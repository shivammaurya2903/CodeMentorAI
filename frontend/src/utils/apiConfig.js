/**
 * Centralized API Base URL Configuration
 */
export function getApiBaseUrl() {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;
    const isLocalHost =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.endsWith('.local') ||
      /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);

    if (isLocalHost) {
      // Use the same port as the backend, or default to 5000
      const apiPort = port || '5000';
      return `${protocol}//${hostname}:${apiPort}`;
    }
  }

  return '';
}

export const API_BASE_URL = getApiBaseUrl();
