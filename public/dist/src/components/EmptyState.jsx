import React from 'react';

const EmptyState = ({ hasPlayers, isDark }) => (
  <div className="w-full h-full">
    <div className="w-full h-full bg-transparent flex items-center justify-center">
      <div className="text-center">
        <div className="text-3xl mb-4">
          {hasPlayers ? '🔍' : '👋'}
        </div>
        <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {hasPlayers 
            ? 'Players not found'
            : 'Select a sport to view player statistics'}
        </p>
      </div>
    </div>
  </div>
);

export default EmptyState;