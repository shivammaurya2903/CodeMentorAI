require("dotenv").config();

const pino = require('pino');
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV !== 'production' ? {
    target: 'pino-pretty',
    options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' }
  } : undefined
});

// Validate required environment variables
function validateEnvironment() {
  const isProduction = process.env.NODE_ENV === 'production';
  const required = ['GROQ_API_KEY'];
  
  if (isProduction) {
    required.push('SESSION_SECRET');
  }

  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    logger.error({ missing }, 'Missing required environment variables');
    process.exit(1);
  }
}

validateEnvironment();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const rateLimit = require("express-rate-limit");
const pinoHttp = require('pino-http');

const csrf = require('csurf');
const chatRoute = require("./routes/chat");
const explainRoute = require("./routes/explain");
const reviewRoute = require("./routes/review");
const githubRoute = require("./routes/github");
const repositoryRoute = require("./routes/repository");
const analysisRoute = require("./routes/analysis");
const fixesRoute = require("./routes/fixes");
const reportingRoute = require("./routes/reporting");
const { handleError } = require("./utils/errorHandler");

const app = express();

// Structured HTTP logging
app.use(pinoHttp({ logger }));

// CSRF protection for mutating routes
const csrfProtection = process.env.NODE_ENV === 'test' 
  ? (req, res, next) => next()  // Skip CSRF in test environment
  : csrf({
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      },
    });

// Make CSRF token available to frontend
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Security Headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.groq.com", "https://github.com"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

const allowedOrigins = (process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(origin => origin.trim()).filter(Boolean)
  : [
      'http://127.0.0.1:5500',
      'http://localhost:5500',
      'http://127.0.0.1:3000',
      'http://localhost:3000',
    ]);

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
}));

// Rate limiting - stricter for AI endpoints
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute for AI endpoints
  message: { error: 'Too many AI requests, please slow down.', code: 'AI_RATE_LIMIT_EXCEEDED' },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests from this IP, please try again later.', code: 'RATE_LIMIT_EXCEEDED' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);

// 2MB Body Parser size limit to support code payloads up to 50k characters
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: true }));
app.use(cookieParser());

const isProduction = process.env.NODE_ENV === 'production';

if (!process.env.SESSION_SECRET) {
  if (isProduction) {
    logger.error('SESSION_SECRET must be set in production environment');
    process.exit(1);
  }
  logger.warn('SESSION_SECRET not set in environment. Using development fallback.');
}

const sessionSecret = process.env.SESSION_SECRET || 'dev-session-secret-fallback-key';

const RedisStore = require('connect-redis').default;
const { createClient } = require('redis');

let sessionStore;
let redisClient = null;
if (process.env.REDIS_URL) {
  redisClient = createClient({ url: process.env.REDIS_URL });
  redisClient.on('error', (err) => logger.error({ err }, 'Redis Client Error'));
  redisClient.connect().catch((err) => logger.error({ err }, 'Redis connection failed'));
  sessionStore = new RedisStore({ client: redisClient });
  logger.info('Redis session store enabled');
} else {
  logger.warn('REDIS_URL not set, using in-memory session store (not suitable for production)');
}

// Graceful shutdown for Redis
const shutdownRedis = async () => {
  if (redisClient && redisClient.isOpen) {
    try {
      await redisClient.quit();
      logger.info('Redis connection closed');
    } catch (err) {
      logger.error({ err }, 'Error closing Redis connection');
    }
  }
};

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await shutdownRedis();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await shutdownRedis();
  process.exit(0);
});

app.use(session({
  store: sessionStore,
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

// Routes - apply CSRF protection to mutating endpoints
app.use("/api/chat", aiLimiter, csrfProtection, chatRoute);
app.use("/api/explain", aiLimiter, csrfProtection, explainRoute);
app.use("/api/review", aiLimiter, csrfProtection, reviewRoute);
app.use("/api/github", githubRoute);
app.use("/api/repository", csrfProtection, repositoryRoute);
app.use("/api/analysis", aiLimiter, csrfProtection, analysisRoute);
app.use("/api/fixes", aiLimiter, csrfProtection, fixesRoute);
app.use("/api/reporting", reportingRoute);

app.get('/auth/github', (req, res) => {
  res.redirect('/api/github/oauth');
});

app.get('/auth/github/callback', async (req, res) => {
  const query = new URLSearchParams(req.query).toString();
  const callbackPath = query ? `/api/github/callback?${query}` : '/api/github/callback';
  res.redirect(callbackPath);
});

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  const frontendDist = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendDist));
  
  // SPA fallback - serve index.html for non-API routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/auth') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
      if (err) {
        next(err);
      }
    });
  });
}

// Root endpoint (only in development or when not serving SPA)
if (process.env.NODE_ENV !== 'production') {
  app.get('/', (req, res) => {
    res.json({
      name: 'CodeMentorAI API',
      status: 'ok',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/health',
        chat: '/api/chat',
        explain: '/api/explain',
        review: '/api/review',
        github: '/api/github'
      }
    });
  });
}

// Public Health Check Endpoint (Safe, no internal credential disclosure)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString()
  });
});

// Readiness Probe
app.get('/health/readiness', (req, res) => {
  const isReady = !!process.env.GROQ_API_KEY;
  if (isReady) {
    res.json({ status: 'ready', timestamp: new Date().toISOString() });
  } else {
    res.status(503).json({ status: 'not_ready', message: 'Groq API Key unconfigured' });
  }
});

// Global Express Error Middleware
app.use(handleError);

if (require.main === module) {
  const port = process.env.PORT || 5000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`✅ CodeMentorAI Backend running on port ${port}`);
  });
}

module.exports = app; // Export for testing
