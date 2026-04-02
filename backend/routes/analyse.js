const express = require("express");
const router = express.Router();
const { analyseCode } = require("../services/aiService");

router.post("/", async (req, res) => {
  try {
    const { code, language, issue } = req.body;

    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "Valid code is required" });
    }
    
    const MAX_CODE_LENGTH = 50000; // characters
    if (code.length > MAX_CODE_LENGTH) {
      return res.status(413).json({ 
        error: `Code too large. Maximum ${MAX_CODE_LENGTH} characters allowed.`
      });
    }

    const response = await analyseCode(code, language, issue);

    res.json(response);
  } catch (err) {
    console.error("Analyse error:", err);
    res.status(500).json({ error: "Analyse service failed. Check API key." });
  }
});

module.exports = router;
