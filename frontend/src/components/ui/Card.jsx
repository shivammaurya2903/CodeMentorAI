import React from 'react';

export function Card({
  children,
  variant = 'default',
  hoverable = false,
  className = '',
  style = {},
  onClick,
  ...props
}) {
  const variants = {
    default: {
      backgroundColor: 'var(--surface)',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-sm)',
    },
    elevated: {
      backgroundColor: 'var(--surface-elevated)',
      border: '1px solid var(--border-strong)',
      boxShadow: 'var(--shadow-md)',
    },
    interactive: {
      backgroundColor: 'var(--surface)',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-sm)',
      cursor: 'pointer',
    },
    success: {
      backgroundColor: 'var(--surface)',
      border: '1px solid rgba(34, 197, 94, 0.3)',
      boxShadow: '0 0 16px rgba(34, 197, 94, 0.08)',
    },
    warning: {
      backgroundColor: 'var(--surface)',
      border: '1px solid rgba(245, 158, 11, 0.3)',
      boxShadow: '0 0 16px rgba(245, 158, 11, 0.08)',
    },
    danger: {
      backgroundColor: 'var(--surface)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      boxShadow: '0 0 16px rgba(239, 68, 68, 0.08)',
    },
  };

  const isInteractive = hoverable || variant === 'interactive' || Boolean(onClick);

  return (
    <div
      onClick={onClick}
      style={{
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        transition: 'all var(--transition-normal)',
        ...(variants[variant] || variants.default),
        ...(isInteractive ? { cursor: 'pointer' } : {}),
        ...style,
      }}
      className={`c-card ${isInteractive ? 'c-card--hoverable' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  variant = 'info',
  size = 'md',
  icon: Icon = null,
  className = '',
  style = {},
  ...props
}) {
  const variants = {
    info: { bg: 'var(--info-subtle)', color: 'var(--info)', border: 'rgba(59, 130, 246, 0.25)' },
    success: { bg: 'var(--success-subtle)', color: 'var(--success)', border: 'rgba(34, 197, 94, 0.25)' },
    warning: { bg: 'var(--warning-subtle)', color: 'var(--warning)', border: 'rgba(245, 158, 11, 0.25)' },
    danger: { bg: 'var(--danger-subtle)', color: 'var(--danger)', border: 'rgba(239, 68, 68, 0.25)' },
    primary: { bg: 'var(--primary-subtle)', color: 'var(--primary)', border: 'rgba(56, 189, 248, 0.25)' },
    neutral: { bg: 'var(--surface-hover)', color: 'var(--text-muted)', border: 'var(--border-strong)' },
  };

  const sizes = {
    sm: { padding: '0.2rem 0.6rem', fontSize: 'var(--text-xs)', iconSize: 12 },
    md: { padding: '0.3rem 0.75rem', fontSize: 'var(--text-sm)', iconSize: 14 },
    lg: { padding: '0.4rem 0.9rem', fontSize: 'var(--text-base)', iconSize: 16 },
  };

  const currentVariant = variants[variant] || variants.info;
  const currentSize = sizes[size] || sizes.md;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: currentSize.padding,
        fontSize: currentSize.fontSize,
        fontWeight: 'var(--fw-semibold)',
        borderRadius: 'var(--radius-full)',
        backgroundColor: currentVariant.bg,
        color: currentVariant.color,
        border: `1px solid ${currentVariant.border}`,
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
        userSelect: 'none',
        ...style,
      }}
      className={`c-badge c-badge--${variant} ${className}`}
      {...props}
    >
      {Icon && <Icon size={currentSize.iconSize} />}
      {children}
    </span>
  );
}
