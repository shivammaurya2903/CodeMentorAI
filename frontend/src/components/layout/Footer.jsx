import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Github, Code, FolderGit2, Shield, Activity, ExternalLink, Heart } from 'lucide-react';
import { Badge } from '../ui/Card';
import { useGithubAuth } from '../../context/GithubAuthContext';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { connected, user, connectGitHub } = useGithubAuth();

  return (
    <footer
      style={{
        backgroundColor: 'var(--surface)',
        borderTop: '1px solid var(--border-strong)',
        color: 'var(--text-muted)',
        fontSize: 'var(--text-sm)',
        marginTop: 'auto',
        width: '100%',
        boxSizing: 'border-box',
      }}
      className="c-footer"
    >
      <div
        style={{
          maxWidth: 'var(--content-max-width)',
          margin: '0 auto',
          padding: '3rem var(--page-padding) 2rem var(--page-padding)',
          display: 'flex',
          flexDirection: 'column',
          gap: '2.5rem',
        }}
      >
        {/* Top Footer Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            justifyContent: 'space-between',
          }}
        >
          {/* Column 1: Brand & Tagline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', gridColumn: 'span 2' }} className="c-footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-inverse)',
                  fontWeight: 'var(--fw-extrabold)',
                  fontSize: '1.1rem',
                  boxShadow: 'var(--shadow-glow)',
                }}
              >
                CM
              </div>
              <span style={{ fontWeight: 'var(--fw-bold)', fontSize: 'var(--text-lg)', color: 'var(--text)', letterSpacing: '-0.02em' }}>
                CodeMentor AI
              </span>
              <Badge variant="info" size="sm">
                v2.0.0
              </Badge>
            </div>

            <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', maxWidth: '38ch', lineHeight: 'var(--lh-relaxed)', margin: 0 }}>
              Enterprise AI-powered code review, repository context analysis, and senior developer mentorship platform.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.25rem' }}>
              <a
                href="https://github.com/shivammaurya2903/CodeMentorAI"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.75rem',
                  backgroundColor: 'var(--surface-hover)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 500,
                  transition: 'all var(--transition-fast)',
                }}
                className="c-footer-link"
              >
                <Github size={15} /> GitHub Repository <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Column 2: Product Workflows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--fw-bold)', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Product
            </h4>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }} aria-label="Product links">
              <Link to="/" style={{ color: 'var(--text-muted)', fontSize: 'var(--text-base)' }} className="c-footer-link">
                Dashboard Overview
              </Link>
              <Link to="/review" style={{ color: 'var(--text-muted)', fontSize: 'var(--text-base)' }} className="c-footer-link">
                AI Code Review
              </Link>
              <Link to="/workspace" style={{ color: 'var(--text-muted)', fontSize: 'var(--text-base)' }} className="c-footer-link">
                Repository Workbench
              </Link>
              <Link to="/security" style={{ color: 'var(--text-muted)', fontSize: 'var(--text-base)' }} className="c-footer-link">
                Security Engine
              </Link>
              <Link to="/health" style={{ color: 'var(--text-muted)', fontSize: 'var(--text-base)' }} className="c-footer-link">
                Health Scorecard
              </Link>
              <Link to="/improve-plan" style={{ color: 'var(--text-muted)', fontSize: 'var(--text-base)' }} className="c-footer-link">
                Improvement Plan
              </Link>
            </nav>
          </div>

          {/* Column 3: Community & Resources */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--fw-bold)', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Community
            </h4>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }} aria-label="Community links">
              <a href="https://github.com/shivammaurya2903/CodeMentorAI" target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', fontSize: 'var(--text-base)' }} className="c-footer-link">
                GitHub Repository
              </a>
              <a href="https://github.com/shivammaurya2903/CodeMentorAI/issues" target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', fontSize: 'var(--text-base)' }} className="c-footer-link">
                Issue Tracker
              </a>
              <a href="https://github.com/shivammaurya2903/CodeMentorAI/releases" target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', fontSize: 'var(--text-base)' }} className="c-footer-link">
                Releases & Changelog
              </a>
            </nav>
          </div>

          {/* Column 4: Integration & Security */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--fw-bold)', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Integrations
            </h4>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }} aria-label="Integration links">
              {connected && user ? (
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--success)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)', display: 'inline-block' }} />
                  Linked as @{user.login}
                </div>
              ) : (
                <button
                  onClick={connectGitHub}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    fontSize: 'var(--text-base)',
                    fontWeight: 500,
                    padding: 0,
                    textAlign: 'left',
                  }}
                  className="c-footer-link"
                >
                  <Github size={16} /> Connect GitHub OAuth
                </button>
              )}
            </nav>
          </div>
        </div>

        {/* Bottom Bar / Copyright */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--border)',
            paddingTop: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-dim)',
          }}
        >
          <div>
            © {currentYear} CodeMentorAI. Built for high-performance software engineering teams.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <a
              href="https://github.com/shivammaurya2903/CodeMentorAI"
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--text-dim)' }}
              className="c-footer-link"
            >
              GitHub Source
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
