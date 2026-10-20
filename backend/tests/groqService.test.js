const { getGroqClient, isGroqConfigured, getGroqModel, logGroqError, createGroqCompletion } = require('../services/groqService');

describe('Groq Service Provider Unit Test Suite', () => {
  const originalApiKey = process.env.GROQ_API_KEY;

  afterEach(() => {
    process.env.GROQ_API_KEY = originalApiKey;
  });

  it('should detect operational status based on GROQ_API_KEY env var', () => {
    process.env.GROQ_API_KEY = 'gsk_test_1234567890abcdef1234567890abcdef';
    expect(isGroqConfigured()).toBe(true);

    process.env.GROQ_API_KEY = '';
    expect(isGroqConfigured()).toBe(false);

    process.env.GROQ_API_KEY = 'your_groq_api_key_here';
    expect(isGroqConfigured()).toBe(false);
  });

  it('should return default or custom model name from environment', () => {
    delete process.env.GROQ_MODEL;
    expect(getGroqModel()).toBe('qwen/qwen3-8b-27b');

    process.env.GROQ_MODEL = 'llama-3.3-70b-versatile';
    expect(getGroqModel()).toBe('llama-3.3-70b-versatile');
  });

  it('should initialize OpenAI-compatible client with Groq base URL', () => {
    process.env.GROQ_API_KEY = 'gsk_valid_key_test_1234567890abcdef';
    const client = getGroqClient();
    expect(client).toBeDefined();
    expect(client.baseURL).toBe('https://api.groq.com/openai/v1');
  });

  it('should throw clear error when GROQ_API_KEY is missing', () => {
    process.env.GROQ_API_KEY = '';
    expect(() => getGroqClient()).toThrow('GROQ_API_KEY is missing or unconfigured');
  });

  it('should log errors securely without crashing', () => {
    expect(() => logGroqError(new Error('Test API exception'))).not.toThrow();
  });
});
