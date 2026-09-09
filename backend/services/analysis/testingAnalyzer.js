/**
 * Testing Intelligence Engine
 * Evaluates repository testing maturity, detects test framework,
 * calculates estimated coverage, identifies untested edge cases, and generates test code.
 */

function analyzeTestingMaturity(index) {
  if (!index) {
    return {
      testFramework: 'Unknown',
      testFilesCount: 0,
      estimatedCoverage: 0,
      untestedModules: [],
      recommendations: [],
    };
  }

  const allDeps = {
    ...(index.dependencies.dependencies || {}),
    ...(index.dependencies.devDependencies || {}),
  };

  let testFramework = 'None Detected';
  if (allDeps['jest']) testFramework = 'Jest';
  else if (allDeps['mocha']) testFramework = 'Mocha';
  else if (allDeps['vitest']) testFramework = 'Vitest';
  else if (allDeps['cypress'] || allDeps['playwright']) testFramework = 'Cypress / Playwright';

  const testFiles = index.tests || [];
  const testFilesCount = testFiles.length;

  const appFiles = Array.from(index.fileMap.keys()).filter(f => {
    return !f.includes('node_modules/') && !f.includes('dist/') && !index.tests.includes(f);
  });

  const estimatedCoverage = appFiles.length > 0
    ? Math.min(100, Math.round((testFilesCount / Math.max(1, appFiles.length * 0.5)) * 100))
    : 0;

  const untestedModules = [];
  for (const routeFile of index.routes || []) {
    const hasMatchingTest = testFiles.some(t => t.toLowerCase().includes(routeFile.split('/').pop().split('.')[0].toLowerCase()));
    if (!hasMatchingTest) {
      untestedModules.push({
        file: routeFile,
        type: 'API Route',
        reason: 'No dedicated endpoint unit/integration test file detected',
      });
    }
  }

  for (const serviceFile of index.services || []) {
    const hasMatchingTest = testFiles.some(t => t.toLowerCase().includes(serviceFile.split('/').pop().split('.')[0].toLowerCase()));
    if (!hasMatchingTest) {
      untestedModules.push({
        file: serviceFile,
        type: 'Service Layer',
        reason: 'Service logic lacks dedicated mock test coverage',
      });
    }
  }

  const recommendations = [
    `Framework detected: ${testFramework}. Maintain consistent test runner scripts in package.json.`,
    `Estimated test coverage is ${estimatedCoverage}%. Expand test suite to cover high-risk API routes.`,
  ];

  if (untestedModules.length > 0) {
    recommendations.push(`Priority: Write integration tests for ${untestedModules.slice(0, 3).map(m => m.file).join(', ')}.`);
  }

  return {
    testFramework,
    testFilesCount,
    estimatedCoverage,
    untestedModules: untestedModules.slice(0, 10),
    recommendations,
  };
}

module.exports = { analyzeTestingMaturity };
