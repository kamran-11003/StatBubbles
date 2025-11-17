import React from 'react';
import { ChevronDown, Users } from 'lucide-react';

const PlayerCountDropdown = ({ 
  playerCount, 
  onPlayerCountSelect, 
  playerCounts, 
  isDark, 
  isOpen, 
  onToggle,
  size = 'default'
}) => {
  const isSmall = size === 'small';
  
  const buttonClass = isSmall
    ? 'flex items-center px-2 py-1 rounded text-xs'
    : 'flex items-center px-3 py-1 rounded-lg text-xs';
    
  const iconSize = isSmall ? 12 : 14;

  return (
    <div className={`relative dropdown-container ${isSmall ? 'flex-shrink-0' : ''}`} onClick={e => e.stopPropagation()}>
      <button
        onClick={onToggle}
        className={`${buttonClass} ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'} focus:outline-none ${isSmall ? 'whitespace-nowrap' : ''}`}
      >
        {!isSmall && <Users className="mr-1" size={iconSize} />}
        <span className={`font-medium ${isSmall ? 'mr-1' : 'mr-2 truncate'}`}>
          {playerCounts.find(p => p.value === playerCount)?.label || 'Top 10'}
        </span>
        <ChevronDown size={iconSize} />
      </button>
      {isOpen && (
        <div className={`absolute left-0 mt-2 py-2 ${isSmall ? 'w-28' : 'w-36'} rounded-md shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'} ring-1 ring-black ring-opacity-5 z-50`}>
          {playerCounts.map(option => (
            <button
              key={option.value}
              className={`block w-full text-left px-4 py-2 text-xs ${
                playerCount === option.value 
                  ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') 
                  : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')
              }`}
              onClick={() => onPlayerCountSelect(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlayerCountDropdown;

