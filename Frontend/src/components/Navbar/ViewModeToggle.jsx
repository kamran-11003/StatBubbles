import React from 'react';
import { Users, Database } from 'lucide-react';

const ViewModeToggle = ({ viewMode, onViewModeChange, isDark, size = 'default' }) => {
  const isSmall = size === 'small';
  
  const buttonClass = isSmall
    ? 'px-2 py-1 rounded text-xs font-medium transition-all duration-200 flex items-center gap-1'
    : 'px-3 py-1 rounded-lg font-medium transition-all duration-200';
    
  const iconSize = isSmall ? 12 : 16;

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onViewModeChange('Players')}
        className={`${buttonClass} ${
          viewMode === 'Players'
            ? isDark ? 'bg-blue-300 text-blue-900' : 'bg-blue-100 text-blue-700'
            : isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-50'
        }`}
      >
        {isSmall && <Users size={iconSize} />}
        <span>{isSmall ? 'P' : 'Players'}</span>
      </button>
      <button
        onClick={() => onViewModeChange('Teams')}
        className={`${buttonClass} ${
          viewMode === 'Teams'
            ? isDark ? 'bg-blue-300 text-blue-900' : 'bg-blue-100 text-blue-700'
            : isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-50'
        }`}
      >
        {isSmall && <Database size={iconSize} />}
        <span>{isSmall ? 'T' : 'Teams'}</span>
      </button>
    </div>
  );
};

export default ViewModeToggle;

