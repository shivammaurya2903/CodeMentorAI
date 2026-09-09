import React from 'react';
import { Sparkles } from 'lucide-react';
import { CodeViewer } from '../code/CodeViewer';

export function RefactoredCode({ code = '', language = 'javascript' }) {
  if (!code) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <Sparkles size={20} style={{ color: 'var(--primary)' }} />
        <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--fw-bold)', color: 'var(--text)' }}>
          Optimized Refactored Implementation
        </h3>
      </div>
      <CodeViewer code={code} language={language} filename={`refactored.${language}`} />
    </div>
  );
}
