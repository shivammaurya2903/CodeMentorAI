const express = require('express');
const { generateFixPatch } = require('../services/aiService');
const { createChangeRequest } = require('../services/fixes/patchGenerator');
const { validatePatchSyntax } = require('../services/fixes/patchValidator');

const router = express.Router();

// POST /api/fixes/generate { filePath, originalCode, issueDescription, requestedFix }
router.post('/generate', async (req, res) => {
  const { filePath = 'file.js', originalCode, issueDescription = '', requestedFix = '' } = req.body;
  if (!originalCode) {
    return res.status(400).json({ error: 'originalCode is required' });
  }

  try {
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
  } catch (err) {
    console.error('Fix patch generation error:', err);
    res.status(500).json({ error: `Patch generation failed: ${err.message}` });
  }
});

// POST /api/fixes/validate { code, filePath }
router.post('/validate', (req, res) => {
  const { code, filePath = 'file.js' } = req.body;
  const validation = validatePatchSyntax(code, filePath);
  res.json(validation);
});

module.exports = router;
