/**
 * Response Validator & Schema Sanitizer
 * Ensures structured AI model responses adhere to expected API contracts
 * before returning data to the frontend.
 */

function sanitizeChatResponse(parsed, fallback = {}) {
  return {
    reply: String(parsed?.reply || fallback.reply || 'No response generated from AI model.'),
    cited_files: Array.isArray(parsed?.cited_files) ? parsed.cited_files : (fallback.cited_files || []),
    fix: String(parsed?.fix || fallback.fix || ''),
    improved_code: String(parsed?.improved_code || fallback.improved_code || ''),
  };
}

function sanitizeReviewResponse(parsed, originalCode = '') {
  return {
    score: typeof parsed?.score === 'number' ? Math.max(0, Math.min(100, parsed.score)) : 75,
    scores: {
      correctness: parsed?.scores?.correctness || 75,
      security: parsed?.scores?.security || 75,
      maintainability: parsed?.scores?.maintainability || 75,
      performance: parsed?.scores?.performance || 75,
      reliability: parsed?.scores?.reliability || 75,
      testing: parsed?.scores?.testing || 75,
    },
    summary: String(parsed?.summary || 'Code review analysis complete.'),
    issues: Array.isArray(parsed?.issues)
      ? parsed.issues.map(iss => ({
          type: String(iss.type || 'maintainability'),
          severity: String(iss.severity || 'medium'),
          line: Number(iss.line) || 1,
          description: String(iss.description || 'Issue detected'),
          impact: String(iss.impact || ''),
          fix: String(iss.fix || ''),
          confidence: String(iss.confidence || 'Medium'),
        }))
      : [],
    improvements: Array.isArray(parsed?.improvements) ? parsed.improvements.map(String) : [],
    refactored_code: String(parsed?.refactored_code || originalCode),
  };
}

function sanitizeSecurityResponse(parsed) {
  return {
    summary: String(parsed?.summary || 'Security analysis complete.'),
    findings: Array.isArray(parsed?.findings)
      ? parsed.findings.map(f => ({
          title: String(f.title || 'Security Finding'),
          severity: String(f.severity || 'medium'),
          file: String(f.file || ''),
          line: Number(f.line) || 1,
          evidence: String(f.evidence || ''),
          impact: String(f.impact || ''),
          fix: String(f.fix || ''),
          confidence: String(f.confidence || 'Medium'),
        }))
      : [],
  };
}

function sanitizePerformanceResponse(parsed) {
  return {
    summary: String(parsed?.summary || 'Performance assessment complete.'),
    findings: Array.isArray(parsed?.findings)
      ? parsed.findings.map(f => ({
          title: String(f.title || 'Performance Finding'),
          severity: String(f.severity || 'medium'),
          file: String(f.file || ''),
          line: Number(f.line) || 1,
          evidence: String(f.evidence || ''),
          impact: String(f.impact || ''),
          fix: String(f.fix || ''),
          confidence: String(f.confidence || 'Medium'),
        }))
      : [],
  };
}

function sanitizePatchResponse(parsed, originalCode = '', filePath = '') {
  return {
    filePath: String(parsed?.filePath || filePath),
    reason: String(parsed?.reason || 'Code optimization'),
    risk: String(parsed?.risk || 'Low'),
    proposedCode: String(parsed?.proposedCode || originalCode),
    explanation: String(parsed?.explanation || 'Patch generated'),
  };
}

module.exports = {
  sanitizeChatResponse,
  sanitizeReviewResponse,
  sanitizeSecurityResponse,
  sanitizePerformanceResponse,
  sanitizePatchResponse,
};
