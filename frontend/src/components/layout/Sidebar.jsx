import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Code,
  FolderGit2,
  Shield,
  Activity,
  Sparkles,
  Github,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react';
import { useGithubAuth } from '../../context/GithubAuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Badge } from '../ui/Card';
import { Button } from '../ui/Button';

export function Sidebar({ collapsed = false }) {
  const { connected, user, login, connectGitHub, logout } = useGithubAuth();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/workspace', label: 'Repo Workbench', icon: FolderGit2 },
    { to: '/review', label: 'AI Code Review', icon: Code },
    { to: '/security', label: 'Security Engine', icon: Shield },
    { to: '/health', label: 'Health Scorecard', icon: Activity },
    { to: '/improve-plan', label: 'Improvement Plan', icon: Sparkles },
  ];

  return (
    <aside
      style={{
        width: collapsed ? '72px' : '260px',
        backgroundColor: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.25rem 0.85rem',
        transition: 'width var(--transition-normal)',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-header)',
        flexShrink: 0,
      }}
    >
      {/* Brand Header */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            padding: '0.5rem 0.75rem',
            marginBottom: '1.5rem',
          }}
        >
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
              fontSize: '1.15rem',
              boxShadow: 'var(--shadow-glow)',
              flexShrink: 0,
            }}
          >
            CM
          </div>
          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 'var(--fw-bold)', fontSize: 'var(--text-lg)', color: 'var(--text)', letterSpacing: '-0.02em' }}>
                CodeMentor AI
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', fontWeight: 500 }}>
                Enterprise Platform
              </span>
            </div>
          )}
        </div>

        {/* Nav Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.75rem 0.95rem',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  backgroundColor: isActive ? 'var(--primary-subtle)' : 'transparent',
                  fontWeight: isActive ? 'var(--fw-semibold)' : 'var(--fw-medium)',
                  fontSize: 'var(--text-base)',
                  transition: 'all var(--transition-fast)',
                  borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                  textDecoration: 'none',
                })}
              >
                <Icon size={20} style={{ flexShrink: 0 }} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer / Account Status & Theme Toggle */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            padding: '0.65rem 0.95rem',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text)',
            backgroundColor: 'var(--surface-hover)',
            border: '1px solid var(--border)',
            cursor: 'pointer',
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--fw-medium)',
            transition: 'background-color var(--transition-fast)',
            width: '100%',
          }}
          title="Toggle Dark/Light Theme"
        >
          {theme === 'dark' ? <Sun size={18} style={{ color: 'var(--warning)' }} /> : <Moon size={18} style={{ color: 'var(--accent)' }} />}
          {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* GitHub Connection Card */}
        <div
          style={{
            padding: '0.85rem',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-strong)',
          }}
        >
          {connected && user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {(user.avatarUrl || user.avatar_url) ? (
                  <img
                    src={user.avatarUrl || user.avatar_url}
                    alt={user.login}
                    style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--border-strong)', objectFit: 'cover' }}
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
                      fontSize: 'var(--text-xs)',
                    }}
                  >
                    {user.login?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                {!collapsed && (
                  <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', flex: 1 }}>
                    <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--fw-semibold)', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      @{user.login}
                    </div>
                    <Badge variant="success" size="sm">
                      Connected
                    </Badge>
                  </div>
                )}
              </div>
              {!collapsed && (
                <button
                  onClick={logout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--danger)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    marginTop: '0.2rem',
                    fontWeight: 500,
                  }}
                >
                  <LogOut size={14} /> Logout
                </button>
              )}
            </div>
          ) : (
            <Button
              onClick={login || connectGitHub}
              variant="secondary"
              size="sm"
              icon={Github}
              fullWidth
            >
              {!collapsed ? 'Connect to GitHub' : ''}
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}
