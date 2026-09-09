import React, { useRef, useState } from 'react';
import { Trash2, Copy, Check, Code2 } from 'lucide-react';
import { IconButton } from '../ui/Button';

export function CodeEditor({ value = '', onChange, placeholder = 'Paste your code here...', rows = 16, language = 'javascript' }) {
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef(null);

  const lineCount = Math.max(1, (value.match(/\n/g) || []).length + 1);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    onChange('');
    if (textareaRef.current) textareaRef.current.focus();
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-subtle)',
        border: '1px solid var(--border-strong)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Editor Header Bar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
          <span style={{ marginLeft: '0.5rem', fontFamily: 'var(--font-mono)', fontWeight: 'var(--fw-semibold)', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Code2 size={14} /> snippet.{language}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={handleCopy}
            disabled={!value}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'none',
              border: 'none',
              color: copied ? 'var(--success)' : 'var(--text-muted)',
              cursor: value ? 'pointer' : 'not-allowed',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              padding: '0.2rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
            }}
            title="Copy code to clipboard"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleClear}
            disabled={!value}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'none',
              border: 'none',
              color: value ? 'var(--danger)' : 'var(--text-dim)',
              cursor: value ? 'pointer' : 'not-allowed',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              padding: '0.2rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
            }}
            title="Clear editor"
          >
            <Trash2 size={14} /> Clear
          </button>
        </div>
      </div>

      {/* Textarea + Line Numbers */}
      <div style={{ display: 'flex', minHeight: '320px', maxHeight: '520px', overflowY: 'auto' }}>
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
          {lineNumbers.map((num) => (
            <div key={num}>{num}</div>
          ))}
        </div>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          style={{
            flex: 1,
            padding: '0.85rem 1rem',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-base)',
            lineHeight: 1.65,
            resize: 'vertical',
            boxSizing: 'border-box',
          }}
        />
      </div>
    </div>
  );
}
