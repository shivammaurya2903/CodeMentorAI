import { api } from './api';
import { API_BASE_URL } from '../utils/apiConfig';
import { normalizeReviewResponse, normalizeAnalysisResponse } from './aiService';

export const githubService = {
  async getStatus() {
    try {
      const data = await api.get('/api/github/status');
      return {
        connected: !!data.connected,
        sessionId: data.sessionId || null,
        hasToken: !!data.hasToken,
      };
    } catch {
      return { connected: false, sessionId: null, hasToken: false };
    }
  },

  async getUserProfile() {
    return api.get('/api/github/user');
  },

  async getUserRepos() {
    const data = await api.get('/api/github/repos');
    return Array.isArray(data) ? data : data.repos || [];
  },

  async getRepoFiles(repoFullName) {
    const data = await api.get(`/api/github/repo-files?repo=${encodeURIComponent(repoFullName)}`);
    return data.files || [];
  },

  async getFileContent(repoFullName, path) {
    const data = await api.get(
      `/api/github/file?repo=${encodeURIComponent(repoFullName)}&path=${encodeURIComponent(path)}`
    );
    return data.content || '';
  },

  async analyzeRepoFile(repoFullName, filePath, type = 'review', language = 'javascript') {
    const raw = await api.post('/api/github/analyze-file', {
      repo: repoFullName,
      filePath,
      type,
      language,
    });

    if (type === 'analyse') {
      return normalizeAnalysisResponse(raw);
    }
    return normalizeReviewResponse(raw);
  },

  async getPullRequests(repoFullName) {
    const data = await api.get(`/api/github/prs?repo=${encodeURIComponent(repoFullName)}`);
    return data.prs || [];
  },

  connectGitHub() {
    window.location.href = `${API_BASE_URL}/auth/github`;
  },

  // Repository Intelligence
  async indexRepository(repoFullName) {
    return api.post('/api/repository/index', { repo: repoFullName });
  },

  async getRepositoryStatus(repoFullName) {
    return api.get(`/api/repository/status?repo=${encodeURIComponent(repoFullName)}`);
  },

  async searchRepository(repoFullName, query, searchTypes = ['file', 'symbol', 'text']) {
    return api.post('/api/repository/search', { repo: repoFullName, query, searchTypes });
  },

  // Advanced Analysis Engines
  async runSecurityScan(repoFullName, code, filePath) {
    return api.post('/api/analysis/security', { repo: repoFullName, code, filePath });
  },

  async runPerformanceScan(code, filePath) {
    return api.post('/api/analysis/performance', { code, filePath });
  },

  async getArchitecture(repoFullName) {
    return api.post('/api/analysis/architecture', { repo: repoFullName });
  },

  async getHealthScorecard(repoFullName) {
    return api.post('/api/analysis/health', { repo: repoFullName });
  },

  async getImprovementPlan(repoFullName) {
    return api.post('/api/analysis/improve-plan', { repo: repoFullName });
  },

  // Automated Patch & Safe Fixes
  async generatePatch(filePath, originalCode, issueDescription, requestedFix) {
    return api.post('/api/fixes/generate', { filePath, originalCode, issueDescription, requestedFix });
  },

  async validatePatch(code, filePath) {
    return api.post('/api/fixes/validate', { code, filePath });
  },

  getReportDownloadUrl(repoFullName, format = 'markdown') {
    return `${API_BASE_URL}/api/reporting/export?repo=${encodeURIComponent(repoFullName)}&format=${format}`;
  },
};
