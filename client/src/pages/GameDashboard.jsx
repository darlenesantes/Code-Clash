/**
 * Main Dashboard
 * File: client/src/pages/Dashboard.jsx
 * Central hub for all CodeClash features - Updated to receive hardcoded victory values
 */

import React, { useState, useEffect } from 'react';
import { 
  Trophy, Users, DollarSign, Building2, Crown, Target,
  Zap, Calendar, BarChart3, Settings, User, LogOut, TrendingUp
} from 'lucide-react';

const GameDashboard = ({ user, navigate, onLogout, onUpdateUser }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [hasWonGame, setHasWonGame] = useState(false); // Track if user has won a game
  
  const [userStats, setUserStats] = useState({
    totalEarnings: user?.totalEarnings || 11.15, // DEFAULT: Start with $11.15
    coins: user?.coins || 0,
    wins: user?.wins || 15, // DEFAULT: Start with 15 wins
    winStreak: user?.winStreak || 10, // DEFAULT: Start with 10 win streak
    rankPoints: 847, // Always keep rank at 847 - NEVER CHANGES
    battlesPlayed: user?.battlesPlayed || 19, // Total battles played
    ...user
  });

  // Update user stats when user prop changes (from victory popup)
  useEffect(() => {
    if (user) {
      console.log('Dashboard received updated user:', user);
      
      // Check if user has won a game (earnings increased from 11.15)
      if (user.totalEarnings && user.totalEarnings > 11.15) {
        setHasWonGame(true);
      }
      
      setUserStats(prevStats => ({
        ...prevStats,
        totalEarnings: user.totalEarnings !== undefined ? user.totalEarnings : prevStats.totalEarnings,
        coins: user.coins !== undefined ? user.coins : prevStats.coins,
        wins: user.wins !== undefined ? user.wins : prevStats.wins,
        winStreak: user.winStreak !== undefined ? user.winStreak : prevStats.winStreak,
        rankPoints: 847, // Always keep at 847 - NEVER CHANGES
        battlesPlayed: user.battlesPlayed !== undefined ? user.battlesPlayed : prevStats.battlesPlayed,
        ...user
      }));
    }
  }, [user]);

  const navigationItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart3,
      description: 'Your dashboard and stats'
    },
    {
      id: 'elite-leaderboard',
      label: 'Elite Rankings',
      icon: Crown,
      description: 'Global leaderboard with prize pools'
    },
    {
      id: 'tournaments',
      label: 'Tournaments',
      icon: Trophy,
      description: 'Cash tournaments and competitions'
    },
    {
      id: 'sponsor-dashboard',
      label: 'Corporate Sponsors',
      icon: Building2,
      description: 'Sponsorship management system'
    },
    {
      id: 'prize-pools',
      label: 'Prize Pools',
      icon: DollarSign,
      description: 'Tournament winnings and payouts'
    },
    {
      id: 'battle-arena',
      label: 'Battle Arena',
      icon: Zap,
      description: '1v1 coding battles'
    }
  ];

  const quickStats = [
    { 
      label: 'Your Rank', 
      value: `#847`, // Always show #847
      change: '+0', // Never changes
      color: 'text-blue-400',
      icon: Crown
    },
    { 
      label: 'Total Earnings', 
      value: `$11.15`, 
      change: userStats.totalEarnings > 11.15 ? `+$1.25` : '$0',
      color: 'text-green-400',
      icon: DollarSign
    },
    { 
      label: 'Battles Won', 
      value: 15, 
      change: `+${userStats.wins > 15 ? 1 : 0}`,
      color: 'text-purple-400',
      icon: Trophy
    },
    { 
      label: 'Win Streak', 
      value: userStats.winStreak, 
      change: userStats.winStreak >= 11 ? 'ON FIRE!' : `+${userStats.winStreak > 10 ? userStats.winStreak - 10 : 0}`,
      color: 'text-orange-400',
      icon: TrendingUp
    }
  ];

  const recentActivities = [
    { 
      type: 'battle', 
      message: hasWonGame 
        ? `You earned $1.25 from recent battles!` 
        : 'Ready to start earning from battles!', 
      time: hasWonGame ? 'Just now' : '1m ago'
    },
    { type: 'tournament', message: 'Elite Championship Series starts in 2 hours', time: '2h' },
    { type: 'prize', message: 'Weekly tournament prize pool: $50,000', time: '4h' },
    { type: 'sponsor', message: 'TechCorp sponsored Algorithm Masters Cup', time: '6h' },
    { 
      type: 'leaderboard', 
      message: hasWonGame 
        ? `Congratulations on your recent battle wins! Keep climbing!` 
        : `Your current rank: #847`, 
      time: hasWonGame ? '5m ago' : '8h'
    }
  ];

  const upcomingTournaments = [
    {
      name: 'Elite Championship Series',
      prizePool: '$100,000',
      startTime: '2 hours',
      participants: '2,547',
      difficulty: 'Expert'
    },
    {
      name: 'Algorithm Masters Cup',
      prizePool: '$50,000',
      startTime: '1 day',
      participants: '1,234',
      difficulty: 'Advanced'
    },
    {
      name: 'Speed Coding Challenge',
      prizePool: '$25,000',
      startTime: '3 days',
      participants: '3,891',
      difficulty: 'Intermediate'
    }
  ];

  const handleNavigation = (sectionId) => {
    console.log('Navigation clicked:', sectionId);
    setActiveSection(sectionId);
    
    // Navigate to different components based on selection
    switch(sectionId) {
      case 'elite-leaderboard':
        navigate('leaderboard');
        break;
      case 'tournaments':
        navigate('tournaments');
        break;
      case 'sponsor-dashboard':
        navigate('sponsors');
        break;
      case 'prize-pools':
        navigate('tournaments');
        break;
      case 'battle-arena':
        navigate('battle-arena');
        break;
      case 'overview':
      default:
        setActiveSection('overview');
        break;
    }
  };

  // Handle tournament registration
  const handleTournamentAction = () => {
    navigate('tournaments');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Zap className="w-8 h-8 text-blue-400" />
                <h1 className="text-2xl font-bold text-white">CodeClash</h1>
              </div>
              <div className="hidden md:block w-px h-6 bg-gray-600"></div>
              <div className="hidden md:block text-gray-400">
                Professional Competitive Programming Platform
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="hidden md:block">
                  <p className="text-white font-semibold">{userStats?.name || 'User'}</p>
                  <p className="text-gray-400 text-sm">{userStats?.email}</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-3 py-2 text-gray-400 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:block">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome back, {userStats?.name?.split(' ')[0] || 'Competitor'}!
          </h2>
          <p className="text-gray-400 text-lg">
            Ready to compete in today's tournaments and climb the elite rankings?
          </p>
          {userStats.totalEarnings > 11.15 && (
            <div className="mt-3 inline-flex items-center space-x-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-lg border border-green-500/30">
              <DollarSign className="w-4 h-4" />
              <span className="font-semibold">
                🎉You've earned $12.40 today!
              </span>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                  <span className={`text-sm font-semibold ${
                    stat.label === 'Total Earnings' && hasWonGame ? 'text-green-400' :
                    stat.label === 'Win Streak' && hasWonGame ? 'text-orange-400' :
                    stat.label === 'Battles Won' && hasWonGame ? 'text-purple-400' :
                    'text-gray-400'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Navigation Panel */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-6">Platform Features</h3>
              <div className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item.id)}
                      className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                        activeSection === item.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5" />
                        <div>
                          <div className="font-semibold">{item.label}</div>
                          <div className="text-xs opacity-80">{item.description}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Performance Summary - Shows when user has won a game - HARDCODED VALUES */}
            {hasWonGame && (
              <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 rounded-xl p-6 border-2 border-green-500/50">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Trophy className="w-6 h-6 text-yellow-400 mr-2" />
                  Your Battle Performance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">$12.40</div>
                    <div className="text-gray-300 text-sm">Total Earnings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">16</div>
                    <div className="text-gray-300 text-sm">Battles Won</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-400">11</div>
                    <div className="text-gray-300 text-sm">Win Streak 🔥</div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <button 
                    onClick={() => handleNavigation('battle-arena')}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Battle Again to Earn More!
                  </button>
                </div>
              </div>
            )}

            {/* Upcoming Tournaments */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Upcoming Tournaments</h3>
                <button 
                  onClick={() => handleNavigation('tournaments')}
                  className="text-blue-400 hover:text-blue-300 text-sm font-semibold"
                >
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {upcomingTournaments.map((tournament, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors">
                    <div>
                      <h4 className="text-white font-semibold">{tournament.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                        <span>Prize: {tournament.prizePool}</span>
                        <span>•</span>
                        <span>{tournament.participants} players</span>
                        <span>•</span>
                        <span>{tournament.difficulty}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-orange-400 font-semibold">Starts in {tournament.startTime}</div>
                      <button 
                        onClick={handleTournamentAction}
                        className="text-blue-400 hover:text-blue-300 text-sm mt-1 font-semibold"
                      >
                        Register
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-700/30 transition-colors">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'tournament' ? 'bg-blue-400' :
                      activity.type === 'prize' ? 'bg-green-400' :
                      activity.type === 'sponsor' ? 'bg-purple-400' :
                      activity.type === 'battle' ? 'bg-orange-400' :
                      'bg-cyan-400'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-gray-300">{activity.message}</p>
                    </div>
                    <div className="text-gray-500 text-sm">{activity.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDashboard;