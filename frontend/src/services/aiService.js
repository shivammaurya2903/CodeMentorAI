import { api } from './api';

export function normalizeReviewResponse(data = {}) {
  return {
    score: typeof data.score === 'number' ? data.score : 0,
    summary: data.summary || 'Code review completed.',
    issues: Array.isArray(data.issues) ? data.issues : [],
    improvements: Array.isArray(data.improvements) ? data.improvements : [],
    reviewed_code: data.reviewed_code || '',
    refactored_code: data.refactored_code || data.optimized_code || data.fixed_code || '',
  };
}

export function normalizeAnalysisResponse(data = {}) {
  const issues = Array.isArray(data.issues)
    ? data.issues
    : data.analysis
    ? [{ type: 'analysis', severity: 'medium', description: data.analysis, fix: data.fixes || '' }]
    : [];

  return {
    analysis: data.analysis || 'Analysis completed.',
    fixes: data.fixes || '',
    fixed_code: data.fixed_code || data.refactored_code || '',
    refactored_code: data.fixed_code || data.refactored_code || '',
    issues,
    score: typeof data.score === 'number' ? data.score : 80,
    summary: data.summary || data.analysis || 'Code analysis complete.',
  };
}

export function normalizeExplainResponse(data = {}) {
  return {
    explanation: data.explanation || 'No explanation provided.',
    key_concepts: Array.isArray(data.key_concepts) ? data.key_concepts : [],
    improvements: data.improvements || '',
  };
}

export function normalizeChatResponse(data = {}) {
  let parsed = data;
  if (typeof data === 'string') {
    try {
      parsed = JSON.parse(data);
    } catch {
      parsed = { reply: data };
    }
  }

  let replyText = parsed?.reply;
  if (typeof replyText === 'object' && replyText !== null) {
    replyText = replyText.reply || replyText.content || JSON.stringify(replyText, null, 2);
  } else if (typeof replyText === 'string' && replyText.trim().startsWith('{') && replyText.trim().endsWith('}')) {
    try {
      const nested = JSON.parse(replyText);
      if (nested?.reply) {
        replyText = nested.reply;
        if (!parsed.improved_code && nested.improved_code) {
          parsed.improved_code = nested.improved_code;
        }
      }
    } catch {}
  }

  return {
    reply: replyText || (typeof parsed === 'string' ? parsed : 'AI response unavailable.'),
    fix: parsed?.fix || '',
    improved_code: parsed?.improved_code || parsed?.refactored_code || '',
    cited_files: Array.isArray(parsed?.cited_files)
      ? parsed.cited_files
      : Array.isArray(parsed?.sources)
      ? parsed.sources
      : [],
    mode: parsed?.mode || '',
    scope: parsed?.scope || parsed?.context_scope || '',
  };
}

export const aiService = {
  async reviewCode(code, language = 'javascript') {
    const raw = await api.post('/api/review', { code, language });
    return normalizeReviewResponse(raw);
  },

  async analyseCode(code, language = 'javascript', issue = '') {
    const raw = await api.post('/api/analysis', { code, language, issue });
    return normalizeAnalysisResponse(raw);
  },

  async explainCode(code, language = 'javascript') {
    const raw = await api.post('/api/explain', { code, language });
    return normalizeExplainResponse(raw);
  },

  async chatWithAI(message, code = '', language = 'javascript', options = {}) {
    const payload = typeof message === 'object' && message !== null
      ? message
      : { message, code, language, ...options };
    const raw = await api.post('/api/chat', payload);
    return normalizeChatResponse(raw);
  },
};
