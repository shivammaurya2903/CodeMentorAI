const express = require("express");
const router = express.Router();
const { chatWithAI } = require("../services/aiService");
const { repositoryIndexer } = require("../services/repository/repositoryIndexer");

router.post("/", async (req, res) => {
  try {
    const { message, code, language, mode = 'developer', scope = 'current_file', repo = '', selectedFiles = [] } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Valid message is required" });
    }

    const index = repo ? repositoryIndexer.getRepositoryIndex(repo) : null;

    const response = await chatWithAI(message, code, language, {
      mode,
      scope,
      index,
      selectedFiles,
    });

    res.json(response);
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: err.message || "Chat service failed. Check API key." });
  }
});

router.options("/", (req, res) => {
  res.sendStatus(200);
});

module.exports = router;
