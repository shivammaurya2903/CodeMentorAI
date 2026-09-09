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
  return {
    reply: data.reply || (typeof data === 'string' ? data : 'AI response unavailable.'),
    fix: data.fix || '',
    improved_code: data.improved_code || data.refactored_code || '',
    cited_files: Array.isArray(data.cited_files) ? data.cited_files : (Array.isArray(data.sources) ? data.sources : []),
    mode: data.mode || '',
    scope: data.scope || data.context_scope || '',
  };
}

export const aiService = {
  async reviewCode(code, language = 'javascript') {
    const raw = await api.post('/api/review', { code, language });
    return normalizeReviewResponse(raw);
  },

  async analyseCode(code, language = 'javascript', issue = '') {
    const raw = await api.post('/api/analyse', { code, language, issue });
    return normalizeAnalysisResponse(raw);
  },

  async explainCode(code, language = 'javascript') {
    const raw = await api.post('/api/explain', { code, language });
    return normalizeExplainResponse(raw);
  },

  async chatWithAI(message, code = '', language = 'javascript', options = {}) {
    const raw = await api.post('/api/chat', { message, code, language, ...options });
    return normalizeChatResponse(raw);
  },
};
