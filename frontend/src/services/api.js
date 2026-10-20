import { API_BASE_URL } from '../utils/apiConfig';

export class ApiError extends Error {
  constructor(message, status = 500, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

let csrfToken = null;

async function fetchCsrfToken() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/csrf-token`, { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      csrfToken = data.csrfToken;
    }
  } catch {
    // CSRF endpoint may not exist in dev/test
  }
}

async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const isMutating = ['POST', 'PUT', 'DELETE', 'PATCH'].includes((options.method || 'GET').toUpperCase());
  if (isMutating && !csrfToken) {
    await fetchCsrfToken();
  }

  const config = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(csrfToken && isMutating ? { 'X-CSRF-Token': csrfToken } : {}),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }

    if (!response.ok) {
      // If CSRF token invalid, clear it and retry once
      if (response.status === 403 && data?.code === 'CSRF_TOKEN_INVALID' && isMutating) {
        csrfToken = null;
        await fetchCsrfToken();
        if (csrfToken) {
          config.headers['X-CSRF-Token'] = csrfToken;
          const retryResponse = await fetch(url, config);
          const retryData = await retryResponse.json();
          if (retryResponse.ok) return retryData;
        }
      }
      const errorMessage = data?.error || data?.message || `HTTP ${response.status} Error`;
      throw new ApiError(errorMessage, response.status, data);
    }

    return data;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(err.message || 'Network request failed', 0);
  }
}

export const api = {
  get: (endpoint, headers) => request(endpoint, { method: 'GET', headers }),
  post: (endpoint, body, headers) =>
    request(endpoint, { method: 'POST', body: JSON.stringify(body), headers }),
  put: (endpoint, body, headers) =>
    request(endpoint, { method: 'PUT', body: JSON.stringify(body), headers }),
  delete: (endpoint, headers) => request(endpoint, { method: 'DELETE', headers }),
};
