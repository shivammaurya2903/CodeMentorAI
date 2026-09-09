import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, Info, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Badge } from '../ui/Card';
import { Button } from '../ui/Button';

export function IssueCard({ issue, onFixIssue }) {
  const [expanded, setExpanded] = useState(true);

  const severity = (issue.severity || 'info').toLowerCase();
  const type = issue.type || 'Issue';
  const line = issue.line ? `Line ${issue.line}` : null;
  const description = issue.description || (typeof issue === 'string' ? issue : '');
  const fix = issue.fix || '';

  const getSeverityIcon = () => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertCircle size={20} style={{ color: 'var(--danger)' }} />;
      case 'medium':
      case 'warning':
        return <AlertTriangle size={20} style={{ color: 'var(--warning)' }} />;
      default:
        return <Info size={20} style={{ color: 'var(--info)' }} />;
    }
  };

  const getBadgeVariant = () => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'danger';
      case 'medium':
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border-strong)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        transition: 'all var(--transition-fast)',
        boxShadow: 'var(--shadow-sm)',
      }}
      className="c-issue-card"
    >
      {/* Header Bar */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          cursor: 'pointer',
          userSelect: 'none',
          backgroundColor: 'var(--surface)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {getSeverityIcon()}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 'var(--fw-bold)', fontSize: 'var(--text-base)', color: 'var(--text)' }}>
              {type.toUpperCase()}
            </span>
            <Badge variant={getBadgeVariant()} size="sm">
              {severity}
            </Badge>
            {line && (
              <span
                style={{
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--primary)',
                  backgroundColor: 'var(--primary-subtle)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 'var(--fw-semibold)',
                }}
              >
                {line}
              </span>
            )}
          </div>
        </div>

        <button
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
          title={expanded ? 'Collapse Issue' : 'Expand Issue'}
        >
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Expanded Details Body */}
      {expanded && (
        <div
          style={{
            padding: '1.25rem',
            borderTop: '1px solid var(--border)',
            backgroundColor: 'var(--bg-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <p style={{ fontSize: 'var(--text-md)', color: 'var(--text)', lineHeight: 'var(--lh-relaxed)' }}>
            {description}
          </p>

          {fix && (
            <div style={{ marginTop: '0.25rem' }}>
              <div
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--fw-bold)',
                  color: 'var(--text-muted)',
                  marginBottom: '0.4rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Suggested Fix / Guidance:
              </div>
              <pre
                style={{
                  padding: '0.85rem 1rem',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-base)',
                  lineHeight: 'var(--lh-normal)',
                  color: 'var(--primary)',
                  overflowX: 'auto',
                }}
              >
                <code>{fix}</code>
              </pre>
            </div>
          )}

          {onFixIssue && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
              <Button
                variant="primary"
                size="sm"
                icon={Sparkles}
                onClick={(e) => {
                  e.stopPropagation();
                  onFixIssue(issue);
                }}
              >
                Generate Diff Patch
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
