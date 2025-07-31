const https = require('https');

exports.handler = async (event, context) => {
  console.log('Auth function called:', event.httpMethod);
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'POST') {
    try {
      const { token } = JSON.parse(event.body || '{}');
      
      if (!token) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            success: false,
            error: 'No token provided' 
          }),
        };
      }

      // Verify Google token
      const userInfo = await verifyGoogleToken(token);
      
      if (!userInfo) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ 
            success: false,
            error: 'Invalid token' 
          }),
        };
      }

      // Return user with your hardcoded gaming stats
      const user = {
        id: userInfo.sub,
        name: userInfo.name,
        email: userInfo.email,
        avatar: userInfo.picture,
        wins: 15,
        totalEarnings: 11.15,
        winStreak: 10,
        coins: 1250,
        rankPoints: 847,
        rank: 'Silver II',
        totalBattles: 19,
        joinedAt: new Date().toISOString()
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          user: user
        }),
      };
    } catch (error) {
      console.error('Auth error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          success: false,
          error: 'Authentication failed' 
        }),
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' }),
  };
};

function verifyGoogleToken(token) {
  return new Promise((resolve) => {
    const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          if (res.statusCode !== 200) {
            resolve(null);
            return;
          }
          const tokenInfo = JSON.parse(data);
          const expectedClientId = process.env.GOOGLE_CLIENT_ID || process.env.REACT_APP_GOOGLE_CLIENT_ID;
          
          if (tokenInfo.aud === expectedClientId) {
            resolve(tokenInfo);
          } else {
            resolve(null);
          }
        } catch (error) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}