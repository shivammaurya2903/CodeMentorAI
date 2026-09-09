import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, FolderGit2, ArrowRight } from 'lucide-react';
import { Card, Badge } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function GithubSuccessPage() {
  const navigate = useNavigate();

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

        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-md)', lineHeight: 'var(--lh-relaxed)', marginBottom: '2rem' }}>
          Your GitHub account is linked. You can now browse repositories, view file directory trees, and perform AI analysis directly.
        </p>

        <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button variant="primary" size="lg" icon={FolderGit2} iconRight={ArrowRight} onClick={() => navigate('/workspace')}>
            Open Repo Workbench
          </Button>
          <Button variant="secondary" size="lg" onClick={() => navigate('/')}>
            Go to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}
