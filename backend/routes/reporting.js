const express = require('express');
const { repositoryIndexer } = require('../services/repository/repositoryIndexer');
const { generateProjectHealthScorecard } = require('../services/reporting/healthDashboardService');
const { generateMarkdownReport } = require('../services/reporting/reportGenerator');

const router = express.Router();

// GET /api/reporting/export?repo=owner/repo&format=markdown|json
router.get('/export', (req, res) => {
  const { repo, format = 'markdown' } = req.query;
  const index = repositoryIndexer.getRepositoryIndex(repo);
  const scorecard = generateProjectHealthScorecard(index);

  if (format === 'json') {
    return res.json({
      repoId: repo || 'Workspace Repository',
      generatedAt: new Date().toISOString(),
      scorecard,
      indexSummary: index ? { totalFiles: index.totalFiles, languages: index.languages } : null,
    });
  }

  const markdownContent = generateMarkdownReport({
    repoId: repo,
    scorecard,
    index,
  });

  res.setHeader('Content-Type', 'text/markdown');
  res.setHeader('Content-Disposition', `attachment; filename="CodeMentorAI_Report_${(repo || 'repo').replace('/', '_')}.md"`);
  res.send(markdownContent);
});

module.exports = router;
