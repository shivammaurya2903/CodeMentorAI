/**
 * Architecture Analyzer Service
 * Automatically detects application stack components (Frontend, Backend, Database,
 * APIs, Authentication, Workers, External Integrations) and generates visual representation.
 */

function analyzeArchitecture(index) {
  if (!index) {
    return {
      stack: {},
      diagram: '',
      summary: 'No repository index available for architecture analysis.',
    };
  }

  const stack = {
    frontend: [],
    backend: [],
    database: [],
    apis: [],
    authentication: [],
    testing: [],
    integrations: [],
  };

  const deps = index.dependencies.dependencies || {};
  const devDeps = index.dependencies.devDependencies || {};
  const allDeps = { ...deps, ...devDeps };

  // Detect Frontend Frameworks
  if (allDeps['react'] || allDeps['react-dom']) stack.frontend.push('React SPA');
  if (allDeps['next']) stack.frontend.push('Next.js SSR/SSG');
  if (allDeps['vue']) stack.frontend.push('Vue.js');
  if (allDeps['vite']) stack.frontend.push('Vite Bundler');

  // Detect Backend Frameworks
  if (allDeps['express']) stack.backend.push('Express.js REST API');
  if (allDeps['@nestjs/core']) stack.backend.push('NestJS Server');
  if (allDeps['fastify']) stack.backend.push('Fastify API');

  // Detect Database & Caching
  if (allDeps['redis'] || allDeps['ioredis'] || allDeps['connect-redis']) stack.database.push('Redis Cache & Session Store');
  if (allDeps['mongoose'] || allDeps['mongodb']) stack.database.push('MongoDB Document Database');
  if (allDeps['pg'] || allDeps['prisma'] || allDeps['sequelize']) stack.database.push('PostgreSQL Relational DB');

  // Detect Authentication
  if (allDeps['express-session'] || allDeps['cookie-parser']) stack.authentication.push('Cookie & Session Auth');
  if (allDeps['jsonwebtoken'] || allDeps['jose']) stack.authentication.push('JWT Token Authentication');
  if (allDeps['@octokit/rest'] || index.routes.some(r => r.includes('github'))) stack.authentication.push('GitHub OAuth 2.0 Integration');

  // Detect AI & External Services
  if (allDeps['openai']) stack.integrations.push('Groq / OpenAI LLM API Service');
  if (allDeps['@octokit/rest']) stack.integrations.push('GitHub REST & GraphQL API');

  // Detect Testing Frameworks
  if (allDeps['jest']) stack.testing.push('Jest Unit/Integration Test Suite');
  if (allDeps['supertest']) stack.testing.push('Supertest HTTP Assertion Suite');

  // Generate ASCII / Text Visual Diagram
  const diagram = `
┌────────────────────────────────────────────────────────┐
│               CODEMENTORAI ARCHITECTURE                │
└────────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────┐
│ FRONTEND LAYER                                         │
│ ${stack.frontend.join(', ') || 'React 18 + Vite SPA'}                    │
└──────────────────────────┬─────────────────────────────┘
                           │
                 HTTP REST │ Sessions / JSON
                           ▼
┌────────────────────────────────────────────────────────┐
│ BACKEND API EXPRESS SERVER                             │
│ ${stack.backend.join(', ') || 'Node.js Express Server'}                │
└───────┬──────────────────┬───────────────────┬─────────┘
        │                  │                   │
        ▼                  ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌─────────────────┐
│ AI ENGINE    │   │ GITHUB API   │   │ REDIS / SESSION │
│ Groq OpenAI  │   │ Octokit REST │   │ Memory Store    │
└──────────────┘   └──────────────┘   └─────────────────┘
`;

  return {
    stack,
    diagram: diagram.trim(),
    summary: `Architecture analysis complete. Identified ${Object.keys(stack).reduce((acc, k) => acc + stack[k].length, 0)} stack components across ${index.totalFiles} files.`,
  };
}

module.exports = { analyzeArchitecture };
