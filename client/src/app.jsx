import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import ProfileSetup from './pages/ProfileSetup';
import LeaderboardPage from './pages/LeaderboardPage';
import GameDashboard from './pages/GameDashboard';
import authService from './services/api/authService'; // FIXED: Capital S
import './styles/global.css';
import GameRoom from './pages/GameRoom';
import MatchLobby from './pages/MatchLobby';
import TestRoomPage from "./pages/TestRoomPage";

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
        
        // Use proper auth service
        const authResult = await authService.initialize();
        
        if (authResult.authenticated) {
          console.log('User is authenticated:', authResult.user);
          setUser(authResult.user);
          
          // Navigate to proper page based on setup status
          if (!authResult.user.setupComplete) {
            setCurrentPage('profile-setup');
          } else {
            setCurrentPage('dashboard');
          }
        } else {
          console.log('No authenticated user found');
          authService.clearSession();
          setCurrentPage('landing');
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
        authService.clearSession();
        setCurrentPage('landing');
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

  // Enhanced login function
  const handleLogin = (userData) => {
    console.log('Login successful in App.jsx:', userData);
    setUser(userData);
    
    // Navigate based on setup completion
    if (!userData.setupComplete) {
      console.log('User needs setup, navigating to profile-setup');
      navigate('profile-setup');
    } else {
      console.log('User setup complete, navigating to dashboard');
      navigate('dashboard');
    }
  };

  // Enhanced logout function
  const handleLogout = async () => {
    try {
      console.log('Logging out...');
      await authService.logout();
      setUser(null);
      navigate('landing');
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
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
        </div>
      </div>
    );
  };

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
          />
        );
      
      case 'profile-setup':
        return (
          <ProfileSetup 
            navigate={navigate} 
            user={user} 
            onComplete={(updatedUser) => {
              setUser(updatedUser);
              navigate('dashboard');
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
          <GameDashboard 
            navigate={navigate} 
            user={user}
            onLogout={handleLogout}
          />
        );

      case 'game-room':
        return (
          <GameRoom 
            navigate={navigate} 
            user={user}
            roomData={null}
          />
        );  

      case 'match-lobby':
        return (
          <MatchLobby 
            navigate={navigate} 
            user={user}
            mode="quick"
          />
        );
      
      case 'test-room':
        return (
          <TestRoomPage
            navigate={navigate}
            user={user}
          />
        );
      
      default:
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