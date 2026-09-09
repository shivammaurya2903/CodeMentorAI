import React from 'react';

export function Input({
  label,
  error,
  helperText,
  icon: Icon,
  className = '',
  style = {},
  inputStyle = {},
  disabled = false,
  required = false,
  id,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%', ...style }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--fw-semibold)',
            color: 'var(--text)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
        {Icon && (
          <Icon
            size={18}
            style={{
              position: 'absolute',
              left: '0.85rem',
              color: 'var(--text-dim)',
              pointerEvents: 'none',
            }}
          />
        )}

        <input
          id={inputId}
          disabled={disabled}
          required={required}
          style={{
            width: '100%',
            height: 'var(--height-input)',
            padding: Icon ? '0 1rem 0 2.6rem' : '0 1rem',
            backgroundColor: 'var(--surface-subtle)',
            border: `1px solid ${error ? 'var(--danger)' : 'var(--border-strong)'}`,
            borderRadius: 'var(--radius-md)',
            color: 'var(--text)',
            fontSize: 'var(--text-base)',
            outline: 'none',
            transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
            opacity: disabled ? 0.6 : 1,
            cursor: disabled ? 'not-allowed' : 'text',
            ...inputStyle,
          }}
          className={`c-input ${className}`}
          {...props}
        />
      </div>

      {error ? (
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--danger)', fontWeight: 500 }}>
          ⚠️ {error}
        </span>
      ) : helperText ? (
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-dim)' }}>
          {helperText}
        </span>
      ) : null}
    </div>
  );
}

export function Select({
  label,
  options = [],
  error,
  helperText,
  icon: Icon,
  className = '',
  style = {},
  selectStyle = {},
  disabled = false,
  id,
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%', ...style }}>
      {label && (
        <label
          htmlFor={selectId}
          style={{
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--fw-semibold)',
            color: 'var(--text)',
          }}
        >
          {label}
        </label>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
        {Icon && (
          <Icon
            size={18}
            style={{
              position: 'absolute',
              left: '0.85rem',
              color: 'var(--text-dim)',
              pointerEvents: 'none',
            }}
          />
        )}

        <select
          id={selectId}
          disabled={disabled}
          style={{
            width: '100%',
            height: 'var(--height-input)',
            padding: Icon ? '0 2.2rem 0 2.6rem' : '0 2.2rem 0 1rem',
            backgroundColor: 'var(--surface-subtle)',
            border: `1px solid ${error ? 'var(--danger)' : 'var(--border-strong)'}`,
            borderRadius: 'var(--radius-md)',
            color: 'var(--text)',
            fontSize: 'var(--text-base)',
            outline: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'border-color var(--transition-fast)',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.85rem center',
            opacity: disabled ? 0.6 : 1,
            ...selectStyle,
          }}
          className={`c-select ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option
              key={typeof opt === 'object' ? opt.value : opt}
              value={typeof opt === 'object' ? opt.value : opt}
              style={{ backgroundColor: 'var(--surface)', color: 'var(--text)' }}
            >
              {typeof opt === 'object' ? opt.label : opt}
            </option>
          ))}
        </select>
      </div>

      {error && <span style={{ fontSize: 'var(--text-sm)', color: 'var(--danger)' }}>⚠️ {error}</span>}
      {!error && helperText && <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-dim)' }}>{helperText}</span>}
    </div>
  );
}

export function Textarea({
  label,
  error,
  helperText,
  className = '',
  style = {},
  textareaStyle = {},
  disabled = false,
  rows = 4,
  id,
  ...props
}) {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%', ...style }}>
      {label && (
        <label
          htmlFor={textareaId}
          style={{
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--fw-semibold)',
            color: 'var(--text)',
          }}
        >
          {label}
        </label>
      )}

      <textarea
        id={textareaId}
        disabled={disabled}
        rows={rows}
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--surface-subtle)',
          border: `1px solid ${error ? 'var(--danger)' : 'var(--border-strong)'}`,
          borderRadius: 'var(--radius-md)',
          color: 'var(--text)',
          fontSize: 'var(--text-base)',
          lineHeight: 'var(--lh-normal)',
          outline: 'none',
          resize: 'vertical',
          transition: 'border-color var(--transition-fast)',
          opacity: disabled ? 0.6 : 1,
          fontFamily: 'inherit',
          ...textareaStyle,
        }}
        className={`c-textarea ${className}`}
        {...props}
      />

      {error && <span style={{ fontSize: 'var(--text-sm)', color: 'var(--danger)' }}>⚠️ {error}</span>}
      {!error && helperText && <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-dim)' }}>{helperText}</span>}
    </div>
  );
}
