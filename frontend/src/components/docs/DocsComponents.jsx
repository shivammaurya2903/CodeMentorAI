import React, { useState } from 'react';
import { Sparkles, AlertTriangle, Shield, Check, Copy, Info, Search } from 'lucide-react';
import { Card } from '../ui/Card';

export function DocsCallout({ type = 'note', title, children, className = '', style = {} }) {
  const configs = {
    tip: {
      icon: Sparkles,
      bg: 'rgba(56, 189, 248, 0.08)',
      border: 'rgba(56, 189, 248, 0.3)',
      color: 'var(--primary)',
      defaultTitle: 'Pro Tip',
    },
    note: {
      icon: Info,
      bg: 'var(--surface-subtle)',
      border: 'var(--border-strong)',
      color: 'var(--text)',
      defaultTitle: 'Note',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'rgba(245, 158, 11, 0.08)',
      border: 'rgba(245, 158, 11, 0.3)',
      color: 'var(--warning)',
      defaultTitle: 'Warning',
    },
    important: {
      icon: AlertTriangle,
      bg: 'rgba(239, 68, 68, 0.08)',
      border: 'rgba(239, 68, 68, 0.3)',
      color: 'var(--danger)',
      defaultTitle: 'Important Requirement',
    },
    security: {
      icon: Shield,
      bg: 'rgba(34, 197, 94, 0.08)',
      border: 'rgba(34, 197, 94, 0.3)',
      color: 'var(--success)',
      defaultTitle: 'Security Note',
    },
  };

  const cfg = configs[type] || configs.note;
  const Icon = cfg.icon;

  return (
    <div
      style={{
        padding: '1.15rem 1.35rem',
        backgroundColor: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderLeft: `4px solid ${cfg.color}`,
        borderRadius: 'var(--radius-lg)',
        margin: '1.25rem 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem',
        ...style,
      }}
      className={`c-docs-callout ${className}`}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: cfg.color, fontWeight: 'var(--fw-bold)', fontSize: 'var(--text-base)' }}>
        <Icon size={18} />
        <span>{title || cfg.defaultTitle}</span>
      </div>
      <div style={{ fontSize: 'var(--text-base)', color: 'var(--text)', lineHeight: 'var(--lh-relaxed)' }}>
        {children}
      </div>
    </div>
  );
}

export function DocsCodeBlock({ code = '', language = 'bash', title = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-subtle)',
        border: '1px solid var(--border-strong)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        margin: '1.25rem 0',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.6rem 1rem',
          backgroundColor: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          fontSize: 'var(--text-sm)',
          color: 'var(--text-muted)',
          fontWeight: 500,
        }}
      >
        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontWeight: 'var(--fw-semibold)' }}>
          {title || language}
        </span>
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
          }}
          title="Copy code to clipboard"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <pre
        style={{
          padding: '1rem 1.25rem',
          margin: 0,
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-base)',
          lineHeight: 1.65,
          color: 'var(--text)',
          overflowX: 'auto',
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function DocsTable({ headers = [], rows = [] }) {
  return (
    <div
      style={{
        overflowX: 'auto',
        margin: '1.25rem 0',
        border: '1px solid var(--border-strong)',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--surface)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          fontSize: 'var(--text-base)',
        }}
      >
        <thead>
          <tr style={{ backgroundColor: 'var(--surface-hover)', borderBottom: '1px solid var(--border-strong)' }}>
            {headers.map((h, idx) => (
              <th
                key={idx}
                style={{
                  padding: '0.85rem 1.15rem',
                  fontWeight: 'var(--fw-bold)',
                  color: 'var(--text)',
                  fontSize: 'var(--text-sm)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rIdx) => (
            <tr
              key={rIdx}
              style={{
                borderBottom: rIdx === rows.length - 1 ? 'none' : '1px solid var(--border)',
                transition: 'background-color var(--transition-fast)',
              }}
              className="c-tree-item"
            >
              {row.map((cell, cIdx) => (
                <td
                  key={cIdx}
                  style={{
                    padding: '0.85rem 1.15rem',
                    color: cIdx === 0 ? 'var(--text)' : 'var(--text-muted)',
                    lineHeight: 'var(--lh-normal)',
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DocsStep({ number, title, children }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '1.25rem',
        alignItems: 'flex-start',
        margin: '1.25rem 0',
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary)',
          color: 'var(--text-inverse)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'var(--fw-extrabold)',
          fontSize: 'var(--text-base)',
          flexShrink: 0,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {number}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <h4 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--fw-bold)', color: 'var(--text)', margin: 0 }}>
          {title}
        </h4>
        <div style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', lineHeight: 'var(--lh-relaxed)' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function DocsSearch({ searchTerm, setSearchTerm }) {
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '580px', margin: '0 auto 1.5rem auto' }}>
      <Search
        size={20}
        style={{
          position: 'absolute',
          left: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-dim)',
          pointerEvents: 'none',
        }}
      />
      <input
        type="text"
        placeholder="Search docs (e.g. GitHub OAuth, score ranges, API endpoints, Groq, security)..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: '100%',
          height: '48px',
          padding: '0 1rem 0 3rem',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-full)',
          color: 'var(--text)',
          fontSize: 'var(--text-base)',
          outline: 'none',
          boxShadow: 'var(--shadow-md)',
          transition: 'all var(--transition-fast)',
        }}
        className="c-input"
      />
    </div>
  );
}
