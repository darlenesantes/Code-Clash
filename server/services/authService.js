const { OAuth2Client } = require('google-auth-library');
const { findOrCreateUser } = require('../controllers/userController');

console.log('Google Client ID loaded:', process.env.GOOGLE_CLIENT_ID);

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const authenticateWithGoogle = async (token) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const user = await findOrCreateUser(payload.sub);

    // Update user info if needed
    if (user.email !== payload.email || user.name !== payload.name) {
      await user.update({
        email: payload.email,
        name: payload.name,
        picture: payload.picture
      });
    }

    return {
      success: true,
      user: {
        id: user.id,
        googleId: user.googleId,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        languagePreference: user.languagePreference,
        difficultyLevel: user.difficultyLevel,
        wins: user.wins,
        losses: user.losses,
        totalMatchesPlayed: user.totalMatchesPlayed,
        winStreak: user.winStreak
      }
    };
  } catch (error) {
    console.error('Auth error:', error);
    return {
      success: false,
      error: 'Authentication failed'
    };
  }
};

module.exports = {
  authenticateWithGoogle
};