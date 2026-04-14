# CodeMentor AI - AI-Powered Code Review & Mentorship Platform

[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-blue.svg)](https://nodejs.org/)
[![Frontend](https://img.shields.io/badge/Frontend-HTML%20CSS%20JS-green.svg)](https://developer.mozilla.org/en-US/docs/Web)
[![AI](https://img.shields.io/badge/AI-Groq-orange.svg)](https://console.groq.com/)

## Overview

CodeMentor AI is an AI-powered code mentorship platform that provides instant code reviews, bug detection, refactoring suggestions, and performance analysis. You can paste code directly or connect a GitHub repository and get feedback like working with a senior developer.

### Key Features

- AI code review with bug detection and suggestions
- Code quality scores with actionable insights
- Multi-language support for JavaScript, Python, Java, TypeScript, C++, Go, and more
- Real-time feedback for faster iteration
- Performance analysis with optimization recommendations
- GitHub integration for repository browsing and review

## Quick Start

### Prerequisites

- Node.js v18 or newer
- A Groq API key in `backend/.env`

### Run Locally

```bash
npm run setup:backend
npm run dev
```

The backend runs on `http://localhost:5000` and the frontend runs on `http://localhost:5500`.

If you want to open pages directly, use `frontend/index.html` for the landing page and `frontend/review.html` for the review interface.

### Health Check

```bash
curl http://localhost:5000/health
```

### Environment Variables

Copy `backend/.env.example` to `backend/.env` and set the values you need:

```bash
GROQ_API_KEY=your_groq_api_key_here
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
GITHUB_CALLBACK_URL=http://localhost:5000/auth/github/callback
FRONTEND_URL=http://localhost:5500
PORT=5000
SESSION_SECRET=change_me_for_dev
```

## API Endpoints

- `POST /api/review` - AI code review and quality score. Body: `{ code, language }`
- `POST /api/chat` - AI chat for coding questions. Body: `{ message }`
- `POST /api/analyse` - Deep code analysis. Body: `{ code }`
- `POST /api/explain` - Explain code functionality. Body: `{ code }`
- `GET /health` - Health check.

### Example Review Request

```bash
curl -X POST http://localhost:5000/api/review \
  -H "Content-Type: application/json" \
  -d '{"code":"function twoSum(nums, target) { const map = {}; ... }","language":"javascript"}'
```

## Project Structure

```text
e:/CodeMentorAI/
├── backend/                 # Node.js/Express API server
│   ├── index.js             # Main server entry
│   ├── package.json         # Backend dependencies
│   ├── routes/              # API routes
│   └── services/            # AI and GitHub service integrations
└── frontend/                # Static web app
    ├── index.html           # Landing page
    ├── review.html          # Code review interface
    ├── docs.html            # Documentation
    ├── styles.css           # Global styles
    ├── script.js            # Frontend logic
    ├── review.js            # Review page logic
    └── docs.css             # Docs styles
```

## Tech Stack

### Backend Stack

- Node.js and Express.js
- Groq AI integration through the OpenAI SDK
- CORS for frontend access
- dotenv for environment configuration

### Frontend Stack

- Vanilla HTML, CSS, and JavaScript
- JetBrains Mono and Inter fonts
- Responsive layout with code review and repository browsing views

### Dependencies

```bash
npm i express cors dotenv openai
npm i -D nodemon
```

## Features Showcase

1. Landing page in `index.html` with a hero section, features, testimonials, and demo content.
2. Code review in `review.html` with AI analysis and refactoring output.
3. Documentation in `docs.html` with usage guidance.
4. Mobile-friendly layouts throughout the app.

## Usage Examples

### Code Review Example

```javascript
function findDuplicates(arr) {
  return arr.filter((item, index) => arr.indexOf(item) === index);
}
```

### Frontend Integration

The review page includes:

- Syntax-highlighted code editor
- Language selection
- Instant AI feedback
- Copy and export actions

## Contributing

1. Fork the repository.
2. Create a feature branch with `git checkout -b feature/amazing-feature`.
3. Commit your changes with `git commit -m 'Add amazing feature'`.
4. Push the branch with `git push origin feature/amazing-feature`.
5. Open a pull request.

## License

This project is licensed under the ISC license.

## Acknowledgments

- Groq for AI capabilities
- Shivam Maurya for the original project

## Next Steps

- GitHub integration improvements
- User authentication
- Code snippet history
- VS Code extension
- Docker deployment

## Built With Care

Star this repository if you find it useful.
