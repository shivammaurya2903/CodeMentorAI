import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, RefreshCw } from 'lucide-react';
import { githubService } from '../services/githubService';
import { Button } from '../components/ui/Button';
import { Badge, Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { ErrorState, Skeleton, EmptyState } from '../components/ui/EmptyState';

export function ImprovementPlanPage() {
  const [searchParams] = useSearchParams();
  const repoParam = searchParams.get('repo');

  const [loading, setLoading] = useState(false);
  const [planData, setPlanData] = useState(null);
  const [error, setError] = useState(null);

  const fetchPlan = async (repoName) => {
    if (!repoName) return;
    setLoading(true);
    setError(null);
    try {
      await githubService.indexRepository(repoName);
      const data = await githubService.getImprovementPlan(repoName);
      setPlanData(data);
    } catch (err) {
      console.error('Failed to generate improvement plan:', err);
      setError(err.message || 'Could not generate improvement plan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (repoParam) {
      fetchPlan(repoParam);
    }
  }, [repoParam]);

  const categories = [
    { title: 'P0 — Immediate Fixes', key: 'immediate', variant: 'danger' },
    { title: 'P1 — Short Term Priority', key: 'shortTerm', variant: 'warning' },
    { title: 'P2 — Medium Term Architecture', key: 'mediumTerm', variant: 'primary' },
    { title: 'P3 — Long Term Growth & Observability', key: 'longTerm', variant: 'info' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Project Improvement Plan"
        description="Prioritized engineering roadmap automatically synthesized from repository metrics and security scans."
        badge={
          <Badge variant="primary" size="sm" icon={Sparkles}>
            AI Roadmap Generator
          </Badge>
        }
        actions={
          repoParam ? (
            <Button variant="primary" size="md" icon={RefreshCw} isLoading={loading} onClick={() => fetchPlan(repoParam)}>
              Generate New Plan
            </Button>
          ) : null
        }
      />

      {error && <ErrorState title="Roadmap Generation Error" message={error} />}

      {!repoParam ? (
        <EmptyState
          icon={Sparkles}
          title="No Repository Selected for Improvement Plan"
          description="Select a repository in the Repository Workbench to generate a prioritized engineering improvement roadmap."
        />
      ) : loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Skeleton height="140px" borderRadius="var(--radius-lg)" />
          <Skeleton height="140px" borderRadius="var(--radius-lg)" />
          <Skeleton height="140px" borderRadius="var(--radius-lg)" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {categories.map(cat => {
            const items = planData?.roadmap?.[cat.key] || [];
            if (items.length === 0) return null;

            return (
              <div key={cat.key} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  <Badge variant={cat.variant} size="md">
                    {cat.title}
                  </Badge>
                  <span style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', fontWeight: 500 }}>
                    ({items.length} tasks)
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {items.map((item, idx) => (
                    <Card
                      key={idx}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.65rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-bold)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--surface-subtle)', color: 'var(--primary)' }}>
                          {item.category}
                        </span>
                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                          Estimated Effort: <strong style={{ color: 'var(--text)' }}>{item.effort}</strong>
                        </span>
                      </div>

                      <h4 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--fw-bold)', margin: 0, color: 'var(--text)' }}>
                        {idx + 1}. {item.title}
                      </h4>

                      <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', margin: 0, lineHeight: 'var(--lh-relaxed)' }}>
                        <strong>Rationale:</strong> {item.reason}
                      </p>

                      <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', margin: 0, lineHeight: 'var(--lh-relaxed)' }}>
                        <strong>Expected ROI:</strong> {item.impact}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
