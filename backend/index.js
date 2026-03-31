require("dotenv").config();
const express = require("express");
const cors = require("cors");

const chatRoute = require("./routes/chat");
const analyseRoute = require("./routes/analyse");
const explainRoute = require("./routes/explain");
const reviewRoute = require("./routes/review");

const app = express();

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = ['http://localhost:5000', 'http://localhost:5500', 'http://127.0.0.1:5000', 'http://127.0.0.1:5500'];
    
    // Allow requests with no origin (like mobile apps, file://, or curl requests)
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/chat", chatRoute);
app.use("/api/analyse", analyseRoute);
app.use("/api/explain", explainRoute);
app.use("/api/review", reviewRoute);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    groqKeySet: !!process.env.GROQ_API_KEY 
  });
});

const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${port}`);
  if (!process.env.GROQ_API_KEY) {
    console.warn("WARNING: GROQ_API_KEY not set in .env! API calls will fail.");
  } else {
    console.log("Groq API key configured.");
  }
});
