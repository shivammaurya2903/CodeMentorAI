import React from 'react';

export function PageHeader({
  title,
  description,
  badge,
  actions,
  className = '',
  style = {},
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        paddingBottom: '1.25rem',
        borderBottom: '1px solid var(--border)',
        marginBottom: '1.5rem',
        ...style,
      }}
      className={`c-page-header ${className}`}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--fw-extrabold)', color: 'var(--text)', letterSpacing: '-0.02em' }}>
            {title}
          </h1>
          {badge}
        </div>

        {actions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {actions}
          </div>
        )}
      </div>

      {description && (
        <p style={{ fontSize: 'var(--text-md)', color: 'var(--text-muted)', maxWidth: '64ch', lineHeight: 'var(--lh-relaxed)' }}>
          {description}
        </p>
      )}
    </div>
  );
}
