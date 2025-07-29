import React, { useState, useEffect } from 'react';
import { Trophy, Zap, Clock, Users, Coins } from 'lucide-react';
import Avatar from './ui/Avatar';

const ReadyScreen = ({ 
  user, 
  opponent, 
  roomCode, 
  difficulty, 
  onReady, 
  onCancel,
  coinsAtStake = 50 
}) => {
  const [countdown, setCountdown] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);

  useEffect(() => {
    // Simulate opponent getting ready after 2 seconds
    const opponentReadyTimer = setTimeout(() => {
      setOpponentReady(true);
    }, 2000);

    return () => clearTimeout(opponentReadyTimer);
  }, []);

  useEffect(() => {
    // Start countdown when both players are ready
    if (isReady && opponentReady && countdown === null) {
      setCountdown(5);
    }
  }, [isReady, opponentReady, countdown]);

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      // Start the game
      onReady();
    }
  }, [countdown, onReady]);

  const handleReady = () => {
    setIsReady(true);
  };

  const getDifficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'easy': return 'text-green-400 bg-green-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'hard': return 'text-red-400 bg-red-500/20';
      default: return 'text-blue-400 bg-blue-500/20';
    }
  };

  const getDifficultyReward = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'easy': return 25;
      case 'medium': return 50;
      case 'hard': return 100;
      default: return 50;
    }
  };

  const reward = getDifficultyReward(difficulty);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-6">
        {/* Main Ready Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 text-center">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <h1 className="text-3xl font-bold text-white">Battle Arena</h1>
              <Trophy className="w-8 h-8 text-yellow-400" />
            </div>
            <p className="text-gray-400 text-lg">Prepare for an epic coding battle!</p>
            {roomCode && (
              <div className="mt-4 bg-gray-900/50 rounded-lg px-4 py-2">
                <span className="text-gray-400">Room: </span>
                <span className="text-blue-400 font-mono font-bold">{roomCode}</span>
              </div>
            )}
          </div>

          {/* Countdown Display */}
          {countdown !== null && (
            <div className="mb-8">
              <div className="relative">
                <div className="w-32 h-32 mx-auto rounded-full border-8 border-blue-500/30 flex items-center justify-center bg-blue-500/10">
                  <div className="text-6xl font-bold text-white">
                    {countdown}
                  </div>
                </div>
                <div className="absolute -inset-2 rounded-full border-4 border-blue-500 animate-ping opacity-20"></div>
              </div>
              <p className="text-blue-400 font-semibold mt-4">
                {countdown > 0 ? 'Battle starting in...' : 'Fight!'}
              </p>
            </div>
          )}

          {/* Battle Info */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Difficulty */}
            <div className="bg-gray-900/50 rounded-xl p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-gray-400">Difficulty</span>
              </div>
              <div className={`px-3 py-1 rounded-lg font-semibold capitalize ${getDifficultyColor(difficulty)}`}>
                {difficulty || 'Medium'}
              </div>
            </div>

            {/* Time Limit */}
            <div className="bg-gray-900/50 rounded-xl p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="text-gray-400">Time Limit</span>
              </div>
              <div className="text-white font-bold">10:00</div>
            </div>

            {/* Reward */}
            <div className="bg-gray-900/50 rounded-xl p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="text-gray-400">Winner Gets</span>
              </div>
              <div className="text-yellow-400 font-bold">+{reward} Coins</div>
            </div>
          </div>

          {/* Players */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Current User */}
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <Avatar 
                  theme={user?.avatarTheme || 'coder'} 
                  color={user?.avatarColor || 'blue'} 
                  size="xl"
                />
              </div>
              <div>
                <div className="text-xl font-bold text-white mb-1">
                  {user?.displayName || user?.name || 'You'}
                </div>
                <div className="text-gray-400 text-sm">
                  {user?.rank || 'Bronze I'} • {user?.wins || 0} wins
                </div>
              </div>
              <div className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                isReady 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-600 text-gray-300'
              }`}>
                {isReady ? '✓ Ready!' : 'Waiting...'}
              </div>
            </div>

            {/* VS Divider */}
            <div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 flex items-center justify-center">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold px-4 py-2 rounded-full">
                VS
              </div>
            </div>

            {/* Opponent */}
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <Avatar 
                  theme={opponent?.avatar?.theme || 'ninja'} 
                  color={opponent?.avatar?.color || 'red'} 
                  size="xl"
                />
              </div>
              <div>
                <div className="text-xl font-bold text-white mb-1">
                  {opponent?.displayName || 'Waiting for opponent...'}
                </div>
                <div className="text-gray-400 text-sm">
                  {opponent?.rank || 'Unknown'} • {opponent?.wins || 0} wins
                </div>
              </div>
              <div className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                opponentReady 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-600 text-gray-300'
              }`}>
                {opponentReady ? '✓ Ready!' : 'Getting ready...'}
              </div>
            </div>
          </div>

          {/* Ready Button */}
          {!isReady && countdown === null && (
            <div className="space-y-4">
              <p className="text-gray-400">
                Both players must be ready before the battle can begin
              </p>
              <button
                onClick={handleReady}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white font-bold px-8 py-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  I'm Ready to Battle!
                </div>
              </button>
            </div>
          )}

          {/* Waiting for Countdown */}
          {isReady && opponentReady && countdown === null && (
            <div className="space-y-4">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-blue-400 font-semibold">
                Both players ready! Starting battle...
              </p>
            </div>
          )}

          {/* Cancel Button */}
          <div className="mt-6">
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-white transition-colors px-4 py-2"
              disabled={countdown !== null && countdown <= 3}
            >
              {countdown !== null && countdown <= 3 
                ? 'Cannot cancel now!' 
                : 'Cancel Battle'
              }
            </button>
          </div>

          {/* Stakes Warning */}
          <div className="mt-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 text-yellow-400">
              <Coins className="w-5 h-5" />
              <span className="font-semibold">Stakes: {coinsAtStake} coins at risk</span>
            </div>
            <p className="text-yellow-300 text-sm mt-1">
              Winner takes all • Loser loses {Math.floor(coinsAtStake / 2)} coins
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadyScreen;