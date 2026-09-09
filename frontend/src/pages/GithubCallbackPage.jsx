import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGithubAuth } from '../context/GithubAuthContext';
import { Skeleton } from '../components/ui/EmptyState';

export function GithubCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshStatus } = useGithubAuth();

  useEffect(() => {
    async function processCallback() {
      const error = searchParams.get('error');
      const connected = searchParams.get('connected');

      if (error) {
        navigate(`/auth/github/error?reason=${encodeURIComponent(error)}`, { replace: true });
        return;
      }

      if (connected === '1') {
        await refreshStatus();
        navigate('/auth/github/success', { replace: true });
        return;
      }

      await refreshStatus();
      navigate('/auth/github/success', { replace: true });
    }

    processCallback();
  }, [searchParams, navigate, refreshStatus]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '1rem',
        textAlign: 'center',
      }}
    >
      <Skeleton height="40px" width="200px" />
      <p style={{ color: 'var(--text-muted)' }}>Verifying GitHub OAuth session token...</p>
    </div>
  );
}
