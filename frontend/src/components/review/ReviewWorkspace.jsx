import React, { useState } from 'react';
import { Sparkles, Bug, HelpCircle, FileCode } from 'lucide-react';
import { LanguageSelector } from '../code/LanguageSelector';
import { CodeEditor } from '../code/CodeEditor';
import { ScoreCard } from './ScoreCard';
import { IssueList } from './IssueList';
import { RefactoredCode } from './RefactoredCode';
import { Button } from '../ui/Button';
import { Skeleton, ErrorState } from '../ui/EmptyState';
import { aiService } from '../../services/aiService';

export function ReviewWorkspace({ initialCode = '', initialLanguage = 'javascript' }) {
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(initialLanguage);
  const [activeTab, setActiveTab] = useState('review'); // 'review' | 'analyse' | 'explain'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    if (!code.trim()) {
      setError('Please paste or enter code before running AI analysis.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let res;
      if (activeTab === 'analyse') {
        res = await aiService.analyseCode(code, language);
      } else if (activeTab === 'explain') {
        res = await aiService.explainCode(code, language);
      } else {
        res = await aiService.reviewCode(code, language);
      }
      setResult({ type: activeTab, data: res });
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err.message || 'Failed to process request. Check server connectivity or API key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.75rem' }}>
      {/* Left Input Workspace Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Action Tabs & Language Selector */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--surface)',
            padding: '0.4rem',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-strong)',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {[
              { id: 'review', label: 'AI Review', icon: Sparkles },
              { id: 'analyse', label: 'Deep Fix', icon: Bug },
              { id: 'explain', label: 'Explain', icon: HelpCircle },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.55rem 0.95rem',
                    fontSize: 'var(--text-base)',
                    fontWeight: active ? 'var(--fw-semibold)' : 'var(--fw-medium)',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    backgroundColor: active ? 'var(--primary-subtle)' : 'transparent',
                    color: active ? 'var(--primary)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <LanguageSelector value={language} onChange={setLanguage} />
        </div>

        {/* Code Input Editor */}
        <CodeEditor
          value={code}
          onChange={setCode}
          language={language}
          placeholder={`// Paste your ${language} code snippet here for instant AI review & mentorship...`}
        />

        {error && <ErrorState title="Analysis Failed" message={error} onRetry={handleSubmit} />}

        <Button
          variant="primary"
          size="lg"
          isLoading={loading}
          icon={Sparkles}
          onClick={handleSubmit}
          fullWidth
        >
          {loading
            ? 'AI Mentoring Code...'
            : `Run ${activeTab === 'analyse' ? 'Deep Analysis' : activeTab === 'explain' ? 'Explanation' : 'AI Code Review'}`}
        </Button>
      </div>

      {/* Right Output Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Skeleton height="160px" borderRadius="var(--radius-lg)" />
            <Skeleton height="220px" borderRadius="var(--radius-lg)" />
            <Skeleton height="200px" borderRadius="var(--radius-lg)" />
          </div>
        ) : result ? (
          result.type === 'explain' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div
                style={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.5rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--fw-bold)', color: 'var(--text)', marginBottom: '0.85rem' }}>
                  📖 Code Breakdown & Explanation
                </h3>
                <p style={{ lineHeight: 'var(--lh-relaxed)', color: 'var(--text-muted)', fontSize: 'var(--text-md)' }}>
                  {result.data.explanation}
                </p>

                {result.data.key_concepts?.length > 0 && (
                  <div style={{ marginTop: '1.25rem' }}>
                    <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--fw-bold)', color: 'var(--text)', marginBottom: '0.5rem' }}>
                      Key Architectural Concepts:
                    </h4>
                    <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', fontSize: 'var(--text-base)', lineHeight: 'var(--lh-relaxed)' }}>
                      {result.data.key_concepts.map((concept, idx) => (
                        <li key={idx} style={{ marginBottom: '0.35rem' }}>
                          {concept}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <ScoreCard score={result.data.score} summary={result.data.summary} />
              <IssueList issues={result.data.issues} />
              {result.data.refactored_code && (
                <RefactoredCode code={result.data.refactored_code} language={language} />
              )}
            </div>
          )
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
              backgroundColor: 'var(--surface)',
              border: '1px dashed var(--border-strong)',
              borderRadius: 'var(--radius-xl)',
              padding: '2.5rem',
              textAlign: 'center',
              color: 'var(--text-dim)',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-subtle)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <FileCode size={28} />
            </div>
            <h4 style={{ fontSize: 'var(--text-xl)', color: 'var(--text)', fontWeight: 'var(--fw-bold)' }}>
              AI Analysis Results Workbench
            </h4>
            <p style={{ fontSize: 'var(--text-md)', maxWidth: '42ch', marginTop: '0.4rem', lineHeight: 'var(--lh-relaxed)' }}>
              Paste your source code on the left and click Run to generate quality scores, security checks, and refactored code.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
