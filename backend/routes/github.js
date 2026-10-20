const express = require('express');
const crypto = require('crypto');
const { reviewCode, analyseCode } = require('../services/aiService');
const {
  exchangeCodeForToken,
  getAuthenticatedUser,
  getUserRepos,
  getRepository,
  getRepoFiles,
  getFileContent,
  getPullRequests,
  getUserToken,
  setUserToken,
  userTokens,
  removeUserToken,
} = require('../services/githubService');
const { AppError, asyncHandler } = require('../utils/errorHandler');
const pino = require('pino');
const logger = pino({ name: 'githubRoutes' });

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5500';
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/auth/github/callback';

const router = express.Router();

// Input validation functions
function validateRepoName(repo) {
  const repoRegex = /^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+$/;
  if (!repoRegex.test(repo)) {
    throw new Error('Invalid repository name format');
  }
}

function validateFilePath(filePath) {
  // Prevent directory traversal attacks
  if (filePath.includes('..') || filePath.startsWith('/') || filePath.includes('\\')) {
    throw new Error('Invalid file path');
  }
  // Basic length check
  if (filePath.length > 500) {
    throw new Error('File path too long');
  }
  // Allow only alphanumeric, hyphens, underscores, dots, and forward slashes
  const validPathRegex = /^[a-zA-Z0-9_.\-\/]+$/;
  if (!validPathRegex.test(filePath)) {
    throw new Error('File path contains invalid characters');
  }
  // Prevent hidden files/directories
  const segments = filePath.split('/');
  for (const segment of segments) {
    if (segment.startsWith('.') && segment !== '.' && segment !== '..') {
      throw new Error('Hidden files/directories not allowed');
    }
  }
}

function validateOwnerAndRepo(owner, repo) {
  const segmentRegex = /^[a-zA-Z0-9_.-]+$/;
  if (!segmentRegex.test(owner) || !segmentRegex.test(repo)) {
    throw new Error('Invalid owner or repo');
  }
}

function normalizeBearerToken(rawToken) {
  if (!rawToken) return null;

  let token = String(rawToken).trim();
  if (!token) return null;

  // Guard common bad values from legacy/localStorage-based token flows.
  if (token === 'null' || token === 'undefined' || token === '[object Object]') {
    return null;
  }

  if (
    (token.startsWith('"') && token.endsWith('"')) ||
    (token.startsWith("'") && token.endsWith("'"))
  ) {
    token = token.slice(1, -1).trim();
  }

  if (token.startsWith('{') && token.endsWith('}')) {
    try {
      const parsed = JSON.parse(token);
      token = String(
        parsed?.access_token || parsed?.token || parsed?.github_token || ''
      ).trim();
    } catch {
      return null;
    }
  }

  return token || null;
}

function looksLikeGitHubToken(token) {
  return /^(gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,}|[a-f0-9]{40})$/.test(token);
}

async function ensureGitHubSession(req, res) {
  const existingSessionToken = (await getUserToken(req.sessionID))?.access_token;
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    const rawToken = authHeader.slice('Bearer '.length).trim();
    const token = normalizeBearerToken(rawToken);

    if (token && looksLikeGitHubToken(token)) {
      if (token !== existingSessionToken) {
        setUserToken(req.sessionID, token);
      }
      req.session.githubConnected = true;
      return true;
    }

    if (!existingSessionToken) {
      req.session.githubConnected = false;
      res.status(401).json({ error: 'Invalid GitHub token. Reconnect GitHub.' });
      return false;
    }
  }

  const userData = await getUserToken(req.sessionID);
  if (!userData?.access_token) {
    req.session.githubConnected = false;
    res.status(401).json({ error: 'Session expired, reconnect GitHub' });
    return false;
  }
  return true;
}

function getFrontendBaseUrl() {
  const raw = String(FRONTEND_URL || '').trim() || 'http://localhost:5500';

  try {
    const parsed = new URL(raw);
    return parsed.origin;
  } catch {
    return raw.replace(/\/$/, '');
  }
}

function buildAuthRedirectPath(firstArg, secondArg = '', query = '') {
  let frontendBase;
  let targetPage;
  let queryStr;

  if (firstArg && (String(firstArg).startsWith('http://') || String(firstArg).startsWith('https://'))) {
    frontendBase = String(firstArg).replace(/\/$/, '');
    targetPage = secondArg;
    queryStr = query;
  } else {
    frontendBase = getFrontendBaseUrl();
    targetPage = firstArg;
    queryStr = secondArg;
  }
  const suffix = queryStr ? `?${queryStr}` : '';
  return `${frontendBase}/auth/github/${targetPage}${suffix}`;
}

// GET /api/github/oauth - Start OAuth with PKCE
router.get('/oauth', (req, res) => {
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    const frontendBase = getFrontendBaseUrl();
    return res.redirect(
      `${frontendBase}/auth/github/error?reason=${encodeURIComponent('GitHub OAuth credentials are not configured on the server.')}`
    );
  }

  const state = crypto.randomBytes(32).toString('hex');
  // PKCE: Generate code_verifier (43-128 chars) and code_challenge (S256)
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');

  req.session.oauthState = state;
  req.session.pkceVerifier = codeVerifier;

  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    scope: 'repo',
    state,
    redirect_uri: GITHUB_CALLBACK_URL,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });
  const githubUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
  req.session.save((err) => {
    if (err) {
      return res.status(500).json({ error: 'Session error' });
    }
    res.redirect(githubUrl);
  });
});

// GET /api/github/callback - OAuth callback with PKCE
router.get('/callback', async (req, res) => {
  const { code, state, error, error_description: errorDescription } = req.query;

  if (error) {
    const message = errorDescription || 'GitHub authorization was cancelled.';
    const query = new URLSearchParams({
      reason: 'cancelled',
      message,
    }).toString();
    return res.redirect(buildAuthRedirectPath('404', query));
  }

  if (!state || state !== req.session.oauthState) {
    const query = new URLSearchParams({
      reason: 'invalid_state',
      message: 'GitHub authorization state is invalid or expired.',
    }).toString();
    return res.redirect(buildAuthRedirectPath('404', query));
  }

  if (!code) {
    const query = new URLSearchParams({
      reason: 'missing_code',
      message: 'GitHub authorization code was not returned.',
    }).toString();
    return res.redirect(buildAuthRedirectPath('404', query));
  }

  const codeVerifier = req.session.pkceVerifier;
  if (!codeVerifier) {
    const query = new URLSearchParams({
      reason: 'missing_pkce_verifier',
      message: 'PKCE code verifier not found in session.',
    }).toString();
    return res.redirect(buildAuthRedirectPath('404', query));
  }

  try {
    const tokenResult = await exchangeCodeForToken(code, req.sessionID, state, codeVerifier);
    req.session.githubConnected = true;
    delete req.session.oauthState;
    delete req.session.pkceVerifier;

    const frontendUrl = getFrontendBaseUrl();
    req.session.save((err) => {
      if (err) console.error('Session save error:', err);
      res.cookie('gh_connected', 'true', { maxAge: 86400000, httpOnly: false, sameSite: 'lax' });
      res.redirect(buildAuthRedirectPath(frontendUrl, 'success'));
    });
  } catch (err) {
    logger.error({ err }, 'OAuth callback error');
    const query = new URLSearchParams({
      reason: 'token_exchange_failed',
      message: 'GitHub authentication could not be completed.',
    }).toString();
    res.redirect(buildAuthRedirectPath('404', query));
  }
});

// GET /api/github/user - Authenticated user profile
router.get('/user', asyncHandler(async (req, res) => {
  if (!(await ensureGitHubSession(req, res))) return;

  const user = await getAuthenticatedUser(req.sessionID);
  res.json(user);
}));

// GET /api/github/repos - List user repos (req.sessionID for auth)
router.get('/repos', asyncHandler(async (req, res) => {
  if (!(await ensureGitHubSession(req, res))) return;

  const repos = await getUserRepos(req.sessionID);
  res.json({ repos });
}));

// GET /api/github/repo-files?repo=owner/repo
router.get('/repo-files', asyncHandler(async (req, res) => {
  const { repo } = req.query;
  if (!repo) throw new AppError('repo param required', 400, 'VALIDATION_ERROR');

  validateRepoName(repo);
  if (!(await ensureGitHubSession(req, res))) return;

  const files = await getRepoFiles(req.sessionID, repo);
  res.json({ files });
}));

// GET /api/github/file?repo=owner/repo&path=...
router.get('/file', asyncHandler(async (req, res) => {
  const { repo, path: filePath } = req.query;
  if (!repo || !filePath) throw new AppError('repo and path required', 400, 'VALIDATION_ERROR');

  validateRepoName(repo);
  validateFilePath(filePath);
  if (!(await ensureGitHubSession(req, res))) return;

  const content = await getFileContent(req.sessionID, repo, filePath);
  res.json({ content, path: filePath });
}));

// POST /api/github/analyze-file {repo, filePath, type: 'review|analyse'}
router.post('/analyze-file', asyncHandler(async (req, res) => {
  const { repo, filePath, type = 'review', language } = req.body;
  if (!repo || !filePath) throw new AppError('repo and filePath required', 400, 'VALIDATION_ERROR');

  validateRepoName(repo);
  validateFilePath(filePath);
  if (!(await ensureGitHubSession(req, res))) return;

  const content = await getFileContent(req.sessionID, repo, filePath);
  let aiResult;
  if (type === 'analyse') {
    aiResult = await analyseCode(content, language);
  } else {
    aiResult = await reviewCode(content, language);
  }
  res.json({
    ...aiResult,
    repo,
    filePath,
    message: `Analysis complete for ${filePath}`,
  });
}));

// GET /api/github/prs?repo=owner/repo
router.get('/prs', asyncHandler(async (req, res) => {
  const { repo, state = 'open' } = req.query;
  if (!repo) throw new AppError('repo param required', 400, 'VALIDATION_ERROR');

  validateRepoName(repo);
  if (!(await ensureGitHubSession(req, res))) return;

  const prs = await getPullRequests(req.sessionID, repo, state);
  res.json({ prs });
}));

// GET /api/github/status
router.get('/status', asyncHandler(async (req, res) => {
  const hasToken = !!(await getUserToken(req.sessionID));
  if (!hasToken && req.session.githubConnected) {
    req.session.githubConnected = false;
  }

  res.json({
    connected: hasToken && !!req.session.githubConnected,
    sessionId: req.sessionID,
    hasToken,
  });
}));

// POST /api/github/logout - Full backend logout
router.post('/logout', asyncHandler(async (req, res) => {
  const sessionId = req.sessionID;

  if (sessionId) {
    await removeUserToken(sessionId);
  }

  res.clearCookie('gh_connected');
  res.clearCookie('connect.sid');

  if (req.session) {
    await new Promise((resolve) => {
      req.session.destroy((err) => {
        if (err) {
          logger.warn({ err }, 'Session destroy warning during logout');
        }
        resolve();
      });
    });
  }

  res.json({ success: true });
}));

// GET /api/github/repos/:owner/:repo - Fetch repository details
router.get('/repos/:owner/:repo', asyncHandler(async (req, res) => {
  const { owner, repo } = req.params;

  validateOwnerAndRepo(owner, repo);
  if (!(await ensureGitHubSession(req, res))) return;

  const repository = await getRepository(req.sessionID, owner, repo);
  res.json({ repository });
}));

// GET /api/github/repos/:owner/:repo/files - Fetch repository file tree
router.get('/repos/:owner/:repo/files', asyncHandler(async (req, res) => {
  const { owner, repo } = req.params;

  validateOwnerAndRepo(owner, repo);
  if (!(await ensureGitHubSession(req, res))) return;

  const files = await getRepoFiles(req.sessionID, `${owner}/${repo}`);
  res.json({ files });
}));

// GET /api/github/repos/:owner/:repo/file/* - Fetch file content by path
router.get('/repos/:owner/:repo/file/*', asyncHandler(async (req, res) => {
  const { owner, repo } = req.params;
  const filePath = req.params[0];

  if (!filePath) throw new AppError('file path required', 400, 'VALIDATION_ERROR');

  validateOwnerAndRepo(owner, repo);
  validateFilePath(filePath);
  if (!(await ensureGitHubSession(req, res))) return;

  const content = await getFileContent(req.sessionID, `${owner}/${repo}`, filePath);
  res.json({ content, path: filePath });
}));

module.exports = router;

