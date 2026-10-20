require("dotenv").config();
const OpenAI = require("openai");
const pino = require('pino');

const logger = pino({ name: 'groqService' });

/**
 * Groq AI Service Provider
 * Provides lazy-initialized OpenAI-compatible client for Groq LLM inference,
 * retry logic, model configuration, and secure error reporting.
 */

let groqClientInstance = null;

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_groq_api_key_here') {
    throw new Error('GROQ_API_KEY is missing or unconfigured in backend environment.');
  }

  if (!groqClientInstance || groqClientInstance._options?.apiKey !== apiKey) {
    groqClientInstance = new OpenAI({
      apiKey,
      baseURL: "https://api.groq.com/openai/v1"
    });
  }

  return groqClientInstance;
}

function isGroqConfigured() {
  const key = process.env.GROQ_API_KEY;
  return Boolean(key && key.trim() !== '' && key !== 'your_groq_api_key_here');
}

function getGroqModel() {
  return process.env.GROQ_MODEL || "qwen/qwen3-8b-27b";
}

function logGroqError(error) {
  logger.error({
    message: error?.message || 'Unknown Groq error',
    status: error?.status || 500,
    code: error?.code || 'GROQ_ERROR',
    timestamp: new Date().toISOString(),
  }, 'Groq API Technical Error');
}

function isGroqJsonGenerationError(error) {
  const message = (error && error.message ? String(error.message) : '').toLowerCase();
  return error && error.status === 400 && message.includes('failed to generate json');
}

/**
 * Create completion with Groq AI API
 * Handles retries, timeout, JSON mode fallback, and exponential backoff
 */
async function createGroqCompletion(messages, options = {}) {
  const { retries = 2, jsonMode = true, modelOverride = null } = options;
  const client = getGroqClient();
  const model = modelOverride || getGroqModel();
  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutMs = Number(process.env.GROQ_TIMEOUT_MS || 15000);
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const params = {
        model,
        messages,
      };

      if (jsonMode) {
        params.response_format = { type: "json_object" };
      }

      const response = await client.chat.completions.create(params, { signal: controller.signal });
      clearTimeout(timer);
      return response;
    } catch (error) {
      clearTimeout(timer);
      lastError = error;

      // Handle JSON mode formatting errors on Groq models
      if (jsonMode && isGroqJsonGenerationError(error)) {
        try {
          return await client.chat.completions.create({
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

  logGroqError(lastError);

  if (lastError?.status === 401) {
    throw new Error("GROQ_AUTH_ERROR: 401 Incorrect API key. Check GROQ_API_KEY in .env");
  }

  if (lastError?.status === 429) {
    throw new Error("GROQ_RATE_LIMIT: Rate limit exceeded on Groq API. Please try again in a few moments.");
  }

  throw new Error(`AI service failed: ${lastError?.message || 'Groq request failed'}`);
}

module.exports = {
  getGroqClient,
  isGroqConfigured,
  getGroqModel,
  logGroqError,
  createGroqCompletion,
};
