import React, { useState } from 'react';
import { Bot, User, Copy, Check, Sparkles } from 'lucide-react';

export function CodeFixCard({ title = 'Suggested Code Fix', code = '' }) {
  const [copied, setCopied] = useState(false);

  if (!code) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        marginTop: '0.75rem',
        backgroundColor: 'var(--bg-subtle)',
        border: '1px solid var(--border-strong)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.45rem 0.85rem',
          backgroundColor: 'var(--surface-elevated)',
          borderBottom: '1px solid var(--border)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--fw-semibold)',
          color: 'var(--primary)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Sparkles size={14} /> {title}
        </span>
        <button
          onClick={handleCopy}
          style={{
            background: 'none',
            border: 'none',
            color: copied ? 'var(--success)' : 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: 'var(--text-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            fontWeight: 500,
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <pre
        style={{
          padding: '0.85rem 1rem',
          margin: 0,
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-base)',
          lineHeight: 1.6,
          color: 'var(--text)',
          overflowX: 'auto',
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function ChatMessage({ message }) {
  const isUser = message.sender === 'user';

  let displayContent = message.content;
  let improvedCode = message.metadata?.improved_code;
  let fix = message.metadata?.fix;
  let citedFiles = message.metadata?.cited_files;

  // If content is an unparsed JSON string containing { reply, improved_code }, unpack it cleanly
  if (typeof displayContent === 'string' && displayContent.trim().startsWith('{') && displayContent.trim().endsWith('}')) {
    try {
      const parsed = JSON.parse(displayContent);
      if (parsed && typeof parsed === 'object') {
        if (parsed.reply) displayContent = parsed.reply;
        if (!improvedCode && (parsed.improved_code || parsed.refactored_code)) {
          improvedCode = parsed.improved_code || parsed.refactored_code;
        }
        if (!fix && parsed.fix) fix = parsed.fix;
        if (!citedFiles && Array.isArray(parsed.cited_files)) citedFiles = parsed.cited_files;
      }
    } catch {
      // Keep as regular string
    }
  } else if (typeof displayContent === 'object' && displayContent !== null) {
    if (displayContent.reply) {
      improvedCode = improvedCode || displayContent.improved_code || displayContent.refactored_code;
      fix = fix || displayContent.fix;
      citedFiles = citedFiles || displayContent.cited_files;
      displayContent = typeof displayContent.reply === 'string' ? displayContent.reply : JSON.stringify(displayContent.reply, null, 2);
    } else {
      displayContent = JSON.stringify(displayContent, null, 2);
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: '0.85rem',
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: isUser ? 'var(--primary)' : 'var(--surface-hover)',
          color: isUser ? 'var(--text-inverse)' : 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border)',
        }}
      >
        {isUser ? <User size={18} /> : <Bot size={18} />}
      </div>

      {/* Message Bubble Body */}
      <div
        style={{
          maxWidth: '85%',
          backgroundColor: isUser ? 'var(--primary-subtle)' : 'var(--surface)',
          border: `1px solid ${isUser ? 'rgba(56, 189, 248, 0.35)' : 'var(--border-strong)'}`,
          padding: '0.85rem 1.15rem',
          borderRadius: 'var(--radius-xl)',
          fontSize: 'var(--text-base)',
          lineHeight: 'var(--lh-relaxed)',
          color: 'var(--text)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <p style={{ whiteSpace: 'pre-wrap' }}>{displayContent}</p>

        {Array.isArray(citedFiles) && citedFiles.length > 0 && (
          <div style={{ marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>Citations:</span>
            {citedFiles.map((file, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: 'var(--text-xs)',
                  fontFamily: 'var(--font-mono)',
                  padding: '0.15rem 0.45rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--surface-hover)',
                  border: '1px solid var(--border)',
                  color: 'var(--primary)',
                }}
              >
                📄 {file}
              </span>
            ))}
          </div>
        )}

        {fix && <CodeFixCard title="Suggested Code Fix" code={fix} />}
        {improvedCode && (
          <CodeFixCard title="Improved Code Block" code={improvedCode} />
        )}
      </div>
    </div>
  );
}
