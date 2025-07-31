/**
 * Authentication Service  
 * File: client/src/services/api/authService.js
 * Works with your existing GoogleAuthButton component
 */

class AuthService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
  }

  async googleAuth(token) {
    try {
      console.log('AuthService: Sending Google token to backend...');
      
      // Fixed: Make console log match actual URL
      const url = `${this.baseURL}/auth`;
      console.log('API URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers.get('content-type'));

      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Non-JSON response received:', textResponse.substring(0, 200));
        throw new Error('Server returned HTML instead of JSON. Check if the function is deployed.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Authentication failed');
      }

      const data = await response.json();
      console.log('Auth Success:', data);

      return {
        success: true,
        user: data.user,
        message: data.message
      };

    } catch (error) {
      console.error('AuthService Error:', error);
      
      if (error.message.includes('fetch') || error.name === 'TypeError') {
        return {
          success: false,
          error: 'Network error. Please check your connection and ensure the server is running.'
        };
      }

      if (error.message.includes('HTML instead of JSON')) {
        return {
          success: false,
          error: 'Function not found. Please check if /.netlify/functions/auth is deployed.'
        };
      }

      return {
        success: false,
        error: error.message || 'Authentication failed'
      };
    }
  }

  async updateProfile(profileData) {
    try {
      console.log('AuthService: Updating profile...');
      console.log('Profile data:', profileData);

      const response = await fetch(`${this.baseURL}/api/auth/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData)
      });

      console.log('Profile update response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Profile update failed');
      }

      const data = await response.json();
      console.log('Profile Update Success:', data);

      return {
        success: true,
        user: { ...profileData },
        message: data.message
      };

    } catch (error) {
      console.error('Profile Update Error:', error);
      
      if (error.message.includes('fetch') || error.name === 'TypeError') {
        return {
          success: false,
          error: 'Network error. Please check your connection and ensure the server is running.'
        };
      }

      return {
        success: false,
        error: error.message || 'Profile update failed'
      };
    }
  }
}

// Export a singleton instance
const authService = new AuthService();
export default authService;