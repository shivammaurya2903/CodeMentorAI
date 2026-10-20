import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { githubService } from '../services/githubService';

const GithubAuthContext = createContext({
  connected: false,
  user: null,
  loading: true,
  error: null,
  refreshStatus: async () => {},
  connectGitHub: () => {},
  logout: () => {},
});

export function GithubAuthProvider({ children }) {
  const [connected, setConnected] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshStatus = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const status = await githubService.getStatus();
      setConnected(status.connected);

      if (status.connected) {
        try {
          const profile = await githubService.getUserProfile();
          setUser(profile);
        } catch (err) {
          console.warn('Failed to fetch user profile:', err);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to query GitHub status:', err);
      setError(err.message);
      setConnected(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const connectGitHub = () => {
    githubService.connectGitHub();
  };

  const logout = async () => {
    try {
      await githubService.post('/api/github/logout');
    } catch (err) {
      console.error('Backend logout error:', err);
    }
    setConnected(false);
    setUser(null);
    localStorage.removeItem('github_connected_cache');
  };

  return (
    <GithubAuthContext.Provider
      value={{
        connected,
        user,
        loading,
        error,
        refreshStatus,
        connectGitHub,
        logout,
      }}
    >
      {children}
    </GithubAuthContext.Provider>
  );
}

export function useGithubAuth() {
  const context = useContext(GithubAuthContext);
  if (!context) {
    throw new Error('useGithubAuth must be used within a GithubAuthProvider');
  }
  return context;
}
