# CodeMentor AI — React + Vite AI Code Review Platform

[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-blue.svg)](https://nodejs.org/)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite-61dafb.svg)](https://react.dev/)
[![AI](https://img.shields.io/badge/AI-Groq-orange.svg)](https://console.groq.com/)

## Overview

CodeMentor AI is a modern AI-powered code review and mentorship platform built as a **React + Vite Single-Page Application (SPA)** with an Express backend. It provides instant code quality scoring, bug detection, refactoring suggestions, and deep repository file analysis via **GitHub OAuth** and the **Groq API** (`llama-3.1-8b-instant`).

---

## Key Features

- **React + Vite SPA Architecture:** High-performance, componentized developer tool interface.
- **Dark-First Technical Visual System:** Restrained, developer-centric UI/UX inspired by Vercel, Linear, and Cursor.
- **AI Code Review Workbench:** Code quality rating (0-100), severity-tagged issue cards, and refactored code blocks.
- **GitHub Repository Workspace:** Interactive directory file tree browser and single-file AI review tools.
- **Floating AI Assistant Widget:** Instant code Q&A, inline code fix cards, and secure React rendering.
- **Centralized API Layer & State:** Unified HTTP adapter (`api.js`) and `GithubAuthContext` with normalized backend responses.

---

## Quick Start

### Prerequisites

- Node.js v18 or newer
- A Groq API key in `backend/.env`

### Run Locally

```bash
npm run setup
npm run dev
```

- **React + Vite Frontend:** `http://localhost:5500`
- **Express Backend Server:** `http://localhost:5000`

### Build for Production

```bash
npm run build:frontend
```

---

## Project Structure

```text
e:/Projects/CodeMentorAI/
├── package.json                    # Workspace dev launcher & scripts
├── scripts/dev.js                  # Concurrent dev runner (Vite + Node)
├── backend/                        # Node.js/Express API server
│   ├── index.js                    # Express server entry point
│   ├── routes/                     # API routes (/api/review, /api/chat, /api/github)
│   └── services/                   # Groq AI & Octokit integration
└── frontend/                       # React + Vite SPA
    ├── vite.config.js              # Vite configuration with Express proxy
    ├── index.html                  # App root HTML
    └── src/
        ├── main.jsx                # React root entry
        ├── App.jsx                 # Router & Top-Level Error Boundary
        ├── styles/                 # Design tokens (tokens.css, globals.css)
        ├── services/               # API client & AI/GitHub adapters
        ├── context/                # GithubAuthContext & ThemeContext
        ├── components/
        │   ├── ui/                 # Button, Input, Card, Badge, Modal, Skeleton
        │   ├── layout/             # AppShell, Sidebar, TopBar, MobileNavigation
        │   ├── code/               # CodeEditor, CodeViewer, LanguageSelector
        │   ├── review/             # ReviewWorkspace, ScoreCard, IssueList
        │   ├── github/             # RepositoryList, FileTree, FileViewer
        │   └── chat/               # ChatWidget, ChatMessage, CodeFixCard
        └── pages/
            ├── HomePage.jsx        # Developer Dashboard
            ├── ReviewPage.jsx      # Code Review Workbench
            ├── WorkspacePage.jsx   # GitHub Repo Workbench
            ├── DocsPage.jsx        # API Documentation
            └── Github*.jsx         # OAuth Callback & Status pages
```

---

## Tech Stack

### Frontend Stack
- **Framework:** React 18 & React Router DOM v6
- **Build Tool:** Vite 5
- **Icons:** Lucide React
- **Design System:** Dark-first CSS Variables / Design Tokens

### Backend Stack
- **Runtime:** Node.js & Express.js
- **AI Integration:** Groq API (`llama-3.1-8b-instant`) via OpenAI SDK
- **GitHub Integration:** Octokit REST API & GitHub OAuth 2.0

---

## License

This project is licensed under the ISC license.
