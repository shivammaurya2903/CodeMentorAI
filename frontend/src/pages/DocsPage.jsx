import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Sparkles,
  Code2,
  FolderGit2,
  Shield,
  Activity,
  Terminal,
  Server,
  Layers,
  ArrowRight,
  HelpCircle,
  AlertTriangle,
  Lock,
  Cpu,
} from 'lucide-react';
import { Badge, Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';
import {
  DocsCallout,
  DocsCodeBlock,
  DocsTable,
  DocsStep,
  DocsSearch,
} from '../components/docs/DocsComponents';

export function DocsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState('intro');

  const navSections = [
    {
      title: 'Getting Started',
      items: [
        { id: 'intro', label: 'What is CodeMentorAI?' },
        { id: 'quickstart', label: 'Quick Start Walkthrough' },
        { id: 'architecture', label: 'System Architecture' },
      ],
    },
    {
      title: 'Core Workflows',
      items: [
        { id: 'code-review', label: 'AI Code Review Guide' },
        { id: 'ai-chat', label: 'AI Engineering Assistant' },
        { id: 'explanation', label: 'Code Breakdown & Explain' },
        { id: 'deep-analysis', label: 'Deep Analysis & Fixes' },
      ],
    },
    {
      title: 'GitHub Workbench',
      items: [
        { id: 'github-oauth', label: 'Connecting GitHub OAuth' },
        { id: 'repo-browser', label: 'Repository Explorer' },
        { id: 'diff-patches', label: 'Diff Patch Generation' },
      ],
    },
    {
      title: 'Understanding Results',
      items: [
        { id: 'quality-score', label: 'Quality Score Index (0-100)' },
        { id: 'issue-severity', label: 'Issue Severity Matrix' },
        { id: 'health-scorecard', label: '8-Dimension Health Scorecard' },
        { id: 'improvement-roadmap', label: 'P0-P3 Improvement Roadmap' },
      ],
    },
    {
      title: 'Developer Reference',
      items: [
        { id: 'api-reference', label: 'REST API Endpoint Table' },
        { id: 'environment-variables', label: 'Environment Variables' },
        { id: 'local-dev', label: 'Local Development Setup' },
      ],
    },
    {
      title: 'Security & Privacy',
      items: [
        { id: 'security-privacy', label: 'Secrets & Code Privacy' },
      ],
    },
    {
      title: 'Support & FAQ',
      items: [
        { id: 'troubleshooting', label: 'Troubleshooting & Errors' },
        { id: 'faq', label: 'Frequently Asked Questions' },
      ],
    },
  ];

  const matchesSearch = (text) => {
    if (!searchTerm.trim()) return true;
    return text.toLowerCase().includes(searchTerm.toLowerCase());
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="CodeMentorAI Documentation Hub"
        description="Complete user guides, GitHub integration workflows, AI review scoring metrics, backend REST API references, and security best practices."
        badge={
          <Badge variant="info" size="sm" icon={BookOpen}>
            User & Developer Documentation
          </Badge>
        }
      />

      {/* Search Input Bar */}
      <DocsSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {/* Main Documentation Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(240px, 280px) 1fr',
          gap: '2rem',
          alignItems: 'flex-start',
        }}
        className="c-workspace-grid"
      >
        {/* Left Docs Navigation Sidebar */}
        <aside
          style={{
            position: 'sticky',
            top: '80px',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.25rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            maxHeight: 'calc(100vh - 100px)',
            overflowY: 'auto',
            boxShadow: 'var(--shadow-sm)',
          }}
          className="desktop-only"
        >
          {navSections.map((group) => (
            <div key={group.title} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--fw-bold)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {group.title}
              </span>
              {group.items.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setActiveSection(item.id)}
                  style={{
                    padding: '0.45rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: activeSection === item.id ? 'var(--fw-bold)' : 'var(--fw-medium)',
                    color: activeSection === item.id ? 'var(--primary)' : 'var(--text-muted)',
                    backgroundColor: activeSection === item.id ? 'var(--primary-subtle)' : 'transparent',
                    textDecoration: 'none',
                    transition: 'all var(--transition-fast)',
                  }}
                  className="c-tree-item"
                >
                  {item.label}
                </a>
              ))}
            </div>
          ))}
        </aside>

        {/* Right Main Content Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', minWidth: 0 }}>
          {/* SECTION: INTRODUCTION */}
          {matchesSearch('introduction what is codementorai ai review groq llama ast') && (
            <section id="intro" style={{ scrollMarginTop: '90px' }}>
              <Card style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Sparkles size={24} style={{ color: 'var(--primary)' }} />
                  <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--fw-extrabold)', color: 'var(--text)', margin: 0 }}>
                    What is CodeMentorAI?
                  </h2>
                </div>

                <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', lineHeight: 'var(--lh-relaxed)', margin: 0 }}>
                  <strong>CodeMentorAI</strong> is an enterprise AI-powered code review, security audit, and senior developer mentorship platform. It provides sub-second feedback on code quality, detects OWASP security risks and memory leaks, generates unit test cases, and produces refactored code patches directly inside your workflow.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
                  <div style={{ padding: '1rem', backgroundColor: 'var(--surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--fw-bold)', color: 'var(--text)', marginBottom: '0.35rem' }}>
                      ⚡ Groq LLM Inference
                    </h4>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', margin: 0 }}>
                      Powered by high-throughput Llama-3 70B models for instantaneous review iteration cycles.
                    </p>
                  </div>

                  <div style={{ padding: '1rem', backgroundColor: 'var(--surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--fw-bold)', color: 'var(--text)', marginBottom: '0.35rem' }}>
                      📁 Repository Context
                    </h4>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', margin: 0 }}>
                      Index GitHub repositories to ask architecture questions and run deep AST security audits.
                    </p>
                  </div>

                  <div style={{ padding: '1rem', backgroundColor: 'var(--surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--fw-bold)', color: 'var(--text)', marginBottom: '0.35rem' }}>
                      🛠️ Automated Diff Patches
                    </h4>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', margin: 0 }}>
                      Generate valid git diff patches for detected bugs and apply them into the code viewer with one click.
                    </p>
                  </div>
                </div>

                <DocsCallout type="tip" title="No Setup Required for Snippets">
                  You can immediately start reviewing code snippets on the <Link to="/review" style={{ fontWeight: 600 }}>AI Code Review page</Link> without linking a GitHub account!
                </DocsCallout>
              </Card>
            </section>
          )}

          {/* SECTION: QUICK START */}
          {matchesSearch('quick start workflow step review workspace github') && (
            <section id="quickstart" style={{ scrollMarginTop: '90px' }}>
              <Card style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <RocketIcon size={24} style={{ color: 'var(--primary)' }} />
                  <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--fw-extrabold)', color: 'var(--text)', margin: 0 }}>
                    Quick Start Guide
                  </h2>
                </div>

                <DocsStep number="1" title="Open CodeMentorAI">
                  Navigate to the Dashboard or open the <strong>AI Code Review</strong> page from the sidebar navigation.
                </DocsStep>

                <DocsStep number="2" title="Select Programming Language">
                  Choose your language (JavaScript, TypeScript, Python, Java, C++, Go, HTML, CSS, JSON) from the dropdown selector.
                </DocsStep>

                <DocsStep number="3" title="Paste Code Snippet or Open Repository">
                  Paste code into the interactive editor, or open the <strong>Repo Workbench</strong> to select a file from a connected GitHub repository.
                </DocsStep>

                <DocsStep number="4" title="Run AI Mentorship Analysis">
                  Click <strong>Run AI Code Review</strong> for full scores or select <strong>Deep Fix</strong> / <strong>Explain</strong> for targeted insights.
                </DocsStep>

                <DocsStep number="5" title="Inspect Score & Issues">
                  Review your 0–100 Code Quality Score, expandable issue cards (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), and refactored implementation.
                </DocsStep>

                <DocsStep number="6" title="Generate & Apply Patches">
                  Click <strong>Generate Diff Patch</strong> on any issue to view side-by-side git diff changes and apply them directly into your workspace.
                </DocsStep>
              </Card>
            </section>
          )}

          {/* SECTION: SYSTEM ARCHITECTURE */}
          {matchesSearch('system architecture react vite express groq llama diagram') && (
            <section id="architecture" style={{ scrollMarginTop: '90px' }}>
              <Card style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Layers size={24} style={{ color: 'var(--primary)' }} />
                  <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--fw-extrabold)', color: 'var(--text)', margin: 0 }}>
                    System Architecture Overview
                  </h2>
                </div>

                <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', lineHeight: 'var(--lh-relaxed)', margin: 0 }}>
                  CodeMentorAI follows a modern decoupled architecture. The frontend is built on React 18, Vite 5, and React Router, while the backend is an Express Node.js server that orchestrates LLM prompt engineering, AST security parsing, and GitHub REST API integrations.
                </p>

                <DocsCodeBlock
                  language="text"
                  title="Architecture Data Flow"
                  code={`┌─────────────────────────────────────────────────────────────┐
│                 React 18 + Vite 5 Frontend                  │
│   (AppShell, CodeEditor, WorkspacePage, ChatWidget, Footer)  │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP REST Requests
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Express Backend Server                    │
│   (Auth Middleware, Rate Limiter, Repository Context Index) │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌─────────────────────────────┐  ┌────────────────────────────┐
│      Groq LLM Engine        │  │      GitHub OAuth API      │
│  (Llama-3-70b-8192 Model)   │  │ (Repos, File Trees, User)  │
└─────────────────────────────┘  └────────────────────────────┘`}
                />
              </Card>
            </section>
          )}

          {/* SECTION: CORE WORKFLOWS - CODE REVIEW */}
          {matchesSearch('ai code review guide score summary issues refactored') && (
            <section id="code-review" style={{ scrollMarginTop: '90px' }}>
              <Card style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Code2 size={24} style={{ color: 'var(--primary)' }} />
                  <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--fw-extrabold)', color: 'var(--text)', margin: 0 }}>
                    AI Code Review Guide
                  </h2>
                </div>

                <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', lineHeight: 'var(--lh-relaxed)', margin: 0 }}>
                  The <strong>AI Code Review</strong> workflow performs comprehensive static analysis, security validation, and architectural review on source code snippets.
                </p>

                <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--fw-bold)', color: 'var(--text)', marginTop: '0.5rem' }}>
                  What You Receive in Every Review:
                </h3>

                <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', fontSize: 'var(--text-base)', lineHeight: 'var(--lh-relaxed)' }}>
                  <li style={{ marginBottom: '0.4rem' }}>
                    <strong>Quality Score Index (0–100)</strong>: An overall gauge combining security, maintainability, and complexity metrics.
                  </li>
                  <li style={{ marginBottom: '0.4rem' }}>
                    <strong>Executive Summary</strong>: A high-level assessment of strengths, algorithmic time complexity, and primary risks.
                  </li>
                  <li style={{ marginBottom: '0.4rem' }}>
                    <strong>Categorized Issues List</strong>: Clear issue cards with severity ratings (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), line references, and suggested fixes.
                  </li>
                  <li style={{ marginBottom: '0.4rem' }}>
                    <strong>Optimized Refactored Implementation</strong>: Production-ready clean code snippet incorporating best practices.
                  </li>
                </ul>

                <DocsCallout type="note" title="Language AST Support">
                  Supported languages include JavaScript, TypeScript, Python, Java, C++, Go, HTML, CSS, and JSON.
                </DocsCallout>
              </Card>
            </section>
          )}

          {/* SECTION: AI ASSISTANT CHAT */}
          {matchesSearch('ai engineering assistant partner chat widget floating context scope') && (
            <section id="ai-chat" style={{ scrollMarginTop: '90px' }}>
              <Card style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Sparkles size={24} style={{ color: 'var(--primary)' }} />
                  <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--fw-extrabold)', color: 'var(--text)', margin: 0 }}>
                    AI Engineering Partner Chat
                  </h2>
                </div>

                <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', lineHeight: 'var(--lh-relaxed)', margin: 0 }}>
                  CodeMentorAI features both a floating <strong>AI Chat Widget</strong> (accessible via the floating button at bottom-right) and a dedicated <strong>AI Engineering Partner</strong> pane inside the GitHub Repository Workbench.
                </p>

                <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--fw-bold)', color: 'var(--text)', marginTop: '0.5rem' }}>
                  Chat Modes & Context Scopes:
                </h3>

                <DocsTable
                  headers={['Control', 'Options', 'Description']}
                  rows={[
                    [
                      'Context Scope',
                      'Current File | Indexed Repo',
                      'Controls whether the AI answers based only on the currently opened file or searches across all indexed repository files.',
                    ],
                    [
                      'Answer Mode',
                      'Developer | Educational',
                      'Developer mode delivers concise code patches and technical specs; Educational mode provides step-by-step explanations and concepts.',
                    ],
                  ]}
                />

                <DocsCallout type="tip" title="Copying Code Fixes">
                  Code fixes suggested inside AI chat messages include a <strong>Copy Code</strong> button in the header for fast copying.
                </DocsCallout>
              </Card>
            </section>
          )}

          {/* SECTION: GITHUB WORKBENCH */}
          {matchesSearch('github workbench oauth connect repository file tree explorer diff patch') && (
            <section id="github-oauth" style={{ scrollMarginTop: '90px' }}>
              <Card style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <FolderGit2 size={24} style={{ color: 'var(--primary)' }} />
                  <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--fw-extrabold)', color: 'var(--text)', margin: 0 }}>
                    Connecting GitHub OAuth & Workbench
                  </h2>
                </div>

                <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', lineHeight: 'var(--lh-relaxed)', margin: 0 }}>
                  Connect your GitHub account using OAuth 2.0 to list public and private repositories, explore directory trees, and inspect codebase files without manually copying code.
                </p>

                <DocsStep number="1" title="Click Connect GitHub">
                  Click <strong>Connect GitHub</strong> from the sidebar or the TopBar CTA button.
                </DocsStep>

                <DocsStep number="2" title="Authorize CodeMentorAI">
                  Authorize the GitHub OAuth application when prompted. CodeMentorAI requests standard read permissions (`read:user` and repository access).
                </DocsStep>

                <DocsStep number="3" title="Browse Repositories">
                  In the <strong>Repo Workbench</strong>, select any repository from your list to open the 3-column file viewer layout.
                </DocsStep>

                <DocsCallout type="security" title="OAuth Tokens & Security">
                  CodeMentorAI uses secure HTTP-only session cookies for GitHub tokens. Your GitHub password or personal credentials are never requested or stored.
                </DocsCallout>
              </Card>
            </section>
          )}

          {/* SECTION: UNDERSTANDING RESULTS - SCORES & SEVERITY */}
          {matchesSearch('quality score score range severity critical high medium low health scorecard') && (
            <section id="quality-score" style={{ scrollMarginTop: '90px' }}>
              <Card style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Activity size={24} style={{ color: 'var(--primary)' }} />
                  <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--fw-extrabold)', color: 'var(--text)', margin: 0 }}>
                    Understanding Review Scores & Severities
                  </h2>
                </div>

                <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--fw-bold)', color: 'var(--text)', marginTop: '0.5rem' }}>
                  Quality Score Index Ranges:
                </h3>

                <DocsTable
                  headers={['Score Range', 'Rating', 'Color Indicator', 'Interpretation & Action Required']}
                  rows={[
                    ['90 – 100', 'Excellent', 'Green (Success)', 'Clean, robust code with optimal complexity and strong error handling.'],
                    ['75 – 89', 'Good', 'Blue (Primary)', 'Solid foundation with minor opportunities for refactoring or documentation.'],
                    ['60 – 74', 'Fair / Needs Work', 'Yellow (Warning)', 'Noticeable performance warnings, unhandled edge cases, or code smells.'],
                    ['Below 60', 'Significant Issues', 'Red (Danger)', 'Critical bugs, memory leaks, OWASP risks, or unhandled syntax errors.'],
                  ]}
                />

                <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--fw-bold)', color: 'var(--text)', marginTop: '1rem' }}>
                  Issue Severity Matrix:
                </h3>

                <DocsTable
                  headers={['Severity Badge', 'Meaning', 'Action Recommended']}
                  rows={[
                    ['CRITICAL', 'Security vulnerability, secret key leak, or runtime crash hazard.', 'Fix immediately before merging or deploying.'],
                    ['HIGH', 'Algorithmic bottleneck, memory leak, or missing error boundary.', 'Address during current sprint cycle.'],
                    ['MEDIUM', 'Suboptimal pattern, redundant computation, or unhandled type cast.', 'Refactor when modifying file.'],
                    ['LOW', 'Stylistic suggestion, docstring gap, or minor naming convention.', 'Optional cleanup.'],
                  ]}
                />
              </Card>
            </section>
          )}

          {/* SECTION: DEVELOPER & API REFERENCE */}
          {matchesSearch('developer api reference endpoints environment variables local dev groq') && (
            <section id="api-reference" style={{ scrollMarginTop: '90px' }}>
              <Card style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Server size={24} style={{ color: 'var(--primary)' }} />
                  <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--fw-extrabold)', color: 'var(--text)', margin: 0 }}>
                    Developer REST API Reference
                  </h2>
                </div>

                <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', lineHeight: 'var(--lh-relaxed)', margin: 0 }}>
                  Below is the complete inventory of backend Express API routes provided by CodeMentorAI:
                </p>

                <DocsTable
                  headers={['Method', 'Endpoint Route', 'Purpose & Response Details']}
                  rows={[
                    ['POST', '/api/review', 'Analyzes code snippet and returns quality score, issues, summary, and refactored code.'],
                    ['POST', '/api/chat', 'AI mentorship chat endpoint supporting scope and developer/explain modes.'],
                    ['POST', '/api/analyse', 'Deep fix analysis returning specific bug solutions and memory checks.'],
                    ['POST', '/api/explain', 'Breakdown of code logic, data structures, and key architectural concepts.'],
                    ['GET', '/api/github/status', 'Check GitHub OAuth authentication status and logged-in user details.'],
                    ['GET', '/api/github/repos', 'Fetches authenticated user GitHub repositories list.'],
                    ['GET', '/api/github/file', 'Fetches file content by repository name and file path.'],
                    ['POST', '/api/repository/index', 'Indexes repository files into local context for semantic retrieval.'],
                    ['POST', '/api/analysis/security', 'Runs static AST security scan for OWASP risks and secret exposures.'],
                    ['POST', '/api/fixes/generate-patch', 'Generates unified diff patch for specific reported issue.'],
                    ['GET', '/api/reporting/health-scorecard', 'Computes 8-dimensional health scorecard for repository.'],
                    ['GET', '/api/reporting/improvement-plan', 'Synthesizes P0–P3 prioritized engineering improvement roadmap.'],
                  ]}
                />

                <h3 id="environment-variables" style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--fw-bold)', color: 'var(--text)', marginTop: '1.5rem' }}>
                  Environment Variables Configuration:
                </h3>

                <DocsTable
                  headers={['Variable Name', 'Location', 'Required', 'Purpose & Example']}
                  rows={[
                    ['GROQ_API_KEY', 'Backend (.env)', 'Yes', 'Groq API Key for LLM inference (e.g. gsk_...).'],
                    ['SESSION_SECRET', 'Backend (.env)', 'Production', 'Secret key used to encrypt express sessions.'],
                    ['FRONTEND_URL', 'Backend (.env)', 'Optional', 'CORS origin list (default: http://localhost:5173).'],
                    ['GITHUB_CLIENT_ID', 'Backend (.env)', 'Optional', 'GitHub OAuth App Client ID.'],
                    ['GITHUB_CLIENT_SECRET', 'Backend (.env)', 'Optional', 'GitHub OAuth App Client Secret.'],
                    ['VITE_API_BASE_URL', 'Frontend (.env)', 'Optional', 'API base URL (default: http://localhost:5000).'],
                  ]}
                />

                <h3 id="local-dev" style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--fw-bold)', color: 'var(--text)', marginTop: '1.5rem' }}>
                  Local Development Setup Commands:
                </h3>

                <DocsCodeBlock
                  language="bash"
                  title="Terminal Commands"
                  code={`# Clone repo
git clone https://github.com/shivammaurya2903/CodeMentorAI.git
cd CodeMentorAI

# 1. Start Backend Server (Port 5000)
cd backend
npm install
# Add GROQ_API_KEY to .env
npm start

# 2. Start Frontend Dev Server (Port 5173) in a new terminal
cd ../frontend
npm install
npm run dev`}
                />
              </Card>
            </section>
          )}

          {/* SECTION: SECURITY & PRIVACY */}
          {matchesSearch('security privacy secrets github permissions safety owasp') && (
            <section id="security-privacy" style={{ scrollMarginTop: '90px' }}>
              <Card style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Shield size={24} style={{ color: 'var(--success)' }} />
                  <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--fw-extrabold)', color: 'var(--text)', margin: 0 }}>
                    Security & Code Privacy
                  </h2>
                </div>

                <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', lineHeight: 'var(--lh-relaxed)', margin: 0 }}>
                  Security is built into CodeMentorAI at every layer. We respect developer privacy and enforce strict secret masking rules.
                </p>

                <DocsCallout type="important" title="Never Commit API Keys">
                  Never hardcode or push `GROQ_API_KEY` or `GITHUB_CLIENT_SECRET` into frontend client bundles or public git repositories. Always configure secrets inside backend `.env` files.
                </DocsCallout>

                <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', fontSize: 'var(--text-base)', lineHeight: 'var(--lh-relaxed)' }}>
                  <li style={{ marginBottom: '0.4rem' }}>
                    <strong>Automated Secret Masking</strong>: The Security Engine automatically flags exposed AWS access keys, JWT tokens, and private RSA keys.
                  </li>
                  <li style={{ marginBottom: '0.4rem' }}>
                    <strong>Zero Code Persistence</strong>: Code snippets submitted for review are analyzed in-memory and are never written to external database logs.
                  </li>
                </ul>
              </Card>
            </section>
          )}

          {/* SECTION: TROUBLESHOOTING & FAQ */}
          {matchesSearch('troubleshooting errors faq rate limit 429 413 groq missing oauth') && (
            <section id="troubleshooting" style={{ scrollMarginTop: '90px' }}>
              <Card style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <HelpCircle size={24} style={{ color: 'var(--primary)' }} />
                  <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--fw-extrabold)', color: 'var(--text)', margin: 0 }}>
                    Troubleshooting & FAQ
                  </h2>
                </div>

                <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--fw-bold)', color: 'var(--text)', marginTop: '0.5rem' }}>
                  Common Error Messages & Resolutions:
                </h3>

                <DocsTable
                  headers={['Error Message / Code', 'Root Cause', 'Resolution Step']}
                  rows={[
                    ['RATE_LIMIT_EXCEEDED (429)', 'Too many requests sent from IP within 15-minute window.', 'Wait a few minutes before running another scan.'],
                    ['PAYLOAD_TOO_LARGE (413)', 'Code snippet payload exceeds Express 2MB limit.', 'Trim snippet to focus on specific functions or files.'],
                    ['Groq API Key unconfigured (503)', 'Backend `.env` file missing valid `GROQ_API_KEY`.', 'Add `GROQ_API_KEY=gsk_...` to `backend/.env` and restart server.'],
                    ['OAuth Session Expired', 'GitHub OAuth token expired or permissions revoked.', 'Click Disconnect GitHub in Sidebar, then Re-Connect.'],
                  ]}
                />

                <h3 id="faq" style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--fw-bold)', color: 'var(--text)', marginTop: '1.5rem' }}>
                  Frequently Asked Questions:
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ padding: '1rem', backgroundColor: 'var(--surface-subtle)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                    <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--fw-bold)', color: 'var(--text)', marginBottom: '0.35rem' }}>
                      Does CodeMentorAI automatically commit changes to my GitHub repo?
                    </h4>
                    <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', margin: 0 }}>
                      No. CodeMentorAI generates non-destructive diff patches. You inspect changes inside the Diff Viewer modal and apply them manually into your editor.
                    </p>
                  </div>

                  <div style={{ padding: '1rem', backgroundColor: 'var(--surface-subtle)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                    <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--fw-bold)', color: 'var(--text)', marginBottom: '0.35rem' }}>
                      Which programming languages are supported?
                    </h4>
                    <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', margin: 0 }}>
                      Full review, score, and refactoring support is available for JavaScript, TypeScript, Python, Java, C++, Go, HTML, CSS, and JSON.
                    </p>
                  </div>
                </div>

                {/* Getting Started CTA */}
                <div
                  style={{
                    marginTop: '2rem',
                    padding: '2rem',
                    backgroundColor: 'var(--surface-elevated)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-xl)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1.25rem',
                    boxShadow: 'var(--shadow-md)',
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--fw-bold)', color: 'var(--text)', marginBottom: '0.35rem' }}>
                      Ready to Elevate Your Code Quality?
                    </h3>
                    <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', margin: 0 }}>
                      Run instant AI mentorship scans or inspect your connected GitHub repositories.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.85rem' }}>
                    <Link to="/review" style={{ textDecoration: 'none' }}>
                      <Button variant="primary" size="md" icon={Sparkles}>
                        Start AI Code Review
                      </Button>
                    </Link>
                    <Link to="/workspace" style={{ textDecoration: 'none' }}>
                      <Button variant="secondary" size="md" icon={FolderGit2}>
                        Open Repo Workbench
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function RocketIcon(props) {
  return <Sparkles {...props} />;
}
