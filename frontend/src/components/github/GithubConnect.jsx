import React from 'react';
import { Github, ArrowRight } from 'lucide-react';
import { Card, Badge } from '../ui/Card';
import { Button } from '../ui/Button';
import { useGithubAuth } from '../../context/GithubAuthContext';

export function GithubConnect() {
  const { connected, user, connectGitHub } = useGithubAuth();

  if (connected && user) return null;

  return (
    <Card
      style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, var(--surface-elevated) 100%)',
        border: '1px solid var(--border-strong)',
        margin: '1.25rem 0',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', maxWidth: '640px' }}>
          <div
            style={{
              padding: '0.85rem',
              backgroundColor: 'var(--surface-hover)',
              borderRadius: 'var(--radius-lg)',
              color: 'var(--text)',
              border: '1px solid var(--border-strong)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Github size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--fw-bold)', color: 'var(--text)' }}>
                Connect Your GitHub Repository
              </h3>
              <Badge variant="info" size="sm">OAuth 2.0</Badge>
            </div>
            <p style={{ fontSize: 'var(--text-md)', color: 'var(--text-muted)', lineHeight: 'var(--lh-relaxed)' }}>
              Unlock direct file browsing, automatic single-file AI reviews, and full codebase analysis without manually copying code snippets.
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          icon={Github}
          iconRight={ArrowRight}
          onClick={connectGitHub}
        >
          Connect GitHub Workspace
        </Button>
      </div>
    </Card>
  );
}
