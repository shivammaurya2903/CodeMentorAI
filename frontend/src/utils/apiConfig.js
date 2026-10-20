/**
 * Centralized API Base URL Configuration
 */
export function getApiBaseUrl() {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;
    // When served directly by the backend on port 5000, use relative paths
    if (port === '5000') {
      return '';
    }
    // When served by a frontend dev/preview server on localhost (5500, 5173, etc.), target port 5000
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.local')) {
      return `${protocol}//${hostname}:5000`;
    }
    return window.location.origin;
  }

  return 'http://localhost:5000';
}

export const API_BASE_URL = getApiBaseUrl();
