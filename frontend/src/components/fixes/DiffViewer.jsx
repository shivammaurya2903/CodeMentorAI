import React, { useState } from 'react';
import { CheckCircle2, Copy, Download, X, FileCode } from 'lucide-react';
import { Button, IconButton } from '../ui/Button';
import { Badge } from '../ui/Card';

export function DiffViewer({ changeRequest, onApply, onReject, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!changeRequest) return null;

  const { filePath, proposedCode, diff, reason, risk, verificationStatus } = changeRequest;

  const handleCopy = () => {
    navigator.clipboard.writeText(proposedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([proposedCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filePath.split('/').pop() || 'patch.js';
    a.click();
    URL.revokeObjectURL(url);
  };

  const diffLines = (diff || '').split('\n');

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(9, 13, 22, 0.82)',
        backdropFilter: 'blur(6px)',
        zIndex: 'var(--z-modal)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--surface-elevated)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: '920px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          animation: 'fadeIn 200ms ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileCode size={22} style={{ color: 'var(--primary)' }} />
            <div>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--fw-bold)', margin: 0, color: 'var(--text)' }}>
                Proposed Code Patch: {filePath}
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', margin: 0, marginTop: '0.15rem' }}>
                {reason}
              </p>
            </div>
          </div>

          <IconButton icon={X} title="Close Diff Viewer" onClick={onClose} size="sm" />
        </div>

        {/* Verification Status & Risk Banner */}
        <div
          style={{
            padding: '0.85rem 1.5rem',
            backgroundColor: 'var(--bg-subtle)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 'var(--text-base)',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
            <span>Verification: <strong>{verificationStatus || 'Syntax & AST Passed'}</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Badge variant={risk === 'High' ? 'danger' : 'success'} size="sm">
              Risk Level: {risk || 'Low'}
            </Badge>
          </div>
        </div>

        {/* Diff View Code Lines */}
        <div
          style={{
            padding: '1rem 1.25rem',
            overflowY: 'auto',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-base)',
            backgroundColor: '#0a0e17',
            color: '#c9d1d9',
            flex: 1,
            lineHeight: 1.65,
          }}
        >
          {diffLines.map((line, idx) => {
            let bgColor = 'transparent';
            let textColor = '#c9d1d9';
            if (line.startsWith('+') && !line.startsWith('+++')) {
              bgColor = 'rgba(46, 160, 67, 0.18)';
              textColor = '#7ee787';
            } else if (line.startsWith('-') && !line.startsWith('---')) {
              bgColor = 'rgba(248, 81, 73, 0.18)';
              textColor = '#ff7b72';
            } else if (line.startsWith('@@') || line.startsWith('---') || line.startsWith('+++')) {
              textColor = '#79c0ff';
            }

            return (
              <div key={idx} style={{ backgroundColor: bgColor, color: textColor, padding: '0.15rem 0.5rem', borderRadius: '2px', whiteSpace: 'pre-wrap' }}>
                {line}
              </div>
            );
          })}
        </div>

        {/* Actions Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--surface)',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="secondary" size="sm" icon={Copy} onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy Proposed Code'}
            </Button>
            <Button variant="secondary" size="sm" icon={Download} onClick={handleDownload}>
              Download Patch
            </Button>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="dangerSubtle" size="md" onClick={onReject}>
              Reject Patch
            </Button>

            <Button variant="primary" size="md" icon={CheckCircle2} onClick={() => onApply(proposedCode)}>
              Apply Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
