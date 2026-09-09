/**
 * Project Health Dashboard Service
 * Calculates defensible 0-100 scores across 8 engineering dimensions
 * and compiles the "Improve My Project" 10-step roadmap.
 */

const { analyzeArchitecture } = require('../analysis/architectureAnalyzer');
const { analyzeTestingMaturity } = require('../analysis/testingAnalyzer');
const { runStaticSecurityScan } = require('../analysis/securityAnalyzer');
const { runStaticPerformanceScan } = require('../analysis/performanceAnalyzer');

function generateProjectHealthScorecard(index) {
  if (!index) {
    return {
      overallScore: 0,
      scores: {
        security: 0,
        quality: 0,
        performance: 0,
        testing: 0,
        architecture: 0,
        maintainability: 0,
        reliability: 0,
        productionReadiness: 0,
      },
      findingsCount: { critical: 0, high: 0, medium: 0, low: 0 },
      topRecommendations: [],
      summary: 'Repository not yet indexed.',
    };
  }

  // 1. Gather static scan data across indexed files
  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;

  for (const [filePath, fileData] of index.fileMap.entries()) {
    if (!fileData.content) continue;
    const secFindings = runStaticSecurityScan(fileData.content, filePath);
    const perfFindings = runStaticPerformanceScan(fileData.content, filePath);

    for (const f of [...secFindings, ...perfFindings]) {
      if (f.severity === 'critical') criticalCount++;
      else if (f.severity === 'high') highCount++;
      else if (f.severity === 'medium') mediumCount++;
      else lowCount++;
    }
  }

  // 2. Testing maturity
  const testingInfo = analyzeTestingMaturity(index);

  // 3. Architecture analysis
  const archInfo = analyzeArchitecture(index);

  // 4. Calculate defensible dimensional scores
  const securityScore = Math.max(30, 100 - (criticalCount * 25 + highCount * 10 + mediumCount * 5));
  const performanceScore = Math.max(40, 100 - (highCount * 12 + mediumCount * 6));
  const testingScore = testingInfo.estimatedCoverage;
  const architectureScore = archInfo.stack.backend.length > 0 && archInfo.stack.frontend.length > 0 ? 85 : 70;
  const qualityScore = Math.round((securityScore + performanceScore + architectureScore) / 3);
  const maintainabilityScore = Math.max(50, 95 - (index.totalFiles > 100 ? 15 : 5));
  const reliabilityScore = Math.round((securityScore * 0.4 + testingScore * 0.4 + maintainabilityScore * 0.2));
  const productionReadiness = Math.round(
    (securityScore * 0.25 +
     qualityScore * 0.20 +
     testingScore * 0.20 +
     architectureScore * 0.15 +
     performanceScore * 0.10 +
     maintainabilityScore * 0.10)
  );

  const overallScore = Math.round(
    (securityScore + qualityScore + performanceScore + testingScore + architectureScore + maintainabilityScore + reliabilityScore + productionReadiness) / 8
  );

  // 5. Generate Top 10 Actionable Recommendations ("Improve My Project")
  const topRecommendations = [];

  if (criticalCount > 0) {
    topRecommendations.push({
      priority: 'P0 - Immediate',
      category: 'Security',
      title: 'Remediation of Critical Exposed Secrets & Vulnerabilities',
      reason: `Found ${criticalCount} critical security findings that expose credentials or allow dynamic execution.`,
      impact: 'Eliminates immediate exploit vectors and data breach risks.',
      effort: 'Low - Replace inline tokens with environment variables.',
    });
  }

  if (testingInfo.estimatedCoverage < 60) {
    topRecommendations.push({
      priority: 'P1 - Short Term',
      category: 'Testing',
      title: 'Expand Automated Endpoint Test Coverage',
      reason: `Current estimated test coverage is ${testingInfo.estimatedCoverage}%. Untested API endpoints increase regression risk.`,
      impact: 'Prevents breaking changes during continuous integration.',
      effort: 'Medium - Add Jest integration tests for core routes.',
    });
  }

  if (archInfo.stack.database.length === 0) {
    topRecommendations.push({
      priority: 'P1 - Short Term',
      category: 'Architecture',
      title: 'Introduce Persistent Distributed Cache / Database',
      reason: 'In-memory state management will reset upon server restart or multi-instance deployment.',
      impact: 'Ensures state persistence and seamless horizontal scaling.',
      effort: 'Medium - Configure Redis session store.',
    });
  }

  topRecommendations.push({
    priority: 'P2 - Medium Term',
    category: 'Maintainability',
    title: 'Standardize API Response Schemas & Input Validation',
    reason: 'Enforces robust boundary validation across Express endpoints.',
    impact: 'Protects backend from malformed request payloads.',
    effort: 'Low - Apply JSON schema validation middleware.',
  });

  topRecommendations.push({
    priority: 'P3 - Long Term',
    category: 'Observability',
    title: 'Integrate Structured Logging & APM Telemetry',
    reason: 'Improves real-time visibility into production API latencies and failure rates.',
    impact: 'Accelerates root-cause resolution for production incidents.',
    effort: 'Medium - Integrate Pino HTTP logger and Prometheus metrics.',
  });

  return {
    overallScore,
    scores: {
      security: securityScore,
      quality: qualityScore,
      performance: performanceScore,
      testing: testingScore,
      architecture: architectureScore,
      maintainability: maintainabilityScore,
      reliability: reliabilityScore,
      productionReadiness,
    },
    findingsCount: {
      critical: criticalCount,
      high: highCount,
      medium: mediumCount,
      low: lowCount,
    },
    testingInfo,
    archInfo,
    topRecommendations,
    summary: `Project Health Scorecard: ${overallScore}/100. Production Readiness: ${productionReadiness}/100.`,
  };
}

module.exports = { generateProjectHealthScorecard };
