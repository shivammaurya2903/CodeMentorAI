const express = require('express');
const { generateFixPatch } = require('../services/aiService');
const { createChangeRequest } = require('../services/fixes/patchGenerator');
const { validatePatchSyntax } = require('../services/fixes/patchValidator');
const { AppError, asyncHandler } = require('../utils/errorHandler');

const router = express.Router();

// POST /api/fixes/generate { filePath, originalCode, issueDescription, requestedFix }
router.post('/generate', asyncHandler(async (req, res) => {
  const { filePath = 'file.js', originalCode, issueDescription = '', requestedFix = '' } = req.body;
  if (!originalCode || typeof originalCode !== 'string') {
    throw new AppError('originalCode is required', 400, 'VALIDATION_ERROR');
  }
  if (originalCode.length > 50000) {
    throw new AppError('Code too large. Maximum 50000 characters allowed.', 413, 'PAYLOAD_TOO_LARGE');
  }

  const aiPatch = await generateFixPatch({
    filePath,
    originalCode,
    issueDescription,
    requestedFix,
  });

  const validation = validatePatchSyntax(aiPatch.proposedCode, filePath);

  const changeRequest = createChangeRequest({
    filePath,
    originalCode,
    proposedCode: aiPatch.proposedCode,
    reason: aiPatch.reason || issueDescription,
    risk: aiPatch.risk || 'Low',
    verificationStatus: validation.valid ? 'Syntax Verification Passed' : 'Syntax Check Failed',
  });

  res.json({
    ...changeRequest,
    validation,
    explanation: aiPatch.explanation,
  });
}));

// POST /api/fixes/validate { code, filePath }
router.post('/validate', asyncHandler(async (req, res) => {
  const { code, filePath = 'file.js' } = req.body;
  if (!code || typeof code !== 'string') {
    throw new AppError('code is required', 400, 'VALIDATION_ERROR');
  }
  if (code.length > 50000) {
    throw new AppError('Code too large. Maximum 50000 characters allowed.', 413, 'PAYLOAD_TOO_LARGE');
  }
  const validation = validatePatchSyntax(code, filePath);
  res.json(validation);
}));

module.exports = router;
