/**
 * Professional Gaming Battle Arena UI
 * File: client/src/pages/BattleArena.jsx
 * Esports-grade competitive programming interface
 */
import React, { useState, useEffect } from 'react'; 
import matchService from '../services/api/matchService';

import { 
  ArrowLeft, Users, Plus, Hash, Play, Code, Clock, ChevronDown, 
  Wifi, Zap, Trophy, Target, Shield, Swords, Activity, 
  Monitor, Server, Globe, Signal, Crown, User
} from 'lucide-react';

// Add this AFTER your imports in GameRoom.jsx
const VictoryPopup = ({ 
  show, 
  onClose, 
  user, 
  opponent, 
  gameStats, 
  rewards,
  isFirstWin = false,
  onUpdateProfile
}) => {
  const [showExplosion, setShowExplosion] = useState(false);
  const [animatedCash, setAnimatedCash] = useState(0);
  const [animatedCoins, setAnimatedCoins] = useState(0);

  // Enhanced rewards with real money conversion
  const defaultRewards = {
    coins: isFirstWin ? 250 : 150,
    cash: isFirstWin ? 1.25 : 0.75,
    xp: isFirstWin ? 200 : 125,
    rankPoints: isFirstWin ? 75 : 35,
    achievements: isFirstWin ? ['First Victory', 'Code Warrior'] : [],
    bonusMultiplier: Math.random() > 0.7 ? 1.5 : 1.0
  };

  const finalRewards = rewards || defaultRewards;
  const finalCash = (finalRewards.cash * finalRewards.bonusMultiplier).toFixed(2);
  const finalCoins = Math.floor(finalRewards.coins * finalRewards.bonusMultiplier);

  const tournamentData = {
    name: "Weekly Championship",
    prize: "$10,000",
    participants: "2,847",
    timeLeft: "2h 15m",
    entryFee: "$5.00",
    yourRank: "#47"
  };

  useEffect(() => {
    if (show) {
      setShowExplosion(true);
      setTimeout(() => animateCounter(setAnimatedCash, parseFloat(finalCash)), 1200);
      setTimeout(() => animateCounter(setAnimatedCoins, finalCoins), 1400);
    }
  }, [show, finalCash, finalCoins]);

  const animateCounter = (setter, target) => {
    let current = 0;
    const increment = target / 30;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setter(target);
        clearInterval(timer);
      } else {
        setter(typeof target === 'number' && target < 10 ? parseFloat(current.toFixed(2)) : Math.floor(current));
      }
    }, 30);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* EXPLOSIVE Confetti Effect */}
      {showExplosion && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(80)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${1 + Math.random() * 3}s`
              }}
            >
              <div className={`w-3 h-3 rounded-full shadow-lg ${
                ['bg-yellow-400', 'bg-green-400', 'bg-blue-400', 'bg-purple-400', 'bg-red-400', 'bg-pink-400'][i % 6]
              }`} />
            </div>
          ))}
          
          {/* Money Rain Effect */}
          {[...Array(20)].map((_, i) => (
            <div
              key={`money-${i}`}
              className="absolute text-2xl animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`
              }}
            >
              💰
            </div>
          ))}
        </div>
      )}

      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl border-2 border-yellow-500/50 shadow-2xl max-w-4xl w-full mx-4 overflow-hidden relative">
        {/* Animated border glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-green-500/20 to-purple-500/20 animate-pulse rounded-3xl"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-green-400 to-purple-400 animate-pulse"></div>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-20 p-3 bg-gray-800/80 hover:bg-gray-700/80 rounded-full transition-all duration-200 transform hover:scale-110"
        >
          <X className="w-6 h-6 text-gray-300" />
        </button>

        {/* EPIC Victory Content */}
        <div className="p-8 text-center">
          <div className="mb-8">
            <Trophy className="w-28 h-28 text-yellow-400 mx-auto animate-bounce drop-shadow-2xl mb-6" />
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 mb-4 animate-pulse">
              LEGENDARY WIN!
            </h1>
            <p className="text-2xl text-green-400 font-bold mb-4 animate-bounce">
              🔥 ABSOLUTE DOMINATION! 🔥
            </p>
          </div>

          {/* MASSIVE Cash Display */}
          <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 rounded-3xl p-8 border-2 border-green-500/50 mb-8">
            <h3 className="text-3xl font-black text-white mb-4">CASH EARNED!</h3>
            <div className="text-6xl font-black text-green-400 mb-4">
              ${animatedCash}
            </div>
            <div className="text-lg text-gray-300">
              {finalCoins} Coins = ${finalCash}
            </div>
          </div>

          {/* Tournament Promotion */}
          <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 rounded-3xl p-8 border-2 border-purple-500/50 mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">🏆 TOURNAMENT ALERT!</h3>
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
              WIN {tournamentData.prize}!
            </div>
            <p className="text-purple-300 mb-4">
              {tournamentData.name} starts in {tournamentData.timeLeft}!
            </p>
            <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-200 transform hover:scale-105">
              ENTER TOURNAMENT NOW! ({tournamentData.entryFee})
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-6 px-8 rounded-2xl font-bold text-xl transition-all duration-200 transform hover:scale-105"
            >
              NEXT BATTLE
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-6 px-8 rounded-2xl font-bold text-xl transition-all duration-200"
            >
              DASHBOARD
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Gaming-style Language Selector
const LanguageSelector = ({ selectedLanguage, onLanguageChange, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { id: 'javascript', name: 'JavaScript', color: 'text-yellow-400' },
    { id: 'python', name: 'Python', color: 'text-blue-400' },
    { id: 'java', name: 'Java', color: 'text-orange-400' },
    { id: 'cpp', name: 'C++', color: 'text-purple-400' },
    { id: 'csharp', name: 'C#', color: 'text-green-400' },
    { id: 'go', name: 'Go', color: 'text-cyan-400' },
    { id: 'rust', name: 'Rust', color: 'text-red-400' },
    { id: 'typescript', name: 'TypeScript', color: 'text-blue-300' }
  ];

  const handleLanguageSelect = (languageId) => {
    onLanguageChange(languageId);
    setIsOpen(false);
  };

  const currentLanguage = languages.find(lang => lang.id === selectedLanguage);
  const displayName = currentLanguage ? currentLanguage.name : 'JavaScript';
  const displayColor = currentLanguage ? currentLanguage.color : 'text-yellow-400';

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 bg-gray-800/80 backdrop-blur-sm hover:bg-gray-700/80 text-white px-6 py-3 rounded-xl border border-gray-600/50 hover:border-gray-500/70 transition-all duration-200 min-w-64 shadow-lg hover:shadow-xl"
      >
        <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
        <Code className="w-5 h-5 text-gray-300" />
        <span className={`font-semibold ${displayColor}`}>{displayName}</span>
        <ChevronDown className={`w-5 h-5 transition-transform ml-auto text-gray-400 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-gray-800/95 backdrop-blur-md border border-gray-600/50 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-2">
            {languages.map((language) => (
              <button
                key={language.id}
                onClick={() => handleLanguageSelect(language.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-all duration-200 rounded-lg ${
                  selectedLanguage === language.id
                    ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-blue-500/50'
                    : 'hover:bg-gray-700/50 hover:border hover:border-gray-600/30'
                }`}
              >
                <div className={`w-2 h-2 ${language.color.replace('text-', 'bg-')} rounded-full`}></div>
                <Code className="w-4 h-4 text-gray-400" />
                <span className={`font-medium ${selectedLanguage === language.id ? language.color : 'text-gray-300'}`}>
                  {language.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Gaming Stats Bar Component with Dynamic Updates
const StatsBar = ({ onlineUsers = 2847, activeMatches = 156, serverLoad = 23 }) => {
  const [currentStats, setCurrentStats] = useState({
    online: onlineUsers,
    active: activeMatches,
    load: serverLoad
  });

  useEffect(() => {
    const updateStats = () => {
      setCurrentStats(prev => ({
        online: Math.max(2500, prev.online + Math.floor(Math.random() * 21) - 10), // ±10 users
        active: Math.max(120, prev.active + Math.floor(Math.random() * 11) - 5), // ±5 battles
        load: Math.max(15, Math.min(85, prev.load + Math.floor(Math.random() * 7) - 3)) // ±3% load
      }));
    };

    const interval = setInterval(updateStats, 3000 + Math.random() * 2000); // 3-5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center space-x-8 mb-8">
      <div className="flex items-center space-x-2 text-green-400">
        <Users className="w-4 h-4" />
        <span className="font-mono text-sm">{currentStats.online.toLocaleString()}</span>
        <span className="text-xs text-gray-400">ONLINE</span>
      </div>
      <div className="flex items-center space-x-2 text-blue-400">
        <Activity className="w-4 h-4" />
        <span className="font-mono text-sm">{currentStats.active}</span>
        <span className="text-xs text-gray-400">ACTIVE</span>
      </div>
      <div className="flex items-center space-x-2 text-purple-400">
        <Server className="w-4 h-4" />
        <span className="font-mono text-sm">{currentStats.load}%</span>
        <span className="text-xs text-gray-400">LOAD</span>
      </div>
    </div>
  );
};

const BattleArena = ({ navigate, user, roomCode: initialRoomCode }) => {
  const [roomCode, setRoomCode] = useState(initialRoomCode || '');
  const [difficulty, setDifficulty] = useState('any');
  const [topic, setTopic] = useState('any');
  const [combinations, setCombinations] = useState([]);
  const [optionsLoaded, setOptionsLoaded] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    let active = true;
    matchService.getOptions().then(({ combinations: available }) => {
      if (!active) return;
      setCombinations(available);
      setOptionsLoaded(true);
    }).catch(() => {
      if (active) setCreateError('Unable to load match options. Check the server and refresh.');
    });
    return () => { active = false; };
  }, []);

  const hasProblems = (selectedDifficulty, selectedTopic) => combinations.some((combination) =>
    (selectedDifficulty === 'any' || combination.difficulty === selectedDifficulty) &&
    (selectedTopic === 'any' || combination.topic === selectedTopic)
  );

  const handleCreateRoom = async () => {
    if (isCreating || !hasProblems(difficulty, topic)) return;
    setIsCreating(true);
    setCreateError('');
    try {
      const room = await matchService.createRoom({ difficulty, topic });
      navigate('game-room', { roomCode: room.roomCode, preferences: room.preferences });
    } catch (error) {
      setCreateError(error.message || 'Unable to create the room. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = () => {
    if (roomCode.length >= 4) {
      navigate('game-room', { roomCode: roomCode.toUpperCase(), language: 'javascript' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 relative overflow-hidden">
      {/* Gaming Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(147,51,234,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-purple-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-32 left-40 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
      </div>

      <div className="relative z-10 px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate('dashboard')}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Dashboard</span>
            </button>

          </div>
          
          {/* Title Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <Swords className="w-8 h-8 text-orange-400" />
              <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400">
                BATTLE ARENA
              </h1>
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-xl text-gray-300 font-medium">
              COMPETITIVE PROGRAMMING • REAL-TIME BATTLES • GLOBAL LEADERBOARDS
            </p>
          </div>

          {/* MVP language */}
          <div className="flex justify-center mb-12">
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm text-yellow-300">
              Choose JavaScript or Python inside your match.
            </div>
          </div>

          {/* Main Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Create Room */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-gray-800/40 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center justify-between mb-6">
                  <div className="bg-blue-500/20 p-4 rounded-xl">
                    <Plus className="w-8 h-8 text-blue-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-blue-400 font-mono text-sm">PRIVATE</div>
                    <div className="text-white font-bold">ROOM</div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">CREATE ROOM</h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Create a private two-player room, then share its code with your opponent.
                </p>
                <div className="space-y-4 mb-6">
                  <label className="block text-sm text-gray-300" htmlFor="match-difficulty">
                    Difficulty
                    <select id="match-difficulty" value={difficulty} onChange={(event) => setDifficulty(event.target.value)} disabled={!optionsLoaded || isCreating} className="mt-2 w-full bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-600">
                      {['any', 'easy', 'medium', 'hard'].map((value) => (
                        <option key={value} value={value} disabled={!hasProblems(value, topic)}>
                          {value === 'any' ? 'Any (random)' : value.charAt(0).toUpperCase() + value.slice(1)}{optionsLoaded && !hasProblems(value, topic) ? ' - unavailable' : ''}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm text-gray-300" htmlFor="match-topic">
                    Topic
                    <select id="match-topic" value={topic} onChange={(event) => setTopic(event.target.value)} disabled={!optionsLoaded || isCreating} className="mt-2 w-full bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-600">
                      {['any', ...new Set(combinations.map((combination) => combination.topic))].map((value) => (
                        <option key={value} value={value} disabled={!hasProblems(difficulty, value)}>
                          {value === 'any' ? 'Any (random)' : value.charAt(0).toUpperCase() + value.slice(1)}{!hasProblems(difficulty, value) ? ' - unavailable' : ''}
                        </option>
                      ))}
                    </select>
                  </label>
                  <p className="text-xs text-gray-400">Any chooses randomly from matching problems. Unavailable combinations are disabled.</p>
                  {!optionsLoaded && !createError && <p role="status" className="text-sm text-gray-400">Loading match options...</p>}
                  {createError && <p role="alert" className="text-sm text-red-400">{createError}</p>}
                </div>
                <button
                  onClick={handleCreateRoom}
                  disabled={!optionsLoaded || isCreating || !hasProblems(difficulty, topic)}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  {isCreating ? 'CREATING ROOM...' : 'CREATE ROOM'}
                </button>
              </div>
            </div>

            {/* Join Room */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-gray-800/40 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center justify-between mb-6">
                  <div className="bg-purple-500/20 p-4 rounded-xl">
                    <Hash className="w-8 h-8 text-purple-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-purple-400 font-mono text-sm">INVITE</div>
                    <div className="text-white font-bold">CODE</div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">JOIN ROOM</h3>
                <p className="text-gray-300 mb-4 leading-relaxed">
                  Enter an invite code to join a friend's private battle room.
                </p>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="ENTER ROOM CODE"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    className="w-full bg-gray-900/50 text-white px-4 py-3 rounded-xl border border-gray-600/50 focus:border-purple-500/70 focus:outline-none font-mono text-center text-lg tracking-widest placeholder-gray-500"
                    maxLength={8}
                  />
                  <button
                    onClick={handleJoinRoom}
                    disabled={roomCode.length < 4}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    JOIN BATTLE
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 text-center">
            <Users className="mx-auto mb-3 h-7 w-7 text-blue-400" />
            <h3 className="text-2xl font-bold text-white">TWO-PLAYER PRIVATE MATCHES</h3>
            <p className="mt-2 text-gray-300">Create a room, share its code, and the match begins when a second player joins.</p>
          </div>
        </div>
      </div>


    </div>
  );
};

// Battle Arena Activity Feed Component - Enhanced with Better Messages
const BattleArenaActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({ online: 2847, battles: 156 });

  // Enhanced activity templates with more realistic trash talk
  const activityTemplates = [
    {
      type: 'battle_win',
      icon: Trophy,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10 border-yellow-500/20',
      messages: [
        'CodeWarrior: "beat you to it, lol"',
        'BeastCoder: "lol done"',
        'ByteNinja: "good for you"',
        'AlgoMaster: "you got it"',
        'DevChampion: "same here"',
        'LogicBeast: "cool thanks"'
      ]
    },
    {
      type: 'room_action',
      icon: Swords,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10 border-orange-500/20',
      messages: [
        'EPIC SHOWDOWN: "Let\'s see who\'s the better coder"',
        'Championship finals: "OH please, give me a break!"',
        'Legendary battle: "hmm this is tricky"',  
        'New Expert room: "taking longer than expected"',
        'Speed coding duel: "this problem has some gotchas"',
        'High-stakes match: "please, you\'re far from it man"'
      ]
    },
    {
      type: 'achievement',
      icon: Crown,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/20',
      messages: [
        'CandyJava earned "Algorithm Assassin" badge!',
        'CodeNinja reached Grandmaster status!',
        'ByteBeast unlocked "Speed Demon" title!',
        'AlgoWizard hit 500-problem milestone!',
        'DevDestroyer became Python Overlord!',
        'LogicLord achieved 50-win streak!'
      ]
    },
    {
      type: 'live_event',
      icon: Zap,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10 border-cyan-500/20',
      messages: [
        'BREAKING: New world record set!',
        'Server migration complete - 0ms latency!',
        'Double XP weekend starts now!',
        'Premium tournament brackets released!',
        'Global leaderboard shuffle incoming!',
        'New problem set deployed live!'
      ]
    },
    {
      type: 'player_join',
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/20',
      messages: [
        'Google engineer "TechTitan" joined the arena!',
        'Ex-Facebook legend "CodeCrusher" is back!',
        'MIT prodigy "AlgoGod" entered the battlefield!',
        'Competitive programming champion online!',
        'Former IOI gold medalist just logged in!',
        'Silicon Valley veteran seeking challengers!'
      ]
    },
    {
      type: 'tournament',
      icon: Target,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10 border-red-500/20',
      messages: [
        'Weekly Championship: 2,847 participants!',
        'Elimination bracket down to final 16!',
        'Prize pool increased to 15,000 coins!',
        'Sudden death round starting in 3 minutes!',
        'Tournament upset: Bronze beat Diamond!',
        'Grand finale: 50,000 viewers watching!'
      ]
    },
    {
      type: 'system',
      icon: Activity,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10 border-green-500/20',
      messages: [
        'Peak concurrent users: 3,127!',
        'Average solve time down 23% today!',
        'New difficulty algorithm deployed!',
        'Anti-cheat system upgraded successfully!',
        'Global matchmaking optimization active!',
        'Performance metrics at all-time high!'
      ]
    }
  ];

  // Generate random activity
  const generateActivity = () => {
    const template = activityTemplates[Math.floor(Math.random() * activityTemplates.length)];
    const message = template.messages[Math.floor(Math.random() * template.messages.length)];
    
    return {
      id: Date.now() + Math.random(),
      type: template.type,
      icon: template.icon,
      color: template.color,
      bgColor: template.bgColor,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isNew: true
    };
  };

  // Update stats dynamically
  useEffect(() => {
    const updateStats = () => {
      setStats(prev => ({
        online: Math.max(2500, prev.online + Math.floor(Math.random() * 21) - 10),
        battles: Math.max(120, prev.battles + Math.floor(Math.random() * 11) - 5)
      }));
    };

    const statsInterval = setInterval(updateStats, 4000 + Math.random() * 2000);
    return () => clearInterval(statsInterval);
  }, []);

  // Add new activities frequently for buzzing effect
  useEffect(() => {
    const addActivity = () => {
      const newActivity = generateActivity();
      setActivities(prev => {
        const updated = [newActivity, ...prev.slice(0, 7)]; // Keep 8 activities
        // Mark old activities as not new
        return updated.map((activity, index) => ({
          ...activity,
          isNew: index === 0
        }));
      });
    };

    // Add initial activities
    addActivity();
    setTimeout(addActivity, 800);
    setTimeout(addActivity, 1600);
    setTimeout(addActivity, 2400);

    // Set up frequent interval for buzzing effect
    const interval = setInterval(() => {
      addActivity();
    }, Math.random() * 2000 + 2000); // 2-4 seconds for more activity

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/30">
        <div className="flex items-center gap-2 mb-2">
          <div className="relative">
            <Activity className="w-5 h-5 text-cyan-400" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
          </div>
          <span className="text-white font-semibold">Live Battle Feed</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>High activity zone</span>
        </div>
      </div>

      {/* Activities in Long Box */}
      <div className="flex-1 p-3 pb-20"> {/* Added bottom padding for stats box */}
        <div className="bg-gray-800/20 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-4 h-full overflow-y-auto">
          <div className="space-y-2">
            {activities.map((activity, index) => {
              const IconComponent = activity.icon;
              return (
                <div
                  key={activity.id}
                  className={`p-3 rounded-xl border backdrop-blur-sm transition-all duration-700 ease-out ${activity.bgColor} ${
                    activity.isNew ? 'animate-pulse shadow-lg ring-2 ring-cyan-400/30' : ''
                  }`}
                  style={{
                    animation: activity.isNew ? 'slideInLeft 0.6s ease-out, glow 2s ease-in-out' : undefined,
                    backgroundColor: 'rgba(17, 24, 39, 0.3)'
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-1.5 rounded-full bg-gray-800/70 ${activity.color} flex-shrink-0 relative`}>
                      <IconComponent className="w-3.5 h-3.5" />
                      {activity.isNew && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white leading-relaxed font-medium">
                        {activity.message}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">
                          {activity.timestamp}
                        </p>
                        {activity.isNew && (
                          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30">
                            LIVE
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Stats - Positioned at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-800/30 backdrop-blur-sm border-t border-gray-700/30 rounded-b-2xl">
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-gray-800/40 rounded-xl p-3 border border-gray-700/30">
              <div className="text-green-400 font-bold text-sm transition-all duration-500">
                {stats.online.toLocaleString()}
              </div>
              <div className="text-gray-400 text-xs">Online</div>
            </div>
            <div className="bg-gray-800/40 rounded-xl p-3 border border-gray-700/30">
              <div className="text-orange-400 font-bold text-sm transition-all duration-500">
                {stats.battles}
              </div>
              <div className="text-gray-400 text-xs">Battles</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes glow {
          0%, 100% { 
            box-shadow: 0 0 5px rgba(34, 211, 238, 0.3); 
          }
          50% { 
            box-shadow: 0 0 20px rgba(34, 211, 238, 0.6); 
          }
        }
      `}</style>
    </div>
  );
};

export default BattleArena;
