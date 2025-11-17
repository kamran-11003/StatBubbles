import React from 'react';

const LeagueButton = ({ 
  league, 
  isSelected, 
  onClick, 
  isDark, 
  showLiveScore = false, 
  liveGameData = null,
  size = 'default'
}) => {
  const isSmall = size === 'small';
  
  const buttonClass = isSmall
    ? 'px-2.5 py-1 rounded text-xs font-medium transition-all duration-200 whitespace-nowrap'
    : 'px-4 py-1 rounded-lg transition-all duration-300';

  return (
    <button
      onClick={onClick}
      className={`${buttonClass} ${
        isSelected 
          ? 'bg-blue-500 text-white' 
          : `${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-50'}`
      } ${!isSmall && 'focus:outline-none focus:ring-2 focus:ring-blue-500'}`}
    >
      <span className="font-medium">
        {league.name}
      </span>
    </button>
  );
};

export default LeagueButton;

