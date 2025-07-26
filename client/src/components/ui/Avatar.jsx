import React from 'react';

const Avatar = ({ theme, color, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-20 h-20 text-lg'
  };

  const themes = {
    gamer: { icon: '🎮', label: 'Gamer' },
    coder: { icon: '💻', label: 'Coder' },
    genius: { icon: '🧠', label: 'Genius' },
    champion: { icon: '🏆', label: 'Champion' },
    cyborg: { icon: '🦾', label: 'Cyborg' },
    ninja: { icon: '🥷', label: 'Ninja' }
  };

  const colors = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    pink: 'bg-pink-500',
    yellow: 'bg-yellow-500',
    cyan: 'bg-cyan-500'
  };

  const selectedTheme = themes[theme] || themes.coder;
  const selectedColor = colors[color] || colors.blue;

  return (
    <div className={`${sizes[size]} ${selectedColor} rounded-full flex items-center justify-center text-white font-bold shadow-lg ${className}`}>
      <span className="text-lg">{selectedTheme.icon}</span>
    </div>
  );
};

export default Avatar;