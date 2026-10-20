# CodeMentorAI — REST API Endpoint Reference

This reference documents every REST API route provided by the **CodeMentorAI Backend API Server**.

---

## Health & Operational Endpoints

### 1. System Health Check
- **Method**: `GET`
- **Endpoint**: `/health`
- **Auth**: None (Public)
- **Response**: `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2026-09-09T14:45:00.000Z"
}
```

### 2. Readiness Probe
- **Method**: `GET`
- **Endpoint**: `/health/readiness`
- **Auth**: None (Public)
- **Response**: `200 OK` (Ready) or `503 Service Unavailable`
```json
{
  "status": "ready",
  "timestamp": "2026-09-09T14:45:00.000Z"
}
```

---

## AI Inference & Mentorship Endpoints

### 3. AI Assistant Chat
- **Method**: `POST`
- **Endpoint**: `/api/chat`
- **Auth**: Optional Session
- **Request Body**:
```json
{
  "message": "How do I optimize database queries in Express?",
  "code": "const res = await db.query('SELECT * FROM users');",
  "language": "javascript",
  "mode": "senior",
  "scope": "current_file"
}
```
- **Response**: `200 OK`
```json
{
  "reply": "Use indexed queries and selective projections...",
  "cited_files": ["backend/index.js"],
  "fix": "",
  "improved_code": "const res = await db.query('SELECT id, name FROM users WHERE active = 1');"
}
```

### 4. Code Review Engine
- **Method**: `POST`
- **Endpoint**: `/api/review`
- **Auth**: None
- **Request Body**:
```json
{
  "code": "function add(a,b){ return a+b; }",
  "language": "javascript"
}
```
- **Response**: `200 OK`
```json
{
  "score": 92,
  "summary": "Clean addition function.",
  "issues": [],
  "improvements": ["Add TypeScript type definitions"],
  "refactored_code": "const add = (a: number, b: number): number => a + b;"
}
```

### 5. Deep Code Analysis
- **Method**: `POST`
- **Endpoint**: `/api/analyse`
- **Request Body**:
```json
{
  "code": "fs.readFileSync('large.json')",
  "language": "javascript",
  "issue": "blocking I/O"
}
```
- **Response**: `200 OK`
```json
{
  "analysis": "Synchronous file system call blocks Node event loop.",
  "fixes": "Replace readFileSync with async fs.promises.readFile.",
  "fixed_code": "const data = await fs.promises.readFile('large.json', 'utf8');"
}
```

### 6. Code Explanation
- **Method**: `POST`
- **Endpoint**: `/api/explain`
- **Request Body**:
```json
{
  "code": "const memo = (fn) => { const cache = {}; return (...args) => cache[args] ||= fn(...args); };",
  "language": "javascript"
}
```
- **Response**: `200 OK`
```json
{
  "explanation": "Higher-order function implementing result memoization via closures.",
  "key_concepts": ["Closure", "Higher-Order Function", "Memoization"],
  "improvements": "Use Map object for non-string key indexing."
}
```

---

## GitHub Integration Endpoints

### 7. GitHub OAuth Trigger
- **Method**: `GET`
- **Endpoint**: `/api/github/oauth`
- **Auth**: None
- **Behavior**: Redirects client browser to `https://github.com/login/oauth/authorize`.

### 8. GitHub Connection Status
- **Method**: `GET`
- **Endpoint**: `/api/github/status`
- **Response**: `200 OK`
```json
{
  "connected": true,
  "sessionId": "sess_12345",
  "hasToken": true
}
```

### 9. User Repositories
- **Method**: `GET`
- **Endpoint**: `/api/github/repos`
- **Auth**: Session Cookie / Bearer Token
- **Response**: `200 OK`
```json
{
  "repos": [
    {
      "id": 101,
      "name": "CodeMentorAI",
      "full_name": "user/CodeMentorAI",
      "private": false,
      "stargazers_count": 42
    }
  ]
}
```

---

## Repository Intelligence & Analysis Endpoints

### 10. Index Repository
- **Method**: `POST`
- **Endpoint**: `/api/repository/index`
- **Request Body**: `{ "repo": "user/repo" }`

### 11. Security Audit Scan
- **Method**: `POST`
- **Endpoint**: `/api/analysis/security`
- **Request Body**: `{ "code": "elem.innerHTML = input;", "filePath": "src/dom.js" }`

### 12. Performance Audit Scan
- **Method**: `POST`
- **Endpoint**: `/api/analysis/performance`
- **Request Body**: `{ "code": "fs.readFileSync('file.txt');", "filePath": "src/file.js" }`

### 13. Health Scorecard
- **Method**: `POST`
- **Endpoint**: `/api/analysis/health`
- **Request Body**: `{ "repo": "user/repo" }`

### 14. Report Export
- **Method**: `GET`
- **Endpoint**: `/api/reporting/export?repo=user/repo&format=markdown`
- **Response**: `200 OK` (File Download: `text/markdown`)
