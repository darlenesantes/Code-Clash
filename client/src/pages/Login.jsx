import React, { useState } from 'react';
import { Zap, ArrowLeft, AlertCircle } from 'lucide-react';
import GoogleAuthButton from '../components/auth/GoogleAuthButton';

const Login = ({ navigate, onLogin }) => {
  const [error, setError] = useState('');

  const handleGoogleSuccess = async (user) => {
    console.log('Google login successful in Login.jsx:', user);

    // here we are going to send the unique googleId to the backend to find or create a user
    try {
      console.log("THE USER ID IS THIS:", user.googleId);
      const response = await fetch('/api/user/auth/google', {
        method: 'Post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ googleId: user.googleId })
      });

      const dbUser = await response.json();

      onLogin(dbUser); // Call the parent's onLogin function
      console.log('User logged in successfully');
    } catch (error) {
      console.error('Error logging in with Google:', error);
    }
    
    // Call the parent's onLogin function which handles navigation
    await onLogin(user);
    
    // Don't navigate here - let App.jsx handle it via onLogin
  };

  const handleGoogleError = (error) => {
    console.error('Google login error:', error);
    setError(error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <header className="relative z-50 px-6 py-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('landing')}
            className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Zap className="w-6 h-6 text-white" />
            <span className="text-xl font-bold text-white">CodeClash</span>
          </button>

          <button
            onClick={() => navigate('landing')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome to CodeClash
            </h1>
            <p className="text-gray-400">
              Sign in with Google to start your coding battles
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-2xl p-8">
            <GoogleAuthButton
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />

            {error && (
              <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-red-400 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;