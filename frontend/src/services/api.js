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
let csrfTokenPromise = null;

function getCookie(name) {
  if (typeof document === 'undefined' || !document.cookie) {
    return null;
  }
  const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

function readCookieToken() {
  return getCookie('XSRF-TOKEN') || getCookie('csrfToken') || getCookie('_csrf') || null;
}

export async function fetchCsrfToken(forceFresh = false) {
  if (!forceFresh) {
    const cookieToken = readCookieToken();
    if (cookieToken) {
      csrfToken = cookieToken;
      return csrfToken;
    }
    if (csrfToken) {
      return csrfToken;
    }
    if (csrfTokenPromise) {
      return csrfTokenPromise;
    }
  }

  csrfTokenPromise = (async () => {
    try {
      const url = `${API_BASE_URL}/api/csrf-token`;
      const res = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`CSRF token fetch failed with status: ${res.status}`);
      }

      const data = await res.json();
      if (!data?.csrfToken) {
        throw new Error('CSRF token not present in response');
      }

      csrfToken = data.csrfToken;
      return csrfToken;
    } finally {
      csrfTokenPromise = null;
    }
  })();

  return csrfTokenPromise;
}

function buildConfig(options = {}, token = null) {
  const { headers: customHeaders, ...restOptions } = options;
  const isMutating = ['POST', 'PUT', 'DELETE', 'PATCH'].includes((options.method || 'GET').toUpperCase());

  // Explicitly ensure 'Content-Type': 'application/json' for JSON payloads
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(customHeaders || {}),
  };

  const activeToken = token || csrfToken || readCookieToken();
  if (isMutating && activeToken) {
    headers['X-CSRF-Token'] = activeToken;
    headers['csrf-token'] = activeToken;
  }

  return {
    credentials: 'include',
    ...restOptions,
    headers,
  };
}

async function parseResponse(response) {
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

  return data;
}

async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const isMutating = ['POST', 'PUT', 'DELETE', 'PATCH'].includes((options.method || 'GET').toUpperCase());

  let token = null;
  if (isMutating) {
    try {
      token = await fetchCsrfToken();
    } catch (err) {
      console.warn('Unable to pre-fetch CSRF token:', err.message);
    }
  }

  let config = buildConfig(options, token);

  try {
    const response = await fetch(url, config);
    const data = await parseResponse(response);

    if (!response.ok) {
      // If CSRF token is invalid, clear cache, fetch a fresh token, and retry ONCE
      if (response.status === 403 && data?.code === 'CSRF_TOKEN_INVALID' && isMutating && !options._isRetry) {
        csrfToken = null;
        try {
          const freshToken = await fetchCsrfToken(true);
          const retryConfig = buildConfig({ ...options, _isRetry: true }, freshToken);
          const retryResponse = await fetch(url, retryConfig);
          const retryData = await parseResponse(retryResponse);

          if (retryResponse.ok) {
            return retryData;
          }
          const retryErrorMsg = retryData?.error || retryData?.message || `HTTP ${retryResponse.status} Error`;
          throw new ApiError(retryErrorMsg, retryResponse.status, retryData);
        } catch (retryErr) {
          if (retryErr instanceof ApiError) throw retryErr;
          console.error('CSRF token refresh and retry failed:', retryErr);
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
  get: (endpoint, headers = {}) => request(endpoint, { method: 'GET', headers }),
  post: (endpoint, body, headers = {}) =>
    request(endpoint, { method: 'POST', body: JSON.stringify(body), headers }),
  put: (endpoint, body, headers = {}) =>
    request(endpoint, { method: 'PUT', body: JSON.stringify(body), headers }),
  delete: (endpoint, headers = {}) => request(endpoint, { method: 'DELETE', headers }),
};
