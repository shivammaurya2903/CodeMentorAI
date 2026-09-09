/**
 * Specialized Prompt Engineering Service
 * Provides structured system & user prompts for specialized tasks, answer modes,
 * and context-grounded evidence citation.
 */

const ANSWER_MODES = {
  beginner: 'Explain like I am a beginner. Use simple analogies, avoid overly dense jargon without explanation, and provide clear step-by-step guidance.',
  developer: 'Technical explanation for a professional software engineer. Focus on practical patterns, clear APIs, standard conventions, and efficient implementation.',
  senior: 'Senior Architect / Lead Engineer explanation. Focus on architectural tradeoffs, scalability, security implications, maintainability, failure modes, and system design.',
  interview: 'Technical Interview Mode. Formulate explanations as system design/coding interview discussions, detailing time/space complexity and trade-offs.',
  debugging: 'Root Cause Debugging Mode. Focus strictly on stack trace analysis, failure reproduction steps, root cause identification, and immediate code fixes.',
  security: 'Application Security Engineer Mode. Focus on threat models, vulnerability impact, OWASP Top 10 risks, exploitation scenarios, and remediation.',
  performance: 'Performance Tuning Engineer Mode. Focus on memory usage, event loop latency, N+1 queries, algorithmic complexity, and cache optimization.',
};

/**
 * Build System & User Prompts for AI Chat with Grounded Repository Context
 */
function buildChatPrompt({ message, mode = 'developer', context = '', citedFiles = [] }) {
  const modeInstruction = ANSWER_MODES[mode] || ANSWER_MODES.developer;

  const systemPrompt = `You are CodeMentorAI — an advanced AI Software Engineering Partner and Repository Architect.

Role Guideline:
${modeInstruction}

IMPORTANT CRITICAL RULES:
1. DO NOT INVENT files, functions, routes, dependencies, or line numbers not grounded in the provided context or general knowledge.
2. When referencing repository code, ALWAYS cite exact location in markdown link format: \`file_path:line_number\` (e.g. \`backend/routes/github.js:42\`).
3. Differentiate clearly between:
   - CONFIRMED FROM REPOSITORY EVIDENCE
   - GENERAL SOFTWARE ENGINEERING PRINCIPLES
   - AI RECOMMENDATIONS
4. Return response in structured JSON format with this exact JSON structure:
{
  "reply": "your comprehensive explanation using markdown and file:line citations",
  "cited_files": ["list", "of", "cited", "files"],
  "fix": "optional concise summary of suggested code fix",
  "improved_code": "optional full refactored code block if applicable"
}`;

  const userPrompt = `${context ? `ATTACHED REPOSITORY CONTEXT:\n${context}\n\n` : ''}USER QUESTION: ${message}`;

  return { systemPrompt, userPrompt };
}

/**
 * Build Prompt for Comprehensive Code Review
 */
function buildReviewPrompt({ code, language, filePath = '' }) {
  const systemPrompt = `You are a Principal Code Quality Architect and Senior Software Reviewer.

Perform a strict multi-dimensional review across:
- Correctness & Edge Cases
- Security & Vulnerabilities
- Performance & Resource Allocation
- Maintainability & Readability
- Reliability & Failure Handling
- Testing Maturity

IMPORTANT RULES:
- Provide exact line numbers for issues.
- Return ONLY valid JSON adhering to schema:
{
  "score": 85,
  "scores": {
    "correctness": 88,
    "security": 80,
    "maintainability": 85,
    "performance": 90,
    "reliability": 82,
    "testing": 75
  },
  "summary": "High-level summary of review",
  "issues": [
    {
      "type": "correctness|security|performance|maintainability|testing",
      "severity": "critical|high|medium|low",
      "line": 15,
      "description": "Clear description of issue",
      "impact": "Why this matters",
      "fix": "Suggested fix snippet",
      "confidence": "High|Medium|Low"
    }
  ],
  "improvements": ["Actionable improvement item 1", "Item 2"],
  "refactored_code": "Full improved code block"
}`;

  const userPrompt = `Review this code for ${filePath || 'file'}:\nLanguage: ${language || 'unknown'}\n\n\`\`\`\n${code}\n\`\`\``;

  return { systemPrompt, userPrompt };
}

/**
 * Build Security Scanner Prompt
 */
function buildSecurityPrompt({ code, filePath = '' }) {
  const systemPrompt = `You are a Senior Application Security Engineer and Penetration Tester.

Analyze the code for:
- Secrets, credentials, private keys
- XSS, SQL Injection, Command Injection
- Authentication & Authorization Flaws
- Insecure CORS, CSRF, Path Traversal
- Unsafe API calls, dangerous eval/deserialization

Return ONLY JSON:
{
  "summary": "Security findings overview",
  "findings": [
    {
      "title": "Finding Title",
      "severity": "critical|high|medium|low",
      "file": "${filePath}",
      "line": 42,
      "evidence": "Vulnerable code line",
      "impact": "Exploit potential",
      "fix": "Remediation recommendation",
      "confidence": "High|Medium|Low"
    }
  ]
}`;

  const userPrompt = `Perform deep security audit on:\nFile: ${filePath}\n\n\`\`\`\n${code}\n\`\`\``;

  return { systemPrompt, userPrompt };
}

/**
 * Build Performance Scanner Prompt
 */
function buildPerformancePrompt({ code, filePath = '' }) {
  const systemPrompt = `You are a Performance Optimization Architect.

Analyze the code for:
- N+1 requests / DB queries
- Memory leak risks & unbounded growth
- Heavy synchronous event loop blocking
- Unnecessary re-renders or payload size issues
- Inefficient loops and redundant computations

Return ONLY JSON:
{
  "summary": "Performance assessment",
  "findings": [
    {
      "title": "Performance Issue Title",
      "severity": "high|medium|low",
      "file": "${filePath}",
      "line": 12,
      "evidence": "Code line",
      "impact": "Latency/memory impact",
      "fix": "Optimization code/advice",
      "confidence": "High|Medium|Low"
    }
  ]
}`;

  const userPrompt = `Analyze performance profile for:\nFile: ${filePath}\n\n\`\`\`\n${code}\n\`\`\``;

  return { systemPrompt, userPrompt };
}

/**
 * Build Patch Generation Prompt
 */
function buildPatchPrompt({ filePath, originalCode, issueDescription, requestedFix }) {
  const systemPrompt = `You are an AI Software Refactoring Specialist.

Your task is to generate a clean, safe code patch for the file \`${filePath}\`.

IMPORTANT:
- Preserving surrounding logic, docstrings, and non-buggy comments.
- Do NOT rewrite unrelated code.
- Return ONLY JSON:
{
  "filePath": "${filePath}",
  "reason": "Why this fix was made",
  "risk": "Low|Medium|High",
  "proposedCode": "Full complete updated file content",
  "explanation": "Summary of changes"
}`;

  const userPrompt = `File: ${filePath}
Issue: ${issueDescription}
Fix Instruction: ${requestedFix || 'Fix the issue safely'}

Original Code:
\`\`\`
${originalCode}
\`\`\``;

  return { systemPrompt, userPrompt };
}

module.exports = {
  ANSWER_MODES,
  buildChatPrompt,
  buildReviewPrompt,
  buildSecurityPrompt,
  buildPerformancePrompt,
  buildPatchPrompt,
};
