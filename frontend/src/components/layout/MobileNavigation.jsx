import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { X, LayoutDashboard, Code, FolderGit2, Shield, Activity, Sparkles, Github, LogOut } from 'lucide-react';
import { useGithubAuth } from '../../context/GithubAuthContext';
import { Button, IconButton } from '../ui/Button';
import { Badge } from '../ui/Card';

export function MobileNavigation({ isOpen, onClose }) {
  const { connected, user, login, connectGitHub, logout } = useGithubAuth();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/workspace', label: 'Repo Workbench', icon: FolderGit2 },
    { to: '/review', label: 'AI Code Review', icon: Code },
    { to: '/security', label: 'Security Engine', icon: Shield },
    { to: '/health', label: 'Health Scorecard', icon: Activity },
    { to: '/improve-plan', label: 'Improvement Plan', icon: Sparkles },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(6px)',
        zIndex: 'var(--z-drawer)',
        display: 'flex',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '300px',
          maxWidth: '85vw',
          backgroundColor: 'var(--surface-elevated)',
          height: '100%',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRight: '1px solid var(--border-strong)',
          boxShadow: 'var(--shadow-lg)',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-inverse)',
                  fontWeight: 'var(--fw-extrabold)',
                  fontSize: '1.1rem',
                }}
              >
                CM
              </div>
              <span style={{ fontWeight: 'var(--fw-bold)', fontSize: 'var(--text-lg)', color: 'var(--text)' }}>
                CodeMentor AI
              </span>
            </div>
            <IconButton icon={X} title="Close Navigation" onClick={onClose} size="md" />
          </div>

          {/* Navigation items */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                    backgroundColor: isActive ? 'var(--primary-subtle)' : 'transparent',
                    fontWeight: isActive ? 'var(--fw-semibold)' : 'var(--fw-medium)',
                    fontSize: 'var(--text-base)',
                    textDecoration: 'none',
                    minHeight: '44px',
                  })}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Account / Connect GitHub */}
        <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
          {connected && user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {(user.avatarUrl || user.avatar_url) ? (
                  <img
                    src={user.avatarUrl || user.avatar_url}
                    alt={user.login}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border)', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
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
                    {user.login?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 'var(--fw-semibold)', color: 'var(--text)', fontSize: 'var(--text-base)' }}>
                    @{user.login}
                  </div>
                  <Badge variant="success" size="sm">Connected</Badge>
                </div>
              </div>
              <Button variant="dangerSubtle" size="md" icon={LogOut} onClick={logout} fullWidth>
                Logout
              </Button>
            </div>
          ) : (
            <Button variant="primary" size="lg" icon={Github} onClick={login || connectGitHub} fullWidth>
              Connect to GitHub
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
