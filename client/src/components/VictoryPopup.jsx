import React, { useState, useEffect } from 'react';
import { 
  Trophy, Crown, Star, Zap, Coins, Target, 
  CheckCircle, ArrowRight, X, Sparkles,
  TrendingUp, Award, Medal
} from 'lucide-react';
import Avatar from '../components/ui/Avatar';

const VictoryPopup = ({ 
  show, 
  onClose, 
  user, 
  opponent, 
  gameStats, 
  rewards,
  isFirstWin = false,
  onUpdateProfile // Add this prop to update user profile
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [animatedCoins, setAnimatedCoins] = useState(0);
  const [animatedXP, setAnimatedXP] = useState(0);
  const [profileUpdated, setProfileUpdated] = useState(false);

  // Default rewards if not provided
  const defaultRewards = {
    coins: isFirstWin ? 100 : 75,
    xp: isFirstWin ? 150 : 100,
    rankPoints: isFirstWin ? 50 : 25,
    achievements: isFirstWin ? ['First Victory'] : []
  };

  const finalRewards = rewards || defaultRewards;
  const finalGameStats = gameStats || {
    completionTime: '2:34',
    testsPassedFirst: true,
    accuracy: 100,
    difficulty: 'Easy'
  };

  useEffect(() => {
    if (show) {
      setShowConfetti(true);
      setCurrentStep(0);
      
      // Animate step progression
      const stepTimer = setTimeout(() => setCurrentStep(1), 500);
      const coinsTimer = setTimeout(() => animateCounter(setAnimatedCoins, finalRewards.coins), 1000);
      const xpTimer = setTimeout(() => animateCounter(setAnimatedXP, finalRewards.xp), 1200);
      
      // Update user profile after animations
      const profileTimer = setTimeout(() => {
        updateUserProfile();
      }, 2000);
      
      return () => {
        clearTimeout(stepTimer);
        clearTimeout(coinsTimer);
        clearTimeout(xpTimer);
        clearTimeout(profileTimer);
      };
    }
  }, [show, finalRewards.coins, finalRewards.xp]);

  const animateCounter = (setter, target) => {
    let current = 0;
    const increment = target / 20;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setter(target);
        clearInterval(timer);
      } else {
        setter(Math.floor(current));
      }
    }, 50);
  };

  // Update user profile with victory rewards
  const updateUserProfile = () => {
    if (!profileUpdated && onUpdateProfile) {
      const updatedUser = {
        ...user,
        wins: (user.wins || 0) + 1,
        coins: (user.coins || 100) + finalRewards.coins,
        totalGames: (user.totalGames || 0) + 1,
        winRate: Math.round(((user.wins || 0) + 1) / ((user.totalGames || 0) + 1) * 100),
        // Add rank progression logic
        rankPoints: (user.rankPoints || 0) + finalRewards.rankPoints
      };

      // Simple rank progression
      if (updatedUser.rankPoints >= 100 && user.rank === 'Bronze I') {
        updatedUser.rank = 'Bronze II';
      } else if (updatedUser.rankPoints >= 200 && user.rank === 'Bronze II') {
        updatedUser.rank = 'Silver I';
      }

      onUpdateProfile(updatedUser);
      setProfileUpdated(true);
    }
  };

  const handleClose = () => {
    // Ensure profile is updated before closing
    if (!profileUpdated) {
      updateUserProfile();
    }
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <div className={`w-2 h-2 rounded ${
                ['bg-yellow-400', 'bg-blue-400', 'bg-purple-400', 'bg-green-400', 'bg-red-400'][i % 5]
              }`} />
            </div>
          ))}
        </div>
      )}

      <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-3xl border border-yellow-500/30 shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-300" />
        </button>

        {/* Victory Header */}
        <div className="relative bg-gradient-to-r from-yellow-500/20 via-yellow-400/30 to-yellow-500/20 p-8 text-center border-b border-yellow-500/20">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent animate-pulse" />
          
          <div className="relative z-10">
            {/* Main Trophy */}
            <div className="mb-6 transform animate-bounce">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-lg border-4 border-yellow-300">
                <Trophy className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* Victory Text */}
            <h1 className="text-4xl font-bold text-white mb-2">
              🎉 VICTORY! 🎉
            </h1>
            <p className="text-xl text-yellow-300 mb-4">
              {isFirstWin ? "Congratulations on your first win!" : "Another epic victory!"}
            </p>
            
            {/* Achievement Badge */}
            {isFirstWin && (
              <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-400/30 rounded-full px-4 py-2 mb-4">
                <Award className="w-5 h-5 text-purple-400" />
                <span className="text-purple-300 font-semibold">First Victory Achievement Unlocked!</span>
              </div>
            )}

            {/* Profile Update Notification */}
            {profileUpdated && (
              <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/30 rounded-full px-4 py-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-300 text-sm">Profile updated with victory rewards!</span>
              </div>
            )}
          </div>
        </div>

        {/* Battle Summary */}
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            Battle Summary
          </h3>
          
          <div className="grid grid-cols-2 gap-6">
            {/* You */}
            <div className="text-center">
              <Avatar src={user?.picture} size="large" className="mb-3 mx-auto" />
              <p className="font-semibold text-white">{user?.displayName || 'You'}</p>
              <div className="mt-2 p-3 bg-green-500/20 border border-green-400/30 rounded-lg">
                <Crown className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                <p className="text-green-400 font-bold">WINNER</p>
                <p className="text-sm text-green-300">Time: {finalGameStats.completionTime}</p>
              </div>
            </div>

            {/* Opponent */}
            <div className="text-center">
              <Avatar src={opponent?.picture} size="large" className="mb-3 mx-auto" />
              <p className="font-semibold text-white">{opponent?.displayName || 'Opponent'}</p>
              <div className="mt-2 p-3 bg-red-500/20 border border-red-400/30 rounded-lg">
                <Medal className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                <p className="text-red-400 font-bold">DEFEATED</p>
                <p className="text-sm text-red-300">{opponent?.rank || 'Silver I'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rewards Section */}
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Victory Rewards
          </h3>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* Coins */}
            <div className="text-center p-4 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
              <Coins className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-300">+{animatedCoins}</p>
              <p className="text-sm text-yellow-200">Coins</p>
            </div>

            {/* XP */}
            <div className="text-center p-4 bg-blue-500/20 border border-blue-400/30 rounded-lg">
              <Star className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-300">+{animatedXP}</p>
              <p className="text-sm text-blue-200">XP</p>
            </div>

            {/* Rank Points */}
            <div className="text-center p-4 bg-purple-500/20 border border-purple-400/30 rounded-lg">
              <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-300">+{finalRewards.rankPoints}</p>
              <p className="text-sm text-purple-200">Rank Points</p>
            </div>
          </div>

          {/* Updated Stats Preview */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between p-2 bg-gray-700/30 rounded">
              <span className="text-gray-300">New Win Count:</span>
              <span className="text-green-400 font-semibold">{(user?.wins || 0) + 1}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-700/30 rounded">
              <span className="text-gray-300">New Coin Total:</span>
              <span className="text-yellow-400 font-semibold">{(user?.coins || 100) + finalRewards.coins}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-700/30 rounded">
              <span className="text-gray-300">Completion Time:</span>
              <span className="text-white font-semibold">{finalGameStats.completionTime}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-700/30 rounded">
              <span className="text-gray-300">First Try:</span>
              <span className="text-green-400 font-semibold">
                {finalGameStats.testsPassedFirst ? 'Yes! 🎯' : 'No'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6">
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Trophy className="w-5 h-5" />
              Back to Dashboard
            </button>
            <button
              onClick={() => {
                handleClose();
                // Could navigate to match lobby for another battle
              }}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            >
              Next Battle
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          
          {isFirstWin && (
            <p className="text-center text-gray-400 text-sm mt-4">
              🎉 Welcome to the CodeClash arena! Your journey as a coding warrior begins now!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VictoryPopup;