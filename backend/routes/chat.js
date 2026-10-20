const express = require("express");
const router = express.Router();
const { chatWithAI } = require("../services/aiService");
const { repositoryIndexer } = require("../services/repository/repositoryIndexer");
const { AppError, asyncHandler } = require("../utils/errorHandler");

router.post("/", asyncHandler(async (req, res) => {
  const { message, code, language, mode = 'developer', scope = 'current_file', repo = '', selectedFiles = [] } = req.body;

  if (!message || typeof message !== "string") {
    throw new AppError("Valid message is required", 400, "VALIDATION_ERROR");
  }

  const index = repo ? repositoryIndexer.getRepositoryIndex(repo) : null;

  const response = await chatWithAI(message, code, language, {
    mode,
    scope,
    index,
    selectedFiles,
  });

  res.json(response);
}));

router.options("/", (req, res) => {
  res.sendStatus(200);
});

module.exports = router;
