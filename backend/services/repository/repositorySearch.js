/**
 * Repository Search Engine
 * Performs intelligent search over indexed repository files, symbols,
 * routes, dependencies, and code content.
 */

function searchRepository(index, query = '', options = {}) {
  if (!index || !query || typeof query !== 'string') {
    return { results: [], query, total: 0 };
  }

  const {
    maxResults = 20,
    searchTypes = ['file', 'symbol', 'text'], // file, symbol, text
  } = options;

  const normalizedQuery = query.toLowerCase().trim();
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);

  const results = [];
  const seenKeys = new Set();

  // 1. Filename & Path Search
  if (searchTypes.includes('file')) {
    for (const [filePath, fileData] of index.fileMap.entries()) {
      const lowerPath = filePath.toLowerCase();
      let matchScore = 0;

      if (lowerPath === normalizedQuery) matchScore += 100;
      else if (lowerPath.includes(normalizedQuery)) matchScore += 60;
      else if (tokens.every(token => lowerPath.includes(token))) matchScore += 40;

      if (matchScore > 0) {
        const key = `file:${filePath}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          results.push({
            type: 'file',
            filePath,
            score: matchScore,
            language: fileData.language,
            lines: fileData.lines,
            snippet: fileData.path,
          });
        }
      }
    }
  }

  // 2. Symbol Search
  if (searchTypes.includes('symbol')) {
    for (const sym of index.symbols || []) {
      const lowerName = sym.name.toLowerCase();
      let matchScore = 0;

      if (lowerName === normalizedQuery) matchScore += 90;
      else if (lowerName.includes(normalizedQuery)) matchScore += 50;
      else if (tokens.some(t => lowerName.includes(t))) matchScore += 30;

      if (matchScore > 0) {
        const key = `symbol:${sym.file}:${sym.line}:${sym.name}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          results.push({
            type: 'symbol',
            symbolType: sym.type,
            name: sym.name,
            filePath: sym.file,
            line: sym.line,
            score: matchScore,
            snippet: `${sym.type} ${sym.name} at line ${sym.line}`,
          });
        }
      }
    }
  }

  // 3. Code Text Search
  if (searchTypes.includes('text')) {
    for (const [filePath, fileData] of index.fileMap.entries()) {
      if (!fileData.content) continue;
      const lines = fileData.content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lowerLine = line.toLowerCase();

        if (lowerLine.includes(normalizedQuery) || tokens.every(t => lowerLine.includes(t))) {
          const key = `text:${filePath}:${i + 1}`;
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            results.push({
              type: 'text',
              filePath,
              line: i + 1,
              score: 30,
              snippet: line.trim().substring(0, 140),
            });
            if (results.length >= maxResults * 2) break;
          }
        }
      }
    }
  }

  results.sort((a, b) => b.score - a.score);
  const sliced = results.slice(0, maxResults);

  return {
    query,
    total: sliced.length,
    results: sliced,
  };
}

module.exports = { searchRepository };
