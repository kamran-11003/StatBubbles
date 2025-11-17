import React from 'react';
import { ChevronDown } from 'lucide-react';

const StatsDropdown = ({ 
  selectedStat, 
  onStatSelect, 
  statList,
  selectedLeague,
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
  
  const dropdownWidth = isSmall ? 'w-48' : 'w-56';
  
  // Check if stats have categories
  const hasCategories = statList.some(stat => stat.category);
  
  // Get unique categories for MLB, NFL, NHL
  const categories = hasCategories ? [...new Set(statList.map(stat => stat.category))] : [];
  
  const renderCategorizedStats = () => {
    if (selectedLeague === 'MLB') {
      return (
        <>
          {['Batting', 'Fielding', 'Pitching'].map(category => (
            <div key={category}>
              <div className="px-3 py-1 border-b border-gray-200 dark:border-gray-700">
                <h3 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {category}
                </h3>
              </div>
              {statList.filter(stat => stat.category === category).map(stat => (
                <button
                  key={stat.key}
                  className={`block w-full text-left px-4 py-2 text-xs ${
                    selectedStat === stat.key 
                      ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') 
                      : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')
                  }`}
                  onClick={() => onStatSelect(stat.key)}
                >
                  {stat.label}
                </button>
              ))}
            </div>
          ))}
        </>
      );
    }
    
    if (selectedLeague === 'NFL') {
      return (
        <>
          {['General', 'Passing', 'Rushing', 'Receiving', 'Defense', 'Scoring', 'Kicking', 'Punting', 'Returns'].map(category => (
            <div key={category}>
              <div className="px-3 py-1 border-b border-gray-200 dark:border-gray-700">
                <h3 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {category}
                </h3>
              </div>
              {statList.filter(stat => stat.category === category).map(stat => (
                <button
                  key={stat.key}
                  className={`block w-full text-left px-4 py-2 text-xs ${
                    selectedStat === stat.key 
                      ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') 
                      : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')
                  }`}
                  onClick={() => onStatSelect(stat.key)}
                >
                  {stat.label}
                </button>
              ))}
            </div>
          ))}
        </>
      );
    }
    
    if (selectedLeague === 'NHL') {
      return (
        <>
          {['General', 'Offensive', 'Goalie', 'Defensive', 'Penalties'].map(category => (
            <div key={category}>
              <div className="px-3 py-1 border-b border-gray-200 dark:border-gray-700">
                <h3 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {category}
                </h3>
              </div>
              {statList.filter(stat => stat.category === category).map(stat => (
                <button
                  key={stat.key}
                  className={`block w-full text-left px-4 py-2 text-xs ${
                    selectedStat === stat.key 
                      ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') 
                      : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')
                  }`}
                  onClick={() => onStatSelect(stat.key)}
                >
                  {stat.label}
                </button>
              ))}
            </div>
          ))}
        </>
      );
    }
    
    return null;
  };

  return (
    <div className={`relative dropdown-container ${isSmall ? 'flex-shrink-0' : ''}`} onClick={e => e.stopPropagation()}>
      <button
        onClick={onToggle}
        className={`${buttonClass} ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'} focus:outline-none ${isSmall ? 'whitespace-nowrap' : ''}`}
      >
        <span className={`font-medium ${isSmall ? 'mr-1 truncate max-w-[70px]' : 'mr-2 truncate max-w-[120px]'}`}>
          {statList.find(stat => stat.key === selectedStat)?.label || 'Select Stat'}
        </span>
        <ChevronDown size={iconSize} />
      </button>
      {isOpen && (
        <div className={`absolute left-0 mt-2 py-2 ${dropdownWidth} rounded-md shadow-lg max-h-60 overflow-y-auto ${isDark ? 'bg-gray-800' : 'bg-white'} ring-1 ring-black ring-opacity-5 z-50`}>
          {hasCategories ? (
            renderCategorizedStats()
          ) : (
            statList.map(stat => (
              <button
                key={stat.key}
                className={`block w-full text-left px-4 py-2 text-xs ${
                  selectedStat === stat.key 
                    ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') 
                    : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')
                }`}
                onClick={() => onStatSelect(stat.key)}
              >
                {stat.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default StatsDropdown;

