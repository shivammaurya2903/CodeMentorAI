# CodeMentorAI — System Architecture Documentation

This document describes the high-level architecture, design patterns, security boundaries, and data flow lifecycles of **CodeMentorAI**.

---

## 1. High-Level Architecture Overview

```text
┌────────────────────────────────────────────────────────┐
│                   Frontend Client                      │
│            React 18 + Vite 5 SPA (Port 5500)          │
│     Pages, Components, Theme Context, API Client      │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS / REST API
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Express API Router                   │
│             Node.js Backend Server (Port 5000)         │
│   Cors, Rate Limiting, Helmet, Cookie Session Store    │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
               ▼                          ▼
┌─────────────────────────────┐ ┌────────────────────────┐
│ Repository Intelligence &   │ │ Groq AI Service        │
│ Secret Redaction Engine     │ │ Provider (groqService) │
│ Indexer, AST, Context Bldr  │ │ OpenAI SDK (Groq)      │
└─────────────────────────────┘ └───────────┬────────────┘
                                            │
                                            ▼
                                      ┌────────────────────────└─────┐
                                      │ Groq API Cloud Engine (openai/gpt-oss-120b) │
                                      └───────────────────────────────────────────────┘
```

---

## 2. Component Architecture

### 2.1 Frontend Architecture
- **Framework**: React 18 with Vite 5.
- **Routing**: React Router v6 mapping core workspace pages (`/`, `/review`, `/workspace`, `/security`, `/health`, `/improve-plan`, `/docs`).
- **Services Layer**: `src/services/api.js` (centralized HTTP fetch wrapper with error handling and credentials), `src/services/aiService.js`, `src/services/githubService.js`.
- **State Management**: React `useState`/`useContext` (`GithubAuthContext`, `ThemeContext`) plus `localStorage` persistence.

### 2.2 Backend Architecture
- **Server Framework**: Node.js & Express 4.
- **Middleware**:
  - `cors`: Secure cross-origin resource sharing.
  - `helmet`: Security response headers.
  - `express-rate-limit`: Request throttling (200 req / 15 min).
  - `express-session`: HTTP-only cookie-based session management.
- **Services Abstraction**:
  - `groqService.js`: Lazy-initialized OpenAI client for Groq LLM inference with retry backoff.
  - `secretDetector.js`: Client/Server secret redaction filter for PATs, keys, credentials.
  - `repositoryIndexer.js`: In-memory code symbol, file tree, and AST dependency indexer.
  - `patchValidator.js`: Babel AST parser verifying synthetic patch syntax.

---

## 3. Data Flow Lifecycles

### 3.1 AI Chat & Code Review Lifecycle
```text
User Input → UI Form → aiService.chatWithAI() 
  → HTTP POST /api/chat 
  → secretDetector.redactSecrets() 
  → contextBuilder.buildContext() 
  → groqService.createGroqCompletion() 
  → Groq API Cloud 
  → safeJsonParse & sanitize 
  → HTTP Response JSON 
  → State Update → UI Render with Citations & Fix Cards
```

---

## 4. Security & Privacy Boundaries
- **Zero Client Key Exposure**: `GROQ_API_KEY`, `GITHUB_CLIENT_SECRET`, and `SESSION_SECRET` remain strictly on the backend server.
- **Secret Redaction**: Regex-based redaction replaces sensitive tokens with `[REDACTED:TOKEN]` placeholders prior to LLM submission.
- **Session Privacy**: Cookie sessions are flagged `HttpOnly`, `SameSite=Lax`, and `Secure` in production environments.
