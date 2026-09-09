/**
 * Security Engine Service
 * Combines deterministic static analysis patterns with AI-driven security auditing
 * to detect application security risks, secret exposures, and config flaws.
 */

const { scanForSecrets } = require('../repository/secretDetector');

const STATIC_SECURITY_RULES = [
  {
    id: 'SEC_EVAL',
    title: 'Dangerous Code Execution (eval / Function constructor)',
    regex: /\b(eval\s*\(|new\s+Function\s*\()/gi,
    severity: 'critical',
    impact: 'Allows arbitrary JavaScript code execution leading to RCE vulnerabilities.',
    fix: 'Avoid dynamic code evaluation; refactor using safe standard data structures or JSON parsing.',
  },
  {
    id: 'SEC_INNER_HTML',
    title: 'Potential Cross-Site Scripting (XSS via innerHTML)',
    regex: /\.innerHTML\s*=/gi,
    severity: 'high',
    impact: 'Allows injection of unescaped HTML/JavaScript into the client DOM.',
    fix: 'Use textContent, innerText, or DOM sanitization libraries (e.g. DOMPurify).',
  },
  {
    id: 'SEC_PATH_TRAVERSAL',
    title: 'Potential Path Traversal in File Access',
    regex: /fs\.(?:readFile|writeFile|createReadStream)\s*\([^,]*req\.(?:query|body|params)/gi,
    severity: 'high',
    impact: 'Attackers could read or overwrite arbitrary system files by passing relative paths (../).',
    fix: 'Sanitize file paths using path.basename() or validate against a strict allowed file list.',
  },
  {
    id: 'SEC_CORS_WILDCARD',
    title: 'Insecure Permissive CORS Credentials Configuration',
    regex: /cors\s*\(\s*{\s*origin\s*:\s*true/gi,
    severity: 'medium',
    impact: 'Allows any origin to make authenticated cross-site requests.',
    fix: 'Specify explicit allowed origins domain array instead of reflecting request origin blindly.',
  },
  {
    id: 'SEC_SQL_INJECTION',
    title: 'Potential SQL Injection via Unparameterized Query',
    regex: /(?:query|execute)\s*\(\s*[`'"].*?\${/gi,
    severity: 'critical',
    impact: 'Untrusted user input string interpolation in SQL queries can cause database corruption or data leak.',
    fix: 'Use parameterized queries / prepared statements with placeholders (e.g., $1, ?).',
  },
];

/**
 * Run deterministic static security scan on file content
 */
function runStaticSecurityScan(content = '', filePath = '') {
  const findings = [];

  // 1. Secret scanning
  const secrets = scanForSecrets(content, filePath);
  for (const s of secrets) {
    findings.push({
      title: `Exposed Secret: ${s.type}`,
      severity: 'critical',
      file: filePath,
      line: getLineNumberFromIndex(content, s.index),
      evidence: `[REDACTED:${s.label}]`,
      impact: 'Exposed secret tokens or private keys can lead to unauthorized service access.',
      fix: 'Store credential in environment variable (.env) and do not commit to repository.',
      confidence: 'High',
      source: 'Static Analysis',
    });
  }

  // 2. Vulnerability rule scanning
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const rule of STATIC_SECURITY_RULES) {
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

function getLineNumberFromIndex(content, index) {
  if (index <= 0) return 1;
  const sub = content.substring(0, index);
  return sub.split('\n').length;
}

module.exports = {
  runStaticSecurityScan,
  STATIC_SECURITY_RULES,
};
