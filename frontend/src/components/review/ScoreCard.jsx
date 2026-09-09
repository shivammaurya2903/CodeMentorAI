import React from 'react';
import { Award, ShieldCheck, Zap, Code } from 'lucide-react';
import { Card, Badge } from '../ui/Card';

export function ScoreCard({ score = 0, summary = '' }) {
  let rating = 'Needs Work';
  let variant = 'danger';

  if (score >= 90) {
    rating = 'Excellent';
    variant = 'success';
  } else if (score >= 75) {
    rating = 'Good';
    variant = 'primary';
  } else if (score >= 60) {
    rating = 'Fair';
    variant = 'warning';
  }

  return (
    <Card style={{ background: 'radial-gradient(circle at top right, rgba(56, 189, 248, 0.08), transparent 60%), var(--surface)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Award size={22} style={{ color: 'var(--primary)' }} />
          <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--fw-bold)', color: 'var(--text)' }}>
            Code Quality Index
          </h3>
        </div>
        <Badge variant={variant} size="md">
          {rating}
        </Badge>
      </div>

      {/* Main Score & Metrics */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.6rem', marginBottom: '0.85rem' }}>
        <span style={{ fontSize: 'var(--text-5xl)', fontWeight: 'var(--fw-extrabold)', color: 'var(--text)', lineHeight: 1, letterSpacing: '-0.03em' }}>
          {score}
        </span>
        <span style={{ fontSize: 'var(--text-lg)', color: 'var(--text-dim)', fontWeight: 'var(--fw-semibold)', paddingBottom: '0.3rem' }}>
          / 100
        </span>
      </div>

      {/* Visual Progress Bar */}
      <div
        style={{
          width: '100%',
          height: '10px',
          backgroundColor: 'var(--surface-hover)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          marginBottom: '1.25rem',
          border: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            width: `${Math.min(100, Math.max(0, score))}%`,
            height: '100%',
            backgroundColor:
              score >= 90
                ? 'var(--success)'
                : score >= 75
                ? 'var(--primary)'
                : score >= 60
                ? 'var(--warning)'
                : 'var(--danger)',
            borderRadius: 'var(--radius-full)',
            transition: 'width var(--transition-normal)',
          }}
        />
      </div>

      {summary && (
        <p style={{ fontSize: 'var(--text-md)', color: 'var(--text-muted)', lineHeight: 'var(--lh-relaxed)' }}>
          {summary}
        </p>
      )}
    </Card>
  );
}
