import React, { useState, useRef } from 'react';
import { Send } from 'lucide-react';
import { Button } from '../ui/Button';

export function ChatInput({ onSendMessage, isLoading = false }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem',
        padding: '0.85rem 1rem',
        backgroundColor: 'var(--surface)',
        borderTop: '1px solid var(--border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.6rem' }}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
          }}
          onKeyDown={handleKeyDown}
          placeholder="Ask AI mentor a question, paste code, or request refactoring..."
          rows={1}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--surface-subtle)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-md)',
            outline: 'none',
            color: 'var(--text)',
            fontSize: 'var(--text-base)',
            lineHeight: 'var(--lh-normal)',
            resize: 'none',
            maxHeight: '140px',
            fontFamily: 'inherit',
          }}
        />

        <Button variant="primary" size="md" isLoading={isLoading} type="submit" icon={Send} />
      </div>

      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', textAlign: 'right' }}>
        Press <kbd style={{ padding: '0.1rem 0.35rem', backgroundColor: 'var(--surface-hover)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)' }}>Enter</kbd> to send, <kbd style={{ padding: '0.1rem 0.35rem', backgroundColor: 'var(--surface-hover)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)' }}>Shift+Enter</kbd> for new line
      </div>
    </form>
  );
}
