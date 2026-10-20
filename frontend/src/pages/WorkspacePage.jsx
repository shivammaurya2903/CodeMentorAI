import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FolderGit2,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  FileCode,
  Search,
  Code,
  Bot,
  Layers,
} from 'lucide-react';
import { useGithubAuth } from '../context/GithubAuthContext';
import { githubService } from '../services/githubService';
import { api } from '../services/api';
import { GithubConnect } from '../components/github/GithubConnect';
import { RepositoryList } from '../components/github/RepositoryList';
import { FileTree } from '../components/github/FileTree';
import { ArchitectureViewer } from '../components/github/ArchitectureViewer';
import { CodeViewer } from '../components/code/CodeViewer';
import { Button } from '../components/ui/Button';
import { ScoreCard } from '../components/review/ScoreCard';
import { IssueList } from '../components/review/IssueList';
import { RefactoredCode } from '../components/review/RefactoredCode';
import { ContextSelector } from '../components/chat/ContextSelector';
import { AnswerModeSelector } from '../components/chat/AnswerModeSelector';
import { DiffViewer } from '../components/fixes/DiffViewer';
import { Skeleton, ErrorState } from '../components/ui/EmptyState';
import { Badge } from '../components/ui/Card';

export function WorkspacePage() {
  const { connected } = useGithubAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const repoParam = searchParams.get('repo');

  const [repos, setRepos] = useState([]);
  const [loadingRepos, setLoadingRepos] = useState(false);

  const [selectedRepo, setSelectedRepo] = useState(repoParam || null);
  const [files, setFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [loadingContent, setLoadingContent] = useState(false);

  // Indexing & Search
  const [indexing, setIndexing] = useState(false);
  const [indexStatus, setIndexStatus] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // AI Assistant Chat & Context Controls
  const [mobileTab, setMobileTab] = useState('tree'); // 'tree' | 'code' | 'ai'
  const [contextScope, setContextScope] = useState('current_file');
  const [answerMode, setAnswerMode] = useState('developer');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);

  // Review & Patch state
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [activePatch, setActivePatch] = useState(null);
  const [error, setError] = useState(null);

  // Load repositories
  const fetchRepos = useCallback(async () => {
    if (!connected) return;
    setLoadingRepos(true);
    setError(null);
    try {
      const data = await githubService.getUserRepos();
      setRepos(data);
    } catch (err) {
      // Silently handle error in production; UI displays error state
      setError('Could not fetch GitHub repositories. Try reconnecting your GitHub account.');
    } finally {
      setLoadingRepos(false);
    }
  }, [connected]);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  // Load repo file tree & index status
  const fetchRepoFiles = useCallback(async (repoName) => {
    if (!repoName) return;
    setLoadingFiles(true);
    setError(null);
    setFiles([]);
    setSelectedFile(null);
    setFileContent('');
    setAnalysisResult(null);

    try {
      const tree = await githubService.getRepoFiles(repoName);
      setFiles(tree);

      const status = await githubService.getRepositoryStatus(repoName);
      setIndexStatus(status.indexed ? status : null);
    } catch (err) {
      setError(err.message || 'Unable to fetch repository tree.');
    } finally {
      setLoadingFiles(false);
    }
  }, []);

  useEffect(() => {
    if (repoParam) {
      setSelectedRepo(repoParam);
      fetchRepoFiles(repoParam);
    }
  }, [repoParam, fetchRepoFiles]);

  const handleIndexRepo = async () => {
    if (!selectedRepo) return;
    setIndexing(true);
    try {
      const res = await githubService.indexRepository(selectedRepo);
      setIndexStatus(res);
      setContextScope('indexed_repo');
    } catch (err) {
      setError(`Indexing failed: ${err.message}`);
    } finally {
      setIndexing(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!selectedRepo || !searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await githubService.searchRepository(selectedRepo, searchQuery);
      setSearchResults(res.results || []);
    } catch {
      // Search failure is non-critical; UI remains functional
    } finally {
      setSearching(false);
    }
  };

  const handleSelectRepo = (repoFullName) => {
    setSelectedRepo(repoFullName);
    setSearchParams({ repo: repoFullName });
    fetchRepoFiles(repoFullName);
  };

  const handleBackToRepos = () => {
    setSelectedRepo(null);
    setSearchParams({});
    setFiles([]);
    setSelectedFile(null);
    setFileContent('');
    setAnalysisResult(null);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleSelectFile = async (path) => {
    if (!selectedRepo || !path) return;
    setSelectedFile(path);
    setLoadingContent(true);
    setAnalysisResult(null);
    setMobileTab('code');

    try {
      const content = await githubService.getFileContent(selectedRepo, path);
      setFileContent(content);
    } catch (err) {
      setFileContent(`// Error loading file content: ${err.message}`);
    } finally {
      setLoadingContent(false);
    }
  };

  const handleAnalyzeFile = async (type = 'review') => {
    if (!selectedRepo || !selectedFile) return;
    setAnalyzing(true);
    setError(null);
    try {
      const res = await githubService.analyzeRepoFile(selectedRepo, selectedFile, type);
      setAnalysisResult(res);
    } catch (err) {
      setError(`AI analysis failed: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateFixForIssue = async (issue) => {
    if (!selectedFile || !fileContent) return;
    try {
      const patch = await githubService.generatePatch(
        selectedFile,
        fileContent,
        issue.description,
        issue.fix
      );
      setActivePatch(patch);
    } catch (err) {
      alert(`Patch generation failed: ${err.message}`);
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || sendingChat) return;

    const userMsg = { role: 'user', content: chatInput };
    setChatMessages((prev) => [...prev, userMsg]);
    const currentMsg = chatInput;
    setChatInput('');
    setSendingChat(true);

    try {
      const history = chatMessages
        .filter((m) => m && m.content)
        .slice(-10)
        .map((m) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
        }));

      const data = await api.post('/api/chat', {
        message: currentMsg,
        code: fileContent,
        language: 'javascript',
        history,
        mode: answerMode,
        scope: contextScope,
        repo: selectedRepo,
      });

      const replyText = typeof data?.reply === 'string'
        ? data.reply
        : (data?.reply ? JSON.stringify(data.reply, null, 2) : 'AI response unavailable.');

      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: replyText,
          cited_files: data?.cited_files || [],
          fix: data?.fix,
          improved_code: data?.improved_code,
        },
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `⚠️ Error: ${err.message}` },
      ]);
    } finally {
      setSendingChat(false);
    }
  };

  if (!connected) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--fw-extrabold)', color: 'var(--text)' }}>
            GitHub Repository Workbench
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-md)', lineHeight: 'var(--lh-relaxed)' }}>
            Connect GitHub to list repositories, build repository context indices, and execute AI code fixes.
          </p>
        </div>
        <GithubConnect />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Workspace Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {selectedRepo && (
            <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={handleBackToRepos}>
              All Repos
            </Button>
          )}
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--fw-extrabold)', display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text)' }}>
            <FolderGit2 size={24} style={{ color: 'var(--primary)' }} />
            {selectedRepo ? selectedRepo : 'GitHub Repository Workbench'}
          </h2>
        </div>

        {selectedRepo && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Button
              variant={indexStatus ? 'secondary' : 'primary'}
              size="sm"
              icon={Sparkles}
              isLoading={indexing}
              onClick={handleIndexRepo}
            >
              {indexStatus ? 'Re-Index Repo' : 'Index Repository'}
            </Button>

            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={() => fetchRepoFiles(selectedRepo)}>
              Refresh Tree
            </Button>
          </div>
        )}
      </div>

      {error && <ErrorState title="Workbench Error" message={error} />}

      {/* Main Workspace Layout */}
      {!selectedRepo ? (
        <RepositoryList repos={repos} loading={loadingRepos} onSelectRepo={handleSelectRepo} />
      ) : (
        <>
          {/* Mobile Tab Controls */}
          <div className="mobile-only" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Button
              variant={mobileTab === 'tree' ? 'primary' : 'secondary'}
              size="sm"
              icon={Layers}
              onClick={() => setMobileTab('tree')}
              fullWidth
            >
              Files
            </Button>
            <Button
              variant={mobileTab === 'code' ? 'primary' : 'secondary'}
              size="sm"
              icon={Code}
              onClick={() => setMobileTab('code')}
              fullWidth
            >
              Code
            </Button>
            <Button
              variant={mobileTab === 'ai' ? 'primary' : 'secondary'}
              size="sm"
              icon={Bot}
              onClick={() => setMobileTab('ai')}
              fullWidth
            >
              AI Partner
            </Button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(260px, 280px) 1fr minmax(320px, 380px)',
              gap: '1.25rem',
              alignItems: 'stretch',
              minHeight: 'calc(100vh - 200px)',
            }}
            className="c-workspace-grid"
          >
            {/* Pane 1: File Explorer & Repository Search */}
            <div
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-xl)',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                overflowY: 'auto',
                maxHeight: 'calc(100vh - 200px)',
                boxShadow: 'var(--shadow-sm)',
              }}
              className={mobileTab === 'tree' ? 'c-pane-active' : 'c-pane-mobile-hide'}
            >
              {/* Search Form */}
              <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.35rem' }}>
                <input
                  type="text"
                  placeholder="Search symbols or files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    fontSize: 'var(--text-base)',
                    backgroundColor: 'var(--surface-subtle)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text)',
                    outline: 'none',
                  }}
                />
                <Button type="submit" variant="primary" size="sm" icon={Search} isLoading={searching} />
              </form>

              {/* Search Results Drawer */}
              {searchResults.length > 0 && (
                <div style={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.65rem', maxHeight: '180px', overflowY: 'auto' }}>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--fw-bold)', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                    SEARCH RESULTS ({searchResults.length})
                  </div>
                  {searchResults.map((r, i) => (
                    <div
                      key={i}
                      onClick={() => handleSelectFile(r.filePath)}
                      style={{
                        padding: '0.35rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 'var(--text-sm)',
                        cursor: 'pointer',
                        color: 'var(--primary)',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        fontWeight: 500,
                      }}
                    >
                      📄 {r.filePath} {r.line ? `:${r.line}` : ''}
                    </div>
                  ))}
                </div>
              )}

              <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-bold)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                📁 REPOSITORY FILES ({files.length})
              </h4>

              {loadingFiles ? (
                <Skeleton height="240px" borderRadius="var(--radius-md)" />
              ) : (
                <FileTree files={files} activeFile={selectedFile} onSelectFile={handleSelectFile} />
              )}
            </div>

            {/* Pane 2: Source Code Viewer & Analysis Results */}
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}
              className={mobileTab === 'code' ? 'c-pane-active' : 'c-pane-mobile-hide'}
            >
              {selectedFile ? (
                <>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: 'var(--surface)',
                      padding: '0.75rem 1.25rem',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border-strong)',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
                      <FileCode size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'var(--fw-semibold)', fontSize: 'var(--text-base)', color: 'var(--text)' }}>
                        {selectedFile}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Button variant="primary" size="sm" icon={Sparkles} isLoading={analyzing} onClick={() => handleAnalyzeFile('review')}>
                        AI Review
                      </Button>
                      <Button variant="secondary" size="sm" isLoading={analyzing} onClick={() => handleAnalyzeFile('analyse')}>
                        Deep Analysis
                      </Button>
                    </div>
                  </div>

                  {loadingContent ? (
                    <Skeleton height="380px" borderRadius="var(--radius-lg)" />
                  ) : (
                    <CodeViewer code={fileContent} filename={selectedFile} />
                  )}

                  {/* Review Results */}
                  {analysisResult && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.75rem' }}>
                      <ScoreCard score={analysisResult.score} summary={analysisResult.summary} />
                      <IssueList issues={analysisResult.issues} onFixIssue={handleGenerateFixForIssue} />
                      {analysisResult.refactored_code && (
                        <RefactoredCode code={analysisResult.refactored_code} />
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {indexStatus && <ArchitectureViewer index={indexStatus} />}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '320px',
                      backgroundColor: 'var(--surface)',
                      border: '1px dashed var(--border-strong)',
                      borderRadius: 'var(--radius-xl)',
                      color: 'var(--text-dim)',
                      textAlign: 'center',
                      padding: '2.5rem',
                    }}
                  >
                    <FolderGit2 size={42} style={{ color: 'var(--primary)', marginBottom: '0.75rem' }} />
                    <h4 style={{ fontSize: 'var(--text-xl)', color: 'var(--text)', fontWeight: 'var(--fw-bold)' }}>
                      Select a File to Inspect Code
                    </h4>
                    <p style={{ fontSize: 'var(--text-md)', maxWidth: '40ch', marginTop: '0.4rem', lineHeight: 'var(--lh-relaxed)' }}>
                      Choose any file from the explorer tree on the left to view contents, trigger AI analysis, or generate patches.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Pane 3: AI Developer Assistant & Mentorship Chat */}
            <div
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-xl)',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                overflowY: 'auto',
                maxHeight: 'calc(100vh - 200px)',
                boxShadow: 'var(--shadow-sm)',
              }}
              className={mobileTab === 'ai' ? 'c-pane-active' : 'c-pane-mobile-hide'}
            >
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--fw-bold)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)' }}>
                  <Sparkles size={18} style={{ color: 'var(--primary)' }} />
                  AI Engineering Partner
                </h3>

                <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <ContextSelector
                    selectedScope={contextScope}
                    onSelectScope={setContextScope}
                    indexed={!!indexStatus}
                    fileCount={indexStatus?.totalFiles || 0}
                  />

                  <AnswerModeSelector
                    selectedMode={answerMode}
                    onSelectMode={setAnswerMode}
                  />
                </div>
              </div>

              {/* Context Transparency Badge */}
              <div
                style={{
                  padding: '0.4rem 0.75rem',
                  backgroundColor: 'var(--surface-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--primary)',
                  fontWeight: 'var(--fw-semibold)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <Sparkles size={12} />
                <span>
                  AI Context Bound: {contextScope === 'current_file' ? (selectedFile ? `Current File (${selectedFile})` : 'No file selected') : contextScope === 'indexed_repo' ? `Repository (${selectedRepo})` : 'No Context'}
                </span>
              </div>

              {/* Chat Messages */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem', minHeight: '240px' }}>
                {chatMessages.length === 0 ? (
                  <div style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', textAlign: 'center', marginTop: '2.5rem', lineHeight: 'var(--lh-relaxed)' }}>
                    Ask questions about repository architecture, auth routes, performance, or bug fixes.
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      style={{
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '92%',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-lg)',
                        fontSize: 'var(--text-base)',
                        lineHeight: 'var(--lh-relaxed)',
                        backgroundColor: msg.role === 'user' ? 'var(--primary)' : 'var(--surface-elevated)',
                        color: msg.role === 'user' ? 'var(--text-inverse)' : 'var(--text)',
                        border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content, null, 2)}
                      {msg.improved_code && (
                        <pre style={{ marginTop: '0.6rem', padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', overflowX: 'auto', fontSize: 'var(--text-sm)', border: '1px solid var(--border)', fontFamily: 'var(--font-mono)' }}>
                          <code>{msg.improved_code}</code>
                        </pre>
                      )}
                      {msg.cited_files && msg.cited_files.length > 0 && (
                        <div style={{ marginTop: '0.5rem', fontSize: 'var(--text-sm)', color: 'var(--primary)', fontWeight: 'var(--fw-semibold)' }}>
                          Cites: {msg.cited_files.join(', ')}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                <input
                  type="text"
                  placeholder="Ask about repo architecture, bugs..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.55rem 0.85rem',
                    fontSize: 'var(--text-base)',
                    backgroundColor: 'var(--surface-subtle)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text)',
                    outline: 'none',
                  }}
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={sendingChat}
                >
                  Send
                </Button>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Diff Viewer Modal */}
      {activePatch && (
        <DiffViewer
          changeRequest={activePatch}
          onApply={(newCode) => {
            setFileContent(newCode);
            alert('Patch applied to workspace viewer!');
            setActivePatch(null);
          }}
          onReject={() => setActivePatch(null)}
          onClose={() => setActivePatch(null)}
        />
      )}
    </div>
  );
}
