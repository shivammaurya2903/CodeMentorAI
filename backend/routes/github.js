const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { reviewCode, analyseCode } = require('../services/aiService');
const {
  exchangeCodeForToken,
  getUserRepos,
  getRepoFiles,
  getFileContent,
  getPullRequests,
  userTokens,
} = require('../services/githubService');

const FRONTEND_URL = 'http://localhost:5500/frontend';

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
}

// Simple session setup for demo (use Redis/prod in production)
router.use(cookieParser());
router.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 1 day
}));

// GET /api/github/oauth - Start OAuth
router.get('/oauth', (req, res) => {
  const state = req.sessionID;
  const githubUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo&state=${state}`;
  res.redirect(githubUrl);
});

// GET /api/github/repos - List user repos (req.sessionID for auth)
router.get('/repos', async (req, res) => {
  try {
    const userData = userTokens.get(req.sessionID);
    if (!userData?.access_token) {
      req.session.githubConnected = false;
      return res.status(401).json({ error: 'Session expired, reconnect GitHub' });
    }
    const repos = await getUserRepos(req.sessionID);
    res.json({ repos });
  } catch (err) {
    console.error('Repos error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/github/repo-files?repo=owner/repo
router.get('/repo-files', async (req, res) => {
  const { repo } = req.query;
  if (!repo) return res.status(400).json({ error: 'repo param required' });

  try {
    validateRepoName(repo);
    const userData = userTokens.get(req.sessionID);
    if (!userData?.access_token) {
      req.session.githubConnected = false;
      return res.status(401).json({ error: 'Session expired, reconnect GitHub' });
    }
    const files = await getRepoFiles(req.sessionID, repo);
    res.json({ files });
  } catch (err) {
    console.error('Repo files error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/github/file?repo=owner/repo&path=...
router.get('/file', async (req, res) => {
  const { repo, path: filePath } = req.query;
  if (!repo || !filePath) return res.status(400).json({ error: 'repo and path required' });

  try {
    validateRepoName(repo);
    validateFilePath(filePath);
    const userData = userTokens.get(req.sessionID);
    if (!userData?.access_token) {
      req.session.githubConnected = false;
      return res.status(401).json({ error: 'Session expired, reconnect GitHub' });
    }
    const content = await getFileContent(req.sessionID, repo, filePath);
    res.json({ content, path: filePath });
  } catch (err) {
    console.error('File error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/github/analyze-file {repo, filePath, type: 'review|analyse'}
router.post('/analyze-file', async (req, res) => {
  const { repo, filePath, type = 'review', language } = req.body;
  if (!repo || !filePath) return res.status(400).json({ error: 'repo and filePath required' });

  try {
    validateRepoName(repo);
    validateFilePath(filePath);
    const userData = userTokens.get(req.sessionID);
    if (!userData?.access_token) {
      req.session.githubConnected = false;
      return res.status(401).json({ error: 'Session expired, reconnect GitHub' });
    }
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
  } catch (err) {
    console.error('Analyze file error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/github/prs?repo=owner/repo
router.get('/prs', async (req, res) => {
  const { repo, state = 'open' } = req.query;
  if (!repo) return res.status(400).json({ error: 'repo param required' });

  try {
    validateRepoName(repo);
    const userData = userTokens.get(req.sessionID);
    if (!userData?.access_token) {
      req.session.githubConnected = false;
      return res.status(401).json({ error: 'Session expired, reconnect GitHub' });
    }
    const prs = await getPullRequests(req.sessionID, repo, state);
    res.json({ prs });
  } catch (err) {
    console.error('PRs error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/github/status
router.get('/status', (req, res) => {
  res.json({
    connected: !!req.session.githubConnected,
    sessionId: req.sessionID,
    hasToken: !!userTokens.get(req.sessionID),
  });
});

module.exports = router;

