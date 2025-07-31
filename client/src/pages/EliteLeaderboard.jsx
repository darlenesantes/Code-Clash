/**
 * Elite Leaderboard Page
 * File: client/src/pages/EliteLeaderboard.jsx
 * Professional rankings with cash prizes
 */

import React, { useState } from 'react';
import { 
  Crown, DollarSign, Trophy, Medal, Flag, TrendingUp,
  ArrowLeft, Users, Target, Star, ChevronUp, ChevronDown
} from 'lucide-react';

const EliteLeaderboard = ({ navigate }) => {
  const [activeTab, setActiveTab] = useState('global');
  const [timeFrame, setTimeFrame] = useState('monthly');

  // Mock elite leaderboard data
  const leaderboardData = [
    {
      rank: 1,
      prevRank: 2,
      username: 'CodeMaster_Elite',
      realName: 'Alex Chen',
      country: 'USA',
      tier: 'GRANDMASTER',
      rating: 3247,
      tournaments: 24,
      wins: 18,
      winRate: 75.0,
      totalEarnings: 127500,
      monthlyEarnings: 15000,
      currentStreak: 8,
      achievements: ['World Champion 2024', 'Perfect Season', 'Speed Demon'],
      sponsorships: ['TechCorp', 'DevTools Inc'],
      isVerified: true,
      isPro: true
    },
    {
      rank: 2,
      prevRank: 1,
      username: 'AlgoWizard_Pro',
      realName: 'Sarah Kim',
      country: 'South Korea',
      tier: 'GRANDMASTER',
      rating: 3198,
      tournaments: 28,
      wins: 19,
      winRate: 67.9,
      totalEarnings: 98750,
      monthlyEarnings: 12000,
      currentStreak: 5,
      achievements: ['Algorithm Master', 'Consistency King'],
      sponsorships: ['CodeAcademy'],
      isVerified: true,
      isPro: true
    },
    {
      rank: 3,
      prevRank: 4,
      username: 'ByteNinja_X',
      realName: 'Hiroshi Tanaka',
      country: 'Japan',
      tier: 'INTERNATIONAL_MASTER',
      rating: 3156,
      tournaments: 31,
      wins: 17,
      winRate: 54.8,
      totalEarnings: 76250,
      monthlyEarnings: 8500,
      currentStreak: 3,
      achievements: ['Performance Beast', 'Marathon Runner'],
      sponsorships: [],
      isVerified: true,
      isPro: true
    },
    {
      rank: 4,
      prevRank: 3,
      username: 'DataStruct_God',
      realName: 'Priya Sharma',
      country: 'India',
      tier: 'INTERNATIONAL_MASTER',
      rating: 3089,
      tournaments: 22,
      wins: 14,
      winRate: 63.6,
      totalEarnings: 54320,
      monthlyEarnings: 6200,
      currentStreak: 2,
      achievements: ['Data Structures Expert', 'Rising Talent'],
      sponsorships: ['StartupTech'],
      isVerified: true,
      isPro: false
    },
    {
      rank: 5,
      prevRank: 6,
      username: 'OptimalPath_AI',
      realName: 'Marcus Weber',
      country: 'Germany',
      tier: 'MASTER',
      rating: 2987,
      tournaments: 19,
      wins: 11,
      winRate: 57.9,
      totalEarnings: 43750,
      monthlyEarnings: 4800,
      currentStreak: 4,
      achievements: ['Optimization Master', 'Steady Climber'],
      sponsorships: [],
      isVerified: false,
      isPro: false
    }
  ];

  const seasonInfo = {
    name: 'Season 2025 - Championship Series',
    currentWeek: 32,
    totalWeeks: 52,
    participants: 45230,
    totalTournaments: 156
  };

  const prizePool = {
    total: 2500000,
    distributed: 1750000,
    remaining: 750000,
    topPrizes: {
      first: 500000,
      second: 300000,
      third: 150000,
      topTen: 50000
    }
  };

  const formatCurrency = (amount) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount.toLocaleString()}`;
  };

  const getTierConfig = (tier) => {
    const configs = {
      GRANDMASTER: { color: 'from-purple-500 to-pink-500', icon: Crown },
      INTERNATIONAL_MASTER: { color: 'from-yellow-500 to-orange-500', icon: Trophy },
      MASTER: { color: 'from-blue-500 to-cyan-500', icon: Medal },
      EXPERT: { color: 'from-green-500 to-teal-500', icon: Star },
      SPECIALIST: { color: 'from-gray-500 to-gray-600', icon: Target }
    };
    return configs[tier] || configs.SPECIALIST;
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
    return <span className="text-lg font-bold text-white">#{rank}</span>;
  };

  const getRankChange = (rank, prevRank) => {
    if (prevRank === rank) return <span className="text-gray-400 text-sm">-</span>;
    if (prevRank > rank) {
      return (
        <div className="flex items-center text-green-400 text-sm">
          <ChevronUp className="h-4 w-4" />
          <span>{prevRank - rank}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center text-red-400 text-sm">
        <ChevronDown className="h-4 w-4" />
        <span>{rank - prevRank}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('dashboard')}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Elite Leaderboard</h1>
          <p className="text-gray-300 text-lg">Top competitive programmers competing for cash prizes</p>
        </div>

        {/* Season Information */}
        <div className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-xl p-6 border border-purple-700 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{seasonInfo.name}</h2>
              <div className="flex items-center space-x-4 text-purple-200">
                <span>Week {seasonInfo.currentWeek} of {seasonInfo.totalWeeks}</span>
                <span>•</span>
                <span>{formatCurrency(seasonInfo.participants)} Players</span>
                <span>•</span>
                <span>{seasonInfo.totalTournaments} Tournaments</span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="h-5 w-5 text-yellow-400" />
                <span className="text-2xl font-bold text-white">{formatCurrency(prizePool.total)}</span>
              </div>
              <p className="text-purple-200 text-sm">Total Prize Pool</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-black/20 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-yellow-400">{formatCurrency(prizePool.topPrizes.first)}</p>
              <p className="text-purple-200 text-sm">Champion Prize</p>
            </div>
            <div className="bg-black/20 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-gray-300">{formatCurrency(prizePool.topPrizes.second)}</p>
              <p className="text-purple-200 text-sm">Runner-up</p>
            </div>
            <div className="bg-black/20 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-amber-400">{formatCurrency(prizePool.topPrizes.third)}</p>
              <p className="text-purple-200 text-sm">Third Place</p>
            </div>
            <div className="bg-black/20 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-blue-400">{formatCurrency(prizePool.topPrizes.topTen)}</p>
              <p className="text-purple-200 text-sm">Top 10 Each</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-800 rounded-xl p-1 mb-6 w-fit">
          {[
            { id: 'global', label: 'Global Rankings', icon: Crown },
            { id: 'regional', label: 'Regional', icon: Flag },
            { id: 'rising', label: 'Rising Stars', icon: TrendingUp }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Time Frame Filter */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-gray-300 font-semibold">Time Frame:</span>
            <div className="flex space-x-2">
              {['weekly', 'monthly', 'seasonal', 'all-time'].map((frame) => (
                <button
                  key={frame}
                  onClick={() => setTimeFrame(frame)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    timeFrame === frame
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {frame.charAt(0).toUpperCase() + frame.slice(1).replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="space-y-4">
          {leaderboardData.map((player) => {
            const tierConfig = getTierConfig(player.tier);
            const TierIcon = tierConfig.icon;

            return (
              <div 
                key={player.username}
                className={`bg-gray-800 rounded-xl p-6 border transition-all duration-300 hover:bg-gray-750 ${
                  player.rank <= 3 
                    ? 'border-yellow-500/30 shadow-lg' 
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  {/* Rank and Player Info */}
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-center">
                      {getRankIcon(player.rank)}
                      {getRankChange(player.rank, player.prevRank)}
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${tierConfig.color} p-1`}>
                          <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                              {player.username.charAt(0)}
                            </div>
                          </div>
                        </div>
                        {player.isVerified && (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-gray-800">
                            <Star className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-xl font-bold text-white">{player.username}</h3>
                          {player.isPro && (
                            <span className="px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs rounded-full font-semibold">
                              PRO
                            </span>
                          )}
                          <div className="flex items-center space-x-1">
                            <Flag className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-400 text-sm">{player.country}</span>
                          </div>
                        </div>
                        <p className="text-gray-400 mb-2">{player.realName}</p>
                        <div className="flex items-center space-x-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${tierConfig.color} text-white flex items-center space-x-1`}>
                            <TierIcon className="h-3 w-3" />
                            <span>{player.tier.replace('_', ' ')}</span>
                          </span>
                          <div className="flex items-center space-x-1">
                            <Target className="h-4 w-4 text-yellow-400" />
                            <span className="text-white font-semibold">{player.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-right">
                    <div>
                      <p className="text-2xl font-bold text-green-400">{formatCurrency(player.totalEarnings)}</p>
                      <p className="text-gray-400 text-sm">Total Earnings</p>
                      <p className="text-green-300 text-xs">+{formatCurrency(player.monthlyEarnings)} this month</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-400">{player.wins}/{player.tournaments}</p>
                      <p className="text-gray-400 text-sm">Wins/Tournaments</p>
                      <p className="text-blue-300 text-xs">{player.winRate.toFixed(1)}% win rate</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-400">{player.currentStreak}</p>
                      <p className="text-gray-400 text-sm">Win Streak</p>
                      <p className="text-purple-300 text-xs">Rating: {player.rating}</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-400">{player.achievements.length}</p>
                      <p className="text-gray-400 text-sm">Achievements</p>
                      <p className="text-orange-300 text-xs">{player.sponsorships.length} sponsors</p>
                    </div>
                  </div>
                </div>

                {/* Achievements and Sponsors */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {player.achievements.slice(0, 3).map((achievement, idx) => (
                        <span key={idx} className="px-2 py-1 bg-yellow-900/50 text-yellow-300 text-xs rounded border border-yellow-700">
                          {achievement}
                        </span>
                      ))}
                    </div>
                    
                    {player.sponsorships.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400 text-sm">Sponsored by:</span>
                        <div className="flex space-x-1">
                          {player.sponsorships.map((sponsor, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs rounded font-semibold">
                              {sponsor}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Load More */}
        <div className="mt-8 text-center">
          <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity">
            Load More Rankings
          </button>
        </div>
      </div>
    </div>
  );
};

export default EliteLeaderboard;