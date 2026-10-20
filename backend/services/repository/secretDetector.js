/**
 * Secret Detector and Redaction Service
 * Prevents sensitive API keys, tokens, credentials, and private keys
 * from being sent to LLMs or stored in cleartext repository indices.
 */

// Common high-confidence patterns for sensitive strings
const SECRET_PATTERNS = [
  { name: 'Groq API Key', regex: /gsk_[a-zA-Z0-9]{32,}/g, label: 'GROQ_API_KEY' },
  { name: 'GitHub Personal Access Token', regex: /(?:ghp|gho|ghu|ghs|ghr)_[a-zA-Z0-9]{36,}/g, label: 'GITHUB_PAT' },
  { name: 'GitHub Fine-grained PAT', regex: /github_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{59}/g, label: 'GITHUB_PAT' },
  { name: 'OpenAI API Key', regex: /sk-[a-zA-Z0-9]{32,}/g, label: 'OPENAI_API_KEY' },
  { name: 'AWS Access Key ID', regex: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/g, label: 'AWS_ACCESS_KEY' },
  { name: 'AWS Secret Key', regex: /(?<=aws_secret_access_key\s*=\s*)[A-Za-z0-9/+=]{40}/gi, label: 'AWS_SECRET_KEY' },
  { name: 'RSA/EC Private Key', regex: /-----BEGIN ([A-Z0-9\s]+) KEY-----[\s\S]*?-----END \1 KEY-----/g, label: 'PRIVATE_KEY' },
  { name: 'Generic Secret Token Assignment', regex: /(?:api_key|apikey|secret|password|passwd|auth_token|access_token|private_key)\s*[:=]\s*["']([^"'\s]{8,})["']/gi, label: 'CONFIDENTIAL_SECRET' },
  { name: 'Database Connection String', regex: /(?:mongodb(?:\+srv)?|postgres|postgresql|mysql|redis):\/\/[^:\s]+:[^@\s]+@[^\s"']+/gi, label: 'DATABASE_URI' },
  { name: 'JWT Token', regex: /eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g, label: 'JWT_TOKEN' },
  // Azure
  { name: 'Azure Storage Account Key', regex: /[A-Za-z0-9/+=]{88}/g, label: 'AZURE_STORAGE_KEY' },
  { name: 'Azure SAS Token', regex: /\?sv=\d{4}-\d{2}-\d{2}&[^&\s]*/g, label: 'AZURE_SAS_TOKEN' },
  { name: 'Azure Client Secret', regex: /[A-Za-z0-9._~-]{40,}/g, label: 'AZURE_CLIENT_SECRET' },
  // Google Cloud
  { name: 'GCP Service Account Key', regex: /"type":\s*"service_account"/g, label: 'GCP_SERVICE_ACCOUNT' },
  { name: 'GCP API Key', regex: /AIza[0-9A-Za-z_-]{35}/g, label: 'GCP_API_KEY' },
  { name: 'GCP OAuth Token', regex: /ya29\.[0-9A-Za-z_-]+/g, label: 'GCP_OAUTH_TOKEN' },
  // Slack
  { name: 'Slack Bot Token', regex: /xoxb-[0-9]{10,}-[0-9]{10,}-[A-Za-z0-9]{24}/g, label: 'SLACK_BOT_TOKEN' },
  { name: 'Slack User Token', regex: /xoxp-[0-9]{10,}-[0-9]{10,}-[0-9]{10,}-[A-Za-z0-9]{24}/g, label: 'SLACK_USER_TOKEN' },
  { name: 'Slack Webhook URL', regex: /https:\/\/hooks\.slack\.com\/services\/[A-Z0-9]+\/[A-Z0-9]+\/[A-Za-z0-9]+/g, label: 'SLACK_WEBHOOK' },
  // Discord
  { name: 'Discord Bot Token', regex: /[MN][A-Za-z\d]{23}\.[\w-]{6}\.[\w-]{27}/g, label: 'DISCORD_BOT_TOKEN' },
  { name: 'Discord Webhook', regex: /https:\/\/discord(?:app)?\.com\/api\/webhooks\/[0-9]+\/[A-Za-z0-9_-]+/g, label: 'DISCORD_WEBHOOK' },
  // Generic
  { name: 'Private SSH Key', regex: /-----BEGIN OPENSSH PRIVATE KEY-----[\s\S]*?-----END OPENSSH PRIVATE KEY-----/g, label: 'SSH_PRIVATE_KEY' },
  { name: 'PGP Private Key', regex: /-----BEGIN PGP PRIVATE KEY BLOCK-----[\s\S]*?-----END PGP PRIVATE KEY BLOCK-----/g, label: 'PGP_PRIVATE_KEY' },
];

const SENSITIVE_FILENAME_PATTERNS = [
  /\.env$/i,
  /\.env\..*/i,
  /.*\.pem$/i,
  /.*\.key$/i,
  /.*\.pkcs12$/i,
  /.*\.pfx$/i,
  /id_rsa/i,
  /id_ed25519/i,
  /credentials\.json$/i,
  /secrets\.yml$/i,
  /secrets\.yaml$/i,
  /.*\.jks$/i,
  /.*\.keystore$/i,
  /.*\.p12$/i,
  /gcp.*\.json$/i,
  /service-account.*\.json$/i,
  /firebase.*\.json$/i,
];

/**
 * Check if a file path is considered a sensitive file that should be excluded from full indexing
 */
function isSensitiveFile(filePath = '') {
  const norm = String(filePath).trim();
  return SENSITIVE_FILENAME_PATTERNS.some(pattern => pattern.test(norm));
}

/**
 * Scan content for potential secrets.
 * Returns array of detected secret findings.
 */
function scanForSecrets(content = '', filePath = '') {
  if (!content || typeof content !== 'string') return [];
  const findings = [];

  for (const pattern of SECRET_PATTERNS) {
    const rx = new RegExp(pattern.regex.source, pattern.regex.flags);
    const matches = content.matchAll(rx);
    for (const match of matches) {
      findings.push({
        type: pattern.name,
        label: pattern.label,
        match: match[0],
        index: match.index,
        filePath,
      });
    }
  }

  return findings;
}

/**
 * Redact secrets from text string prior to LLM submission or logging
 */
function redactSecrets(content = '', filePath = '') {
  if (!content || typeof content !== 'string') return '';
  
  if (isSensitiveFile(filePath)) {
    return `[REDACTED: SENSITIVE FILE (${filePath}) - CONTENT EXCLUDED FOR SECURITY]`;
  }

  let redacted = content;

  for (const pattern of SECRET_PATTERNS) {
    const rx = new RegExp(pattern.regex.source, pattern.regex.flags);
    redacted = redacted.replace(rx, `[REDACTED:${pattern.label}]`);
  }

  return redacted;
}

module.exports = {
  isSensitiveFile,
  scanForSecrets,
  redactSecrets,
  SECRET_PATTERNS,
};
