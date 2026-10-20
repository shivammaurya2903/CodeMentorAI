import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGithubAuth } from '../context/GithubAuthContext';
import { AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { Card, Badge } from '../components/ui/Card';
import { Skeleton } from '../components/ui/EmptyState';

export function GithubCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshStatus } = useGithubAuth();
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let mounted = true;

    async function processCallback() {
      const error = searchParams.get('error');
      const reason = searchParams.get('reason');
      const message = searchParams.get('message');
      const connected = searchParams.get('connected');

      if (error || reason) {
        const errMsg = message || reason || error || 'GitHub authorization failed.';
        if (mounted) {
          setStatus('error');
          setErrorMessage(errMsg);
        }
        navigate(`/auth/github/error?reason=${encodeURIComponent(errMsg)}`, { replace: true });
        return;
      }

      if (connected === '1') {
        try {
          if (mounted) setStatus('loading');
          await refreshStatus();
          if (mounted) {
            setStatus('success');
            navigate('/auth/github/success', { replace: true });
          }
        } catch (err) {
          if (mounted) {
            setStatus('error');
            setErrorMessage(err.message || 'Failed to verify GitHub connection.');
          }
          navigate(`/auth/github/error?reason=${encodeURIComponent(err.message || 'Session verification failed')}`, { replace: true });
        }
        return;
      }

      // No connected flag - try to refresh status anyway
      try {
        if (mounted) setStatus('loading');
        await refreshStatus();
        if (mounted) {
          setStatus('success');
          navigate('/auth/github/success', { replace: true });
        }
      } catch (err) {
        if (mounted) {
          setStatus('error');
          setErrorMessage(err.message || 'Session verification failed.');
        }
        navigate(`/auth/github/error?reason=${encodeURIComponent(err.message || 'Session verification failed')}`, { replace: true });
      }
    }

    processCallback();

    return () => { mounted = false; };
  }, [searchParams, navigate, refreshStatus]);

  const renderStatus = () => {
    switch (status) {
      case 'loading':
        return (
          <>
            <Loader2 className="animate-spin" size={40} style={{ color: 'var(--primary)' }} />
            <p style={{ color: 'var(--text-muted)' }}>Verifying GitHub OAuth session...</p>
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle size={40} style={{ color: 'var(--success)' }} />
            <p style={{ color: 'var(--success)' }}>GitHub connected successfully!</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Redirecting...</p>
          </>
        );
      case 'error':
        return (
          <>
            <AlertCircle size={40} style={{ color: 'var(--danger)' }} />
            <p style={{ color: 'var(--danger)' }}>Connection Failed</p>
            {errorMessage && <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', maxWidth: '400px' }}>{errorMessage}</p>}
          </>
        );
      default:
        return (
          <>
            <Skeleton height="40px" width="200px" />
            <p style={{ color: 'var(--text-muted)' }}>Verifying GitHub OAuth session token...</p>
          </>
        );
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '1.5rem',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <Card style={{ maxWidth: '480px', width: '100%', padding: '2.5rem', textAlign: 'center' }}>
        {renderStatus()}
      </Card>
    </div>
  );
}
