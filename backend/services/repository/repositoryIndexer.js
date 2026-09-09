/**
 * Repository Indexing Engine
 * Builds a deterministic index of a codebase, extracting structure,
 * dependencies, key routes, components, entry points, and symbol relationships.
 */

const path = require('path');
const { redactSecrets, isSensitiveFile } = require('./secretDetector');

class RepositoryIndexer {
  constructor() {
    this.indices = new Map(); // repoId -> index
  }

  /**
   * Deterministically analyze files array and content map
   * @param {string} repoId e.g. "owner/repo"
   * @param {Array<{path: string, content?: string}>} fileList
   */
  indexRepository(repoId, fileList = []) {
    const startTime = Date.now();

    const fileMap = new Map();
    const directoryTree = {};
    const languages = {};
    const dependencies = { dependencies: {}, devDependencies: {} };
    const entryPoints = [];
    const routes = [];
    const components = [];
    const services = [];
    const tests = [];
    const symbols = [];
    let secretCount = 0;

    for (const item of fileList) {
      const filePath = item.path;
      if (!filePath) continue;

      const ext = path.extname(filePath).toLowerCase();
      const lang = this._detectLanguage(ext, filePath);
      languages[lang] = (languages[lang] || 0) + 1;

      const isTest = this._isTestFile(filePath);
      if (isTest) tests.push(filePath);

      const isEntry = this._isEntryPoint(filePath);
      if (isEntry) entryPoints.push(filePath);

      const rawContent = item.content || '';
      const redactedContent = redactSecrets(rawContent, filePath);
      if (rawContent !== redactedContent) secretCount++;

      // Extract symbols (functions, classes, exports)
      if (rawContent && !isSensitiveFile(filePath)) {
        const fileSymbols = this._extractSymbols(filePath, rawContent);
        symbols.push(...fileSymbols);

        if (this._isRouteFile(filePath, rawContent)) {
          routes.push(filePath);
        }
        if (this._isComponentFile(filePath, rawContent)) {
          components.push(filePath);
        }
        if (this._isServiceFile(filePath, rawContent)) {
          services.push(filePath);
        }

        // Parse package manifests
        if (filePath.endsWith('package.json')) {
          try {
            const pkg = JSON.parse(rawContent);
            dependencies.name = pkg.name;
            dependencies.dependencies = { ...dependencies.dependencies, ...pkg.dependencies };
            dependencies.devDependencies = { ...dependencies.devDependencies, ...pkg.devDependencies };
          } catch {
            // Ignore parse errors
          }
        }
      }

      fileMap.set(filePath, {
        path: filePath,
        extension: ext,
        language: lang,
        size: rawContent.length,
        lines: rawContent ? rawContent.split('\n').length : 0,
        isTest,
        isEntry,
        content: redactedContent,
      });

      this._addToTree(directoryTree, filePath);
    }

    const index = {
      repoId,
      indexedAt: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      totalFiles: fileMap.size,
      languages,
      dependencies,
      entryPoints,
      routes,
      components,
      services,
      tests,
      symbols,
      secretCount,
      fileMap,
      directoryTree,
    };

    this.indices.set(repoId, index);
    return index;
  }

  getRepositoryIndex(repoId) {
    return this.indices.get(repoId) || null;
  }

  _detectLanguage(ext, filePath) {
    if (filePath.endsWith('Dockerfile')) return 'Docker';
    if (filePath.endsWith('Makefile')) return 'Makefile';
    const langMap = {
      '.js': 'JavaScript',
      '.jsx': 'JavaScript (React)',
      '.ts': 'TypeScript',
      '.tsx': 'TypeScript (React)',
      '.py': 'Python',
      '.java': 'Java',
      '.go': 'Go',
      '.rs': 'Rust',
      '.c': 'C',
      '.cpp': 'C++',
      '.json': 'JSON',
      '.md': 'Markdown',
      '.css': 'CSS',
      '.html': 'HTML',
      '.yml': 'YAML',
      '.yaml': 'YAML',
      '.sh': 'Shell',
    };
    return langMap[ext] || 'Other';
  }

  _isTestFile(filePath) {
    const lower = filePath.toLowerCase();
    return (
      lower.includes('.test.') ||
      lower.includes('.spec.') ||
      lower.includes('__tests__') ||
      lower.startsWith('tests/') ||
      lower.startsWith('test/')
    );
  }

  _isEntryPoint(filePath) {
    const lower = filePath.toLowerCase();
    return (
      lower.endsWith('index.js') ||
      lower.endsWith('index.ts') ||
      lower.endsWith('main.jsx') ||
      lower.endsWith('main.ts') ||
      lower.endsWith('app.jsx') ||
      lower.endsWith('app.js') ||
      lower.endsWith('server.js')
    );
  }

  _isRouteFile(filePath, content) {
    const lower = filePath.toLowerCase();
    return (
      lower.includes('route') ||
      lower.includes('controller') ||
      content.includes('express.Router') ||
      content.includes('app.get(') ||
      content.includes('app.post(')
    );
  }

  _isComponentFile(filePath, content) {
    const lower = filePath.toLowerCase();
    return (
      lower.includes('components/') ||
      lower.includes('pages/') ||
      lower.endsWith('.jsx') ||
      lower.endsWith('.tsx') ||
      content.includes('export function') ||
      content.includes('export const')
    );
  }

  _isServiceFile(filePath, content) {
    const lower = filePath.toLowerCase();
    return (
      lower.includes('services/') ||
      lower.includes('service.') ||
      lower.includes('utils/') ||
      lower.includes('helpers/')
    );
  }

  _extractSymbols(filePath, content) {
    const symbols = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Functions: function foo(), const foo = () =>
      const funcMatch = line.match(/(?:async\s+)?function\s+([a-zA-Z0-9_$]+)|const\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?\(/);
      if (funcMatch) {
        const name = funcMatch[1] || funcMatch[2];
        if (name && name.length > 2) {
          symbols.push({ name, type: 'function', file: filePath, line: i + 1 });
        }
      }

      // Classes: class Foo
      const classMatch = line.match(/class\s+([a-zA-Z0-9_$]+)/);
      if (classMatch) {
        symbols.push({ name: classMatch[1], type: 'class', file: filePath, line: i + 1 });
      }

      // Routes: app.get('/path', ...), router.post('/path', ...)
      const routeMatch = line.match(/(?:app|router)\.(get|post|put|delete|patch)\s*\(\s*['"]([^'"]+)['"]/);
      if (routeMatch) {
        symbols.push({
          name: `${routeMatch[1].toUpperCase()} ${routeMatch[2]}`,
          type: 'route',
          file: filePath,
          line: i + 1,
        });
      }
    }

    return symbols.slice(0, 50); // limit per file
  }

  _addToTree(tree, filePath) {
    const parts = filePath.split('/');
    let current = tree;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        current[part] = null; // file leaf
      } else {
        current[part] = current[part] || {};
        current = current[part];
      }
    }
  }
}

const repositoryIndexer = new RepositoryIndexer();
module.exports = { repositoryIndexer, RepositoryIndexer };
