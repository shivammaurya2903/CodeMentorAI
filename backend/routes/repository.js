const express = require('express');
const { repositoryIndexer } = require('../services/repository/repositoryIndexer');
const { searchRepository } = require('../services/repository/repositorySearch');
const { getRepoFiles, getFileContent } = require('../services/githubService');

const router = express.Router();

// POST /api/repository/index { repo: 'owner/repo' }
router.post('/index', async (req, res) => {
  const { repo } = req.body;
  if (!repo) return res.status(400).json({ error: 'repo fullName required' });

  try {
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
  } catch (err) {
    console.error('Repository indexing error:', err);
    res.status(500).json({ error: `Indexing failed: ${err.message}` });
  }
});

// GET /api/repository/status?repo=owner/repo
router.get('/status', (req, res) => {
  const { repo } = req.query;
  if (!repo) return res.status(400).json({ error: 'repo parameter required' });

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
});

// POST /api/repository/search { repo: 'owner/repo', query: 'auth' }
router.post('/search', (req, res) => {
  const { repo, query, searchTypes, maxResults } = req.body;
  if (!repo || !query) return res.status(400).json({ error: 'repo and query required' });

  const index = repositoryIndexer.getRepositoryIndex(repo);
  if (!index) {
    return res.status(400).json({ error: 'Repository must be indexed before searching' });
  }

  const results = searchRepository(index, query, { searchTypes, maxResults });
  res.json(results);
});

module.exports = router;
