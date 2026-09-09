import React from 'react';
import { Sparkles, Terminal, Shield, Zap, GraduationCap, Bug, HelpCircle } from 'lucide-react';

export function AnswerModeSelector({ selectedMode = 'developer', onSelectMode }) {
  const modes = [
    { id: 'developer', label: 'Developer', icon: Terminal },
    { id: 'senior', label: 'Senior Architect', icon: Sparkles },
    { id: 'beginner', label: 'Beginner', icon: GraduationCap },
    { id: 'debugging', label: 'Root Cause Debug', icon: Bug },
    { id: 'security', label: 'Security Auditor', icon: Shield },
    { id: 'performance', label: 'Perf Tuning', icon: Zap },
    { id: 'interview', label: 'Interview Mode', icon: HelpCircle },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--fw-bold)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        AI Persona:
      </span>
      {modes.map(m => {
        const Icon = m.icon;
        const active = selectedMode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onSelectMode(m.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.25rem 0.55rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-xs)',
              fontWeight: active ? 'var(--fw-bold)' : 'var(--fw-medium)',
              backgroundColor: active ? 'var(--primary-subtle)' : 'var(--surface-hover)',
              color: active ? 'var(--primary)' : 'var(--text-muted)',
              border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
            title={`Switch to ${m.label} persona`}
          >
            <Icon size={12} />
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
