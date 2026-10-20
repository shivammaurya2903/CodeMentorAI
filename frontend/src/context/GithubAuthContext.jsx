import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { githubService } from '../services/githubService';
import { api } from '../services/api';

const GithubAuthContext = createContext({
  connected: false,
  user: null,
  loading: true,
  error: null,
  refreshStatus: async () => {},
  login: () => {},
  connectGitHub: () => {},
  logout: async () => {},
  setUserProfile: () => {},
});

export function GithubAuthProvider({ children }) {
  const [connected, setConnected] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const logout = useCallback(async () => {
    try {
      await api.post('/api/github/logout');
    } catch (err) {
      console.warn('Backend logout error:', err);
    } finally {
      setConnected(false);
      setUser(null);
      localStorage.removeItem('github_connected_cache');
    }
  }, []);

  const login = useCallback(() => {
    githubService.connectGitHub();
  }, []);

  const refreshStatus = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get('/api/github/status');
      const isConnected = !!res.connected;
      setConnected(isConnected);

      if (isConnected) {
        try {
          const profile = await api.get('/api/github/user');
          const normalizedUser = {
            login: profile.login || '',
            name: profile.name || profile.login || 'GitHub User',
            avatarUrl: profile.avatarUrl || profile.avatar_url || '',
            avatar_url: profile.avatar_url || profile.avatarUrl || '',
            bio: profile.bio || '',
            html_url: profile.html_url || '',
            ...profile,
          };
          setUser(normalizedUser);
        } catch (err) {
          console.error('Failed to fetch user profile:', err);
          if (err?.status === 401 || err?.response?.status === 401) {
            await logout();
          } else {
            setUser(null);
          }
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
  }, [logout]);

  // Consolidate status checks: run exactly once on mount
  useEffect(() => {
    api.get('/api/github/status')
      .then(res => {
        setConnected(!!res.connected);
        if (res.connected) {
          api.get('/api/github/user')
            .then(profile => {
              const normalizedUser = {
                login: profile.login || '',
                name: profile.name || profile.login || 'GitHub User',
                avatarUrl: profile.avatarUrl || profile.avatar_url || '',
                avatar_url: profile.avatar_url || profile.avatarUrl || '',
                bio: profile.bio || '',
                html_url: profile.html_url || '',
                ...profile,
              };
              setUser(normalizedUser);
            })
            .catch(console.error);
        } else {
          setUser(null);
        }
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const setUserProfile = useCallback((profile) => {
    if (profile) {
      const normalizedUser = {
        login: profile.login || '',
        name: profile.name || profile.login || 'GitHub User',
        avatarUrl: profile.avatarUrl || profile.avatar_url || '',
        avatar_url: profile.avatar_url || profile.avatarUrl || '',
        bio: profile.bio || '',
        html_url: profile.html_url || '',
        ...profile,
      };
      setUser(normalizedUser);
      setConnected(true);
    } else {
      setUser(null);
      setConnected(false);
    }
  }, []);

  return (
    <GithubAuthContext.Provider
      value={{
        connected,
        user,
        loading,
        error,
        refreshStatus,
        login,
        connectGitHub: login,
        logout,
        setUserProfile,
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
