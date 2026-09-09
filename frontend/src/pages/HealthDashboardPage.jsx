import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Activity, ShieldCheck, Cpu, TestTube2, Layers, Download, CheckCircle2, RefreshCw } from 'lucide-react';
import { githubService } from '../services/githubService';
import { Button } from '../components/ui/Button';
import { Badge, Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { ErrorState, Skeleton, EmptyState } from '../components/ui/EmptyState';

export function HealthDashboardPage() {
  const [searchParams] = useSearchParams();
  const repoParam = searchParams.get('repo');

  const [scorecard, setScorecard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchScorecard = async (repoName) => {
    if (!repoName) return;
    setLoading(true);
    setError(null);
    try {
      await githubService.indexRepository(repoName);
      const data = await githubService.getHealthScorecard(repoName);
      setScorecard(data);
    } catch (err) {
      console.error('Failed to load health scorecard:', err);
      setError(err.message || 'Could not compute project health scorecard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (repoParam) {
      fetchScorecard(repoParam);
    }
  }, [repoParam]);

  const dimensions = [
    { title: 'Security', score: scorecard?.scores?.security || 0, icon: ShieldCheck, color: 'var(--danger)' },
    { title: 'Code Quality', score: scorecard?.scores?.quality || 0, icon: Activity, color: 'var(--primary)' },
    { title: 'Performance', score: scorecard?.scores?.performance || 0, icon: Cpu, color: 'var(--warning)' },
    { title: 'Testing Maturity', score: scorecard?.scores?.testing || 0, icon: TestTube2, color: 'var(--success)' },
    { title: 'Architecture', score: scorecard?.scores?.architecture || 0, icon: Layers, color: 'var(--accent)' },
    { title: 'Maintainability', score: scorecard?.scores?.maintainability || 0, icon: Activity, color: 'var(--info)' },
    { title: 'Reliability', score: scorecard?.scores?.reliability || 0, icon: CheckCircle2, color: 'var(--success)' },
    { title: 'Production Readiness', score: scorecard?.scores?.productionReadiness || 0, icon: CheckCircle2, color: 'var(--warning)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Project Health & Engineering Scorecard"
        description="Multi-dimensional quantitative assessment based on static analysis rules, test metrics, and AI reasoning."
        badge={
          <Badge variant="info" size="sm" icon={Activity}>
            Metric Scorecard
          </Badge>
        }
        actions={
          repoParam ? (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button variant="secondary" size="md" icon={RefreshCw} isLoading={loading} onClick={() => fetchScorecard(repoParam)}>
                Re-Scan Project
              </Button>
              <a
                href={githubService.getReportDownloadUrl(repoParam, 'markdown')}
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <Button variant="primary" size="md" icon={Download}>
                  Export Report (.md)
                </Button>
              </a>
            </div>
          ) : null
        }
      />

      {error && <ErrorState title="Scorecard Error" message={error} />}

      {!repoParam ? (
        <EmptyState
          icon={Activity}
          title="No Active Repository Connected"
          description="Connect a GitHub repository in the Repository Workbench to index your project and generate a complete health scorecard."
        />
      ) : loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Skeleton height="160px" borderRadius="var(--radius-xl)" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <Skeleton height="120px" borderRadius="var(--radius-lg)" />
            <Skeleton height="120px" borderRadius="var(--radius-lg)" />
            <Skeleton height="120px" borderRadius="var(--radius-lg)" />
            <Skeleton height="120px" borderRadius="var(--radius-lg)" />
          </div>
        </div>
      ) : (
        <>
          {/* Overall Health Score Card */}
          <Card style={{ background: 'radial-gradient(circle at top right, rgba(56, 189, 248, 0.1), transparent 60%), var(--surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-bold)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  OVERALL HEALTH INDEX
                </span>
                <div style={{ fontSize: 'var(--text-5xl)', fontWeight: 'var(--fw-extrabold)', color: 'var(--primary)', lineHeight: 1, marginTop: '0.4rem' }}>
                  {scorecard?.overallScore || 0} <span style={{ fontSize: 'var(--text-xl)', color: 'var(--text-muted)' }}>/ 100</span>
                </div>
                <p style={{ fontSize: 'var(--text-md)', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Production Readiness Score: <strong>{scorecard?.scores?.productionReadiness || 0}%</strong>
                </p>
              </div>

              {/* Findings Badges */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Badge variant="danger" size="lg">
                  Critical Issues: {scorecard?.findingsCount?.critical || 0}
                </Badge>
                <Badge variant="warning" size="lg">
                  High Priority: {scorecard?.findingsCount?.high || 0}
                </Badge>
                <Badge variant="primary" size="lg">
                  Improvements: {scorecard?.findingsCount?.medium || 0}
                </Badge>
              </div>
            </div>
          </Card>

          {/* 8-Dimensional Scorecard Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {dimensions.map(d => {
              const Icon = d.icon;
              return (
                <Card key={d.title} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                    <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-muted)' }}>{d.title}</span>
                    <Icon size={20} style={{ color: d.color }} />
                  </div>
                  <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--fw-extrabold)', color: 'var(--text)' }}>
                    {d.score} <span style={{ fontSize: 'var(--text-base)', color: 'var(--text-dim)', fontWeight: 'var(--fw-normal)' }}>/100</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: 'var(--surface-hover)', borderRadius: 'var(--radius-full)', marginTop: '0.85rem', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <div style={{ height: '100%', width: `${d.score}%`, backgroundColor: d.color, borderRadius: 'var(--radius-full)' }} />
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
