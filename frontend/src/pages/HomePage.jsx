import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Code2, FolderGit2, ArrowRight, ShieldCheck, Zap, Layers } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, Badge } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { GithubConnect } from '../components/github/GithubConnect';

export function HomePage() {
  const navigate = useNavigate();

  const quickWorkflows = [
    {
      title: 'AI Code Review',
      description: 'Get instant feedback on code quality, bug detection, security, and refactoring score.',
      icon: Sparkles,
      action: () => navigate('/review'),
      btnText: 'Start AI Review',
    },
    {
      title: 'GitHub Repo Review',
      description: 'Browse repository file trees, inspect AST contexts, and execute automated deep fixes.',
      icon: FolderGit2,
      action: () => navigate('/workspace'),
      btnText: 'Open Workbench',
    },
    {
      title: 'Code Explanation',
      description: 'Step-by-step breakdown of complex algorithms, patterns, and language concepts.',
      icon: Code2,
      action: () => navigate('/review'),
      btnText: 'Explain Code Snippet',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--section-gap)' }}>
      {/* Hero Banner */}
      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '1.25rem',
          padding: '3rem 2.5rem',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-2xl)',
          background: 'radial-gradient(circle at top right, rgba(56, 189, 248, 0.12), transparent 50%), var(--surface)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <Badge variant="info" size="md" icon={Sparkles}>
          AI-Powered Developer Mentorship Platform
        </Badge>

        <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 'var(--fw-extrabold)', lineHeight: 'var(--lh-tight)', letterSpacing: '-0.03em', maxWidth: '24ch', color: 'var(--text)' }}>
          Senior Developer Mentorship & Automated Code Review
        </h1>

        <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-muted)', maxWidth: '58ch', lineHeight: 'var(--lh-relaxed)' }}>
          Review snippets or connect your GitHub repository to detect bugs, analyze algorithmic complexity, flag security risks, and receive instant refactoring patches.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          <Button variant="primary" size="lg" icon={Sparkles} onClick={() => navigate('/review')}>
            Start AI Code Review
          </Button>
          <Button variant="secondary" size="lg" icon={FolderGit2} onClick={() => navigate('/workspace')}>
            Explore Repository Workbench
          </Button>
        </div>
      </section>

      {/* GitHub Integration Notice */}
      <GithubConnect />

      {/* Quick Workflows Grid */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--fw-bold)', color: 'var(--text)' }}>
          Core Developer Workflows
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {quickWorkflows.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card key={idx} hoverable style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.5rem' }}>
                <div>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'var(--primary-subtle)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1rem',
                    }}
                  >
                    <Icon size={24} />
                  </div>
                  <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--fw-bold)', marginBottom: '0.5rem', color: 'var(--text)' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', lineHeight: 'var(--lh-relaxed)' }}>
                    {item.description}
                  </p>
                </div>

                <Button variant="secondary" size="md" iconRight={ArrowRight} onClick={item.action}>
                  {item.btnText}
                </Button>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Platform Features Section */}
      <section
        style={{
          backgroundColor: 'var(--surface)',
          padding: '2.5rem',
          borderRadius: 'var(--radius-2xl)',
          border: '1px solid var(--border-strong)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--fw-bold)', marginBottom: '1.5rem', color: 'var(--text)' }}>
          Why CodeMentor AI?
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ padding: '0.65rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-subtle)', height: 'fit-content' }}>
              <Zap size={24} style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <h4 style={{ fontWeight: 'var(--fw-bold)', fontSize: 'var(--text-lg)', marginBottom: '0.35rem', color: 'var(--text)' }}>
                Sub-Second Feedback Loop
              </h4>
              <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', lineHeight: 'var(--lh-relaxed)' }}>
                Powered by Groq LLM inference for rapid iteration cycles without developer downtime.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ padding: '0.65rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--success-subtle)', height: 'fit-content' }}>
              <ShieldCheck size={24} style={{ color: 'var(--success)' }} />
            </div>
            <div>
              <h4 style={{ fontWeight: 'var(--fw-bold)', fontSize: 'var(--text-lg)', marginBottom: '0.35rem', color: 'var(--text)' }}>
                Security & Best Practices
              </h4>
              <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', lineHeight: 'var(--lh-relaxed)' }}>
                Automatically flags OWASP risks, memory leaks, unhandled exceptions, and missing tests.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ padding: '0.65rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--accent-subtle)', height: 'fit-content' }}>
              <Layers size={24} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <h4 style={{ fontWeight: 'var(--fw-bold)', fontSize: 'var(--text-lg)', marginBottom: '0.35rem', color: 'var(--text)' }}>
                Multi-Language AST Context
              </h4>
              <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', lineHeight: 'var(--lh-relaxed)' }}>
                Full support for JavaScript, TypeScript, Python, Java, C++, Go, HTML, CSS, and JSON.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
