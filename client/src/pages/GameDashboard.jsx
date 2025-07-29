import React, { useState } from 'react';
import { 
  Zap, Users, Trophy, Clock, Target, Plus, 
  LogOut, Settings, BarChart3, Crown
} from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import DashboardActivityFeed from '../components/DashboardActivityFeed';

const GameDashboard = ({ navigate, user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { label: 'Rank', value: user?.rank || 'Bronze I', icon: Crown, color: 'text-yellow-400' },
    { label: 'Wins', value: user?.wins || 0, icon: Trophy, color: 'text-green-400' },
    { label: 'Win Rate', value: `${user?.winRate || 0}%`, icon: BarChart3, color: 'text-blue-400' },
    { label: 'Coins', value: user?.coins || 100, icon: Zap, color: 'text-yellow-400' }
  ];

  const recentMatches = [
    { opponent: 'CodeNinja', result: 'Victory', problem: 'Two Sum', time: '2:34', coinsEarned: 50 },
    { opponent: 'AlgoMaster', result: 'Defeat', problem: 'Valid Parentheses', time: '4:12', coinsLost: 25 },
    { opponent: 'ByteCrusher', result: 'Victory', problem: 'Roman to Integer', time: '3:45', coinsEarned: 50 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Dashboard Activity Feed */}
      <DashboardActivityFeed />
      
      {/* Header */}
      <header className="relative z-40 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm rounded-xl px-4 py-3 border border-gray-700/50">
              <Zap className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">CodeClash</h1>
                <p className="text-gray-400 text-sm">Battle Arena</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('leaderboard')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 transition-colors"
            >
              <Trophy className="w-4 h-4" />
              Leaderboard
            </button>
            
            <button className="p-2 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8">
              <div className="flex items-center gap-6">
                <Avatar 
                  theme={user?.avatarTheme || 'coder'} 
                  color={user?.avatarColor || 'blue'} 
                  size="xl"
                />
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Welcome back, {user?.displayName || user?.name || 'CodeWarrior'}!
                  </h2>
                  <p className="text-gray-400 text-lg">Ready for your next coding battle?</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 text-center">
                <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Main Action Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Quick Match */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-8 h-8" />
                  <h3 className="text-2xl font-bold">Quick Match</h3>
                </div>
                <p className="text-blue-100 mb-6">Get matched with random opponents instantly</p>
                <button
                  onClick={() => navigate('match-lobby')}
                  className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
                >
                  Find Opponent
                </button>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            </div>

            {/* Private Room */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-8 h-8" />
                  <h3 className="text-2xl font-bold">Private Room</h3>
                </div>
                <p className="text-purple-100 mb-6">Create or join a room to battle friends</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate('match-lobby')}
                    className="bg-white text-purple-600 px-4 py-2 rounded-xl font-semibold hover:bg-purple-50 transition-colors"
                  >
                    Create Room
                  </button>
                  <button
                    onClick={() => navigate('match-lobby')}
                    className="bg-purple-800 text-white px-4 py-2 rounded-xl font-semibold hover:bg-purple-900 transition-colors"
                  >
                    Join Room
                  </button>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            </div>
          </div>

          {/* Recent Matches */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Recent Battles</h3>
              <button className="text-blue-400 hover:text-blue-300 text-sm font-semibold">
                View All
              </button>
            </div>
            
            {recentMatches.length > 0 ? (
              <div className="space-y-4">
                {recentMatches.map((match, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl">
                    <div className="flex items-center gap-4">
                      <Avatar theme="ninja" color={match.result === 'Victory' ? 'green' : 'red'} size="sm" />
                      <div>
                        <div className="font-semibold text-white">vs {match.opponent}</div>
                        <div className="text-gray-400 text-sm">{match.problem}</div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`font-semibold ${
                        match.result === 'Victory' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {match.result}
                      </div>
                      <div className="text-gray-400 text-sm">{match.time}</div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`font-semibold ${
                        match.result === 'Victory' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {match.result === 'Victory' ? `+${match.coinsEarned}` : `-${match.coinsLost}`}
                      </div>
                      <div className="text-gray-400 text-sm">coins</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-white mb-2">No battles yet</h4>
                <p className="text-gray-400 mb-6">Start your first battle to see your match history</p>
                <button
                  onClick={() => navigate('match-lobby')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Start Your First Battle
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDashboard;