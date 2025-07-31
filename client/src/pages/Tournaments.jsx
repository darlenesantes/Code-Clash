/**
 * Tournaments Page - Season 2025
 * File: client/src/pages/Tournaments.jsx
 */
import React, { useState } from 'react';
import { ArrowLeft, Trophy, DollarSign, Users, Calendar, Clock, Target } from 'lucide-react';

const Tournaments = ({ navigate }) => {
  const tournaments2025 = [
    {
      name: 'Elite Championship Series 2025',
      prizePool: '$500,000',
      startTime: 'Starts in 2 hours',
      participants: '3,247',
      difficulty: 'Expert',
      status: 'upcoming'
    },
    {
      name: 'Algorithm Masters Cup 2025',
      prizePool: '$250,000',
      startTime: 'Starts in 1 day',
      participants: '2,156',
      difficulty: 'Advanced',
      status: 'upcoming'
    },
    {
      name: 'Speed Coding Challenge 2025',
      prizePool: '$100,000',
      startTime: 'Starts in 3 days',
      participants: '4,891',
      difficulty: 'Intermediate',
      status: 'upcoming'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('dashboard')}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Tournaments</h1>
          <p className="text-gray-300 text-lg">Season 2025 - Compete in cash prize tournaments and climb the rankings</p>
        </div>

        {/* Tournament Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
            <Trophy className="w-8 h-8 mb-3" />
            <h3 className="text-xl font-bold mb-2">Weekly Championships</h3>
            <p className="text-green-100 mb-3">$25K-$500K prize pools</p>
            <p className="text-sm text-green-200">Every week • All skill levels</p>
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl p-6 text-white">
            <DollarSign className="w-8 h-8 mb-3" />
            <h3 className="text-xl font-bold mb-2">Season Grand Prix</h3>
            <p className="text-purple-100 mb-3">$500K-$2.5M prize pools</p>
            <p className="text-sm text-purple-200">Quarterly • Expert level</p>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white">
            <Users className="w-8 h-8 mb-3" />
            <h3 className="text-xl font-bold mb-2">Team Battles</h3>
            <p className="text-blue-100 mb-3">$100K-$300K prize pools</p>
            <p className="text-sm text-blue-200">Monthly • Teams of 3-5</p>
          </div>
        </div>

        {/* Active Tournaments */}
        <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <h3 className="text-xl font-bold text-white mb-6">Active & Upcoming Tournaments - Season 2025</h3>
          
          <div className="space-y-4">
            {tournaments2025.map((tournament, index) => (
              <div key={index} className="flex items-center justify-between p-6 bg-gray-800/30 rounded-lg border border-gray-700/50">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-xl font-semibold text-white">{tournament.name}</h4>
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400">
                      UPCOMING
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-300">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span>Prize: {tournament.prizePool}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span>{tournament.participants} players</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Target className="w-4 h-4 text-yellow-400" />
                      <span>{tournament.difficulty}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-1 mb-3">
                    <Clock className="w-4 h-4 text-orange-400" />
                    <span className="text-orange-400 font-semibold">{tournament.startTime}</span>
                  </div>
                  <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
                    Register
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tournaments;