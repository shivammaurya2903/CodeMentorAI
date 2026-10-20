import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { githubService } from '../services/githubService';
import { api } from '../services/api';

const GithubAuthContext = createContext({
  connected: false,
  setConnected: () => {},
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
  // Initialize from cookie or localStorage to eliminate UI flash on initial mount
  const [connected, setConnected] = useState(() => {
    if (typeof document !== 'undefined') {
      const hasCookie = document.cookie.split(';').some(c => c.trim().startsWith('gh_connected=true'));
      const hasStorage = localStorage.getItem('gh_connected') === 'true';
      return hasCookie || hasStorage;
    }
    return false;
  });

  const [user, setUser] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      try {
        const cached = localStorage.getItem('github_user_cache');
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return null;
  });
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
      localStorage.removeItem('gh_connected');
      localStorage.removeItem('github_connected_cache');
      localStorage.removeItem('github_user_cache');
      if (typeof document !== 'undefined') {
        document.cookie = 'gh_connected=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
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
      const isConnected = !!(res && (res.connected === true || res.connected === 'true' || res.connected === 1));
      setConnected(isConnected);

      if (isConnected) {
        localStorage.setItem('gh_connected', 'true');
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
          localStorage.setItem('github_user_cache', JSON.stringify(normalizedUser));
        } catch (profileErr) {
          console.warn('Profile fetch warning (non-fatal):', profileErr);
        }
      } else {
        localStorage.removeItem('gh_connected');
        localStorage.removeItem('github_user_cache');
        setUser(null);
      }
      return isConnected;
    } catch (err) {
      console.error('AUTH STATUS ERROR:', err);
      setError(err.message);
      // Fallback: preserve cookie-derived connection if transient network glitch
      const hasCookie = typeof document !== 'undefined' && document.cookie.includes('gh_connected=true');
      setConnected(hasCookie);
      return hasCookie;
    } finally {
      setLoading(false);
    }
  }, []);

  // Consolidate status checks: run on mount
  useEffect(() => {
    let isMounted = true;

    api.get('/api/github/status')
      .then(res => {
        if (!isMounted) return;
        const isConnected = !!(res && (res.connected === true || res.connected === 'true' || res.connected === 1));
        setConnected(isConnected);

        if (isConnected) {
          localStorage.setItem('gh_connected', 'true');
          api.get('/api/github/user')
            .then(profile => {
              if (!isMounted) return;
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
              localStorage.setItem('github_user_cache', JSON.stringify(normalizedUser));
            })
            .catch(profileErr => {
              console.warn('Initial profile fetch warning:', profileErr);
            });
        } else {
          localStorage.removeItem('gh_connected');
          localStorage.removeItem('github_user_cache');
          setUser(null);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error('AUTH STATUS ERROR:', err);
          const hasCookie = typeof document !== 'undefined' && document.cookie.includes('gh_connected=true');
          setConnected(hasCookie);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
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
      localStorage.setItem('gh_connected', 'true');
      localStorage.setItem('github_user_cache', JSON.stringify(normalizedUser));
    } else {
      setUser(null);
      setConnected(false);
      localStorage.removeItem('gh_connected');
      localStorage.removeItem('github_user_cache');
    }
  }, []);

  return (
    <GithubAuthContext.Provider
      value={{
        connected,
        setConnected,
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
