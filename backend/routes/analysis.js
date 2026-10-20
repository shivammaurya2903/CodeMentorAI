const express = require('express');
const { repositoryIndexer } = require('../services/repository/repositoryIndexer');
const { runStaticSecurityScan } = require('../services/analysis/securityAnalyzer');
const { runStaticPerformanceScan } = require('../services/analysis/performanceAnalyzer');
const { analyzeArchitecture } = require('../services/analysis/architectureAnalyzer');
const { generateProjectHealthScorecard } = require('../services/reporting/healthDashboardService');
const { generateSecurityAudit, generatePerformanceAudit } = require('../services/aiService');
const { AppError, asyncHandler } = require('../utils/errorHandler');
const pino = require('pino');
const logger = pino({ name: 'analysisRoutes' });

const router = express.Router();

// POST /api/analysis/security { repo: 'owner/repo', code, filePath }
router.post('/security', asyncHandler(async (req, res) => {
  const { code, filePath = 'file.js' } = req.body;

  if (!code || typeof code !== 'string') {
    throw new AppError('Valid code is required', 400, 'VALIDATION_ERROR');
  }

  let staticFindings = [];
  if (code) {
    staticFindings = runStaticSecurityScan(code, filePath);
  }

  let aiFindings = { summary: 'Static audit complete', findings: [] };
  if (code) {
    try {
      aiFindings = await generateSecurityAudit(code, filePath);
    } catch (err) {
      logger.warn({ err }, 'AI Security Audit fallback to static');
    }
  }

  res.json({
    filePath,
    staticFindings,
    aiSummary: aiFindings.summary,
    aiFindings: aiFindings.findings,
    combinedFindings: [...staticFindings, ...aiFindings.findings],
  });
}));

// POST /api/analysis/performance { repo, code, filePath }
router.post('/performance', asyncHandler(async (req, res) => {
  const { code, filePath = 'file.js' } = req.body;

  if (!code || typeof code !== 'string') {
    throw new AppError('Valid code is required', 400, 'VALIDATION_ERROR');
  }

  let staticFindings = [];
  if (code) {
    staticFindings = runStaticPerformanceScan(code, filePath);
  }

  let aiFindings = { summary: 'Performance audit complete', findings: [] };
  if (code) {
    try {
      aiFindings = await generatePerformanceAudit(code, filePath);
    } catch (err) {
      logger.warn({ err }, 'AI Performance Audit fallback to static');
    }
  }

  res.json({
    filePath,
    staticFindings,
    aiSummary: aiFindings.summary,
    aiFindings: aiFindings.findings,
    combinedFindings: [...staticFindings, ...aiFindings.findings],
  });
}));

// POST /api/analysis/architecture { repo: 'owner/repo' }
router.post('/architecture', asyncHandler(async (req, res) => {
  const { repo } = req.body;
  if (!repo) {
    throw new AppError('Repository is required', 400, 'VALIDATION_ERROR');
  }
  const index = repositoryIndexer.getRepositoryIndex(repo);
  if (!index) {
    throw new AppError('Repository not indexed. Please index first.', 400, 'REPOSITORY_NOT_INDEXED');
  }
  const result = analyzeArchitecture(index);
  res.json(result);
}));

// POST /api/analysis/health { repo: 'owner/repo' }
router.post('/health', asyncHandler(async (req, res) => {
  const { repo } = req.body;
  if (!repo) {
    throw new AppError('Repository is required', 400, 'VALIDATION_ERROR');
  }
  const index = repositoryIndexer.getRepositoryIndex(repo);
  if (!index) {
    throw new AppError('Repository not indexed. Please index first.', 400, 'REPOSITORY_NOT_INDEXED');
  }
  const scorecard = generateProjectHealthScorecard(index);
  res.json(scorecard);
}));

// POST /api/analysis/improve-plan { repo: 'owner/repo' }
router.post('/improve-plan', asyncHandler(async (req, res) => {
  const { repo } = req.body;
  if (!repo) {
    throw new AppError('Repository is required', 400, 'VALIDATION_ERROR');
  }
  const index = repositoryIndexer.getRepositoryIndex(repo);
  if (!index) {
    throw new AppError('Repository not indexed. Please index first.', 400, 'REPOSITORY_NOT_INDEXED');
  }
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
}));

module.exports = router;
