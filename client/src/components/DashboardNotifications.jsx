import React, { useState, useEffect } from 'react';
import { 
  Trophy, Zap, Users, Crown, Medal, Swords, 
  Target, Code, Fire, Star, Bell, X 
} from 'lucide-react';

const DashboardActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [isVisible, setIsVisible] = useState(true);

  // Demo data for activities
  const activityTemplates = [
    // Battle invites
    { 
      type: 'invite', 
      template: '{user} sent you a battle invite!', 
      icon: Swords, 
      color: 'text-blue-400 bg-blue-500/20',
      action: 'Join Battle'
    },
    { 
      type: 'invite', 
      template: '{user} challenges you to a coding duel!', 
      icon: Target, 
      color: 'text-purple-400 bg-purple-500/20',
      action: 'Accept Challenge'
    },
    
    // Victories and achievements
    { 
      type: 'victory', 
      template: '{user} won their first championship!', 
      icon: Crown, 
      color: 'text-yellow-400 bg-yellow-500/20' 
    },
    { 
      type: 'victory', 
      template: '{user} beat 3-time Diamond coder {opponent}!', 
      icon: Trophy, 
      color: 'text-gold-400 bg-yellow-500/20' 
    },
    { 
      type: 'victory', 
      template: '{user} just crushed a Hard problem in 2 minutes!', 
      icon: Fire, 
      color: 'text-red-400 bg-red-500/20' 
    },
    { 
      type: 'victory', 
      template: '{user} reached Platinum rank!', 
      icon: Medal, 
      color: 'text-cyan-400 bg-cyan-500/20' 
    },
    
    // Achievements
    { 
      type: 'achievement', 
      template: '{user} solved 100 problems this week!', 
      icon: Code, 
      color: 'text-green-400 bg-green-500/20' 
    },
    { 
      type: 'achievement', 
      template: '{user} has a 15-win streak!', 
      icon: Fire, 
      color: 'text-orange-400 bg-orange-500/20' 
    },
    { 
      type: 'achievement', 
      template: '{user} became a JavaScript Master!', 
      icon: Star, 
      color: 'text-yellow-400 bg-yellow-500/20' 
    },
    
    // Battle results
    { 
      type: 'battle', 
      template: '{user} demolished {opponent} in an Epic Battle!', 
      icon: Zap, 
      color: 'text-purple-400 bg-purple-500/20' 
    },
    { 
      type: 'battle', 
      template: '{user} solved Two Sum in 30 seconds!', 
      icon: Target, 
      color: 'text-blue-400 bg-blue-500/20' 
    },
    
    // Community
    { 
      type: 'community', 
      template: '{user} just joined the CodeClash arena!', 
      icon: Users, 
      color: 'text-green-400 bg-green-500/20' 
    },
    { 
      type: 'community', 
      template: 'New tournament starting in 10 minutes!', 
      icon: Trophy, 
      color: 'text-gold-400 bg-yellow-500/20',
      action: 'Join Tournament'
    }
  ];

  // Demo users for activities
  const demoUsers = [
    'BeastCoder', 'CodeWarrior', 'CandyJava', 'AlgoNinja', 'ByteMaster',
    'DevChampion', 'CodeWizard', 'BugSlayer', 'LogicBeast', 'DataDragon',
    'SyntaxKing', 'PixelPusher', 'CodeCrusher', 'DevDemon', 'AlgoGod',
    'ByteBeast', 'CodePhoenix', 'DevDestroyer', 'AlgoAssassin', 'ByteBrawler'
  ];

  useEffect(() => {
    // Generate activities every 3-5 seconds
    const generateActivity = () => {
      const template = activityTemplates[Math.floor(Math.random() * activityTemplates.length)];
      const user = demoUsers[Math.floor(Math.random() * demoUsers.length)];
      const opponent = demoUsers.filter(u => u !== user)[Math.floor(Math.random() * (demoUsers.length - 1))];
      
      let message = template.template.replace('{user}', user);
      if (message.includes('{opponent}')) {
        message = message.replace('{opponent}', opponent);
      }

      const newActivity = {
        id: Date.now() + Math.random(),
        type: template.type,
        message,
        user,
        icon: template.icon,
        color: template.color,
        action: template.action,
        timestamp: Date.now()
      };

      setActivities(prev => [newActivity, ...prev.slice(0, 9)]); // Keep last 10 activities
    };

    // Generate first activity immediately
    generateActivity();

    // Then generate every 3-5 seconds
    const interval = setInterval(() => {
      generateActivity();
    }, Math.random() * 2000 + 3000); // 3-5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleAction = (activity) => {
    console.log('Action clicked for activity:', activity);
    // Here you would handle the action (join battle, accept challenge, etc.)
  };

  const dismissActivity = (activityId) => {
    setActivities(prev => prev.filter(activity => activity.id !== activityId));
  };

  const formatTimeAgo = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  };

  if (!isVisible || activities.length === 0) {
    return (
      <div className="fixed top-4 right-4 z-40">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
        >
          <Bell className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-80">
      {/* Header */}
      <div className="bg-gray-800/95 backdrop-blur-sm border border-gray-700/50 rounded-t-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-white font-semibold">Live Activity</span>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Activities Feed */}
      <div className="bg-gray-800/95 backdrop-blur-sm border-x border-gray-700/50 max-h-96 overflow-y-auto">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <div
              key={activity.id}
              className={`p-4 border-b border-gray-700/30 transition-all duration-300 hover:bg-gray-700/30 ${
                index === 0 ? 'animate-slide-in-right' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${activity.color} flex-shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm leading-relaxed">
                    {activity.message}
                  </p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-500 text-xs">
                      {formatTimeAgo(activity.timestamp)} ago
                    </span>
                    
                    {activity.action && (
                      <button
                        onClick={() => handleAction(activity)}
                        className="text-blue-400 hover:text-blue-300 text-xs font-semibold transition-colors"
                      >
                        {activity.action}
                      </button>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => dismissActivity(activity.id)}
                  className="text-gray-500 hover:text-gray-300 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="bg-gray-800/95 backdrop-blur-sm border border-gray-700/50 rounded-b-xl p-3">
        <div className="text-center">
          <span className="text-gray-400 text-xs">
            {activities.length} recent activities
          </span>
        </div>
      </div>

      {/* Floating notification badge */}
      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-bounce">
        {activities.length}
      </div>
    </div>
  );
};

export default DashboardActivityFeed;