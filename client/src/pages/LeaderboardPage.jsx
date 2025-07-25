import React, { useState, useEffect } from 'react';
import { Zap, Trophy, Medal, Crown, ArrowLeft, Filter, Search, TrendingUp, Calendar, Users } from 'lucide-react';

const LeaderboardPage = ({ navigate, user }) => {
  const [activeTab, setActiveTab] = useState('weekly');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRank, setSelectedRank] = useState('all');

  // Mock leaderboard data
  const leaderboardData = {
    weekly: [
      { rank: 1, name: "CodeMaster_X", wins: 127, winRate: 94, streak: 15, avatar: "CM", tier: "Grandmaster" },
      { rank: 2, name: "AlgoQueen", wins: 115, winRate: 89, streak: 12, avatar: "AQ", tier: "Master" },
      { rank: 3, name: "ByteWarrior", wins: 98, winRate: 85, streak: 8, avatar: "BW", tier: "Diamond" },
      { rank: 4, name: "SyntaxSlayer", wins: 87, winRate: 82, streak: 5, avatar: "SS", tier: "Diamond" },
      { rank: 5, name: "LogicLord", wins: 72, winRate: 78, streak: 3, avatar: "LL", tier: "Platinum" },
      { rank: 6, name: "DebugDemon", wins: 68, winRate: 76, streak: 7, avatar: "DD", tier: "Platinum" },
      { rank: 7, name: "ArrayAce", wins: 63, winRate: 74, streak: 4, avatar: "AA", tier: "Gold" },
      { rank: 8, name: "LoopLegend", wins: 59, winRate: 72, streak: 2, avatar: "LL", tier: "Gold" },
      { rank: 9, name: "HashHero", wins: 54, winRate: 69, streak: 6, avatar: "HH", tier: "Gold" },
      { rank: 10, name: "TreeTitan", wins: 51, winRate: 67, streak: 1, avatar: "TT", tier: "Silver" },
      { rank: 11, name: "GraphGuru", wins: 47, winRate: 65, streak: 0, avatar: "GG", tier: "Silver" },
      { rank: 12, name: "DPDynamo", wins: 43, winRate: 62, streak: 3, avatar: "DP", tier: "Silver" },
      { rank: 13, name: "StackSensei", wins: 39, winRate: 60, streak: 2, avatar: "SS", tier: "Bronze" },
      { rank: 14, name: "QueueQueen", wins: 35, winRate: 58, streak: 1, avatar: "QQ", tier: "Bronze" },
      { rank: 15, name: "HeapHunter", wins: 31, winRate: 55, streak: 0, avatar: "HH", tier: "Bronze" }
    ],
    monthly: [
      { rank: 1, name: "AlgoQueen", wins: 423, winRate: 91, streak: 25, avatar: "AQ", tier: "Grandmaster" },
      { rank: 2, name: "CodeMaster_X", wins: 401, winRate: 89, streak: 18, avatar: "CM", tier: "Grandmaster" },
      { rank: 3, name: "ByteWarrior", wins: 387, winRate: 86, streak: 12, avatar: "BW", tier: "Master" }
    ],
    allTime: [
      { rank: 1, name: "CodeMaster_X", wins: 2847, winRate: 87, streak: 45, avatar: "CM", tier: "Grandmaster" },
      { rank: 2, name: "AlgoQueen", wins: 2756, winRate: 85, streak: 32, avatar: "AQ", tier: "Grandmaster" },
      { rank: 3, name: "LegendaryLeetCoder", wins: 2643, winRate: 83, streak: 28, avatar: "LL", tier: "Grandmaster" }
    ]
  };

  const getTierColor = (tier) => {
    const colors = {
      'Grandmaster': 'from-purple-600 to-pink-600',
      'Master': 'from-red-600 to-orange-600',
      'Diamond': 'from-cyan-500 to-blue-600',
      'Platinum': 'from-emerald-500 to-teal-600',
      'Gold': 'from-yellow-500 to-amber-600',
      'Silver': 'from-gray-400 to-gray-600',
      'Bronze': 'from-amber-700 to-orange-800'
    };
    return colors[tier] || 'from-gray-600 to-gray-700';
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
  };

  const filteredData = leaderboardData[activeTab].filter(player => 
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedRank === 'all' || player.tier.toLowerCase() === selectedRank.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      {/* Header */}
      <header className="relative z-50 px-6 py-6 border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* CodeClash Logo */}
          <button 
            onClick={() => navigate('landing')}
            className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Zap className="w-6 h-6 text-white" />
            <span className="text-xl font-bold text-white">CodeClash</span>
          </button>
          
          {/* Navigation */}
          <div className="flex items-center gap-6">
            {user && (
              <button 
                onClick={() => navigate('dashboard')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Dashboard
              </button>
            )}
            <button 
              onClick={() => navigate('landing')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Global <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Leaderboard</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            See where you rank among the coding elite. Climb your way to the top and become a legend.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Time Period Tabs */}
            <div className="flex bg-gray-700/50 rounded-xl p-1">
              {[
                { key: 'weekly', label: 'This Week', icon: Calendar },
                { key: 'monthly', label: 'This Month', icon: TrendingUp },
                { key: 'allTime', label: 'All Time', icon: Trophy }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === key
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-gray-600/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Search and Filter */}
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search warriors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 w-64"
                />
              </div>
              
              <select
                value={selectedRank}
                onChange={(e) => setSelectedRank(e.target.value)}
                className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Ranks</option>
                <option value="grandmaster">Grandmaster</option>
                <option value="master">Master</option>
                <option value="diamond">Diamond</option>
                <option value="platinum">Platinum</option>
                <option value="gold">Gold</option>
                <option value="silver">Silver</option>
                <option value="bronze">Bronze</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6 border border-blue-500/30">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-400" />
              <div>
                <div className="text-2xl font-bold text-white">12,847</div>
                <div className="text-blue-300">Active Warriors</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-600/20 to-teal-600/20 rounded-xl p-6 border border-green-500/30">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-white">1.2M+</div>
                <div className="text-green-300">Battles Fought</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-xl p-6 border border-yellow-500/30">
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8 text-yellow-400" />
              <div>
                <div className="text-2xl font-bold text-white">247</div>
                <div className="text-yellow-300">Grandmasters</div>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-4">
            <h3 className="text-xl font-bold text-white text-center flex items-center justify-center gap-2">
              <Trophy className="w-6 h-6" />
              {activeTab === 'weekly' && 'TOP WARRIORS THIS WEEK'}
              {activeTab === 'monthly' && 'TOP WARRIORS THIS MONTH'}
              {activeTab === 'allTime' && 'LEGENDARY HALL OF FAME'}
            </h3>
          </div>
          
          {/* Table */}
          <div className="divide-y divide-gray-700/50">
            {filteredData.map((player, index) => (
              <div 
                key={player.rank} 
                className={`flex items-center justify-between p-4 hover:bg-gray-700/30 transition-colors ${
                  user && player.name === user.name ? 'bg-blue-600/10 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Rank */}
                  <div className="w-12 flex items-center justify-center">
                    {getRankIcon(player.rank)}
                  </div>
                  
                  {/* Avatar */}
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getTierColor(player.tier)} flex items-center justify-center text-white font-bold shadow-lg`}>
                    {player.avatar}
                  </div>
                  
                  {/* Player Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-semibold text-lg">{player.name}</span>
                      {user && player.name === user.name && (
                        <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">YOU</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getTierColor(player.tier)} text-white`}>
                        {player.tier}
                      </span>
                      <span>Win Rate: {player.winRate}%</span>
                      <span>Streak: {player.streak}</span>
                    </div>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400">{player.wins}</div>
                  <div className="text-sm text-gray-400">wins</div>
                </div>
              </div>
            ))}
          </div>
          
          {/* No Results */}
          {filteredData.length === 0 && (
            <div className="p-12 text-center">
              <div className="text-gray-400 text-lg">No warriors found matching your criteria</div>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedRank('all');
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Your Rank (if logged in) */}
        {user && (
          <div className="mt-8 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl border border-blue-500/30 p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              Your Current Ranking
            </h3>
            
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">#47</div>
                <div className="text-gray-400">Global Rank</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">{user.winRate}%</div>
                <div className="text-gray-400">Win Rate</div>
              </div>
              <div className="text-3xl font-bold text-orange-400 text-center">
                <div>{user.winStreak}</div>
                <div className="text-gray-400 text-base">Current Streak</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">{user.totalMatches}</div>
                <div className="text-gray-400">Total Battles</div>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <button 
                onClick={() => navigate('dashboard')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105"
              >
                Start New Battle
              </button>
            </div>
          </div>
        )}

        {/* Call to Action for Non-logged Users */}
        {!user && (
          <div className="mt-8 text-center bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Join the Rankings?</h3>
            <p className="text-gray-300 mb-6">Create your account and start climbing the leaderboard today!</p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => navigate('register')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105"
              >
                Create Account
              </button>
              <button 
                onClick={() => navigate('login')}
                className="px-6 py-3 border-2 border-blue-500 text-blue-400 font-semibold rounded-xl hover:bg-blue-500 hover:text-white transition-all transform hover:scale-105"
              >
                Sign In
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default LeaderboardPage;
