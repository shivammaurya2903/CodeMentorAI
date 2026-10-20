const express = require('express');
const { repositoryIndexer } = require('../services/repository/repositoryIndexer');
const { searchRepository } = require('../services/repository/repositorySearch');
const { getRepoFiles, getFileContent } = require('../services/githubService');
const { AppError, asyncHandler } = require('../utils/errorHandler');

const router = express.Router();

// POST /api/repository/index { repo: 'owner/repo' }
router.post('/index', asyncHandler(async (req, res) => {
  const { repo } = req.body;
  if (!repo) throw new AppError('repo fullName required', 400, 'VALIDATION_ERROR');

  const fileTree = await getRepoFiles(req.sessionID, repo);

  // Load content for top 40 key code files (limiting payload for fast indexing)
  const keyFiles = fileTree.slice(0, 40);
  const hydratedFiles = await Promise.all(
    keyFiles.map(async f => {
      try {
        const content = await getFileContent(req.sessionID, repo, f.path);
        return { path: f.path, content };
      } catch {
        return { path: f.path, content: '' };
      }
    })
  );

  const index = repositoryIndexer.indexRepository(repo, hydratedFiles);

  res.json({
    success: true,
    repoId: index.repoId,
    indexedAt: index.indexedAt,
    totalFiles: index.totalFiles,
    languages: index.languages,
    routesCount: index.routes.length,
    componentsCount: index.components.length,
    servicesCount: index.services.length,
    symbolsCount: index.symbols.length,
    secretCount: index.secretCount,
    durationMs: index.durationMs,
  });
}));

// GET /api/repository/status?repo=owner/repo
router.get('/status', asyncHandler(async (req, res) => {
  const { repo } = req.query;
  if (!repo) throw new AppError('repo parameter required', 400, 'VALIDATION_ERROR');

  const index = repositoryIndexer.getRepositoryIndex(repo);
  if (!index) {
    return res.json({ indexed: false, message: 'Repository not yet indexed' });
  }

  res.json({
    indexed: true,
    repoId: index.repoId,
    indexedAt: index.indexedAt,
    totalFiles: index.totalFiles,
    languages: index.languages,
    entryPoints: index.entryPoints,
    routes: index.routes,
    services: index.services,
    tests: index.tests,
    symbolsCount: index.symbols.length,
    secretCount: index.secretCount,
  });
}));

// POST /api/repository/search { repo: 'owner/repo', query: 'auth' }
router.post('/search', asyncHandler(async (req, res) => {
  const { repo, query, searchTypes, maxResults } = req.body;
  if (!repo || !query) throw new AppError('repo and query required', 400, 'VALIDATION_ERROR');

  const index = repositoryIndexer.getRepositoryIndex(repo);
  if (!index) {
    throw new AppError('Repository must be indexed before searching', 400, 'REPOSITORY_NOT_INDEXED');
  }

  const results = searchRepository(index, query, { searchTypes, maxResults });
  res.json(results);
}));

module.exports = router;
