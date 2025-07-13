import React from 'react';
import fanatics from '/fanatics.jpg';

const TeamModal = ({ team, isDark, onClose, onShowTeamPlayers }) => {
  // Get team name from the team object
  const getTeamName = (team) => {
    return team.displayName || team.name || team.shortDisplayName || 'Unknown Team';
  };

  const teamName = getTeamName(team);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      onClick={onClose}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div
        className={`${isDark ? 'bg-gray-800/80' : 'bg-white/80'} p-6 rounded-xl w-[500px] mx-4 backdrop-blur-md max-h-[80vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
        style={{
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          background: isDark 
            ? 'linear-gradient(135deg, rgba(31, 41, 55, 0.85), rgba(17, 24, 39, 0.9))' 
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(240, 240, 240, 0.8))'
        }}
      >
        <div className="flex justify-between items-start mb-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            {team.logos && team.logos[0] && (
              <img 
                src={team.logos[0].href} 
                alt={team.logos[0].alt || teamName}
                className="w-16 h-16 object-contain"
              />
            )}
            <div>
              <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {teamName}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {team.location} • {team.nickname}
              </p>
              {/* View Players Button */}
              {onShowTeamPlayers && (
                <button
                  className={`mt-2 px-4 py-1 rounded-lg font-semibold text-sm transition-all duration-200 shadow ${isDark ? 'bg-blue-700/80 text-white hover:bg-blue-600/90' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
                  onClick={() => {
                    onClose();
                    setTimeout(() => onShowTeamPlayers && onShowTeamPlayers(team), 0);
                  }}
                >
                  View Players
                </button>
              )}
            </div>
          </div>
          <button 
            className={`p-1 rounded-full ${isDark ? 'hover:bg-gray-700/70' : 'hover:bg-gray-200/70'}`}
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Advertisement Section */}
        <div 
          className={`mb-6 rounded-lg overflow-hidden ${isDark ? 'bg-gray-700/60' : 'bg-gray-100/60'} cursor-pointer transition-transform hover:scale-[1.02] flex-shrink-0`}
          style={{
            boxShadow: isDark ? 'inset 0 1px 1px rgba(255, 255, 255, 0.05)' : 'inset 0 1px 1px rgba(255, 255, 255, 0.5)',
            border: isDark ? '1px solid rgba(75, 85, 99, 0.3)' : '1px solid rgba(209, 213, 219, 0.4)',
            aspectRatio: '16/9'
          }}
          onClick={() => window.open('https://nbastore.vwz6.net/mObkkq', '_blank')}
        >
          <div className="w-full h-full relative">
            <img 
              src="/fanatics.jpg" 
              alt="Fanatics" 
              className="w-full h-full object-contain bg-[#0B1B3F]"
            />
          </div>
        </div>

        {/* Scrollable Stats Section */}
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-3 pb-2">
            {Object.entries(team)
              .filter(([key, value]) => {
                // Filter out non-stat properties and show team stats
                const excludeKeys = ['_id', '__v', 'teamId', 'uid', 'abbreviation', 'displayName', 'shortDisplayName', 'name', 'nickname', 'location', 'color', 'alternateColor', 'logos', 'createdAt', 'updatedAt', 'standingsUpdatedAt', 'x', 'y', 'vx', 'vy', 'index'];
                return !excludeKeys.includes(key) && value !== null && value !== undefined;
              })
              .map(([key, value]) => {
                // Create a readable label for the stat
                const statLabel = key
                  .replace(/([A-Z])/g, ' $1') // Add space before capital letters
                  .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
                  .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word
                
                // Format record stats (home, away, conference, last ten games)
                const isRecordStat = ['homeRecord', 'awayRecord', 'conferenceRecord', 'lastTenGames'].includes(key);
                
                return (
                  <div 
                    key={key}
                    className={`p-3 ${isDark ? 'bg-gray-700/60' : 'bg-gray-100/60'} rounded-lg backdrop-blur-sm`}
                    style={{
                      boxShadow: isDark ? 'inset 0 1px 1px rgba(255, 255, 255, 0.05)' : 'inset 0 1px 1px rgba(255, 255, 255, 0.5)',
                      border: isDark ? '1px solid rgba(75, 85, 99, 0.3)' : '1px solid rgba(209, 213, 219, 0.4)'
                    }}
                  >
                    <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{statLabel}: </span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>
                      {isRecordStat && typeof value === 'string' && value.includes('-') 
                        ? value // Display record as-is (e.g., "10-10")
                        : typeof value === 'number' 
                          ? (key.toLowerCase().includes('percentage') || key.toLowerCase().includes('pct') || value < 1
                              ? value.toFixed(2)
                              : Math.round(value))
                          : (value || '0')}
                      {!isRecordStat && (key.toLowerCase().includes('percentage') || key.toLowerCase().includes('pct')) ? '%' : ''}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamModal; 