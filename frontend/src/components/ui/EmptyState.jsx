import React from 'react';

export function EmptyState({ icon: Icon, title, description, action, className = '', style = {} }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '3.5rem 2rem',
        backgroundColor: 'var(--surface)',
        border: '1px dashed var(--border-strong)',
        borderRadius: 'var(--radius-xl)',
        gap: '0.85rem',
        margin: '1.25rem 0',
        ...style,
      }}
      className={`c-empty-state ${className}`}
    >
      {Icon && (
        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--primary-subtle)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.25rem',
          }}
        >
          <Icon size={32} />
        </div>
      )}
      <h3 style={{ fontSize: 'var(--text-xl)', color: 'var(--text)', fontWeight: 'var(--fw-bold)' }}>
        {title}
      </h3>
      {description && (
        <p style={{ color: 'var(--text-muted)', maxWidth: '46ch', fontSize: 'var(--text-md)', lineHeight: 'var(--lh-relaxed)' }}>
          {description}
        </p>
      )}
      {action && <div style={{ marginTop: '0.75rem' }}>{action}</div>}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', message, onRetry, className = '', style = {} }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem 1.5rem',
        backgroundColor: 'var(--danger-subtle)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: 'var(--radius-lg)',
        gap: '0.75rem',
        color: 'var(--danger)',
        ...style,
      }}
      className={`c-error-state ${className}`}
    >
      <div style={{ fontSize: '2rem' }}>⚠️</div>
      <h4 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--fw-bold)', color: 'var(--danger)' }}>
        {title}
      </h4>
      {message && (
        <p style={{ fontSize: 'var(--text-base)', color: 'var(--text)', maxWidth: '50ch', lineHeight: 'var(--lh-normal)' }}>
          {message}
        </p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            marginTop: '0.5rem',
            padding: '0.5rem 1.25rem',
            backgroundColor: 'var(--danger)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: 'var(--text-sm)',
            cursor: 'pointer',
          }}
        >
          Retry Action
        </button>
      )}
    </div>
  );
}

export function Skeleton({ width = '100%', height = '1.25rem', borderRadius = 'var(--radius-md)', style = {} }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: 'var(--surface-hover)',
        ...style,
      }}
      className="animate-pulse"
    />
  );
}
