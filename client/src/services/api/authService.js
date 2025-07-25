import axios from 'axios';

const API_BASE = REACT_APP_API_URL || 'http://localhost:3000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

class AuthService {
  constructor() {
    this.setupInterceptors();
  }

  setupInterceptors() {
    // Add session ID to requests
    api.interceptors.request.use((config) => {
      const sessionId = this.getSessionId();
      if (sessionId) {
        config.headers['x-session-id'] = sessionId;
      }
      return config;
    });

    // Handle session expiry
    api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          this.clearSession();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Session management
  getSessionId() {
    return localStorage.getItem('codeclash_session_id');
  }

  storeSession(sessionId, user) {
    localStorage.setItem('codeclash_session_id', sessionId);
    localStorage.setItem('codeclash_user', JSON.stringify(user));
  }

  clearSession() {
    localStorage.removeItem('codeclash_session_id');
    localStorage.removeItem('codeclash_user');
  }

  // Google OAuth ONLY
  async googleAuth(googleToken) {
    try {
      const response = await api.post('/api/auth/google', {
        token: googleToken
      });
      
      const { user, sessionId } = response.data;

      // Store session
      this.storeSession(sessionId, user);

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Google authentication failed'
      };
    }
  }

  // Update profile
  async updateProfile(profileData) {
    try {
      const response = await api.put('/api/auth/profile', profileData);
      const { user } = response.data;

      // Update stored user data
      localStorage.setItem('codeclash_user', JSON.stringify(user));

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Profile update failed'
      };
    }
  }

  // Get current user
  getCurrentUser() {
    try {
      const userString = localStorage.getItem('codeclash_user');
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      return null;
    }
  }

  // Check if authenticated
  isAuthenticated() {
    return !!(this.getSessionId() && this.getCurrentUser());
  }

  // Get current user from server
  async getCurrentUserFromServer() {
    try {
      const response = await api.get('/api/auth/me');
      const { user } = response.data;

      localStorage.setItem('codeclash_user', JSON.stringify(user));
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  }

  // Initialize auth
  async initialize() {
    try {
      if (!this.isAuthenticated()) {
        return { authenticated: false };
      }

      const result = await this.getCurrentUserFromServer();
      if (result.success) {
        return { authenticated: true, user: result.user };
      } else {
        this.clearSession();
        return { authenticated: false };
      }
    } catch (error) {
      this.clearSession();
      return { authenticated: false };
    }
  }

  // Logout
  async logout() {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearSession();
    }
  }
}

export default new AuthService();