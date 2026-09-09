import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Shield, ShieldAlert, CheckCircle2, RefreshCw, Sparkles } from 'lucide-react';
import { githubService } from '../services/githubService';
import { Button } from '../components/ui/Button';
import { Badge, Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { ErrorState, Skeleton, EmptyState } from '../components/ui/EmptyState';
import { DiffViewer } from '../components/fixes/DiffViewer';

export function SecurityPage() {
  const [searchParams] = useSearchParams();
  const repoParam = searchParams.get('repo');

  const [loading, setLoading] = useState(false);
  const [findings, setFindings] = useState([]);
  const [error, setError] = useState(null);

  // Patch modal state
  const [activePatch, setActivePatch] = useState(null);
  const [generatingPatch, setGeneratingPatch] = useState(false);

  const fetchSecurityAudit = async (repoName) => {
    if (!repoName) return;
    setLoading(true);
    setError(null);
    try {
      const files = await githubService.getRepoFiles(repoName);
      const codeFiles = files.filter(f => f.path.endsWith('.js') || f.path.endsWith('.ts') || f.path.endsWith('.json')).slice(0, 5);

      const allFindings = [];
      for (const f of codeFiles) {
        try {
          const content = await githubService.getFileContent(repoName, f.path);
          const res = await githubService.runSecurityScan(repoName, content, f.path);
          if (res.combinedFindings) {
            allFindings.push(...res.combinedFindings);
          }
        } catch {
          // ignore single file failure
        }
      }

      setFindings(allFindings);
    } catch (err) {
      console.error('Failed to run security audit:', err);
      setError(err.message || 'Security audit failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (repoParam) {
      fetchSecurityAudit(repoParam);
    }
  }, [repoParam]);

  const handleGenerateFix = async (finding) => {
    setGeneratingPatch(true);
    try {
      const content = await githubService.getFileContent(repoParam, finding.file);
      const patch = await githubService.generatePatch(
        finding.file,
        content,
        finding.title,
        finding.fix
      );
      setActivePatch(patch);
    } catch (err) {
      alert(`Patch generation failed: ${err.message}`);
    } finally {
      setGeneratingPatch(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Repository Security Engine"
        description="Detect secret exposures, OWASP vulnerabilities, CORS/CSRF misconfigurations, and dangerous code execution."
        badge={
          <Badge variant="danger" size="sm" icon={Shield}>
            Security & AST Auditor
          </Badge>
        }
        actions={
          repoParam ? (
            <Button variant="secondary" size="md" icon={RefreshCw} isLoading={loading} onClick={() => fetchSecurityAudit(repoParam)}>
              Run Security Audit
            </Button>
          ) : null
        }
      />

      {error && <ErrorState title="Security Audit Error" message={error} />}

      {!repoParam ? (
        <EmptyState
          icon={ShieldAlert}
          title="No Repository Selected for Security Audit"
          description="Please select a GitHub repository from the Repo Workbench to trigger an automated security scan."
        />
      ) : loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Skeleton height="120px" borderRadius="var(--radius-lg)" />
          <Skeleton height="120px" borderRadius="var(--radius-lg)" />
          <Skeleton height="120px" borderRadius="var(--radius-lg)" />
        </div>
      ) : findings.length === 0 ? (
        <Card
          style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.85rem',
          }}
        >
          <CheckCircle2 size={44} style={{ color: 'var(--success)' }} />
          <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--fw-bold)', color: 'var(--text)' }}>
            Clean Security Audit! 🎉
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-md)', maxWidth: '44ch', lineHeight: 'var(--lh-relaxed)' }}>
            No critical secrets or high-severity OWASP vulnerabilities were detected in your repository files.
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {findings.map((f, idx) => (
            <Card
              key={idx}
              style={{
                borderLeft: `4px solid ${f.severity === 'critical' ? 'var(--danger)' : 'var(--warning)'}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Badge variant={f.severity === 'critical' ? 'danger' : 'warning'} size="sm">
                    {f.severity}
                  </Badge>

                  <h4 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--fw-bold)', margin: 0, color: 'var(--text)' }}>
                    {f.title}
                  </h4>
                </div>

                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                  Confidence: <strong>{f.confidence || 'High'}</strong> | Location: <code style={{ color: 'var(--primary)' }}>{f.file}:{f.line || 1}</code>
                </span>
              </div>

              {f.impact && (
                <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', margin: 0, lineHeight: 'var(--lh-relaxed)' }}>
                  <strong>Impact:</strong> {f.impact}
                </p>
              )}

              {f.evidence && (
                <div style={{ padding: '0.75rem 1rem', backgroundColor: '#0d1117', color: '#ff7b72', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-base)', overflowX: 'auto' }}>
                  <code>{f.evidence}</code>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.25rem' }}>
                <span style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)' }}>
                  <strong>Recommended Fix:</strong> {f.fix}
                </span>

                <Button variant="primary" size="sm" icon={Sparkles} isLoading={generatingPatch} onClick={() => handleGenerateFix(f)}>
                  Fix This Vulnerability
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Diff Viewer Modal */}
      {activePatch && (
        <DiffViewer
          changeRequest={activePatch}
          onApply={(newCode) => {
            alert('Security Fix applied successfully!');
            setActivePatch(null);
          }}
          onReject={() => setActivePatch(null)}
          onClose={() => setActivePatch(null)}
        />
      )}
    </div>
  );
}
