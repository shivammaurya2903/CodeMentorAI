import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, FolderGit2, ArrowRight } from 'lucide-react';
import { Card, Badge } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useGithubAuth } from '../context/GithubAuthContext';

export function GithubSuccessPage() {
  const navigate = useNavigate();
  const { refreshStatus } = useGithubAuth();

  useEffect(() => {
    refreshStatus();
    const timer = setTimeout(() => {
      navigate('/workspace');
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate, refreshStatus]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '65vh' }}>
      <Card style={{ maxWidth: '560px', width: '100%', textAlign: 'center', padding: '3rem 2.5rem' }}>
        <div
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            backgroundColor: 'var(--success-subtle)',
            color: 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto',
          }}
        >
          <CheckCircle2 size={40} />
        </div>

        <Badge variant="success" size="md" style={{ marginBottom: '0.85rem' }}>
          OAuth Session Established
        </Badge>

        <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--fw-extrabold)', marginBottom: '0.6rem', color: 'var(--text)' }}>
          GitHub Connection Successful!
        </h2>

        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-md)', lineHeight: 'var(--lh-relaxed)', marginBottom: '1.5rem' }}>
          Your GitHub account is linked. Redirecting you to the Repository Workbench in a moment...
        </p>

        <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button variant="primary" size="lg" icon={FolderGit2} iconRight={ArrowRight} onClick={() => navigate('/workspace')}>
            Open Repo Workbench Now
          </Button>
          <Button variant="secondary" size="lg" onClick={() => navigate('/')}>
            Go to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}
