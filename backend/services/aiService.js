require("dotenv").config();
const OpenAI = require("openai");
const { buildChatPrompt, buildReviewPrompt, buildSecurityPrompt, buildPerformancePrompt, buildPatchPrompt } = require("./ai/promptService");
const { sanitizeChatResponse, sanitizeReviewResponse, sanitizeSecurityResponse, sanitizePerformanceResponse, sanitizePatchResponse } = require("./ai/responseValidator");
const { redactSecrets } = require("./repository/secretDetector");
const { buildContext } = require("./repository/contextBuilder");
const pino = require('pino');

const logger = pino({ name: 'aiService' });

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

async function safeJsonParse(content, fallback) {
  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function extractJsonCandidates(text) {
    const candidates = [];

    // ```json ... ```
    let m = text.match(/```json\s*\n([\s\S]*?)\n\s*```/i);
    if (m && m[1]) candidates.push(m[1].trim());

    // ``` ... ```
    m = text.match(/```\s*\n([\s\S]*?)\n\s*```/i);
    if (m && m[1]) candidates.push(m[1].trim());

    // Full content if JSON-like
    const trimmed = text.trim();
    if (trimmed.startsWith('{')) {
      candidates.push(trimmed);
    }

    const unique = [...new Set(candidates)].sort((a, b) => b.length - a.length).slice(0, 3);
    return unique;
  }

  const candidates = extractJsonCandidates(content);

  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    try {
      let cleaned = candidate
        .replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')
        .replace(/\s+/g, ' ')
        .replace(/,\s*([}\]])/g, '$1')
        .trim();

      const parsed = JSON.parse(cleaned);

      if (Object.keys(fallback).some(key => parsed.hasOwnProperty(key))) {
        return parsed;
      }
    } catch {
      // Continue to next candidate
    }
  }

  return fallback;
}

function isGroqJsonGenerationError(error) {
  const message = (error && error.message ? String(error.message) : '').toLowerCase();
  return error && error.status === 400 && message.includes('failed to generate json');
}

function logGroqError(error) {
  logger.error({
    message: error.message,
    status: error.status,
    timestamp: new Date().toISOString(),
  }, 'Groq API error');
}

function getGroqModel() {
  return process.env.GROQ_MODEL || "llama-3.1-8b-instant";
}

async function createGroqCompletion(messages, retries = 2) {
  const model = getGroqModel();
  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutMs = Number(process.env.GROQ_TIMEOUT_MS || 15000);
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await openai.chat.completions.create(
        {
          model,
          response_format: { type: "json_object" },
          messages,
        },
        { signal: controller.signal }
      );
      clearTimeout(timer);
      return response;
    } catch (error) {
      clearTimeout(timer);
      lastError = error;

      if (isGroqJsonGenerationError(error)) {
        try {
          return await openai.chat.completions.create({
            model,
            messages,
          });
        } catch (retryErr) {
          lastError = retryErr;
        }
      }

      const isTransient =
        error.name === 'AbortError' ||
        error.status === 429 ||
        (error.status && error.status >= 500);

      if (isTransient && attempt < retries) {
        const backoff = (attempt + 1) * 1000;
        await new Promise((resolve) => setTimeout(resolve, backoff));
        continue;
      }

      break;
    }
  }

  throw lastError;
}

async function chatWithAI(paramsOrMessage, codeArg, languageArg, optionsArg = {}) {
  let message, code, language, history, mode, scope, repoContext, currentFilePath, selectedFiles, index;

  if (typeof paramsOrMessage === 'object' && paramsOrMessage !== null) {
    message = paramsOrMessage.message || '';
    code = paramsOrMessage.code || paramsOrMessage.context || '';
    language = paramsOrMessage.language || 'javascript';
    history = paramsOrMessage.history || [];
    mode = paramsOrMessage.mode || 'general';
    scope = paramsOrMessage.scope || 'file';
    repoContext = paramsOrMessage.repoContext || null;
    currentFilePath = paramsOrMessage.currentFilePath || '';
    selectedFiles = paramsOrMessage.selectedFiles || [];
    index = paramsOrMessage.index || null;
  } else {
    message = paramsOrMessage || '';
    code = codeArg || '';
    language = languageArg || 'javascript';
    history = optionsArg.history || [];
    mode = optionsArg.mode || 'developer';
    scope = optionsArg.scope || 'current_file';
    repoContext = optionsArg.repoContext || null;
    currentFilePath = optionsArg.currentFilePath || '';
    selectedFiles = optionsArg.selectedFiles || [];
    index = optionsArg.index || null;
  }

  let contextInfo;
  if (repoContext) {
    const repoText = typeof repoContext === 'string' ? repoContext : JSON.stringify(repoContext, null, 2);
    contextInfo = {
      contextText: repoText,
      citedFiles: Array.isArray(repoContext.files) ? repoContext.files : [],
    };
  } else if (code && !optionsArg?.contextText) {
    contextInfo = buildContext({
      scope: 'current_file',
      currentFile: { path: currentFilePath || 'file.js', content: code },
      userQuery: message,
    });
  } else if (index || (selectedFiles && selectedFiles.length > 0)) {
    contextInfo = buildContext({
      scope: index ? 'indexed_repo' : 'selected_files',
      selectedFiles: selectedFiles || [],
      index,
      userQuery: message,
    });
  } else {
    contextInfo = buildContext({ scope: 'no_context', userQuery: message });
  }

  const { systemPrompt, userPrompt } = buildChatPrompt({
    message,
    mode,
    context: contextInfo.contextText,
    citedFiles: contextInfo.citedFiles,
  });

  const historyMessages = Array.isArray(history)
    ? history
        .filter((h) => h && (h.role === 'user' || h.role === 'assistant') && typeof h.content === 'string')
        .slice(-10)
        .map((h) => ({ role: h.role, content: h.content }))
    : [];

  try {
    const response = await createGroqCompletion([
      { role: "system", content: systemPrompt },
      ...historyMessages,
      { role: "user", content: userPrompt }
    ]);

    const content = response.choices?.[0]?.message?.content || "";
    const parsed = await safeJsonParse(content, {
      reply: content || "I have analyzed your query.",
      cited_files: contextInfo.citedFiles || [],
      fix: "",
      improved_code: ""
    });
    return sanitizeChatResponse(parsed, {
      reply: content || "I have analyzed your query.",
      cited_files: contextInfo.citedFiles || [],
      fix: "",
      improved_code: ""
    });
  } catch (error) {
    logGroqError(error);
    if (error.status === 401) {
      throw new Error("401 Incorrect API key. Check GROQ_API_KEY in .env");
    }
    throw new Error(`AI service failed: ${error.message}`);
  }
}

async function explainCode(code, language) {
  const redacted = redactSecrets(code || '');
  const systemPrompt = `You are an expert code explainer. Explain provided code step by step. Return ONLY valid JSON:
{
  "explanation": "detailed step-by-step explanation",
  "key_concepts": ["list", "of", "concepts"],
  "improvements": "suggested enhancements"
}`;

  const userPrompt = `Explain this code:\nLanguage: ${language || "unknown"}\n\n\`\`\`\n${redacted}\n\`\`\``;

  try {
    const response = await createGroqCompletion([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]);

    const content = response.choices[0].message.content;
    return safeJsonParse(content, { explanation: "Explanation unavailable", key_concepts: [], improvements: "" });
  } catch (error) {
    logGroqError(error);
    throw new Error(`AI service failed: ${error.message}`);
  }
}

async function analyseCode(code, language, issue) {
  const redacted = redactSecrets(code || '');
  const systemPrompt = `You are an expert code debugger and analyzer. Analyze code for bugs, performance issues, and security vulnerabilities. Return ONLY valid JSON:
{
  "analysis": "detailed issues found",
  "fixes": "step-by-step fixes",
  "fixed_code": "complete corrected code"
}`;

  const userPrompt = `Analyze and fix this code. Issue reported: ${issue || "general review"}\nLanguage: ${language || "unknown"}\n\n\`\`\`\n${redacted}\n\`\`\``;

  try {
    const response = await createGroqCompletion([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]);

    const content = response.choices[0].message.content;
    return safeJsonParse(content, { analysis: "Analysis unavailable", fixes: "", fixed_code: code });
  } catch (error) {
    logGroqError(error);
    throw new Error(`AI service failed: ${error.message}`);
  }
}

async function reviewCode(code, language, filePath = '') {
  const redacted = redactSecrets(code || '', filePath);
  const { systemPrompt, userPrompt } = buildReviewPrompt({ code: redacted, language, filePath });

  try {
    const response = await createGroqCompletion([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]);

    const content = response.choices[0].message.content;
    const parsed = await safeJsonParse(content, { score: 75, summary: "Review unavailable", issues: [], improvements: [], refactored_code: code });
    return sanitizeReviewResponse(parsed, code);
  } catch (error) {
    logGroqError(error);
    throw new Error(`AI service failed: ${error.message}`);
  }
}

async function generateSecurityAudit(code, filePath = '') {
  const redacted = redactSecrets(code || '', filePath);
  const { systemPrompt, userPrompt } = buildSecurityPrompt({ code: redacted, filePath });

  try {
    const response = await createGroqCompletion([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]);

    const content = response.choices[0].message.content;
    const parsed = await safeJsonParse(content, { summary: "Audit complete", findings: [] });
    return sanitizeSecurityResponse(parsed);
  } catch (error) {
    logGroqError(error);
    throw new Error(`Security audit failed: ${error.message}`);
  }
}

async function generatePerformanceAudit(code, filePath = '') {
  const redacted = redactSecrets(code || '', filePath);
  const { systemPrompt, userPrompt } = buildPerformancePrompt({ code: redacted, filePath });

  try {
    const response = await createGroqCompletion([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]);

    const content = response.choices[0].message.content;
    const parsed = await safeJsonParse(content, { summary: "Performance complete", findings: [] });
    return sanitizePerformanceResponse(parsed);
  } catch (error) {
    logGroqError(error);
    throw new Error(`Performance audit failed: ${error.message}`);
  }
}

async function generateFixPatch({ filePath, originalCode, issueDescription, requestedFix }) {
  const redacted = redactSecrets(originalCode || '', filePath);
  const { systemPrompt, userPrompt } = buildPatchPrompt({ filePath, originalCode: redacted, issueDescription, requestedFix });

  try {
    const response = await createGroqCompletion([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]);

    const content = response.choices[0].message.content;
    const parsed = await safeJsonParse(content, { filePath, reason: issueDescription, risk: 'Low', proposedCode: originalCode, explanation: '' });
    return sanitizePatchResponse(parsed, originalCode, filePath);
  } catch (error) {
    logGroqError(error);
    throw new Error(`Patch generation failed: ${error.message}`);
  }
}

module.exports = {
  chatWithAI,
  explainCode,
  analyseCode,
  reviewCode,
  generateSecurityAudit,
  generatePerformanceAudit,
  generateFixPatch,
};