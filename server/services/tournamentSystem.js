/**
 * Tournaments Page
 * File: client/src/pages/tournaments/Tournaments.jsx
 * Updated for Season 2025 with enhanced features
 */
import React, { useState } from 'react';
import { ArrowLeft, Trophy, DollarSign, Users, Calendar, Clock, Star, Crown, Target, Zap, Award, TrendingUp } from 'lucide-react';
import BackButton from '../../components/ui/BackButton';

const Tournaments = ({ navigate }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('all');

  // Season 2025 Tournament Data
  const tournaments = [
    {
      id: 'elite-2025',
      name: 'Elite Championship Series 2025',
      prizePool: '$500,000',
      startTime: 'Starts in 2 hours',
      participants: '3,247',
      maxParticipants: '5,000',
      difficulty: 'Expert',
      status: 'upcoming',
      category: 'championship',
      duration: '3 hours',
      problems: 5,
      languages: ['JavaScript', 'Python', 'Java', 'C++', 'Go'],
      description: 'The ultimate coding championship for Season 2025. Top 100 coders compete for the largest prize pool in competitive programming history.',
      sponsors: ['Google', 'Microsoft', 'Meta'],
      features: ['Live streaming', 'Real-time leaderboard', 'Expert commentary', 'Post-match analysis']
    },
    {
      id: 'algo-masters-2025',
      name: 'Algorithm Masters Cup 2025',
      prizePool: '$250,000',
      startTime: 'Starts in 1 day',
      participants: '2,156',
      maxParticipants: '3,000',
      difficulty: 'Advanced',
      status: 'upcoming',
      category: 'algorithm',
      duration: '2.5 hours',
      problems: 4,
      languages: ['Python', 'Java', 'C++'],
      description: 'Focus on advanced algorithms and data structures. Perfect for coders looking to master complex algorithmic challenges.',
      sponsors: ['Amazon', 'Citadel'],
      features: ['Algorithm focus', 'Educational content', 'Mentor feedback']
    },
    {
      id: 'speed-coding-2025',
      name: 'Speed Coding Challenge 2025',
      prizePool: '$100,000',
      startTime: 'Starts in 3 days',
      participants: '4,891',
      maxParticipants: '10,000',
      difficulty: 'Intermediate',
      status: 'upcoming',
      category: 'speed',
      duration: '1 hour',
      problems: 8,
      languages: ['JavaScript', 'Python', 'Java', 'C++', 'TypeScript'],
      description: 'Fast-paced coding competition focusing on quick problem-solving skills. Multiple short problems to test coding speed.',
      sponsors: ['Stripe', 'OpenAI'],
      features: ['High-speed format', 'Multiple problems', 'Quick rounds']
    },
    {
      id: 'weekly-bronze-2025',
      name: 'Weekly Bronze Cup 2025',
      prizePool: '$25,000',
      startTime: 'Live now',
      participants: '1,534',
      maxParticipants: '2,000',
      difficulty: 'Beginner',
      status: 'active',
      category: 'weekly',
      duration: '1.5 hours',
      problems: 3,
      languages: ['JavaScript', 'Python'],
      description: 'Perfect entry point for new competitive programmers. Weekly tournament with beginner-friendly problems.',
      sponsors: ['NVIDIA'],
      features: ['Beginner friendly', 'Weekly format', 'Learning resources']
    },
    {
      id: 'team-battle-2025',
      name: 'Team Battle Championship 2025',
      prizePool: '$300,000',
      startTime: 'Starts in 5 days',
      participants: '567 teams',
      maxParticipants: '1,000 teams',
      difficulty: 'Expert',
      status: 'upcoming',
      category: 'team',
      duration: '4 hours',
      problems: 6,
      languages: ['JavaScript', 'Python', 'Java', 'C++', 'Go', 'Rust'],
      description: 'Ultimate team competition where groups of 3-5 coders collaborate to solve complex challenges.',
      sponsors: ['Apple', 'Two Sigma'],
      features: ['Team collaboration', 'Extended duration', 'Complex problems', 'Communication tools']
    },
    {
      id: 'ai-ml-challenge-2025',
      name: 'AI/ML Coding Challenge 2025',
      prizePool: '$150,000',
      startTime: 'Starts in 1 week',
      participants: '1,823',
      maxParticipants: '3,000',
      difficulty: 'Advanced',
      status: 'upcoming',
      category: 'specialty',
      duration: '3 hours',
      problems: 4,
      languages: ['Python', 'R', 'Julia'],
      description: 'Specialized tournament focusing on machine learning algorithms and AI problem-solving techniques.',
      sponsors: ['OpenAI', 'NVIDIA'],
      features: ['AI/ML focus', 'Research problems', 'Industry relevance']
    }
  ];

  const filteredTournaments = tournaments.filter(tournament => {
    const categoryMatch = selectedCategory === 'all' || tournament.category === selectedCategory;
    const skillMatch = selectedSkillLevel === 'all' || tournament.difficulty.toLowerCase() === selectedSkillLevel;
    return categoryMatch && skillMatch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'upcoming': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'finished': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-500/20 text-green-400';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400';
      case 'advanced': return 'bg-orange-500/20 text-orange-400';
      case 'expert': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const registerForTournament = (tournamentId) => {
    // Tournament registration logic
    console.log('Registered for tournament:', tournamentId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        <BackButton navigate={() => navigate('dashboard')} />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Tournaments</h1>
          <p className="text-gray-300 text-lg">Season 2025 - Compete in cash prize tournaments and climb the rankings</p>
        </div>

        {/* Season 2025 Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl p-6 text-white">
            <Trophy className="w-8 h-8 mb-3" />
            <h3 className="text-2xl font-bold">$2.5M+</h3>
            <p className="text-yellow-100">Season 2025 Prize Pool</p>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white">
            <Users className="w-8 h-8 mb-3" />
            <h3 className="text-2xl font-bold">47,000+</h3>
            <p className="text-blue-100">Active Competitors</p>
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
            <Crown className="w-8 h-8 mb-3" />
            <h3 className="text-2xl font-bold">156</h3>
            <p className="text-purple-100">Weekly Tournaments</p>
          </div>

          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
            <TrendingUp className="w-8 h-8 mb-3" />
            <h3 className="text-2xl font-bold">+23%</h3>
            <p className="text-green-100">Participation Growth</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700"
              >
                <option value="all">All Categories</option>
                <option value="championship">Championship</option>
                <option value="algorithm">Algorithm Focus</option>
                <option value="speed">Speed Coding</option>
                <option value="weekly">Weekly Series</option>
                <option value="team">Team Battles</option>
                <option value="specialty">Specialty</option>
              </select>
              
              <select 
                value={selectedSkillLevel}
                onChange={(e) => setSelectedSkillLevel(e.target.value)}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700"
              >
                <option value="all">All Skill Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            
            <div className="text-white">
              <span className="text-gray-400">Showing:</span> {filteredTournaments.length} tournaments
            </div>
          </div>
        </div>

        {/* Tournament Cards */}
        <div className="space-y-6">
          {filteredTournaments.map((tournament) => (
            <div key={tournament.id} className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
              {/* Tournament Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-2xl font-bold text-white">{tournament.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(tournament.status)}`}>
                      {tournament.status === 'active' ? 'LIVE' : tournament.status.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(tournament.difficulty)}`}>
                      {tournament.difficulty}
                    </span>
                  </div>
                  
                  <p className="text-gray-300 mb-4 max-w-3xl">{tournament.description}</p>
                  
                  {/* Tournament Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="w-5 h-5 text-green-400" />
                      <div>
                        <p className="text-lg font-bold text-green-400">{tournament.prizePool}</p>
                        <p className="text-sm text-gray-400">Prize Pool</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-lg font-bold text-white">{tournament.participants}</p>
                        <p className="text-sm text-gray-400">Registered</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-orange-400" />
                      <div>
                        <p className="text-lg font-bold text-white">{tournament.duration}</p>
                        <p className="text-sm text-gray-400">Duration</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Target className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-lg font-bold text-white">{tournament.problems}</p>
                        <p className="text-sm text-gray-400">Problems</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right ml-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Clock className="w-5 h-5 text-orange-400" />
                    <span className={`text-lg font-bold ${
                      tournament.status === 'active' ? 'text-green-400' : 'text-orange-400'
                    }`}>
                      {tournament.startTime}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => registerForTournament(tournament.id)}
                    className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 ${
                      tournament.status === 'active'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {tournament.status === 'active' ? 'Join Now' : 'Register'}
                  </button>
                </div>
              </div>

              {/* Tournament Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-700/30">
                {/* Languages */}
                <div>
                  <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span>Supported Languages</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {tournament.languages.map((lang) => (
                      <span key={lang} className="px-3 py-1 bg-gray-700/50 text-gray-300 rounded-full text-sm">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
                    <Star className="w-4 h-4 text-blue-400" />
                    <span>Features</span>
                  </h4>
                  <div className="space-y-1">
                    {tournament.features.map((feature) => (
                      <div key={feature} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sponsors */}
                <div>
                  <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
                    <Award className="w-4 h-4 text-green-400" />
                    <span>Sponsors</span>
                  </h4>
                  <div className="space-y-1">
                    {tournament.sponsors.map((sponsor) => (
                      <div key={sponsor} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-gray-300 text-sm">{sponsor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tournament Categories */}
        <div className="mt-12 bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-8">
          <h3 className="text-2xl font-bold text-white mb-6">Tournament Categories</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-6 text-center">
              <Trophy className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h4 className="text-xl font-bold text-white mb-2">Weekly Championships</h4>
              <p className="text-green-100 mb-3">$25K-$500K prize pools</p>
              <p className="text-sm text-green-200">Every week • All skill levels</p>
            </div>

            <div className="bg-gradient-to-br from-purple-600/20 to-violet-600/20 border border-purple-500/30 rounded-xl p-6 text-center">
              <Crown className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h4 className="text-xl font-bold text-white mb-2">Season Championships</h4>
              <p className="text-purple-100 mb-3">$500K-$2.5M prize pools</p>
              <p className="text-sm text-purple-200">Quarterly • Expert level only</p>
            </div>

            <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-xl p-6 text-center">
              <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h4 className="text-xl font-bold text-white mb-2">Team Battles</h4>
              <p className="text-blue-100 mb-3">$100K-$300K prize pools</p>
              <p className="text-sm text-blue-200">Monthly • Teams of 3-5</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tournaments;