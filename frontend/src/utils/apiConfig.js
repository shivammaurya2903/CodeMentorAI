/**
 * Centralized API Base URL Configuration
 */
export function getApiBaseUrl() {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocalHost =
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.endsWith('.local') ||
      /^\d{1,3}(\.\d{1,3}){3}$/.test(host);

    if (isLocalHost) {
      return `${window.location.protocol}//${host}:5000`;
    }
  }

  return '';
}

export const API_BASE_URL = getApiBaseUrl();
