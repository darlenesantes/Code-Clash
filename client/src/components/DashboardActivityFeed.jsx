import React, { useState, useEffect } from 'react';
import { 
  Trophy, Zap, Users, Crown, Medal, Swords, 
  Target, Code, Fire, Star, Bell, X 
} from 'lucide-react';

const DashboardActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [isVisible, setIsVisible] = useState(true);

  // Sample activities that generate dynamically
  const activityTemplates = [
    {
      type: 'invite',
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/20',
      messages: [
        'BeastCoder sent you a battle invite!',
        'CodeWarrior wants to challenge you!',
        'AlgoMaster is looking for opponents!',
        'ByteNinja invited you to a duel!'
      ]
    },
    {
      type: 'victory',
      icon: Trophy,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10 border-yellow-500/20',
      messages: [
        'CodeWarrior won the Daily Championship!',
        'BeastCoder defeated 5 opponents in a row!',
        'AlgoWizard completed a perfect streak!',
        'ByteNinja won the Speed Coding contest!'
      ]
    },
    {
      type: 'achievement',
      icon: Medal,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/20',
      messages: [
        'CandyJava beat 3-time Diamond Coder!',
        'CodeNinja reached Platinum rank!',
        'AlgoMaster solved 100 problems today!',
        'ByteBeast earned "Speed Demon" badge!'
      ]
    },
    {
      type: 'tournament',
      icon: Crown,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10 border-red-500/20',
      messages: [
        'Weekly Tournament starting in 10 minutes!',
        'Championship Finals: CodeWarrior vs BeastCoder!',
        'New tournament bracket released!',
        'Prize pool increased to 10,000 coins!'
      ]
    },
    {
      type: 'challenge',
      icon: Swords,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10 border-green-500/20',
      messages: [
        'Epic battle: AlgoWizard vs CodeNinja!',
        'Legendary match in progress!',
        'New record: Problem solved in 47 seconds!',
        'Upset victory: Bronze beat Diamond player!'
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
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  // Add new activities every 3-5 seconds
  useEffect(() => {
    const addActivity = () => {
      const newActivity = generateActivity();
      setActivities(prev => [newActivity, ...prev.slice(0, 4)]); // Keep only 5 activities
    };

    // Add initial activity
    addActivity();

    // Set up interval for new activities
    const interval = setInterval(() => {
      addActivity();
    }, Math.random() * 2000 + 3000); // 3-5 seconds

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-1/2 right-4 transform -translate-y-1/2 w-80 z-50">
      {/* Semi-transparent background with backdrop blur */}
      <div className="bg-gray-900/40 backdrop-blur-md border border-gray-700/50 rounded-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-700/50">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-white">Live Activity</span>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Activities */}
        <div className="p-2 max-h-80 overflow-y-auto">
          {activities.map((activity, index) => {
            const IconComponent = activity.icon;
            return (
              <div
                key={activity.id}
                className={`p-3 rounded-lg border mb-2 transition-all duration-500 ease-out backdrop-blur-sm ${activity.bgColor} ${
                  index === 0 ? 'animate-pulse' : ''
                }`}
                style={{
                  animation: index === 0 ? 'slideInRight 0.5s ease-out' : undefined,
                  backgroundColor: 'rgba(17, 24, 39, 0.3)' // Additional semi-transparent background
                }}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full bg-gray-800/60 ${activity.color}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white leading-relaxed">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-700/50 bg-gray-800/30">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Live updates</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Online</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardActivityFeed;