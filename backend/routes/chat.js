const express = require("express");
const router = express.Router();
const { chatWithAI } = require("../services/aiService");
const { AppError, asyncHandler } = require("../utils/errorHandler");

router.post("/", asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== "string") {
    throw new AppError("Valid message is required", 400, "VALIDATION_ERROR");
  }

  const response = await chatWithAI({
    message: req.body.message,
    code: req.body.code || req.body.context,
    language: req.body.language || 'javascript',
    history: req.body.history || [],
    mode: req.body.mode || 'general',
    scope: req.body.scope || 'file',
    repoContext: req.body.repoContext,
  });

  res.json(response);
}));

router.options("/", (req, res) => {
  res.sendStatus(200);
});

module.exports = router;
