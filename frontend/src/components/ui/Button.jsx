import React from 'react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon = null,
  iconRight: IconRight = null,
  fullWidth = false,
  className = '',
  style = {},
  type = 'button',
  ...props
}) {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontWeight: 600,
    fontFamily: 'var(--font-sans)',
    borderRadius: 'var(--radius-md)',
    transition: 'all var(--transition-fast)',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.55 : 1,
    border: '1px solid transparent',
    outline: 'none',
    width: fullWidth ? '100%' : 'auto',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    boxSizing: 'border-box',
    textDecoration: 'none',
  };

  const variants = {
    primary: {
      backgroundColor: 'var(--primary)',
      color: 'var(--text-inverse)',
      boxShadow: 'var(--shadow-sm)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
    },
    secondary: {
      backgroundColor: 'var(--surface-hover)',
      color: 'var(--text)',
      borderColor: 'var(--border-strong)',
      boxShadow: 'var(--shadow-sm)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--text-muted)',
      borderColor: 'transparent',
    },
    danger: {
      backgroundColor: 'var(--danger)',
      color: '#ffffff',
      boxShadow: 'var(--shadow-sm)',
    },
    dangerSubtle: {
      backgroundColor: 'var(--danger-subtle)',
      color: 'var(--danger)',
      borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    success: {
      backgroundColor: 'var(--success)',
      color: '#ffffff',
      boxShadow: 'var(--shadow-sm)',
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--primary)',
      borderColor: 'var(--primary)',
    },
    link: {
      backgroundColor: 'transparent',
      color: 'var(--primary)',
      padding: 0,
      height: 'auto',
      borderRadius: 0,
    },
  };

  const sizes = {
    sm: {
      height: 'var(--height-btn-sm)',
      padding: '0 0.85rem',
      fontSize: 'var(--text-sm)',
    },
    md: {
      height: 'var(--height-btn-md)',
      padding: '0 1.25rem',
      fontSize: 'var(--text-base)',
    },
    lg: {
      height: 'var(--height-btn-lg)',
      padding: '0 1.65rem',
      fontSize: 'var(--text-md)',
    },
  };

  const iconSizes = {
    sm: 15,
    md: 18,
    lg: 20,
  };

  const combinedStyle = {
    ...baseStyle,
    ...variants[variant],

    ...(variant !== 'link' ? sizes[size] : {}),
    ...style,
  };

  const iconSize = iconSizes[size] || 18;

  return (
    <button
      type={type}
      style={combinedStyle}
      disabled={disabled || isLoading}
      className={`c-button c-button--${variant} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span
          style={{
            width: `${iconSize}px`,
            height: `${iconSize}px`,
            border: '2px solid currentColor',
            borderRightColor: 'transparent',
            borderRadius: '50%',
            display: 'inline-block',
            flexShrink: 0,
          }}
          className="animate-spin"
        />
      ) : Icon ? (
        <Icon size={iconSize} style={{ flexShrink: 0 }} />
      ) : null}

      {children && <span>{children}</span>}

      {!isLoading && IconRight && <IconRight size={iconSize} style={{ flexShrink: 0 }} />}
    </button>
  );
}

export function IconButton({
  icon: Icon,
  title,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  isLoading = false,
  className = '',
  style = {},
  ...props
}) {
  const sizeDims = {
    sm: { width: '32px', height: '32px', iconSize: 16 },
    md: { width: '40px', height: '40px', iconSize: 18 },
    lg: { width: '48px', height: '48px', iconSize: 22 },
  };

  const dim = sizeDims[size] || sizeDims.md;

  return (
    <Button
      variant={variant}
      disabled={disabled}
      isLoading={isLoading}
      title={title}
      aria-label={title}
      className={`c-icon-button ${className}`}
      style={{
        width: dim.width,
        height: dim.height,
        padding: 0,
        borderRadius: 'var(--radius-md)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        ...style,
      }}
      {...props}
    >
      {!isLoading && Icon && <Icon size={dim.iconSize} />}
    </Button>
  );
}
