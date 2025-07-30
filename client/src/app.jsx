import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import ProfileSetup from './pages/ProfileSetup';
import LeaderboardPage from './pages/LeaderboardPage';
import GameDashboard from './pages/GameDashboard';
import GameRoom from './pages/GameRoom'; // Fixed import name
import MatchLobby from './pages/MatchLobby';
import authService from './services/api/authService';
import './styles/global.css';

export const AppContext = React.createContext();

const App = () => {
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [roomData, setRoomData] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Initializing CodeClash app...');
        
        const authResult = await authService.initialize();
        
        if (authResult.authenticated) {
          console.log('User is authenticated:', authResult.user);
          setUser(authResult.user);
          
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

  // Enhanced navigation function
  const navigate = (page, data = null) => {
    console.log('Navigating to:', page, 'with data:', data);
    
    if (page === 'game-room' && data) {
      setRoomData(data);
    }
    
    setCurrentPage(page);
  };

  // Enhanced login function
  const handleLogin = (userData) => {
    console.log('Login successful in App.jsx:', userData);
    setUser(userData);
    
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
      setRoomData(null);
      navigate('landing');
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      authService.clearSession();
      setUser(null);
      setRoomData(null);
      navigate('landing');
    }
  };

  // Profile update function for victory rewards
  const handleProfileUpdate = (updatedUser) => {
    console.log('Updating user profile:', updatedUser);
    setUser(updatedUser);
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
  }

  // App context
  const appContext = {
    user,
    setUser,
    navigate,
    handleLogin,
    handleLogout,
    handleProfileUpdate,
    currentPage,
    roomData,
    setRoomData
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
            roomCode={roomData?.roomCode}
            difficulty={roomData?.difficulty}
            problem={roomData?.problem}
            onUpdateProfile={handleProfileUpdate}
          />
        );  

      case 'match-lobby':
        return (
          <MatchLobby 
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