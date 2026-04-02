// Ensure user is connected before showing repo review page
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    github?.smartRedirect('repo-review');
  });
} else {
  github?.smartRedirect('repo-review');
}

document.addEventListener('DOMContentLoaded', async function() {
    // Elements
    const repoNameEl = document.getElementById('repo-name');
    const fileSearch = document.getElementById('file-search');
    const filesTree = document.getElementById('files-tree');
    const currentFilePathEl = document.getElementById('current-file-path');
    const codeViewer = document.getElementById('code-viewer');
    const analyzeBtn = document.getElementById('analyze-current');
    const copyAnalysisBtn = document.getElementById('copy-analysis');
    const aiContent = document.getElementById('ai-content');
    const chatInput = document.getElementById('chat-input');
    const sendChatBtn = document.getElementById('send-chat');
    const refreshBtn = document.getElementById('refresh-files');
    const backBtn = document.getElementById('back-to-repos');

    let currentRepo = new URLSearchParams(window.location.search).get('repo');
    let currentFile = null;
    let files = [];
    let fileSearchTerm = '';

    const apiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:5000' 
        : 'https://codementorai-vqp8.onrender.com';

    if (!currentRepo) {
        repoNameEl.textContent = 'No repository selected';
        filesTree.innerHTML = '<div class="error">Please select a repository from the home page</div>';
        return;
    }

    repoNameEl.textContent = currentRepo;

    // Load files
    await loadFiles();

    // Event listeners
    refreshBtn.addEventListener('click', loadFiles);
    backBtn.addEventListener('click', () => github?.goToHome());
    fileSearch?.addEventListener('input', (e) => {
        fileSearchTerm = e.target.value.toLowerCase();
        renderFiles(files);
    });
    copyAnalysisBtn?.addEventListener('click', copyAnalysis);
    analyzeBtn.addEventListener('click', analyzeCurrentFile);
    sendChatBtn.addEventListener('click', sendChat);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChat();
    });

    async function loadFiles() {
        try {
            showLoading(filesTree, 'Loading files...');
            const res = await fetch(`${apiUrl}/api/github/files?repo=${encodeURIComponent(currentRepo)}`);
            if (!res.ok) throw new Error(`API error: ${res.status}`);
            files = await res.json();
            renderFiles(files);
        } catch (err) {
            filesTree.innerHTML = `<div class="error">Failed to load files: ${escapeHtml(err.message)}</div>`;
        }
    }

    function renderFiles(filesList) {
        let filteredFiles = filesList.filter(f => 
            f.name?.toLowerCase().includes(fileSearchTerm) || 
            f.path.toLowerCase().includes(fileSearchTerm)
        );
        
        if (!filteredFiles.length) {
            filesTree.innerHTML = '<div class="empty">No files match search</div>';
            return;
        }
        
        // Build tree structure with folders
        const tree = buildFileTree(filteredFiles);
        filesTree.innerHTML = renderFileTree(tree);

        // Add event listeners
        filesTree.querySelectorAll('.file-item, .folder-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.folder-toggle')) return;
                const path = item.dataset.path;
                if (path) loadFileContent(path);
            });
        });
        
        filesTree.querySelectorAll('.folder-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const folder = toggle.closest('.folder-item');
                folder.classList.toggle('expanded');
            });
        });
    }

    function buildFileTree(filesList) {
        const tree = {};
        filesList.forEach(file => {
            const parts = file.path.split('/');
            let current = tree;
            for (let i = 0; i < parts.length - 1; i++) {
                const part = parts[i];
                if (!current[part]) {
                    current[part] = { type: 'folder', name: part, children: {}, path: parts.slice(0, i+1).join('/') };
                }
                current = current[part].children;
            }
            const filename = parts[parts.length - 1];
            current[filename] = { type: 'file', name: filename, path: file.path };
        });
        return tree;
    }

    function renderFileTree(node, path = '') {
        let html = '';
        Object.keys(node).forEach(key => {
            const item = node[key];
            if (item.type === 'folder') {
                html += `
                    <div class="folder-item ${item.expanded ? 'expanded' : ''}" data-path="${item.path}">
                        <span class="folder-toggle">▸</span>
                        <span class="folder-icon">📁</span>
                        <span class="file-name">${escapeHtml(item.name)}</span>
                    </div>
                    <div class="folder-children ${item.expanded ? 'expanded' : ''}">
                        ${renderFileTree(item.children, item.path + '/')}
                    </div>
                `;
            } else {
                html += `
                    <div class="file-item ${currentFile === item.path ? 'selected' : ''}" data-path="${item.path}">
                        <span class="file-icon">${getFileIcon(item.path)}</span>
                        <span class="file-name">${escapeHtml(item.name)}</span>
                    </div>
                `;
            }
        });
        return html;
    }

    async function loadFileContent(path) {
        try {
            currentFile = path;
            currentFilePathEl.textContent = path;
            analyzeBtn.disabled = false;
            showLoading(codeViewer, 'Loading content...');

            const res = await fetch(`${apiUrl}/api/github/file-content?repo=${encodeURIComponent(currentRepo)}&path=${encodeURIComponent(path)}`);
            if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
            const data = await res.json();
            
            // Add syntax highlighting
            const highlighted = highlightCode(data.content || 'Empty file');
            codeViewer.innerHTML = `<div class="code-highlight"><pre><code>${highlighted}</code></pre></div>`;
        } catch (err) {
            codeViewer.innerHTML = `<div class="error">Failed to load file: ${escapeHtml(err.message)}</div>`;
        }
    }

    function highlightCode(code) {
        // Simple regex-based syntax highlighting
        code = code
            .replace(/\/\/.*$/gm, '<span class="comment">$&</span>')
            .replace(/\/\*[\s\S]*?\*\//g, '<span class="comment">$&</span>')
            .replace(/\b(function|const|let|var|if|else|for|while|return|class|async|await|import|export|try|catch|new)\b/g, '<span class="keyword">$1</span>')
            .replace(/"([^"\\]|\\.)*"/g, '<span class="string">$&</span>')
            .replace(/'([^'\\]|\\.)*'/g, '<span class="string">$&</span>')
            .replace(/\b\d+\b/g, '<span class="number">$&</span>')
            .replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g, '<span class="function">$1</span>(')
            .replace(/([{}[\]();,])\s*/g, '<span class="punctuation">$1</span>$2');
        return code;
    }

    async function analyzeCurrentFile() {
        if (!currentFile) return;
        try {
            analyzeBtn.textContent = 'Analyzing...';
            analyzeBtn.disabled = true;
            showLoading(aiContent, 'AI analyzing...');

            const res = await fetch(`${apiUrl}/api/github/analyze-file`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ repo: currentRepo, path: currentFile })
            });
            if (!res.ok) throw new Error(`Analysis failed: ${res.status}`);
            const data = await res.json();
            displayAnalysis(data);
        } catch (err) {
            aiContent.innerHTML = `<div class="error">Analysis failed: ${escapeHtml(err.message)}</div>`;
        } finally {
            analyzeBtn.textContent = 'Analyze with AI';
            analyzeBtn.disabled = false;
        }
    }

    async function sendChat() {
        const message = chatInput.value.trim();
        if (!message || !currentFile) return;
        try {
            showLoading(aiContent, 'AI responding...');
            const res = await fetch(`${apiUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, codeContext: { repo: currentRepo, path: currentFile } })
            });
            if (!res.ok) throw new Error('Chat failed');
            const data = await res.json();
            appendChat(message, data.reply || 'No response');
            chatInput.value = '';
        } catch (err) {
            appendChat(message, `Error: ${err.message}`);
        }
    }

    function displayAnalysis(data) {
        let html = `
            <div class="analysis-summary">${escapeHtml(data.summary || 'Analysis complete')}</div>
            ${data.issues && data.issues.length ? `
                <div class="analysis-issues">
                    <h4>Issues (${data.issues.length})</h4>
                    ${data.issues.map(issue => `
                        <div class="issue-item ${issue.severity || 'info'}">
                            <strong>${issue.type?.toUpperCase()} (${issue.severity?.toUpperCase()})</strong>
                            <p>${escapeHtml(issue.description)}</p>
                            ${issue.fix ? `<code>${escapeHtml(issue.fix)}</code>` : ''}
                        </div>
                    `).join('')}
                </div>
            ` : '<p class="no-issues">No issues found! 🎉</p>'}
            ${data.refactored_code ? `
                <div class="refactored-code">
                    <h4>Improved Code</h4>
                    <pre><code>${escapeHtml(data.refactored_code)}</code></pre>
                </div>
            ` : ''}
            <button id="copy-analysis" class="btn-secondary" style="margin-top: 1rem; width: 100%;">📋 Copy Analysis</button>
        `;
        aiContent.innerHTML = html;
    }

    function copyAnalysis() {
        const text = aiContent.innerText;
        navigator.clipboard.writeText(text).then(() => {
            const btn = document.getElementById('copy-analysis');
            const original = btn.textContent;
            btn.textContent = '✅ Copied!';
            btn.style.background = '#10b981';
            setTimeout(() => {
                btn.textContent = original;
                btn.style.background = '';
            }, 2000);
        });
    }

    function appendChat(userMsg, aiReply) {
        aiContent.innerHTML += `
            <div class="chat-message user">You: ${escapeHtml(userMsg)}</div>
            <div class="chat-message ai">${escapeHtml(aiReply)}</div>
        `;
        aiContent.scrollTop = aiContent.scrollHeight;
    }

    function showLoading(el, text) {
        el.innerHTML = `<div class="loading">${text}</div>`;
    }

    function getFileIcon(path) {
        const ext = path.split('.').pop()?.toLowerCase();
        const icons = { js: '📄', ts: '📄', py: '🐍', java: '☕', cpp: '⚙️', go: '🐹', md: '📝', json: '🔧', html: '🌐', css: '🎨' };
        return icons[ext] || '📄';
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});

