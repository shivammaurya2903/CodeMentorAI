import React, { useState } from 'react';
import { CheckCircle2, ShieldAlert } from 'lucide-react';
import { IssueCard } from './IssueCard';
import { Card } from '../ui/Card';

export function IssueList({ issues = [], onFixIssue }) {
  const [filter, setFilter] = useState('all');

  if (!issues || issues.length === 0) {
    return (
      <Card
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.85rem',
          padding: '3rem 2rem',
          textAlign: 'center',
        }}
      >
        <CheckCircle2 size={40} style={{ color: 'var(--success)' }} />
        <h4 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--fw-bold)', color: 'var(--text)' }}>
          No Issues Detected! 🎉
        </h4>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-md)', maxWidth: '44ch', lineHeight: 'var(--lh-relaxed)' }}>
          Great work! Your code passed automated security, memory, and syntax inspections without critical flags.
        </p>
      </Card>
    );
  }

  const filteredIssues = issues.filter((issue) => {
    if (filter === 'all') return true;
    const sev = (issue.severity || 'info').toLowerCase();
    if (filter === 'critical') return sev === 'critical' || sev === 'high';
    if (filter === 'medium') return sev === 'medium' || sev === 'warning';
    if (filter === 'low') return sev === 'low' || sev === 'info';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header & Filter Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <ShieldAlert size={22} style={{ color: 'var(--primary)' }} />
          <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--fw-bold)', color: 'var(--text)' }}>
            Issues Found ({issues.length})
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: 'var(--surface-subtle)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          {['all', 'critical', 'medium', 'low'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: '0.4rem 0.85rem',
                fontSize: 'var(--text-sm)',
                fontWeight: filter === tab ? 'var(--fw-bold)' : 'var(--fw-medium)',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: filter === tab ? 'var(--primary-subtle)' : 'transparent',
                color: filter === tab ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all var(--transition-fast)',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Issues Stack */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {filteredIssues.map((issue, idx) => (
          <IssueCard key={idx} issue={issue} onFixIssue={onFixIssue} />
        ))}
      </div>
    </div>
  );
}
