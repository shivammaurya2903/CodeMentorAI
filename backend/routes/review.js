const express = require("express");
const router = express.Router();
const { reviewCode } = require("../services/aiService");
const { AppError, asyncHandler } = require("../utils/errorHandler");

router.post("/", asyncHandler(async (req, res) => {
  const { code, language } = req.body;

  if (!code || typeof code !== "string") {
    throw new AppError("Valid code is required", 400, "VALIDATION_ERROR");
  }
  
  const MAX_CODE_LENGTH = 50000;
  if (code.length > MAX_CODE_LENGTH) {
    throw new AppError(`Code too large. Maximum ${MAX_CODE_LENGTH} characters allowed.`, 413, "PAYLOAD_TOO_LARGE");
  }

  const response = await reviewCode(code, language);

  res.json(response);
}));

module.exports = router;
