import React, { useState } from 'react';
import { Copy, Check, FileCode } from 'lucide-react';

export function CodeViewer({ code = '', language = 'text', filename = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code ? code.split('\n') : [];

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-subtle)',
        border: '1px solid var(--border-strong)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.65rem 1rem',
          backgroundColor: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          fontSize: 'var(--text-sm)',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileCode size={16} style={{ color: 'var(--primary)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'var(--fw-semibold)', color: 'var(--text)' }}>
            {filename || `file.${language}`}
          </span>
        </div>

        <button
          onClick={handleCopy}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: 'none',
            border: 'none',
            color: copied ? 'var(--success)' : 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: 'var(--text-sm)',
            fontWeight: 500,
            padding: '0.2rem 0.5rem',
            borderRadius: 'var(--radius-sm)',
          }}
          title="Copy file content"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* Lines View */}
      <div style={{ display: 'flex', overflowX: 'auto', maxHeight: '550px' }}>
        <div
          style={{
            padding: '0.85rem 0.75rem',
            backgroundColor: 'var(--surface-subtle)',
            borderRight: '1px solid var(--border)',
            userSelect: 'none',
            textAlign: 'right',
            color: 'var(--text-dim)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-base)',
            lineHeight: 1.65,
            minWidth: '46px',
          }}
        >
          {lines.map((_, i) => (
            <div key={i + 1}>{i + 1}</div>
          ))}
        </div>

        <pre
          style={{
            margin: 0,
            padding: '0.85rem 1rem',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-base)',
            lineHeight: 1.65,
            color: 'var(--text)',
            whiteSpace: 'pre',
            wordWrap: 'normal',
            overflowX: 'auto',
            flex: 1,
          }}
        >
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
