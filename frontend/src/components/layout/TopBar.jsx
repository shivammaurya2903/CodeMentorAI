import React from 'react';
import { Menu, Github, Sparkles, LogOut, User } from 'lucide-react';
import { useGithubAuth } from '../../context/GithubAuthContext';
import { Button, IconButton } from '../ui/Button';
import { Badge } from '../ui/Card';

export function TopBar({ onOpenMobileNav, pageTitle = 'Dashboard' }) {
  const { connected, user, login, connectGitHub, logout } = useGithubAuth();

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
        {connected ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* User avatar and info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {(user?.avatarUrl || user?.avatar_url) ? (
                <img
                  src={user.avatarUrl || user.avatar_url}
                  alt={user.login || 'GitHub User'}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    color: 'var(--text-inverse)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: 'var(--text-sm)',
                  }}
                >
                  {user?.login?.charAt(0)?.toUpperCase() || 'GH'}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-semibold)', color: 'var(--text)' }}>
                  {user?.login ? `@${user.login}` : (user?.name || 'GitHub Connected')}
                </span>
                <Badge variant="success" size="xs">
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--success)',
                      display: 'inline-block',
                      marginRight: '4px',
                    }}
                  />
                  Connected
                </Badge>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={LogOut}
              onClick={logout}
            >
              Logout
            </Button>
          </div>
        ) : (
          <Button variant="secondary" size="sm" icon={Github} onClick={login || connectGitHub}>
            Connect to GitHub
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