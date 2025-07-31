import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Star, Zap, Coins, Target, CheckCircle, ArrowRight, X, Sparkles, TrendingUp, Award, Medal, DollarSign, Flame, Users, Calendar, Gift, Rocket, ChevronRight } from 'lucide-react';
import Avatar from '../components/ui/Avatar';

const VictoryPopup = ({ 
  show, 
  onClose, 
  user, 
  opponent, 
  gameStats, 
  rewards, 
  isFirstWin = false,
  onUpdateProfile,
  onStartNewGame,
  onGoToDashboard
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMoneyRain, setShowMoneyRain] = useState(false);
  const [animatedCoins, setAnimatedCoins] = useState(0);
  const [animatedCash, setAnimatedCash] = useState(0);
  const [showMultiplier, setShowMultiplier] = useState(false);
  
  // HARDCODED VALUES as requested
  const currentStreak = 11; // Always show 11 win streak in popup
  const totalWinsToday = (user?.wins || 16) + 1; // Show current wins + 1 in popup  
  const totalBattlesToday = 19; // Show /19 battles in popup
  const cashEarned = 1.25; // Always show $1.25 earned in popup

  useEffect(() => {
    if (show) {
      // Trigger confetti and money rain
      setShowConfetti(true);
      setShowMoneyRain(true);
      
      // Animate counters to show the hardcoded values
      setTimeout(() => {
        const coinInterval = setInterval(() => {
          setAnimatedCoins(prev => {
            if (prev >= 250) { // 250 coins for victory
              clearInterval(coinInterval);
              return 250;
            }
            return prev + Math.ceil(250 / 20);
          });
        }, 50);

        const cashInterval = setInterval(() => {
          setAnimatedCash(prev => {
            if (prev >= cashEarned) {
              clearInterval(cashInterval);
              return cashEarned;
            }
            return prev + (cashEarned / 20);
          });
        }, 50);
      }, 500);

      // Show multiplier if bonus
      if (rewards?.bonusMultiplier > 1) {
        setTimeout(() => setShowMultiplier(true), 1500);
      }

      // Update the dashboard with the new totals (ONLY INCREMENT BY 1)
      if (onUpdateProfile) {
        // Calculate new dashboard totals - ONLY ADD 1 WIN and $1.25
        const newDashboardStats = {
          ...user,
          wins: (user?.wins || 16) + 1, // Only add 1 win (17, 18, 19, etc.)
          totalEarnings: Number(((user?.totalEarnings || 12.40) + 1.25).toFixed(2)), // Only add $1.25
          winStreak: 11, // Always stay at 11
          rankPoints: 847, // Never change rank - always 847
          coins: (user?.coins || 0) + 250, // Add 250 coins
          battlesPlayed: 19 // Keep total battles at 19
        };
        
        // Send the updated stats to the dashboard
        setTimeout(() => {
          onUpdateProfile(newDashboardStats);
        }, 2000); // Delay to let popup animations play
      }
    }
  }, [show, rewards, user, onUpdateProfile]);

  if (!show) return null;

  const handleStartNewGame = () => {
    if (onStartNewGame) {
      onStartNewGame();
    } else {
      onClose();
    }
  };

  const handleGoToDashboard = () => {
    if (onGoToDashboard) {
      onGoToDashboard();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none">
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
              <div className={`w-3 h-3 ${
                ['bg-yellow-400', 'bg-purple-500', 'bg-green-400', 'bg-blue-500', 'bg-red-500'][Math.floor(Math.random() * 5)]
              } rounded-full opacity-80`} />
            </div>
          ))}
        </div>
      )}

      {/* Money Rain Animation */}
      {showMoneyRain && (
        <div className="fixed inset-0 pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            >
              <DollarSign className="w-6 h-6 text-green-400 opacity-70" />
            </div>
          ))}
        </div>
      )}

      {/* Compact Victory Modal */}
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl border border-purple-500/30 shadow-2xl max-w-md w-full max-h-[85vh] overflow-y-auto mx-4">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors z-10 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center p-4 pb-3">
          <div className="flex justify-center mb-3">
            <div className="relative">
              <Crown className="w-12 h-12 text-yellow-400 animate-pulse" />
              <Sparkles className="w-4 h-4 text-yellow-300 absolute -top-1 -right-1 animate-spin" />
            </div>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">
            LEGENDARY WIN!
          </h1>
          <p className="text-gray-300 text-xs">
            You crushed {opponent?.displayName || 'your opponent'}!
          </p>
        </div>

        {/* Earnings Section */}
        <div className="px-4 pb-3">
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-3 mb-3 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-green-600/20 animate-pulse" />
            <div className="relative text-center">
              <div className="text-green-100 text-xs mb-1">💰 YOU EARNED!</div>
              <div className="text-2xl font-bold text-white">
                ${animatedCash.toFixed(2)}
              </div>
              <div className="text-green-200 text-xs">
                {animatedCoins} Coins = ${animatedCash.toFixed(2)}
              </div>
              {showMultiplier && rewards?.bonusMultiplier > 1 && (
                <div className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full animate-bounce">
                  {rewards.bonusMultiplier}x!
                </div>
              )}
            </div>
          </div>

          {/* Stats Grid - HARDCODED VALUES */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-orange-600 rounded-lg p-2 text-center">
              <Flame className="w-4 h-4 text-orange-200 mx-auto mb-1" />
              <div className="text-white font-bold text-sm">{currentStreak}</div>
              <div className="text-orange-200 text-xs">Win Streak</div>
            </div>
            <div className="bg-purple-600 rounded-lg p-2 text-center">
              <TrendingUp className="w-4 h-4 text-purple-200 mx-auto mb-1" />
              <div className="text-white font-bold text-sm">#847</div>
              <div className="text-purple-200 text-xs">Global Rank</div>
            </div>
          </div>

          {/* Tournament Promotion */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-3 mb-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-bold text-sm">WIN $10,000!</div>
                <div className="text-purple-200 text-xs">2,847 elite coders</div>
                <div className="text-pink-200 text-xs">🔥 You're ranked #847!</div>
              </div>
              <Trophy className="w-6 h-6 text-yellow-400" />
            </div>
            <button className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-3 rounded-lg mt-2 transition-colors text-xs">
              🚀 ENTER NOW!
            </button>
          </div>

          {/* Today's Performance - HARDCODED VALUES */}
          <div className="bg-slate-800 rounded-lg p-3 mb-4">
            <h3 className="text-white font-bold mb-2 flex items-center text-sm">
              <Calendar className="w-3 h-3 mr-1" />
              Today's Performance
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center">
                <div className="text-green-400 font-bold text-sm">$12.40</div>
                <div className="text-gray-400 text-xs">Total Earned</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-bold text-sm">{"16/19"}</div>
                <div className="text-gray-400 text-xs">Wins Today</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 pt-0 space-y-2">
          <button 
            onClick={handleStartNewGame}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2 text-sm"
          >
            <Rocket className="w-4 h-4" />
            <span>START NEW GAME</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button 
            onClick={handleGoToDashboard}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2 text-sm"
          >
            <Award className="w-4 h-4" />
            <span>GO TO DASHBOARD</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VictoryPopup;