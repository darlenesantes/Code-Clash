import React, { useState } from 'react';
import { Zap, ArrowLeft, AlertCircle, Code, Trophy, Users } from 'lucide-react';
import GoogleAuthButton from '../components/auth/GoogleAuthButton';

const Login = ({ navigate, onLogin }) => {
  const [error, setError] = useState('');

  const handleGoogleSuccess = async (user) => {
    console.log('Google login successful:', user);
    
    try {
      // Call the parent's onLogin function (App.jsx handles navigation)
      onLogin(user);
      console.log('User logged in successfully');
    } catch (error) {
      console.error('Error during login process:', error);
      setError('Login failed. Please try again.');
    }
  };

  const handleGoogleError = (error) => {
    console.error('Google login error:', error);
    setError(error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Subtle Background Animation */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Floating code elements */}
        <div className="absolute top-20 left-10 text-blue-400/20 text-4xl font-mono animate-bounce delay-300">{'<>'}</div>
        <div className="absolute top-32 right-16 text-purple-400/20 text-3xl font-mono animate-bounce delay-700">{'{}'}</div>
        <div className="absolute bottom-24 left-16 text-indigo-400/20 text-5xl font-mono animate-bounce delay-500">{'[]'}</div>
      </div>

      {/* Header */}
      <header className="relative z-50 px-6 py-6">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
            <Zap className="w-6 h-6 text-white" />
            <span className="text-xl font-bold text-white">CodeClash</span>
          </div>

          <button
            onClick={() => navigate('landing')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          
          {/* Hero Section */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-xl">
              <Code className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-3">
              Welcome to <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">CodeClash</span>
            </h1>
            
            <p className="text-gray-300 text-lg mb-8">
              Sign in to start your coding battles
            </p>

            {/* Quick Stats */}
            <div className="flex justify-center gap-6 mb-8">
              <div className="text-center">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-2 mx-auto">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-xs text-gray-400">1v1 Battles</span>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-2 mx-auto">
                  <Trophy className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-xs text-gray-400">Leaderboards</span>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mb-2 mx-auto">
                  <Zap className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-xs text-gray-400">Real-time</span>
              </div>
            </div>
          </div>

          {/* Login Card - Clean & Simple */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-8">
            <div className="space-y-6">
              
              {/* Google Sign In Button */}
              <GoogleAuthButton
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
              />

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-400 text-sm font-medium">{error}</p>
                      <p className="text-red-300/70 text-xs mt-1">
                        Please check your connection and try again
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700/50"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-transparent text-gray-400">Secure & Fast</span>
                </div>
              </div>

              {/* Benefits */}
              <div className="text-center space-y-2">
                <div className="flex justify-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    Free to Play
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    No Ads
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    Cross Platform
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-gray-500 text-xs">
              By signing in, you agree to our{' '}
              <button className="text-blue-400 hover:underline">Terms</button>
              {' '}and{' '}
              <button className="text-blue-400 hover:underline">Privacy Policy</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;