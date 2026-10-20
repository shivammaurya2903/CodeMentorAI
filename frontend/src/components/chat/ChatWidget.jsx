import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Sparkles, Trash2 } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { AnswerModeSelector } from './AnswerModeSelector';
import { IconButton } from '../ui/Button';
import { aiService } from '../../services/aiService';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('developer');
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('ai_chat_history');
      return saved
        ? JSON.parse(saved)
        : [
            {
              sender: 'ai',
              content:
                "Hey! 👋 I'm your AI Code Mentor. Ask me anything about your code, debugging, refactoring, or best practices!",
              timestamp: Date.now(),
            },
          ];
    } catch {
      return [
        {
          sender: 'ai',
          content: "Hey! 👋 I'm your AI Code Mentor. Ask me anything about your code!",
          timestamp: Date.now(),
        },
      ];
    }
  });

  const messagesEndRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem('ai_chat_history', JSON.stringify(messages));
    } catch (e) {
      console.warn('Could not save chat history:', e);
    }
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (text) => {
    const userMsg = { sender: 'user', content: text, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // Map history to strict format: [{ role: 'user' | 'assistant', content: string }]
      const history = messages
        .filter((m) => m && m.content)
        .slice(-10)
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
        }));

      const response = await aiService.chatWithAI(text, '', 'javascript', {
        mode,
        history,
      });

      // Safely extract reply string even if backend returned structured JSON or nested object
      let replyText = 'AI response unavailable.';
      let improvedCode = '';
      let fix = '';
      let citedFiles = [];

      if (response && typeof response === 'object') {
        replyText = typeof response.reply === 'string'
          ? response.reply
          : (typeof response.content === 'string' ? response.content : JSON.stringify(response.reply || response, null, 2));
        improvedCode = response.improved_code || response.refactored_code || '';
        fix = response.fix || '';
        citedFiles = Array.isArray(response.cited_files) ? response.cited_files : [];
      } else if (typeof response === 'string') {
        try {
          const parsed = JSON.parse(response);
          replyText = parsed.reply || parsed.content || response;
          improvedCode = parsed.improved_code || parsed.refactored_code || '';
          fix = parsed.fix || '';
          citedFiles = Array.isArray(parsed.cited_files) ? parsed.cited_files : [];
        } catch {
          replyText = response;
        }
      }

      const aiMsg = {
        sender: 'ai',
        content: replyText,
        metadata: {
          fix,
          improved_code: improvedCode,
          cited_files: citedFiles,
        },
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = {
        sender: 'ai',
        content: `❌ Could not reach AI Service: ${err.message}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        sender: 'ai',
        content: "Chat history cleared. How can I help you with your code today?",
        timestamp: Date.now(),
      },
    ]);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '1.75rem',
          right: '1.75rem',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary)',
          color: 'var(--text-inverse)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: 'var(--shadow-lg), var(--shadow-glow)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 'var(--z-modal)',
          transition: 'all var(--transition-fast)',
        }}
        title="AI Code Mentor Assistant"
      >
        {isOpen ? <X size={26} /> : <MessageSquare size={26} />}
      </button>

      {/* Floating Side Panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '5.75rem',
            right: '1.75rem',
            width: 'min(440px, calc(100vw - 2rem))',
            height: 'min(620px, calc(100vh - 7.5rem))',
            backgroundColor: 'var(--surface-elevated)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-2xl)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 'var(--z-modal)',
            animation: 'fadeIn 200ms ease-out',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '0.85rem 1.1rem',
              backgroundColor: 'var(--surface)',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-subtle)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--fw-bold)', color: 'var(--text)', margin: 0 }}>
                    AI Code Mentor
                  </h4>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--success)', fontWeight: 500 }}>● Active Assistant</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <IconButton icon={Trash2} title="Clear Chat" onClick={handleClearChat} size="sm" />
                <IconButton icon={X} title="Close Assistant" onClick={() => setIsOpen(false)} size="sm" />
              </div>
            </div>

            {/* Persona Selector Bar */}
            <div style={{ paddingTop: '0.2rem', borderTop: '1px border-subtle' }}>
              <AnswerModeSelector selectedMode={mode} onSelectMode={setMode} />
            </div>
          </div>

          {/* Messages Container */}
          <div
            style={{
              flex: 1,
              padding: '1.25rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              backgroundColor: 'var(--bg-subtle)',
            }}
          >
            {messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <ChatInput onSendMessage={handleSendMessage} isLoading={loading} />
        </div>
      )}
    </>
  );
}
