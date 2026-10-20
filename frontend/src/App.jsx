import React, { Component } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { GithubAuthProvider } from './context/GithubAuthContext';
import { AppShell } from './components/layout/AppShell';

import { HomePage } from './pages/HomePage';
import { ReviewPage } from './pages/ReviewPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { HealthDashboardPage } from './pages/HealthDashboardPage';
import { SecurityPage } from './pages/SecurityPage';
import { ImprovementPlanPage } from './pages/ImprovementPlanPage';
import { GithubCallbackPage } from './pages/GithubCallbackPage';
import { GithubSuccessPage } from './pages/GithubSuccessPage';
import { GithubErrorPage } from './pages/GithubErrorPage';

// Top-Level Error Boundary to prevent white screen crashes
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Error boundary logging - in production, integrate with error tracking service (e.g., Sentry)
    if (process.env.NODE_ENV !== 'production') {
      console.error('Uncaught React UI error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#090d16', color: '#f3f4f6', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem', color: '#ef4444' }}>
            Something went wrong
          </h2>
          <p style={{ color: '#9ca3af', maxWidth: '50ch', marginBottom: '1.5rem' }}>
            An unhandled UI error occurred. Please refresh the browser or click below to return home.
          </p>
          <button
            onClick={() => (window.location.href = '/')}
            style={{ padding: '0.6rem 1.25rem', backgroundColor: '#38bdf8', color: '#090d16', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
          >
            Reload Workspace
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <GithubAuthProvider>
          <BrowserRouter>
            <Routes>
              <Route
                path="/"
                element={
                  <AppShell pageTitle="Dashboard">
                    <HomePage />
                  </AppShell>
                }
              />
              <Route
                path="/review"
                element={
                  <AppShell pageTitle="AI Code Review">
                    <ReviewPage />
                  </AppShell>
                }
              />
              <Route
                path="/workspace"
                element={
                  <AppShell pageTitle="Repo Workbench">
                    <WorkspacePage />
                  </AppShell>
                }
              />
              <Route
                path="/security"
                element={
                  <AppShell pageTitle="Security Engine">
                    <SecurityPage />
                  </AppShell>
                }
              />
              <Route
                path="/health"
                element={
                  <AppShell pageTitle="Project Health Scorecard">
                    <HealthDashboardPage />
                  </AppShell>
                }
              />
              <Route
                path="/improve-plan"
                element={
                  <AppShell pageTitle="Improvement Plan">
                    <ImprovementPlanPage />
                  </AppShell>
                }
              />

              {/* GitHub OAuth Flow Routes */}
              <Route path="/auth/github/callback" element={<GithubCallbackPage />} />
              <Route path="/auth/github/success" element={<GithubSuccessPage />} />
              <Route path="/auth/github/error" element={<GithubErrorPage />} />
              <Route path="/auth/github/404" element={<GithubErrorPage />} />

              {/* Legacy Route Backwards Compatibility Fallbacks */}
              <Route path="/index.html" element={<Navigate to="/" replace />} />
              <Route path="/review.html" element={<Navigate to="/review" replace />} />
              <Route path="/repo-review.html" element={<Navigate to="/workspace" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </GithubAuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
