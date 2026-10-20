# CodeMentorAI — Groq AI Integration Architecture

This document describes the Groq AI service layer, model configurations, OpenAI SDK compatibility, prompt engineering pipeline, and error-handling strategies.

---

## 1. Provider & Architecture

CodeMentorAI integrates with **Groq Cloud** for sub-second LLM inference using the OpenAI Node.js SDK compatibility layer (`openai` package).

```text
Backend Server
   │
   ├── groqService.js (Lazy OpenAI Client)
   │     ├── Base URL: https://api.groq.com/openai/v1
   │     ├── API Key: process.env.GROQ_API_KEY
   │     └── Default Model: llama-3.1-8b-instant
   │
   ├── promptService.js (Structured System & Persona Prompts)
   ├── responseValidator.js (JSON Candidate Extraction & Fallback Sanitizing)
   └── secretDetector.js (Client/Server Token & Credential Masking)
```

---

## 2. Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `GROQ_API_KEY` | Secret Groq API Key (`gsk_...`) | *Required* |
| `GROQ_MODEL` | Target Groq LLM Model Name | `llama-3.1-8b-instant` |
| `GROQ_TIMEOUT_MS` | API Request Timeout (ms) | `15000` |

Supported Models:
- `llama-3.1-8b-instant` (Fast, recommended for real-time chat & review)
- `llama-3.3-70b-versatile` (Deep reasoning & complex architectural audits)
- `mixtral-8x7b-32768` (High-context multi-file analysis)

---

## 3. Privacy & Secret Redaction Filter (`secretDetector.js`)

Before any code snippet or repository context is transmitted to the Groq API, `redactSecrets()` scans and sanitizes the payload:

- **Groq API Keys**: `gsk_[a-zA-Z0-9]{32,}` → `[REDACTED:GROQ_API_KEY]`
- **GitHub PATs**: `ghp_...`, `github_pat_...` → `[REDACTED:GITHUB_PAT]`
- **AWS Secret Keys**: `[REDACTED:AWS_SECRET_KEY]`
- **RSA Private Keys**: `-----BEGIN ([A-Z0-9\s]+) KEY-----...` → `[REDACTED:PRIVATE_KEY]`
- **Sensitive Files**: `.env`, `.pem`, `id_rsa` → `[REDACTED: SENSITIVE FILE]`

---

## 4. Multi-Persona Prompt Engineering (`promptService.js`)

The AI engine supports 7 operational personas:
1. `developer`: Balanced technical mentorship and refactored code blocks.
2. `senior`: High-level architecture, design patterns, and system trade-offs.
3. `beginner`: Simplified step-by-step explanations with analogies.
4. `debugging`: Root-cause stack trace diagnosis and bug isolation.
5. `security`: Threat modeling, OWASP Top 10 vulnerabilities, and remediation.
6. `performance`: Time/space complexity (\(O(n)\)) analysis and memory leak prevention.
7. `interview`: Interactive technical questioning and candidate guidance.

---

## 5. Robust JSON Parsing & Fallbacks (`safeJsonParse`)

Groq responses are formatted as structured JSON. `safeJsonParse()` handles edge cases:
- Extracts candidates enclosed in ` ```json ... ``` ` or raw JSON objects.
- Strips single-line (`//`) and multi-line (`/* */`) comments.
- Cleans trailing commas prior to `JSON.parse()`.
- Falls back gracefully to default structured objects if parsing fails.

---

## 6. Error Handling & Retry Backoff

- **Automatic Retries**: Retries up to 2 times for transient errors (`AbortError`, `429 Rate Limit`, `5xx Server Error`).
- **Exponential Backoff**: Waits `(attempt + 1) * 1000` ms between retries.
- **Client Error Masking**: Converts technical Groq errors into safe, actionable API responses for the frontend.
