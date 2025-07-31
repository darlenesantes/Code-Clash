const https = require('https');

exports.handler = async (event, context) => {
  console.log('Auth function called:', event.httpMethod);
  console.log('Request body:', event.body);
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return { 
      statusCode: 200, 
      headers, 
      body: JSON.stringify({ message: 'CORS preflight' })
    };
  }

  if (event.httpMethod === 'POST') {
    try {
      console.log('Processing POST request');
      
      const { token } = JSON.parse(event.body || '{}');
      
      if (!token) {
        console.log('No token provided');
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            success: false, 
            error: 'No token provided' 
          }),
        };
      }

      console.log('Token received, verifying with Google...');
      const userInfo = await verifyGoogleToken(token);
      
      if (!userInfo) {
        console.log('Token verification failed');
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ 
            success: false, 
            error: 'Invalid token' 
          }),
        };
      }

      console.log('Token verified successfully for user:', userInfo.name);

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

      console.log('Returning successful response');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          user: user 
        }),
      };
    } catch (error) {
      console.error('Auth function error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Authentication failed: ' + error.message 
        }),
      };
    }
  }

  // Handle other methods
  console.log('Method not allowed:', event.httpMethod);
  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ 
      error: 'Method not allowed',
      method: event.httpMethod,
      message: 'This function only accepts POST requests'
    }),
  };
};

function verifyGoogleToken(token) {
  return new Promise((resolve) => {
    console.log('Contacting Google tokeninfo API...');
    const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { 
        data += chunk; 
      });
      
      res.on('end', () => {
        try {
          console.log('Google API response status:', res.statusCode);
          
          if (res.statusCode !== 200) {
            console.error('Google API error:', data);
            resolve(null);
            return;
          }
          
          const tokenInfo = JSON.parse(data);
          console.log('Token info received for:', tokenInfo.email);
          
          const expectedClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
          console.log('Expected client ID:', expectedClientId?.substring(0, 20) + '...');
          console.log('Received client ID:', tokenInfo.aud?.substring(0, 20) + '...');
          
          if (tokenInfo.aud === expectedClientId) {
            console.log('Client ID verification successful');
            resolve(tokenInfo);
          } else {
            console.error('Client ID mismatch');
            resolve(null);
          }
        } catch (error) {
          console.error('Error parsing Google response:', error);
          resolve(null);
        }
      });
    }).on('error', (error) => {
      console.error('Network error contacting Google:', error);
      resolve(null);
    });
  });
}