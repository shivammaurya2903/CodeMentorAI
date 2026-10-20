const express = require('express');
const { repositoryIndexer } = require('../services/repository/repositoryIndexer');
const { generateProjectHealthScorecard } = require('../services/reporting/healthDashboardService');
const { generateMarkdownReport } = require('../services/reporting/reportGenerator');
const { AppError, asyncHandler } = require('../utils/errorHandler');

const router = express.Router();

// GET /api/reporting/export?repo=owner/repo&format=markdown|json
router.get('/export', asyncHandler(async (req, res) => {
  const { repo, format = 'markdown' } = req.query;
  if (!repo) {
    throw new AppError('repo parameter is required', 400, 'VALIDATION_ERROR');
  }
  if (!['markdown', 'json'].includes(format)) {
    throw new AppError('format must be markdown or json', 400, 'VALIDATION_ERROR');
  }
  const index = repositoryIndexer.getRepositoryIndex(repo);
  if (!index) {
    throw new AppError('Repository not indexed. Please index first.', 400, 'REPOSITORY_NOT_INDEXED');
  }
  const scorecard = generateProjectHealthScorecard(index);

  if (format === 'json') {
    return res.json({
      repoId: repo,
      generatedAt: new Date().toISOString(),
      scorecard,
      indexSummary: { totalFiles: index.totalFiles, languages: index.languages },
    });
  }

  const markdownContent = generateMarkdownReport({
    repoId: repo,
    scorecard,
    index,
  });

  res.setHeader('Content-Type', 'text/markdown');
  res.setHeader('Content-Disposition', `attachment; filename="CodeMentorAI_Report_${repo.replace('/', '_')}.md"`);
  res.send(markdownContent);
}));

module.exports = router;
