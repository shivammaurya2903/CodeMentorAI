document.addEventListener('DOMContentLoaded', function() {
  // Elements
  const codeEditor = document.getElementById('code-editor');
  const languageSelect = document.getElementById('language-select');
  const submitBtn = document.getElementById('submit-btn');
  const results = document.getElementById('results');
  const scoreBadge = document.getElementById('score-badge');
  const resultContent = document.getElementById('result-content');
  const copyBtn = document.getElementById('copy-feedback');
  const newReviewBtn = document.getElementById('new-review');
  const clearBtn = document.getElementById('clear-btn');

  // Navbar scroll effects (reuse from script.js)
  window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
      navbar.style.background = 'rgba(15, 23, 42, 0.98)';
      navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
    } else {
      navbar.style.background = 'rgba(15, 23, 42, 0.95)';
      navbar.style.boxShadow = 'none';
    }
  });

  // Auto-resize textarea
  codeEditor.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
  });

  // Submit handler
  submitBtn.addEventListener('click', async () => {
    const code = codeEditor.value.trim();
    const language = languageSelect.value;
    
    if (!code) {
      alert('Please enter some code');
      codeEditor.focus();
      return;
    }

    submitBtn.textContent = 'Analyzing...';
    submitBtn.disabled = true;

    try {
      const response = await fetch('http://localhost:5500/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      displayResults(data);
    } catch (error) {
      resultContent.innerHTML = `
        <div class="error">
          <h4>Connection Error</h4>
          <p>${error.message}</p>
          <p>Make sure backend is running on <code>http://localhost:5500</code></p>
        </div>
      `;
      results.classList.remove('hidden');
    } finally {
      submitBtn.textContent = 'Get AI Review';
      submitBtn.disabled = false;
    }
  });

  function displayResults(data) {
    results.classList.remove('hidden');
    results.scrollIntoView({ behavior: 'smooth' });

    // Score
    scoreBadge.innerHTML = `<span class="badge score">Score: ${data.score || 'N/A'}/100</span>`;

    // Results content
    const issuesHtml = data.issues && data.issues.length ? 
      data.issues.map(issue => `
        <div class="issue-item ${issue.severity || 'info'}">
          <strong>${issue.type?.toUpperCase() || 'ISSUE'} (${(issue.severity || 'info').toUpperCase()})</strong> 
          ${issue.line ? ` - Line ${issue.line}` : ''}
          <p>${issue.description}</p>
          ${issue.fix ? `<code>${issue.fix}</code>` : ''}
        </div>
      `).join('') : '<p class="no-issues">No issues found! 🎉 Your code looks great.</p>';

    const summaryHtml = data.summary ? `<div class="review-summary">${data.summary}</div>` : '';
    const refactoredHtml = data.refactored_code ? `
      <div class="refactored-code">
        <h4>Refactored Code:</h4>
        <pre><code>${escapeHtml(data.refactored_code)}</code></pre>
      </div>
    ` : '';

    resultContent.innerHTML = `
      ${summaryHtml}
      <div class="review-issues">
        <h4>Issues Found:</h4>
        ${issuesHtml}
      </div>
      ${refactoredHtml}
    `;
  }

  // Event listeners
  copyBtn.addEventListener('click', async () => {
    const text = resultContent.innerText;
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = 'Copied!';
      copyBtn.style.background = '#10b981';
      setTimeout(() => {
        copyBtn.textContent = 'Copy Feedback';
        copyBtn.style.background = '';
      }, 2000);
    } catch (err) {
      alert('Copy failed');
    }
  });

  newReviewBtn.addEventListener('click', () => {
    results.classList.add('hidden');
    codeEditor.value = '';
    codeEditor.style.height = 'auto';
    codeEditor.focus();
  });

  clearBtn.addEventListener('click', () => {
    codeEditor.value = '';
    codeEditor.style.height = 'auto';
    codeEditor.focus();
  });

  // Utility: Escape HTML for safe display
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Focus editor on load
  codeEditor.focus();
});

