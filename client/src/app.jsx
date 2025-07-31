/**
 * Main Application Component
 * File: client/src/App.jsx
 * Fixed routing system with hardcoded starting values
 */
import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import ProfileSetup from './pages/ProfileSetup';
import LeaderboardPage from './pages/LeaderboardPage';
import GameDashboard from './pages/GameDashboard';
import GameRoom from './pages/GameRoom';
import MatchLobby from './pages/MatchLobby';
import EliteLeaderboard from './pages/EliteLeaderboard';
import Tournaments from './pages/Tournaments';
import BattleArena from './pages/BattleArena';
import CorporateSponsorDashboard from './components/CorporateSponsorDashboard';
import authService from './services/api/authService';
import './styles/global.css';

// Create and export App Context
export const AppContext = React.createContext();

const App = () => {
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [roomData, setRoomData] = useState(null);
  const [pageData, setPageData] = useState({});

  // Initialize user with HARDCODED starting values as requested
  const initializeUser = (userData) => {
    return {
      ...userData,
      wins: userData.wins || 15, // HARDCODED: Start with 15 wins (so next win = 16)
      coins: userData.coins || 0,
      totalEarnings: userData.totalEarnings || 11.15, // HARDCODED: Start with $11.15 (so after $1.25 win = $12.40)
      winStreak: userData.winStreak || 10, // HARDCODED: Start with 10 win streak (so after 1 win = 11)
      rankPoints: 847, // HARDCODED: Always keep rank at 847 (never changes)
      battlesPlayed: userData.battlesPlayed || 19, // HARDCODED: 19 total battles played
      lastBattleTime: userData.lastBattleTime || null
    };
  };

  // Check for existing authentication on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('codeClashUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        const initializedUser = initializeUser(userData);
        setUser(initializedUser);
        setIsAuthenticated(true);
        setCurrentPage('dashboard');
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('codeClashUser');
      }
    }
  }, []);

  // Enhanced navigation function
  const navigate = (page, data = {}) => {
    console.log('Navigating to:', page, 'with data:', data);
    
    // Handle room data for battle-related pages
    if (data && data.roomCode) {
      setRoomData(data);
    }
    
    // Set page data for any additional data passing
    setPageData(data);
    setCurrentPage(page);
  };

  // Enhanced login function that handles both old and new auth flows
  const handleLogin = (userData) => {
    console.log('Login successful in App.jsx:', userData);
    const initializedUser = initializeUser(userData);
    setUser(initializedUser);
    setIsAuthenticated(true);
    
    // Save to localStorage
    localStorage.setItem('codeClashUser', JSON.stringify(initializedUser));
    
    // Check if user needs profile setup
    if (!userData.languagePreference || !userData.difficultyLevel || !userData.profileComplete) {
      console.log('User needs setup, navigating to profile-setup');
      navigate('profileSetup');
    } else {
      console.log('User setup complete, navigating to dashboard');
      navigate('dashboard');
    }
  };

  // Alternative login success handler (for new auth flow)
  const handleLoginSuccess = (userData) => {
    handleLogin(userData);
  };

  // Profile setup completion
  const handleProfileComplete = (profileData) => {
    console.log('Profile setup complete:', profileData);
    const updatedUser = initializeUser({ ...user, ...profileData, profileComplete: true });
    setUser(updatedUser);
    localStorage.setItem('codeClashUser', JSON.stringify(updatedUser));
    navigate('dashboard');
  };

  // Enhanced logout function
  const handleLogout = async () => {
    try {
      console.log('Logging out...');
      setUser(null);
      setIsAuthenticated(false);
      setRoomData(null);
      setPageData({});
      localStorage.removeItem('codeClashUser');
      navigate('landing');
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      // Force cleanup even if error occurs
      setUser(null);
      setIsAuthenticated(false);
      setRoomData(null);
      setPageData({});
      localStorage.removeItem('codeClashUser');
      navigate('landing');
    }
  };

  // CRITICAL: User update function for victory popup integration
  const handleUpdateUser = (updatedUserData) => {
    console.log('App updating user with new stats:', updatedUserData);
    
    const newUserData = {
      ...user,
      ...updatedUserData,
      lastBattleTime: new Date().toISOString() // Track when last battle occurred
    };
    
    setUser(newUserData);
    localStorage.setItem('codeClashUser', JSON.stringify(newUserData));
    
    console.log('User updated successfully:', newUserData);
  };

  // Profile update function (legacy support)
  const handleProfileUpdate = (updatedUser) => {
    console.log('Updating user profile:', updatedUser);
    const newUserData = initializeUser(updatedUser);
    setUser(newUserData);
    localStorage.setItem('codeClashUser', JSON.stringify(newUserData));
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

  // App context value with all necessary functions and data
  const appContext = {
    user,
    setUser,
    isAuthenticated,
    navigate,
    handleLogin,
    handleLoginSuccess,
    handleLogout,
    handleProfileUpdate,
    handleUpdateUser, // Add the new update function to context
    currentPage,
    roomData,
    setRoomData,
    pageData
  };

  // Enhanced page routing that handles all your existing pages
  const renderPage = () => {
    console.log('Rendering page:', currentPage, 'User stats:', user?.totalEarnings, user?.wins);
    
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
            onLoginSuccess={handleLoginSuccess}
          />
        );
      
      case 'profileSetup':
      case 'profile-setup':
        return (
          <ProfileSetup 
            navigate={navigate} 
            user={user} 
            onComplete={handleProfileComplete}
            onProfileComplete={handleProfileComplete}
          />
        );
      
      case 'dashboard':
      case 'game-dashboard':
        return (
          <GameDashboard 
            navigate={navigate} 
            user={user}
            onLogout={handleLogout}
            onUpdateUser={handleUpdateUser} // Pass the update function
          />
        );

      case 'leaderboard':
      case 'eliteRankings':
      case 'elite-leaderboard':
        return (
          <EliteLeaderboard 
            navigate={navigate} 
            user={user} 
            onUpdateUser={handleUpdateUser}
          />
        );

      case 'tournaments':
        return (
          <Tournaments 
            navigate={navigate} 
            user={user} 
            onUpdateUser={handleUpdateUser}
          />
        );
        
      case 'battle':
      case 'battleArena':
      case 'battle-arena':
        return (
          <BattleArena 
            navigate={navigate} 
            user={user} 
            roomCode={roomData?.roomCode}
            opponentData={null}
            onUpdateUser={handleUpdateUser} // Pass update function
          />
        );

      case 'battle-room':
        // For now, redirect to battle arena until BattleRoom is created
        return (
          <BattleArena 
            navigate={navigate} 
            user={user} 
            roomCode={roomData?.roomCode}
            opponentData={null}
            onUpdateUser={handleUpdateUser}
          />
        );
        
      case 'sponsors':
      case 'corporateSponsors':
      case 'sponsor-dashboard':
        // Use the existing CorporateSponsorDashboard component for now
        return (
          <CorporateSponsorDashboard 
            navigate={navigate} 
          />
        );

      case 'leaderboardPage':
      case 'leaderboard-page':
        return (
          <LeaderboardPage 
            navigate={navigate} 
            user={user} 
            onUpdateUser={handleUpdateUser}
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
            onUpdateProfile={handleProfileUpdate} // Legacy support
            onUpdateUser={handleUpdateUser} // NEW: Pass the victory update function
          />
        );  

      case 'match-lobby':
        return (
          <MatchLobby 
            navigate={navigate} 
            user={user}
            onUpdateUser={handleUpdateUser}
          />
        );
      
      default:
        console.log('Unknown page:', currentPage, '- showing landing');
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

// Export context hook for use in child components
export const useAppContext = () => {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppContext.Provider');
  }
  return context;
};

export default App;