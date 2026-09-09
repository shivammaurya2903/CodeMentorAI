import React from 'react';
import { Menu, Github, Sparkles } from 'lucide-react';
import { useGithubAuth } from '../../context/GithubAuthContext';
import { Button, IconButton } from '../ui/Button';
import { Badge } from '../ui/Card';

export function TopBar({ onOpenMobileNav, pageTitle = 'Dashboard' }) {
  const { connected, user, connectGitHub } = useGithubAuth();

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--page-padding)',
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-sticky)',
      }}
    >
      {/* Left: Mobile Navigation Toggle & Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className="mobile-only">
          <IconButton
            icon={Menu}
            title="Open Menu"
            variant="ghost"
            size="md"
            onClick={onOpenMobileNav}
          />
        </div>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--fw-bold)', color: 'var(--text)', margin: 0 }}>
          {pageTitle}
        </h1>
      </div>

      {/* Right: GitHub Status & Quick CTA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {connected && user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Badge variant="success" size="md">
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--success)',
                  display: 'inline-block',
                }}
              />
              GitHub Active
            </Badge>
            <span style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', fontWeight: 500 }} className="desktop-only">
              {user.login}
            </span>
          </div>
        ) : (
          <Button variant="secondary" size="sm" icon={Github} onClick={connectGitHub}>
            Connect GitHub
          </Button>
        )}

        <Button
          variant="primary"
          size="sm"
          icon={Sparkles}
          onClick={() => (window.location.href = '/review')}
        >
          AI Review
        </Button>
      </div>
    </header>
  );
}
