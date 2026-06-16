import React, { useState } from 'react';

const ViewModeToggle = ({ viewMode, onViewModeChange, isDark }) => {
  const isPlayers = viewMode === 'Players';
  const [hovered, setHovered] = useState(null); // 'Players', 'Teams', or null

  // CSS filter to colorize PNG to #0066ff (vibrant blue)
  const activeFilter = "brightness(0) saturate(100%) invert(32%) sepia(97%) saturate(2250%) hue-rotate(212deg) brightness(101%) contrast(106%)";
  
  // CSS filter to colorize PNG to slightly brighter blue for hover active state
  const activeHoverFilter = "brightness(0) saturate(100%) invert(32%) sepia(97%) saturate(2250%) hue-rotate(212deg) brightness(120%) contrast(106%)";

  // Inactive style filters based on theme (#71717a for neutral gray, #a1a1aa for hover gray)
  const inactiveFilter = "brightness(0) saturate(100%) invert(47%) sepia(8%) saturate(350%) hue-rotate(203deg) brightness(93%) contrast(92%)";
  const inactiveHoverFilter = "brightness(0) saturate(100%) invert(72%) sepia(5%) saturate(318%) hue-rotate(204deg) brightness(91%) contrast(88%)";

  const getFilter = (type) => {
    const isActive = viewMode === type;
    const isHovered = hovered === type;
    
    if (isActive) {
      return isHovered ? activeHoverFilter : activeFilter;
    } else {
      return isHovered ? inactiveHoverFilter : inactiveFilter;
    }
  };

  return (
    <div 
      className={`relative flex items-center w-[110px] h-9 p-[3px] rounded-full transition-all duration-300 backdrop-blur-md select-none ${
        isDark 
          ? 'bg-[#1a1a1e]/90 border border-white/5 shadow-[0_0_12px_rgba(0,102,255,0.02)]' 
          : 'bg-white/95 border border-gray-200 shadow-sm'
      }`}
    >
      {/* Sliding background pill highlight */}
      <div 
        className={`absolute top-[4px] h-[26px] w-[42px] rounded-full transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] border ${
          isDark 
            ? 'bg-blue-500/10 border-blue-500/25 shadow-[0_0_8px_rgba(0,102,255,0.15)]' 
            : 'bg-blue-600/10 border-blue-600/20 shadow-[0_0_8px_rgba(0,102,255,0.08)]'
        }`}
        style={{
          left: '6px',
          transform: `translateX(${isPlayers ? '0px' : '56px'})`
        }}
      />
      
      {/* Players button */}
      <button
        onClick={() => onViewModeChange('Players')}
        onMouseEnter={() => setHovered('Players')}
        onMouseLeave={() => setHovered(null)}
        className="w-[48px] h-full flex items-center justify-center z-10 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
        aria-label="View Players"
        aria-pressed={isPlayers}
        title="Players"
      >
        <img 
          src="/players.png" 
          alt="Players" 
          className="w-[16px] h-[16px] object-contain transition-all duration-300 cursor-pointer"
          style={{
            filter: getFilter('Players'),
            opacity: isPlayers ? 1 : 0.6
          }}
        />
      </button>

      {/* Forward slash / separator */}
      <span className="flex-1 flex justify-center text-zinc-500/30 select-none text-[10px] font-semibold z-10">/</span>

      {/* Teams button */}
      <button
        onClick={() => onViewModeChange('Teams')}
        onMouseEnter={() => setHovered('Teams')}
        onMouseLeave={() => setHovered(null)}
        className="w-[48px] h-full flex items-center justify-center z-10 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
        aria-label="View Teams"
        aria-pressed={!isPlayers}
        title="Teams"
      >
        <img 
          src="/teams.png" 
          alt="Teams" 
          className="w-[26px] h-[26px] object-contain transition-all duration-300 cursor-pointer"
          style={{
            filter: getFilter('Teams'),
            opacity: !isPlayers ? 1 : 0.6
          }}
        />
      </button>
    </div>
  );
};

export default ViewModeToggle;
