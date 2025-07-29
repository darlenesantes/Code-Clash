const { OAuth2Client } = require('google-auth-library');

class AuthService {
  constructor() {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    this.activeSessions = new Map(); // sessionId -> user data
  }

  async authenticateWithGoogle(token) {
    try {
      console.log('Authenticating with Google token');

      // Verify Google token
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      console.log('Google authentication successful for:', payload.email);

      // Create user object with real Google data
      const user = {
        id: payload.sub,
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        displayName: payload.name,
        firstName: payload.given_name,
        lastName: payload.family_name,
        picture: payload.picture,
        setupComplete: false,
        // Game stats
        rank: 'Bronze I',
        wins: 0,
        totalGames: 0,
        winRate: 0,
        coins: 100,
        xp: 0
      };

      // Create session
      const sessionId = 'session_' + payload.sub + '_' + Date.now();
      this.activeSessions.set(sessionId, user);

      return {
        success: true,
        user,
        sessionId
      };

    } catch (error) {
      console.error('Google authentication error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async updateUserProfile(userId, profileData) {
    try {
      // Find user session
      let userSession = null;
      let sessionId = null;
      
      for (const [sessId, userData] of this.activeSessions.entries()) {
        if (userData.id === userId) {
          userSession = userData;
          sessionId = sessId;
          break;
        }
      }

      if (!userSession) {
        return {
          success: false,
          error: 'User session not found'
        };
      }

      // Update user profile
      const updatedUser = {
        ...userSession,
        avatarTheme: profileData.avatarTheme || userSession.avatarTheme || 'coder',
        avatarColor: profileData.avatarColor || userSession.avatarColor || 'blue',
        favoriteLanguages: profileData.favoriteLanguages || [],
        skillLevel: profileData.skillLevel || 'intermediate',
        goals: profileData.goals || [],
        setupComplete: profileData.setupComplete || false
      };

      // Update session
      this.activeSessions.set(sessionId, updatedUser);

      console.log('Profile updated for user:', updatedUser.displayName);

      return {
        success: true,
        user: updatedUser
      };

    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  getUserFromSession(sessionId) {
    return this.activeSessions.get(sessionId);
  }

  async invalidateSession(sessionId) {
    try {
      this.activeSessions.delete(sessionId);
      return {
        success: true
      };
    } catch (error) {
      console.error('Session invalidation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  updateUserStats(userId, stats) {
    try {
      // Find and update user stats across all sessions
      for (const [sessionId, userData] of this.activeSessions.entries()) {
        if (userData.id === userId) {
          const updatedUser = {
            ...userData,
            ...stats
          };
          this.activeSessions.set(sessionId, updatedUser);
          return {
            success: true,
            user: updatedUser
          };
        }
      }

      return {
        success: false,
        error: 'User not found'
      };
    } catch (error) {
      console.error('Update user stats error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  getActiveSessionsCount() {
    return this.activeSessions.size;
  }
}

module.exports = new AuthService();