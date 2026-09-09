const express = require('express');
const { repositoryIndexer } = require('../services/repository/repositoryIndexer');
const { runStaticSecurityScan } = require('../services/analysis/securityAnalyzer');
const { runStaticPerformanceScan } = require('../services/analysis/performanceAnalyzer');
const { analyzeArchitecture } = require('../services/analysis/architectureAnalyzer');
const { generateProjectHealthScorecard } = require('../services/reporting/healthDashboardService');
const { generateSecurityAudit, generatePerformanceAudit } = require('../services/aiService');

const router = express.Router();

// POST /api/analysis/security { repo: 'owner/repo', code, filePath }
router.post('/security', async (req, res) => {
  const { repo, code, filePath = 'file.js' } = req.body;

  try {
    let staticFindings = [];
    if (code) {
      staticFindings = runStaticSecurityScan(code, filePath);
    }

    let aiFindings = { summary: 'Static audit complete', findings: [] };
    if (code) {
      try {
        aiFindings = await generateSecurityAudit(code, filePath);
      } catch (err) {
        console.warn('AI Security Audit fallback to static:', err.message);
      }
    }

    res.json({
      filePath,
      staticFindings,
      aiSummary: aiFindings.summary,
      aiFindings: aiFindings.findings,
      combinedFindings: [...staticFindings, ...aiFindings.findings],
    });
  } catch (err) {
    console.error('Security analysis route error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/analysis/performance { repo, code, filePath }
router.post('/performance', async (req, res) => {
  const { code, filePath = 'file.js' } = req.body;

  try {
    let staticFindings = [];
    if (code) {
      staticFindings = runStaticPerformanceScan(code, filePath);
    }

    let aiFindings = { summary: 'Performance audit complete', findings: [] };
    if (code) {
      try {
        aiFindings = await generatePerformanceAudit(code, filePath);
      } catch (err) {
        console.warn('AI Performance Audit fallback to static:', err.message);
      }
    }

    res.json({
      filePath,
      staticFindings,
      aiSummary: aiFindings.summary,
      aiFindings: aiFindings.findings,
      combinedFindings: [...staticFindings, ...aiFindings.findings],
    });
  } catch (err) {
    console.error('Performance analysis route error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/analysis/architecture { repo: 'owner/repo' }
router.post('/architecture', (req, res) => {
  const { repo } = req.body;
  const index = repositoryIndexer.getRepositoryIndex(repo);
  const result = analyzeArchitecture(index);
  res.json(result);
});

// POST /api/analysis/health { repo: 'owner/repo' }
router.post('/health', (req, res) => {
  const { repo } = req.body;
  const index = repositoryIndexer.getRepositoryIndex(repo);
  const scorecard = generateProjectHealthScorecard(index);
  res.json(scorecard);
});

// POST /api/analysis/improve-plan { repo: 'owner/repo' }
router.post('/improve-plan', (req, res) => {
  const { repo } = req.body;
  const index = repositoryIndexer.getRepositoryIndex(repo);
  const scorecard = generateProjectHealthScorecard(index);

  res.json({
    repoId: repo,
    overallScore: scorecard.overallScore,
    productionReadiness: scorecard.scores.productionReadiness,
    topRecommendations: scorecard.topRecommendations,
    roadmap: {
      immediate: scorecard.topRecommendations.filter(r => r.priority.includes('P0')),
      shortTerm: scorecard.topRecommendations.filter(r => r.priority.includes('P1')),
      mediumTerm: scorecard.topRecommendations.filter(r => r.priority.includes('P2')),
      longTerm: scorecard.topRecommendations.filter(r => r.priority.includes('P3')),
    },
  });
});

module.exports = router;
