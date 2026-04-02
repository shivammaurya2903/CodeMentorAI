require("dotenv").config();

// Validate required environment variables
function validateEnvironment() {
  const required = ['GROQ_API_KEY', 'SESSION_SECRET'];
  const optional = ['GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET'];
  
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.error('❌ FATAL: Missing required environment variables:');
    missing.forEach(key => console.error(`  - ${key}`));
    process.exit(1);
  }
  
  const missingOptional = optional.filter(key => !process.env[key]);
  if (missingOptional.length > 0) {
    console.warn('⚠️ WARNING: Missing optional environment variables:');
    missingOptional.forEach(key => console.warn(`  - ${key} (GitHub features disabled)`));
  }
}

validateEnvironment();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const rateLimit = require("express-rate-limit");

const chatRoute = require("./routes/chat");
const analyseRoute = require("./routes/analyse");
const explainRoute = require("./routes/explain");
const reviewRoute = require("./routes/review");
const githubRoute = require("./routes/github");
const { exchangeCodeForToken } = require("./services/githubService");

const app = express();

const ALLOWED_ORIGINS = [
  'http://localhost:5000',
  'http://localhost:5500',
  'http://127.0.0.1:5000',
  'http://127.0.0.1:5500'
];

if (process.env.NODE_ENV === 'production') {
  ALLOWED_ORIGINS.push(
    'https://codementorai-n3b6.onrender.com',
    'https://ai-codementor.netlify.app'
  );
}

const corsOptions = {
  origin: function (origin, callback) {
    // In development, allow requests without origin (for testing)
    // In production, require origin to be in allowed list
    if (!origin && process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    if (ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  maxAge: 86400,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // strict for auth endpoints
  message: 'Too many auth requests, please try again later.'
});

app.use(limiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 1 day
}));

app.use("/api/chat", chatRoute);
app.use("/api/analyse", analyseRoute);
app.use("/api/explain", explainRoute);
app.use("/api/review", reviewRoute);
app.use("/api/github", strictLimiter, githubRoute);


const crypto = require('crypto');

app.get('/auth/github', (req, res) => {
  const state = crypto.randomBytes(32).toString('hex');
  req.session.oauthState = state;
  req.session.save((err) => {
    if (err) return res.status(500).json({ error: 'Session error' });
    const githubUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo&state=${state}`;
    res.redirect(githubUrl);
  });
});


app.get('/auth/github/callback', async (req, res) => {
  const { code, state, error } = req.query;
  
  const { userTokens } = require('./services/githubService');
  const FRONTEND_URL = 'http://localhost:5500';
  
  // Validate state parameter to prevent CSRF
  if (state !== req.session.oauthState) {
    console.error('❌ Invalid OAuth state parameter');
    return res.redirect(`${FRONTEND_URL}/index.html?error=invalid_state`);
  }
  
  // Handle user cancellation or error from GitHub
  if (error) {
    console.error('❌ GitHub OAuth cancelled/error:', error);
    return res.redirect(`${FRONTEND_URL}/index.html`);
  }
  
  // No authorization code received
  if (!code) {
    console.error('❌ No authorization code received');
    return res.redirect(`${FRONTEND_URL}/index.html`);
  }

  try {
    console.log('🔄 Exchanging code for GitHub token...');
    
    // Exchange code for access token
    await exchangeCodeForToken(code, state || req.sessionID);
    
    // Get token for localStorage
    const sessionId = state || req.sessionID;
    const tokenData = userTokens.get(sessionId);
    if (!tokenData?.access_token) {
      throw new Error('Token not found after exchange');
    }
    
    // Mark session as connected
    req.session.githubConnected = true;
    req.session.githubCode = code;
    req.session.githubToken = tokenData.access_token;
    req.session.save((err) => {
      if (err) console.error('Session save error:', err);
    });

    console.log('✅ GitHub OAuth successful! Redirecting to repo-review.html with token');
    
    // Redirect to repo-review page with token in URL for localStorage storage
    res.redirect(`${FRONTEND_URL}/repo-review.html?token=${encodeURIComponent(tokenData.access_token)}`);
  } catch (err) {
    console.error('❌ OAuth token exchange failed:', err.message);
    // On error, redirect back to home
    res.redirect(`${FRONTEND_URL}/index.html`);
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Backend is running with GitHub integration!',
    status: 'ok',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      data: '/api/data',
      chat: '/api/chat',
      analyse: '/api/analyse',
      explain: '/api/explain',
      review: '/api/review',
      github: '/api/github'
    }
  });
});

// Example API route for testing
app.get('/api/data', (req, res) => {
  res.json({
    success: true,
    message: 'Example API endpoint',
    data: {
      timestamp: new Date().toISOString(),
      sampleData: [
        { id: 1, name: 'Sample Item 1' },
        { id: 2, name: 'Sample Item 2' },
        { id: 3, name: 'Sample Item 3' }
      ]
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    groqKeySet: !!process.env.GROQ_API_KEY,
    githubConfig: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET)
  });
});

const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${port}`);
  console.log('🧠 AI Endpoints: /api/chat, /api/review, /api/analyse, /api/explain');
  console.log('🔗 GitHub: /api/github/oauth, /api/github/repos, /api/github/analyze-file');
  if (!process.env.GROQ_API_KEY) {
    console.warn("WARNING: GROQ_API_KEY not set in .env! AI calls will fail.");
  } else {
    console.log("✅ Groq AI configured.");
  }
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    console.warn("WARNING: GITHUB_CLIENT_ID/SECRET not set! GitHub features disabled.");
  } else {
    console.log("✅ GitHub OAuth configured.");
  }
});

