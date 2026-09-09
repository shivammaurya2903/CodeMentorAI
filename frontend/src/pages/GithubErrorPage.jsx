import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Card, Badge } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useGithubAuth } from '../context/GithubAuthContext';

export function GithubErrorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { connectGitHub } = useGithubAuth();

  const reason = searchParams.get('reason') || searchParams.get('message') || 'GitHub authorization was cancelled or denied.';

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '65vh' }}>
      <Card style={{ maxWidth: '560px', width: '100%', textAlign: 'center', padding: '3rem 2.5rem' }}>
        <div
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            backgroundColor: 'var(--danger-subtle)',
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto',
          }}
        >
          <AlertTriangle size={40} />
        </div>

        <Badge variant="danger" size="md" style={{ marginBottom: '0.85rem' }}>
          Authorization Incomplete
        </Badge>

        <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--fw-extrabold)', marginBottom: '0.6rem', color: 'var(--text)' }}>
          GitHub Connection Cancelled
        </h2>

        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-md)', lineHeight: 'var(--lh-relaxed)', marginBottom: '2rem' }}>
          {reason}
        </p>

        <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button variant="primary" size="lg" icon={RefreshCw} onClick={connectGitHub}>
            Try Connecting Again
          </Button>
          <Button variant="secondary" size="lg" icon={ArrowLeft} onClick={() => navigate('/')}>
            Back to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}
