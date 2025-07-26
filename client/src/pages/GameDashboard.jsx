import React, { useState } from 'react';
import { 
  Zap, Users, Trophy, Clock, Target, Plus, 
  LogOut, Settings, BarChart3, Crown
} from 'lucide-react';
import Avatar from '../components/ui/Avatar';

const GameDashboard = ({ navigate, user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const quickStats = [
    { label: 'Rank', value: user?.rank || 'Bronze I', icon: Crown, color: 'text-yellow-400' },
    { label: 'Wins', value: user?.wins || 0, icon: Trophy, color: 'text-green-400' },
    { label: 'Win Rate', value: `${user?.winRate || 0}%`, icon: BarChart3, color: 'text-blue-400' },
    { label: 'Coins', value: user?.coins || 100, icon: Zap, color: 'text-yellow-400' }
  ];

  const recentMatches = [
    { id: 1, opponent: 'CodeNinja', result: 'win', problem: 'Two Sum', time: '2:34' },
    { id: 2, opponent: 'AlgoMaster', result: 'loss', problem: 'Valid Parentheses', time: '4:12' },
    { id: 3, opponent: 'PyGuru', result: 'win', problem: 'Reverse String', time: '1:45' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <header className="relative z-50 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('landing')}
              className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors"
            >
              <Zap className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold">CodeClash</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-gray-800/50 rounded-xl px-4 py-2">
              <Avatar 
                theme={user?.avatarTheme || 'coder'} 
                color={user?.avatarColor || 'blue'} 
                size="sm" 
              />
              <div className="text-left">
                <div className="text-white font-semibold">{user?.username || 'CodeWarrior'}</div>
                <div className="text-gray-400 text-sm">{user?.rank || 'Bronze I'}</div>
              </div>
              <div className="text-yellow-400 font-bold flex items-center gap-1">
                <Zap className="w-4 h-4" />
                {user?.coins || 100}
              </div>
            </div>
            
            <button
              onClick={() => navigate('landing')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
            
            <button
              onClick={onLogout}
              className="text-gray-400 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, {user?.displayName || user?.username || 'CodeWarrior'}!
            </h1>
            <p className="text-gray-400">Ready for your next coding battle?</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {quickStats.map((stat, index) => (
              <div key={index} className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 text-center">
                <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-2`} />
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Main Action Buttons */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Quick Match */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-center hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 cursor-pointer">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Quick Match</h3>
              <p className="text-blue-100 mb-4">Get matched with random opponents instantly</p>
              <button 
                onClick={() => navigate('match-lobby')}
                className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
              >
                Find Opponent
              </button>
            </div>

            {/* Private Room */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-8 text-center hover:from-purple-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105 cursor-pointer">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Private Room</h3>
              <p className="text-purple-100 mb-4">Create or join a room to battle friends</p>
              <div className="flex gap-2 justify-center">
                <button 
                  onClick={() => navigate('match-lobby')}
                  className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Create Room
                </button>
                <button 
                  onClick={() => navigate('match-lobby')}
                  className="bg-purple-800 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-900 transition-colors"
                >
                  Join Room
                </button>
              </div>
            </div>
          </div>

          {/* Recent Matches */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Recent Matches</h3>
              <button 
                onClick={() => navigate('match-history')}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                View All
              </button>
            </div>

            {recentMatches.length > 0 ? (
              <div className="space-y-3">
                {recentMatches.map((match) => (
                  <div key={match.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${
                        match.result === 'win' ? 'bg-green-400' : 'bg-red-400'
                      }`} />
                      <div>
                        <div className="text-white font-semibold">vs {match.opponent}</div>
                        <div className="text-gray-400 text-sm">{match.problem}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${
                        match.result === 'win' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {match.result === 'win' ? 'Victory' : 'Defeat'}
                      </div>
                      <div className="text-gray-400 text-sm flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {match.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No matches yet</p>
                <button 
                  onClick={() => navigate('match-lobby')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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