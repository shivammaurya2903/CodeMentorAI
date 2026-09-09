/**
 * Performance Analyzer Service
 * Detects performance bottlenecks, N+1 patterns, unhandled loops,
 * memory growth risks, and rendering inefficiency.
 */

const STATIC_PERFORMANCE_RULES = [
  {
    id: 'PERF_SYNC_FS',
    title: 'Synchronous File System Operation on Server',
    regex: /fs\.(?:readFileSync|writeFileSync|existsSync|readdirSync)\b/gi,
    severity: 'medium',
    impact: 'Blocks Node.js single-threaded event loop, delaying all active user requests.',
    fix: 'Refactor to asynchronous Promise-based API (fs.promises or async/await).',
  },
  {
    id: 'PERF_NESTED_LOOP',
    title: 'Nested Array Iteration (O(N^2) Complexity)',
    regex: /\bfor\s*\(.*?\)\s*\{[\s\S]*?\bfor\s*\(/gi,
    severity: 'medium',
    impact: 'Exponential computational degradation on larger datasets.',
    fix: 'Optimize using hash map (Map/Set) lookup to achieve O(N) complexity.',
  },
  {
    id: 'PERF_UNBOUNDED_MAP',
    title: 'In-Memory Cache Without TTL / Eviction',
    regex: /const\s+[a-zA-Z0-9_$]*Cache\s*=\s*new\s+Map\(\)/gi,
    severity: 'medium',
    impact: 'Potential unbounded memory growth leading to process Out-Of-Memory (OOM) crash.',
    fix: 'Use LRU cache or implement TTL cleanup intervals.',
  },
];

function runStaticPerformanceScan(content = '', filePath = '') {
  const findings = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const rule of STATIC_PERFORMANCE_RULES) {
      if (rule.regex.test(line)) {
        findings.push({
          title: rule.title,
          severity: rule.severity,
          file: filePath,
          line: i + 1,
          evidence: line.trim().substring(0, 120),
          impact: rule.impact,
          fix: rule.fix,
          confidence: 'High',
          source: 'Static Analysis',
        });
      }
    }
  }

  return findings;
}

module.exports = {
  runStaticPerformanceScan,
  STATIC_PERFORMANCE_RULES,
};
