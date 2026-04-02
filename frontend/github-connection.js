/**
 * GitHub Connection Management
 * Handles connection state, token storage, and smart redirects
 */

class GitHubConnectionManager {
  constructor() {
    this.TOKEN_KEY = 'github_token';
    this.SESSION_KEY = 'github_session_id';
    this.API_URL = this.getApiUrl();
    this.FRONTEND_URL = this.getFrontendUrl();
  }

  /**
   * Get backend API URL based on environment
   */
  getApiUrl() {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:5000'
      : 'https://codementorai-vqp8.onrender.com';
  }

  /**
   * Get frontend URL
   */
  getFrontendUrl() {
    return `${window.location.protocol}//${window.location.hostname}:${window.location.port || (window.location.protocol === 'https:' ? 443 : 80)}`;
  }

  /**
   * Check if GitHub token exists in localStorage
   */
  isConnected() {
    const token = localStorage.getItem(this.TOKEN_KEY);
    return !!token;
  }

  /**
   * Get stored GitHub token
   */
  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Save GitHub token to localStorage (called after OAuth callback)
   */
  saveToken(token) {
    if (token) {
      localStorage.setItem(this.TOKEN_KEY, token);
      console.log('✅ GitHub token saved to localStorage');
      return true;
    }
    return false;
  }

  /**
   * Clear GitHub token (on logout)
   */
  clearToken() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.SESSION_KEY);
    console.log('🔄 GitHub token cleared');
  }

  /**
   * Extract token from URL query params (called from OAuth callback)
   */
  extractTokenFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      this.saveToken(token);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return token;
    }
    return null;
  }

  /**
   * Smart connection check with redirect logic
   * Use on page load to determine where user should be
   */
  smartRedirect(currentPage = 'review') {
    const isConnected = this.isConnected();
    const urlToken = new URLSearchParams(window.location.search).get('token');
    
    console.log(`📍 Current page: ${currentPage}, Connected: ${isConnected}, URL token: ${!!urlToken}`);

    // If token is in URL, allow callback logic to proceed (so token gets saved)
    if (urlToken) {
      console.log('⏳ Token present in URL, waiting for backend callback handling before redirect decision');
      return true;
    }

    // If user is on review.html but NOT connected → redirect to index
    if (currentPage === 'review' && !isConnected) {
      console.log('⚠️ On review.html but not connected → redirecting to index');
      window.location.href = `${this.FRONTEND_URL}/index.html`;
      return false;
    }

    // If user is on repo-review.html but NOT connected → redirect to index
    if (currentPage === 'repo-review' && !isConnected) {
      console.log('⚠️ On repo-review.html but not connected → redirecting to index');
      window.location.href = `${this.FRONTEND_URL}/index.html`;
      return false;
    }

    // If connected, mark as good
    if (isConnected) {
      console.log('✅ GitHub connected, page load OK');
      return true;
    }

    // Default page (index.html) → no redirect needed
    console.log('📄 On index.html, allowing normal flow');
    return false;
  }

  /**
   * Initiate GitHub OAuth flow
   */
  connectGitHub() {
    const storedToken = this.getToken();
    if (storedToken) {
      console.log('✅ GitHub token already present, redirecting to repo-review.html');
      window.location.href = `${this.FRONTEND_URL}/repo-review.html`;
      return;
    }

    console.log('🔗 Starting GitHub OAuth flow (no token found)');
    window.location.href = `${this.API_URL}/auth/github`;
  }

  /**
   * Redirect to repo review after connection
   */
  goToRepoReview() {
    if (this.isConnected()) {
      console.log('🚀 Navigating to repo-review.html');
      window.location.href = `${this.FRONTEND_URL}/repo-review.html`;
    } else {
      console.warn('⚠️ Not connected, cannot navigate to repo review');
    }
  }

  /**
   * Redirect to home page
   */
  goToHome() {
    console.log('🏠 Navigating to index.html');
    window.location.href = `${this.FRONTEND_URL}/index.html`;
  }

  /**
   * Handle OAuth callback - called from repo-review.html or review.html
   */
  handleOAuthCallback() {
    console.log('🔄 Handling OAuth callback...');
    
    // Extract token from URL
    const token = this.extractTokenFromUrl();
    
    if (token) {
      console.log('✅ Token extracted from callback URL');
      return true;
    } else {
      console.log('📌 No token in URL (may have been saved already)');
      return this.isConnected();
    }
  }

  /**
   * Log current connection state
   */
  logStatus() {
    const connected = this.isConnected();
    const token = this.getToken();
    console.log('🔐 GitHub Connection Status:', {
      connected,
      hasToken: !!token,
      tokenLength: token?.length || 0,
      apiUrl: this.API_URL,
    });
  }
}

// Create global instance
const github = new GitHubConnectionManager();

// Auto-handle OAuth callback on page load
document.addEventListener('DOMContentLoaded', function() {
  github.handleOAuthCallback();
});
