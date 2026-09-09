import React from 'react';
import { Layers, FileCode, FolderGit2, ShieldAlert } from 'lucide-react';

export function ContextSelector({ selectedScope, onSelectScope, indexed = false, fileCount = 0 }) {
  const scopes = [
    { id: 'current_file', label: 'Current File', icon: FileCode, desc: 'Selected code snippet' },
    { id: 'indexed_repo', label: 'Indexed Repo', icon: FolderGit2, desc: `${fileCount} indexed files`, disabled: !indexed },
    { id: 'no_context', label: 'No Context', icon: ShieldAlert, desc: 'General knowledge mode' },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <Layers size={13} /> Context:
      </span>
      {scopes.map(s => {
        const Icon = s.icon;
        const active = selectedScope === s.id;
        return (
          <button
            key={s.id}
            disabled={s.disabled}
            onClick={() => onSelectScope(s.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.25rem 0.55rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              fontWeight: active ? 600 : 400,
              backgroundColor: active ? 'var(--primary-subtle)' : 'var(--surface-subtle)',
              color: active ? 'var(--primary)' : s.disabled ? 'var(--text-dim)' : 'var(--text-muted)',
              border: active ? '1px solid var(--primary-border)' : '1px solid var(--border)',
              cursor: s.disabled ? 'not-allowed' : 'pointer',
              opacity: s.disabled ? 0.5 : 1,
              transition: 'all 0.15s ease',
            }}
            title={s.desc}
          >
            <Icon size={12} />
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
