/**
 * Safe Code Patch & Diff Generation Engine
 * Produces structured ChangeRequest patches with unified diff visualization,
 * rationale, risk metrics, and non-destructive apply workflows.
 */

const crypto = require('crypto');

/**
 * Generate a ChangeRequest object
 */
function createChangeRequest({ filePath, originalCode, proposedCode, reason, risk = 'Low', verificationStatus = 'Pending Verification' }) {
  const id = `patch_${crypto.randomBytes(6).toString('hex')}`;
  const diff = generateUnifiedDiff(originalCode, proposedCode, filePath);

  return {
    id,
    filePath,
    originalCode,
    proposedCode,
    diff,
    reason: reason || 'Refactored code to resolve quality or security issues.',
    risk: ['Low', 'Medium', 'High'].includes(risk) ? risk : 'Low',
    verificationStatus,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Simple Unified Diff Generator for UI side-by-side or line diff view
 */
function generateUnifiedDiff(original = '', proposed = '', filePath = 'file.js') {
  const origLines = original.split('\n');
  const propLines = proposed.split('\n');

  const diffLines = [];
  diffLines.push(`--- a/${filePath}`);
  diffLines.push(`+++ b/${filePath}`);

  const maxLen = Math.max(origLines.length, propLines.length);
  for (let i = 0; i < maxLen; i++) {
    const o = origLines[i];
    const p = propLines[i];

    if (o === p) {
      if (o !== undefined) diffLines.push(`  ${o}`);
    } else {
      if (o !== undefined) diffLines.push(`- ${o}`);
      if (p !== undefined) diffLines.push(`+ ${p}`);
    }
  }

  return diffLines.join('\n');
}

module.exports = {
  createChangeRequest,
  generateUnifiedDiff,
};
