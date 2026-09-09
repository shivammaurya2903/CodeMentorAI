require("dotenv").config();

// Validate required environment variables
function validateEnvironment() {
  const isProduction = process.env.NODE_ENV === 'production';
  const required = ['GROQ_API_KEY'];
  
  if (isProduction) {
    required.push('SESSION_SECRET');
  }

  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.error('❌ FATAL: Missing required environment variables:');
    missing.forEach(key => console.error(`  - ${key}`));
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

const chatRoute = require("./routes/chat");
const analyseRoute = require("./routes/analyse");
const explainRoute = require("./routes/explain");
const reviewRoute = require("./routes/review");
const githubRoute = require("./routes/github");
const repositoryRoute = require("./routes/repository");
const analysisRoute = require("./routes/analysis");
const fixesRoute = require("./routes/fixes");
const reportingRoute = require("./routes/reporting");

const app = express();

// Security Headers
app.use(helmet({
  contentSecurityPolicy: false, // Managed by reverse proxy or frontend
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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests from this IP, please try again later.', code: 'RATE_LIMIT_EXCEEDED' }
});

app.use(limiter);

// 2MB Body Parser size limit to support code payloads up to 50k characters
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: true }));
app.use(cookieParser());

const isProduction = process.env.NODE_ENV === 'production';
const sessionSecret = process.env.SESSION_SECRET || 'dev-session-secret-fallback-key';

if (!process.env.SESSION_SECRET) {
  console.warn('⚠️ WARNING: SESSION_SECRET not set in environment. Using development fallback.');
}

app.use(session({
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

// Routes
app.use("/api/chat", chatRoute);
app.use("/api/analyse", analyseRoute);
app.use("/api/explain", explainRoute);
app.use("/api/review", reviewRoute);
app.use("/api/github", githubRoute);
app.use("/api/repository", repositoryRoute);
app.use("/api/analysis", analysisRoute);
app.use("/api/fixes", fixesRoute);
app.use("/api/reporting", reportingRoute);

app.get('/auth/github', (req, res) => {
  res.redirect('/api/github/oauth');
});

app.get('/auth/github/callback', async (req, res) => {
  const query = new URLSearchParams(req.query).toString();
  const callbackPath = query ? `/api/github/callback?${query}` : '/api/github/callback';
  res.redirect(callbackPath);
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'CodeMentorAI API',
    status: 'ok',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      chat: '/api/chat',
      analyse: '/api/analyse',
      explain: '/api/explain',
      review: '/api/review',
      github: '/api/github'
    }
  });
});

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
app.use((err, req, res, next) => {
  console.error('❌ Express Error Handler caught:', err.message);
  const status = err.status || (err.type === 'entity.too.large' ? 413 : 500);
  const message = err.type === 'entity.too.large' 
    ? 'Request payload too large. Maximum size allowed is 2MB.' 
    : err.message || 'Internal Server Error';

  res.status(status).json({
    error: message,
    code: err.code || (status === 413 ? 'PAYLOAD_TOO_LARGE' : 'INTERNAL_SERVER_ERROR')
  });
});

if (require.main === module) {
  const port = process.env.PORT || 5000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`✅ CodeMentorAI Backend running on port ${port}`);
  });
}

module.exports = app; // Export for testing
