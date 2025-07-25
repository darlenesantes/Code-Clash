// Enhanced Authentication Service for CodeClash with 14-day JWT
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Create axios instance with default config
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

  // Setup axios interceptors for automatic token handling
  setupInterceptors() {
    // Request interceptor - add token to requests
    api.interceptors.request.use((config) => {
      const token = this.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor - handle token expiration
    api.interceptors.response.use(
      (response) => {
        // Check if server suggests token refresh
        const shouldRefresh = response.headers['x-token-refresh-suggested'];
        if (shouldRefresh === 'true') {
          this.refreshTokenIfNeeded();
        }
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Try to refresh the token
            const refreshed = await this.refreshToken();
            if (refreshed) {
              // Retry the original request with new token
              const token = this.getAccessToken();
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            this.logout();
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Get stored access token
  getAccessToken() {
    return localStorage.getItem('codeclash_access_token');
  }

  // Get stored refresh token
  getRefreshToken() {
    return localStorage.getItem('codeclash_refresh_token');
  }

  // Store tokens
  storeTokens(accessToken, refreshToken) {
    localStorage.setItem('codeclash_access_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('codeclash_refresh_token', refreshToken);
    }
  }

  // Clear stored tokens
  clearTokens() {
    localStorage.removeItem('codeclash_access_token');
    localStorage.removeItem('codeclash_refresh_token');
    localStorage.removeItem('codeclash_user');
  }

  // Register new user
  async register(userData) {
    try {
      const response = await api.post('/api/auth/register', userData);
      const { user, accessToken, refreshToken } = response.data;
      
      // Store tokens and user data
      this.storeTokens(accessToken, refreshToken);
      localStorage.setItem('codeclash_user', JSON.stringify(user));
      
      return { success: true, user, accessToken, refreshToken };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed'
      };
    }
  }

  // Login existing user
  async login(credentials) {
    try {
      const response = await api.post('/api/auth/login', credentials);
      const { user, accessToken, refreshToken } = response.data;
      
      // Store tokens and user data
      this.storeTokens(accessToken, refreshToken);
      localStorage.setItem('codeclash_user', JSON.stringify(user));
      
      return { success: true, user, accessToken, refreshToken };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    }
  }

  // Google OAuth login
  async googleAuth(googleToken) {
    try {
      const response = await api.post('/api/auth/google', {
        token: googleToken
      });
      const { user, accessToken, refreshToken } = response.data;
      
      // Store tokens and user data
      this.storeTokens(accessToken, refreshToken);
      localStorage.setItem('codeclash_user', JSON.stringify(user));
      
      return { success: true, user, accessToken, refreshToken };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Google authentication failed'
      };
    }
  }

  // Refresh access token using refresh token
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post(`${API_BASE}/api/auth/refresh`, {
        refreshToken
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;
      
      // Store new tokens
      this.storeTokens(accessToken, newRefreshToken);
      
      return { success: true, accessToken, refreshToken: newRefreshToken };
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      return { success: false, error: 'Token refresh failed' };
    }
  }

  // Check if token needs refresh (if expires in less than 1 day)
  async refreshTokenIfNeeded() {
    try {
      const token = this.getAccessToken();
      if (!token) return false;

      // Decode token to check expiry (basic decode, not verification)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = payload.exp - now;
      const oneDayInSeconds = 24 * 60 * 60;

      // If token expires in less than 1 day, refresh it
      if (timeUntilExpiry < oneDayInSeconds) {
        await this.refreshToken();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return false;
    }
  }

  // Logout user
  async logout() {
    try {
      const refreshToken = this.getRefreshToken();
      if (refreshToken) {
        await api.post('/api/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
      this.clearTokens();
    }
  }

  // Get current user from storage
  getCurrentUser() {
    try {
      const userString = localStorage.getItem('codeclash_user');
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getAccessToken();
    const user = this.getCurrentUser();
    
    if (!token || !user) return false;

    try {
      // Check if token is expired
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch (error) {
      console.error('Error checking token validity:', error);
      return false;
    }
  }

  // Get token expiry information
  getTokenInfo() {
    try {
      const token = this.getAccessToken();
      if (!token) return null;

      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = Math.max(0, payload.exp - now);
      
      return {
        expiresAt: new Date(payload.exp * 1000),
        timeUntilExpiry,
        isExpired: payload.exp <= now,
        daysUntilExpiry: Math.floor(timeUntilExpiry / (24 * 60 * 60)),
        hoursUntilExpiry: Math.floor((timeUntilExpiry % (24 * 60 * 60)) / 3600)
      };
    } catch (error) {
      console.error('Error getting token info:', error);
      return null;
    }
  }

  // Update user profile
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

  // Get current user from server (with fresh data)
  async getCurrentUserFromServer() {
    try {
      const response = await api.get('/api/auth/me');
      const { user, tokenExpiresIn } = response.data;
      
      // Update stored user data
      localStorage.setItem('codeclash_user', JSON.stringify(user));
      
      return { 
        success: true, 
        user, 
        tokenExpiresIn,
        tokenInfo: this.getTokenInfo()
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get user info'
      };
    }
  }

  // Initialize auth state on app load
  async initialize() {
    try {
      if (!this.isAuthenticated()) {
        this.clearTokens();
        return { authenticated: false };
      }

      // Try to refresh token if needed
      await this.refreshTokenIfNeeded();
      
      // Get fresh user data from server
      const result = await this.getCurrentUserFromServer();
      
      if (result.success) {
        return { 
          authenticated: true, 
          user: result.user,
          tokenInfo: result.tokenInfo
        };
      } else {
        this.clearTokens();
        return { authenticated: false };
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      this.clearTokens();
      return { authenticated: false };
    }
  }

  // Verify email (placeholder)
  async verifyEmail(token) {
    try {
      const response = await api.post('/api/auth/verify-email', { token });
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Email verification failed'
      };
    }
  }

  // Request password reset
  async requestPasswordReset(email) {
    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Password reset request failed'
      };
    }
  }

  // Reset password
  async resetPassword(token, newPassword) {
    try {
      const response = await api.post('/api/auth/reset-password', {
        token,
        password: newPassword
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Password reset failed'
      };
    }
  }
}

export default new AuthService();