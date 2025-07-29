import React, { useState, useEffect } from 'react';
import { Zap, Play, Eye, Trophy, Users, Flame, Coins, Crown, ArrowRight, Github, Twitter } from 'lucide-react';

const CodeClashLanding = ({ navigate, user }) => {
  const [liveCount, setLiveCount] = useState(247);
  const [isVisible, setIsVisible] = useState(false);

  // Animate live count
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCount(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 3000);
    
    setIsVisible(true);
    return () => clearInterval(interval);
  }, []);

  // Smooth scroll to section
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const Button = ({ children, variant = 'primary', size = 'md', className = '', onClick, ...props }) => {
    const baseClasses = 'font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105';
    const variants = {
      primary: 'bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-500 hover:via-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl',
      secondary: 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white shadow-lg',
      outline: 'border-2 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white bg-transparent backdrop-blur-sm'
    };
    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
      xl: 'px-10 py-5 text-xl'
    };
    
    return (
      <button 
        className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
        onClick={onClick}
        {...props}
      >
        {children}
      </button>
    );
  };

  const FeatureCard = ({ icon: Icon, title, description, gradient }) => (
    <div className={`relative group p-8 rounded-2xl bg-gradient-to-br ${gradient} backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative z-10">
        <Icon className="w-12 h-12 text-blue-400 mb-4 group-hover:text-blue-300 transition-colors" />
        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-100 transition-colors">{title}</h3>
        <p className="text-gray-300 group-hover:text-gray-200 transition-colors">{description}</p>
      </div>
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-xl group-hover:from-blue-400/30 transition-all duration-300"></div>
    </div>
  );

  const CodeAnimation = () => {
    const [currentLine, setCurrentLine] = useState(0);
    const codeLines = [
      "def twoSum(nums, target):",
      "    seen = {}",
      "    for i, num in enumerate(nums):",
      "        complement = target - num",
      "        if complement in seen:",
      "            return [seen[complement], i]",
      "        seen[num] = i"
    ];

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentLine(prev => (prev + 1) % codeLines.length);
      }, 800);
      return () => clearInterval(interval);
    }, []);

    return (
      <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 font-mono text-sm border border-gray-700/50">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-400 ml-2">Battle Arena - Two Sum</span>
        </div>
        {codeLines.map((line, index) => (
          <div 
            key={index} 
            className={`transition-all duration-300 ${
              index <= currentLine ? 'text-green-400 opacity-100' : 'text-gray-600 opacity-30'
            }`}
          >
            <span className="text-gray-500 mr-4">{index + 1}</span>
            {line}
            {index === currentLine && <span className="animate-pulse text-blue-400">|</span>}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className={`relative z-50 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
        <nav className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                CodeClash
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <button 
                onClick={() => scrollToSection('features')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('how-it-works')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                How It Works
              </button>
              <button 
                onClick={() => scrollToSection('leaderboard')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Leaderboard
              </button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => navigate('login')}
              >
                Sign In
              </Button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 pt-20 pb-32">
        <div className={`max-w-6xl mx-auto transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Column - Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-6xl lg:text-7xl font-bold leading-tight">
                  <span className="block text-white">LEETCODE</span>
                  <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    BATTLES.
                  </span>
                  <span className="block text-4xl lg:text-5xl text-gray-300 font-semibold">
                    Real-Time Duels.
                  </span>
                </h1>
                
                <p className="text-xl text-gray-300 leading-relaxed max-w-2xl">
                  Turn interview prep into competitive sport. Battle friends on LeetCode problems, 
                  climb the ranks, and become a coding legend. ⚡
                </p>
              </div>

              {/* Live Stats */}
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-400 font-semibold">LIVE NOW</span>
                </div>
                <span className="text-white font-bold text-lg">
                  {liveCount} coders battling
                </span>
                <div className="flex -space-x-2 ml-4">
                  {['🔥', '⚡', '💻', '🚀'].map((emoji, i) => (
                    <div key={i} className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center border-2 border-gray-700">
                      <span className="text-sm">{emoji}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex gap-4">
                <Button 
                  size="xl" 
                  className="shadow-2xl"
                  onClick={() => {
                    if (user) {
                      navigate('dashboard');
                    } else {
                      navigate('login');
                    }
                  }}
                >
                  <Play className="w-6 h-6" />
                  START YOUR FIRST CLASH
                </Button>
                <Button 
                  size="xl" 
                  variant="outline"
                  onClick={() => scrollToSection('demo-section')}
                >
                  <Eye className="w-6 h-6" />
                  Watch Demo
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">50K+</div>
                  <div className="text-gray-400">Active Coders</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">1M+</div>
                  <div className="text-gray-400">Battles Fought</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">24/7</div>
                  <div className="text-gray-400">Epic Matches</div>
                </div>
              </div>
            </div>

            {/* Right Column - Demo */}
            <div className="relative">
              <div className="relative z-10">
                <CodeAnimation />
                
                {/* Battle UI Preview */}
                <div className="mt-6 p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                        Y
                      </div>
                      <span className="text-white font-semibold">You</span>
                      <span className="text-green-400 text-sm">●</span>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-500">VS</div>
                      <div className="text-xs text-gray-400">LIVE BATTLE</div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-orange-400 text-sm">●</span>
                      <span className="text-white font-semibold">PythonKing</span>
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                        P
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                      <div className="text-blue-400 font-bold">87%</div>
                      <div className="text-xs text-gray-400">Progress</div>
                    </div>
                    <div className="text-center p-3 bg-purple-500/10 rounded-lg">
                      <div className="text-purple-400 font-bold">72%</div>
                      <div className="text-xs text-gray-400">Progress</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <div className="text-yellow-500 font-semibold">⏱ 03:42 remaining</div>
                    <div className="text-xs text-gray-400">First to solve wins +50 coins!</div>
                  </div>
                </div>
              </div>
              
              {/* Glow Effects */}
              <div className="absolute top-10 -right-10 w-40 h-40 bg-blue-500/30 rounded-full blur-3xl"></div>
              <div className="absolute bottom-10 -left-10 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-32 bg-gradient-to-b from-transparent to-gray-900/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-white mb-6">
              Why CodeClash 
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Dominates</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We're not just another coding platform. We're the battleground where legends are born.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Zap}
              title="INSTANT MATCHING"
              description="Find worthy opponents in seconds. No waiting, just pure adrenaline-fueled coding battles."
              gradient="from-blue-900/40 to-blue-800/40"
            />
            
            <FeatureCard
              icon={Users}
              title="REAL-TIME SYNC"
              description="See every keystroke live. Watch your opponent's progress and feel the pressure build."
              gradient="from-purple-900/40 to-purple-800/40"
            />
            
            <FeatureCard
              icon={Trophy}
              title="RANK SYSTEM"
              description="Climb from Bronze to Grandmaster. Every victory brings you closer to coding royalty."
              gradient="from-yellow-900/40 to-yellow-800/40"
            />
            
            <FeatureCard
              icon={Coins}
              title="EARN REWARDS"
              description="Win battles, earn coins. Unlock themes, avatars, and exclusive tournaments."
              gradient="from-green-900/40 to-green-800/40"
            />
            
            <FeatureCard
              icon={Flame}
              title="STREAK SYSTEM"
              description="Build epic win streaks. The longer your streak, the bigger the rewards."
              gradient="from-red-900/40 to-red-800/40"
            />
            
            <FeatureCard
              icon={Crown}
              title="TOURNAMENTS"
              description="Compete in daily tournaments. Prize pools, glory, and bragging rights await."
              gradient="from-pink-900/40 to-pink-800/40"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 py-32 bg-gradient-to-b from-gray-900/50 to-transparent">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-white mb-6">
              How It <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Jump into battle in just 4 simple steps. It's that easy to start your coding domination.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Sign Up", desc: "Create your warrior profile", icon: "👤" },
              { step: "02", title: "Find Match", desc: "Get matched with worthy opponents", icon: "🎯" },
              { step: "03", title: "Code Battle", desc: "Solve LeetCode problems in real-time", icon: "⚔️" },
              { step: "04", title: "Claim Victory", desc: "Earn coins, climb ranks, repeat", icon: "🏆" }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-6xl mb-4">{item.icon}</div>
                <div className="text-blue-400 font-bold text-lg mb-2">STEP {item.step}</div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo-section" className="relative z-10 py-32">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold text-white mb-6">
              See It In <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Action</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Watch how CodeClash transforms boring leetcode grinding into epic real-time battles.
            </p>
            
            {/* Demo Video Placeholder */}
            <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700/50 backdrop-blur-sm">
              <div className="aspect-video bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-600">
                <div className="text-center">
                  <Play className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <p className="text-gray-300 text-lg">Demo Video Coming Soon!</p>
                  <p className="text-gray-500">Epic coding battles in action</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      <section id="leaderboard" className="relative z-10 py-32 bg-gradient-to-b from-transparent to-gray-900/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Leaderboard</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              See where you rank among the coding elite. Climb your way to the top!
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 backdrop-blur-sm overflow-hidden">
              {/* Leaderboard Header */}
              <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-4">
                <h3 className="text-xl font-bold text-white text-center">🏆 TOP WARRIORS THIS WEEK</h3>
              </div>
              
              {/* Leaderboard Entries */}
              <div className="p-6">
                {[
                  { rank: 1, name: "CodeMaster_X", wins: 127, icon: "👑" },
                  { rank: 2, name: "AlgoQueen", wins: 115, icon: "⚡" },
                  { rank: 3, name: "ByteWarrior", wins: 98, icon: "🔥" },
                  { rank: 4, name: "SyntaxSlayer", wins: 87, icon: "⚔️" },
                  { rank: 5, name: "LogicLord", wins: 72, icon: "🚀" }
                ].map((player, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-700/50 last:border-b-0">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-yellow-400">#{player.rank}</div>
                      <div className="text-2xl">{player.icon}</div>
                      <div className="text-white font-semibold">{player.name}</div>
                    </div>
                    <div className="text-green-400 font-bold">{player.wins} wins</div>
                  </div>
                ))}
              </div>
              
              {/* View Full Leaderboard */}
              <div className="p-4 bg-gray-900/50">
                <Button 
                  className="w-full"
                  onClick={() => navigate('leaderboard')}
                >
                  View Full Leaderboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-6xl font-bold">
              <span className="text-white">Ready to</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                DOMINATE?
              </span>
            </h2>
            
            <p className="text-2xl text-gray-300">
              Join the elite. Prove your skills. Become a legend.
            </p>
            
            <div className="flex gap-6 justify-center">
              <Button 
                size="xl" 
                className="shadow-2xl"
                onClick={() => navigate('login')}
              >
                <Play className="w-6 h-6" />
                START CLASHING NOW
                <ArrowRight className="w-6 h-6" />
              </Button>
            </div>
            
            <p className="text-gray-400">
              Free to play • No credit card required • Battle in 30 seconds
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800 py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">CodeClash</span>
            </div>
            
            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
            </div>
          </div>
          
          <div className="text-center mt-8 text-gray-400">
            © 2025 CodeClash. Built for warriors, by warriors. ⚔️ (D.O.W.P)
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CodeClashLanding;