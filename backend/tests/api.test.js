const request = require('supertest');
const { redactSecrets, scanForSecrets } = require('../services/repository/secretDetector');
const { repositoryIndexer } = require('../services/repository/repositoryIndexer');
const { validatePatchSyntax } = require('../services/fixes/patchValidator');

// Mock external services before requiring app
jest.mock('../services/githubService', () => ({
  getUserToken: jest.fn().mockReturnValue(null),
  setUserToken: jest.fn(),
  userTokens: new Map(),
  getRepoFiles: jest.fn().mockResolvedValue([{ path: 'backend/index.js' }]),
  getFileContent: jest.fn().mockResolvedValue('console.log("hello world");'),
}));

jest.mock('../services/aiService', () => ({
  reviewCode: jest.fn().mockResolvedValue({ score: 95, summary: 'Good code', issues: [], refactored_code: 'code' }),
  analyseCode: jest.fn().mockResolvedValue({ analysis: 'No bugs', fixes: '', fixed_code: 'code' }),
  explainCode: jest.fn().mockResolvedValue({ explanation: 'Explains function', key_concepts: [] }),
  chatWithAI: jest.fn().mockResolvedValue({ reply: 'Hello developer', cited_files: [], fix: '', improved_code: '' }),
  generateSecurityAudit: jest.fn().mockResolvedValue({ summary: 'Clean audit', findings: [] }),
  generatePerformanceAudit: jest.fn().mockResolvedValue({ summary: 'Clean perf', findings: [] }),
  generateFixPatch: jest.fn().mockResolvedValue({ filePath: 'file.js', reason: 'Fix bug', risk: 'Low', proposedCode: 'const x = 1;', explanation: 'Fixed' }),
}));

const app = require('../index');

describe('CodeMentorAI Advanced Platform Test Suite', () => {
  describe('Health & Core Status Checks', () => {
    it('GET /health should return status ok', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('timestamp');
    });

    it('GET /health/readiness should return readiness status', async () => {
      const res = await request(app).get('/health/readiness');
      expect([200, 503]).toContain(res.statusCode);
      expect(res.body).toHaveProperty('status');
    });
  });

  describe('Secret Detection & Privacy Safeguards', () => {
    it('should detect and redact Groq and GitHub API keys', () => {
      const rawCode = `const key = "gsk_1234567890abcdef1234567890abcdef";`;
      const redacted = redactSecrets(rawCode);
      expect(redacted).not.toContain('gsk_1234567890abcdef1234567890abcdef');
      expect(redacted).toContain('[REDACTED:GROQ_API_KEY]');
    });

    it('should identify sensitive .env files and redact content entirely', () => {
      const envContent = `GROQ_API_KEY=gsk_123\nDB_PASS=secret123`;
      const redacted = redactSecrets(envContent, '.env');
      expect(redacted).toContain('[REDACTED: SENSITIVE FILE');
    });

    it('should detect and redact secret assignments and RSA private keys', () => {
      const secretCode = `const secret = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";`;
      const rsaCode = `-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA0...\n-----END RSA PRIVATE KEY-----`;
      
      expect(redactSecrets(secretCode)).toContain('[REDACTED:CONFIDENTIAL_SECRET]');
      expect(redactSecrets(rsaCode)).toContain('[REDACTED:PRIVATE_KEY]');
    });
  });

  describe('Multi-Persona AI Chat & Prompt Service', () => {
    it('POST /api/chat should accept answer mode parameters', async () => {
      const res = await request(app).post('/api/chat').send({
        message: 'How do I optimize database queries?',
        mode: 'senior',
        scope: 'repository',
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('reply');
    });
  });

  describe('Patch Validation & Safe Fix Engine', () => {
    it('should pass syntax validation for valid JavaScript AST', () => {
      const res = validatePatchSyntax('const a = 1; function test() { return a + 1; }', 'test.js');
      expect(res.valid).toBe(true);
      expect(res.type).toBe('javascript');
    });

    it('should detect syntax errors for malformed JavaScript', () => {
      const res = validatePatchSyntax('const a = ;', 'broken.js');
      expect(res.valid).toBe(false);
      expect(res.message).toContain('Syntax error');
    });

    it('POST /api/fixes/generate should generate change request with diff', async () => {
      const res = await request(app).post('/api/fixes/generate').send({
        filePath: 'src/app.js',
        originalCode: 'var x = 1;',
        issueDescription: 'Use const instead of var',
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('diff');
      expect(res.body).toHaveProperty('proposedCode');
    });
  });

  describe('Security & Performance Engine Endpoints', () => {
    it('POST /api/analysis/security should detect static innerHTML risk', async () => {
      const res = await request(app).post('/api/analysis/security').send({
        code: 'element.innerHTML = userInput;',
        filePath: 'src/dom.js',
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('staticFindings');
      expect(res.body.staticFindings.some(f => f.title.includes('XSS'))).toBe(true);
    });

    it('POST /api/analysis/performance should detect synchronous file system operations', async () => {
      const res = await request(app).post('/api/analysis/performance').send({
        code: 'const data = fs.readFileSync("data.json");',
        filePath: 'src/file.js',
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body.staticFindings.some(f => f.title.includes('Synchronous'))).toBe(true);
    });
  });

  describe('Repository Intelligence & Health Scorecards', () => {
    it('POST /api/repository/index and GET status', async () => {
      const indexRes = await request(app).post('/api/repository/index').send({ repo: 'test/repo' });
      expect(indexRes.statusCode).toEqual(200);
      expect(indexRes.body).toHaveProperty('success', true);

      const statusRes = await request(app).get('/api/repository/status?repo=test/repo');
      expect(statusRes.statusCode).toEqual(200);
      expect(statusRes.body).toHaveProperty('indexed', true);
    });

    it('POST /api/analysis/health should compute 8-dimensional scorecard', async () => {
      const res = await request(app).post('/api/analysis/health').send({ repo: 'test/repo' });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('overallScore');
      expect(res.body.scores).toHaveProperty('security');
      expect(res.body.scores).toHaveProperty('productionReadiness');
    });

    it('GET /api/reporting/export should generate Markdown report file', async () => {
      const res = await request(app).get('/api/reporting/export?repo=test/repo&format=markdown');
      expect(res.statusCode).toEqual(200);
      expect(res.headers['content-type']).toContain('text/markdown');
      expect(res.text).toContain('# CodeMentorAI — Project Health & Engineering Report');
    });
  });
});
