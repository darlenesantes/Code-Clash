import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import ProfileSetup from './pages/ProfileSetup';
import LeaderboardPage from './pages/LeaderboardPage';
import authService from './services/api/authService';

// Create context FIRST
export const AppContext = React.createContext();

const App = () => {
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize app with proper auth service
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Initializing CodeClash app...');
        
        // Use proper auth service instead of localStorage only
        const authResult = await authService.initialize();
        
        if (authResult.authenticated) {
          console.log('User is authenticated:', authResult.user);
          setUser(authResult.user);
          // DON'T auto-redirect - always show landing page first
          // User can choose to go to dashboard from landing page
          setCurrentPage('landing');
        } else {
          console.log('No authenticated user found');
          // Clear any stale localStorage data
          authService.clearSession();
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
        // Clear tokens on error
        authService.clearSession();
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Navigation function
  const navigate = (page) => {
    console.log('Navigating to:', page);
    setCurrentPage(page);
  };

  // Enhanced login function with proper auth service
  const handleLogin = (userData) => {
    console.log('Login successful:', userData);
    setUser(userData);
    
    // Navigate based on user setup status
    if (!userData.setupComplete) {
      navigate('profile-setup');
    } else {
      // Go back to landing page (now logged in)
      navigate('landing');
    }
  };

  // Enhanced logout function with proper auth service
  const handleLogout = async () => {
    try {
      console.log('Logging out...');
      await authService.logout();
      setUser(null);
      navigate('landing');
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout anyway
      authService.clearSession();
      setUser(null);
      navigate('landing');
    }
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white text-lg">Loading CodeClash...</p>
          <p className="text-gray-400 text-sm mt-2">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  // App context for sharing state
  const appContext = {
    user,
    setUser,
    navigate,
    handleLogin,
    handleLogout,
    currentPage
  };

  // Page routing
  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return (
          <LandingPage 
            navigate={navigate} 
            user={user}
            onLogout={handleLogout}
          />
        );
      
      case 'login':
        return (
          <Login 
            navigate={navigate} 
            onLogin={handleLogin} 
            isRegister={false}
          />
        );
      
      case 'register':
        return (
          <Login 
            navigate={navigate} 
            onLogin={handleLogin} 
            isRegister={true}
          />
        );
      
      case 'profile-setup':
        return (
          <ProfileSetup 
            navigate={navigate} 
            user={user} 
            onComplete={(updatedUser) => {
              setUser(updatedUser);
              navigate('landing'); // Go back to landing after setup
            }}
          />
        );
      
      case 'leaderboard':
        return (
          <LeaderboardPage 
            navigate={navigate} 
            user={user} 
          />
        );
      
      case 'dashboard':
        return (
          <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">Dashboard Coming Soon!</h1>
              <p className="text-gray-400 mb-6">Welcome back, {user?.username || user?.name || 'CodeWarrior'}!</p>
              <p className="text-gray-500 text-sm mb-8">
                Your rank: <span className="text-blue-400 font-semibold">{user?.rank || 'Bronze I'}</span> | 
                Coins: <span className="text-yellow-400 font-semibold">{user?.coins || 0}</span>
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <button 
                  onClick={() => navigate('landing')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
                >
                  Back to Home
                </button>
                <button 
                  onClick={() => navigate('leaderboard')}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-300 transform hover:scale-105"
                >
                  View Leaderboard
                </button>
                <button 
                  onClick={handleLogout}
                  className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 transform hover:scale-105"
                >
                  Logout
                </button>
              </div>
              
              {/* Debug info */}
              {process.env.REACT_APP_DEBUG_MODE === 'true' && (
                <div className="mt-8 p-4 bg-gray-800/50 rounded-xl text-left max-w-md mx-auto">
                  <p className="text-gray-400 text-sm mb-2">Debug Info:</p>
                  <pre className="text-xs text-gray-500 overflow-auto">
                    {JSON.stringify(user, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        );
      
      default:
        console.warn('Unknown page:', currentPage, '- redirecting to landing');
        return (
          <LandingPage 
            navigate={navigate} 
            user={user}
            onLogout={handleLogout}
          />
        );
    }
  };

  return (
    <div className="App">
      <AppContext.Provider value={appContext}>
        {renderPage()}
      </AppContext.Provider>
    </div>
  );
};

export default App;