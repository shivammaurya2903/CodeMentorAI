/**
 * AI Context Builder Service
 * Constructs grounded, secret-redacted prompt context for LLM queries
 * adhering to selected context boundaries.
 */

const { redactSecrets } = require('./secretDetector');

/**
 * Context Scopes:
 * - 'current_file': Selected single file code only
 * - 'selected_files': List of selected file contents
 * - 'current_repo' / 'indexed_repo': High-relevance indexed files & directory tree
 * - 'no_context': General knowledge mode without repository files
 */
function buildContext(options = {}) {
  const {
    scope = 'current_file',
    currentFile = null, // { path, content }
    selectedFiles = [], // Array<{ path, content }>
    index = null,       // Repository index object
    userQuery = '',
    tokenBudget = 6000,
  } = options;

  let contextText = '';
  const citedFiles = [];

  if (scope === 'no_context') {
    return {
      scope: 'no_context',
      contextText: '',
      citedFiles: [],
      summary: 'General Knowledge Mode (No Repository Context)',
    };
  }

  if (scope === 'current_file' && currentFile?.path && currentFile?.content) {
    const redacted = redactSecrets(currentFile.content, currentFile.path);
    contextText = `--- FILE: ${currentFile.path} ---\n${redacted}\n--- END FILE ---`;
    citedFiles.push(currentFile.path);

    return {
      scope: 'current_file',
      contextText,
      citedFiles,
      summary: `Active Context: Single File (${currentFile.path})`,
    };
  }

  if (scope === 'selected_files' && Array.isArray(selectedFiles) && selectedFiles.length > 0) {
    const parts = [];
    for (const f of selectedFiles) {
      if (!f.path || !f.content) continue;
      const redacted = redactSecrets(f.content, f.path);
      parts.push(`--- FILE: ${f.path} ---\n${redacted}\n--- END FILE ---`);
      citedFiles.push(f.path);
    }
    contextText = parts.join('\n\n');

    return {
      scope: 'selected_files',
      contextText,
      citedFiles,
      summary: `Active Context: ${citedFiles.length} Selected Files`,
    };
  }

  // Repository / Indexed Repo Scope
  if (index) {
    const metaParts = [];

    metaParts.push(`--- REPOSITORY STRUCTURE OVERVIEW ---`);
    metaParts.push(`Repository: ${index.repoId}`);
    metaParts.push(`Total Files: ${index.totalFiles}`);
    metaParts.push(`Languages: ${JSON.stringify(index.languages)}`);
    metaParts.push(`Entry Points: ${JSON.stringify(index.entryPoints)}`);
    metaParts.push(`API Routes: ${JSON.stringify(index.routes)}`);
    metaParts.push(`Dependencies: ${JSON.stringify(Object.keys(index.dependencies.dependencies || {}).slice(0, 20))}`);
    metaParts.push(`--- END STRUCTURE OVERVIEW ---\n`);

    // Prioritize relevant files based on user query tokens
    const prioritizedFiles = prioritizeFilesForQuery(index, userQuery);

    let charCount = metaParts.join('\n').length;
    const fileParts = [];

    for (const f of prioritizedFiles) {
      if (charCount > tokenBudget * 4) break; // approximate token budget check
      const fileData = index.fileMap.get(f.path);
      if (!fileData || !fileData.content) continue;

      const contentSnippet = fileData.content.substring(0, 1500); // cap per file
      fileParts.push(`--- FILE: ${f.path} (${fileData.language || 'Code'}) ---\n${contentSnippet}\n--- END FILE ---`);
      citedFiles.push(f.path);
      charCount += contentSnippet.length;
    }

    contextText = metaParts.join('\n') + '\n\n' + fileParts.join('\n\n');

    return {
      scope: 'indexed_repo',
      contextText,
      citedFiles,
      summary: `Active Context: Indexed Repository (${index.repoId}, ${citedFiles.length} key files attached)`,
    };
  }

  return {
    scope,
    contextText: '',
    citedFiles: [],
    summary: 'No active context attached',
  };
}

/**
 * Smart file prioritization based on keywords and query intent
 */
function prioritizeFilesForQuery(index, query = '') {
  const fileScores = [];
  const lowerQuery = query.toLowerCase();

  for (const [filePath, fileData] of index.fileMap.entries()) {
    let score = 0;
    const lowerPath = filePath.toLowerCase();

    // Priority by file type
    if (fileData.isEntry) score += 50;
    if (index.routes.includes(filePath)) score += 40;
    if (filePath.endsWith('package.json') || filePath.endsWith('README.md')) score += 60;

    // Priority by query match
    if (lowerQuery.includes('auth') && (lowerPath.includes('auth') || lowerPath.includes('login') || lowerPath.includes('oauth'))) score += 70;
    if (lowerQuery.includes('api') && (lowerPath.includes('api') || lowerPath.includes('route') || lowerPath.includes('service'))) score += 70;
    if (lowerQuery.includes('test') && fileData.isTest) score += 80;
    if (lowerQuery.includes('security') && (lowerPath.includes('security') || lowerPath.includes('auth') || lowerPath.includes('middleware'))) score += 70;
    if (lowerQuery.includes('perf') && (lowerPath.includes('service') || lowerPath.includes('db') || lowerPath.includes('cache'))) score += 70;

    fileScores.push({ path: filePath, score });
  }

  fileScores.sort((a, b) => b.score - a.score);
  return fileScores.slice(0, 15);
}

module.exports = { buildContext };
