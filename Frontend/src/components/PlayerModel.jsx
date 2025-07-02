import React from 'react';
import fanatics from '/fanatics.jpg';

const PlayerModal = ({ player, isDark, onClose, leagueStats, onShowTeamPlayers }) => {
  // Get player name from the updated schema
  const getPlayerName = (player) => {
    return player.fullName || player.displayName || `${player.firstName || ''} ${player.lastName || ''}`.trim() || 'Unknown';
  };

  const nameParts = getPlayerName(player).split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

  // Determine league based on stats
  const determineLeague = () => {
    // For NFL players, stats are directly on the player object
    if (player.touchdowns !== undefined || player.passYards !== undefined) {
      return 'NFL';
    }
    
    // For NHL players, stats are directly on the player object
    if (player.goals !== undefined || player.assists !== undefined || player.plusMinus !== undefined) {
      return 'NHL';
    }
    
    // For other players, stats are in player.stats
    if (player.stats) {
      if ('points' in player.stats && 'rebounds' in player.stats && 'assists' in player.stats) return 'NBA';
      if ('gamesPlayed' in player.stats && 'strikeouts' in player.stats) return 'MLB';
      if ('goals' in player.stats && 'plusMinus' in player.stats) return 'NHL';
    }
    return 'WNBA'; // Default to WNBA for now
  };

  // Add league to player object if not present
  player.league = player.league || determineLeague();

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      onClick={onClose}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div
        className={`${isDark ? 'bg-gray-800/80' : 'bg-white/80'} p-6 rounded-xl w-[400px] mx-4 backdrop-blur-md max-h-[80vh] flex flex-col`}
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
            {player.headshot && (
              <img 
                src={typeof player.headshot === 'string' ? player.headshot : player.headshot.href} 
                alt={getPlayerName(player)}
                className="w-16 h-16 object-cover rounded-full"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
            <div>
              <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                <div className="text-2xl">{firstName}</div>
                {lastName && <div className="text-2xl">{lastName}</div>}
                <span 
                  className={`text-sm font-normal ${isDark ? 'text-gray-400' : 'text-gray-600'} cursor-pointer hover:underline transition-all duration-200`}
                  onClick={(e) => {
                    e.stopPropagation();
                    const teamName = player.teamDisplayName || player.teamName || player.teamAbbreviation || player.teamId;
                    if (teamName && teamName !== player.league) {
                      // Create a team object for the TeamPlayersView
                      const team = {
                        teamDisplayName: player.teamDisplayName,
                        teamName: player.teamName,
                        teamAbbreviation: player.teamAbbreviation,
                        teamId: player.teamId,
                        displayName: player.teamDisplayName || player.teamName
                      };
                      onShowTeamPlayers(team);
                    }
                  }}
                >
                  {player.teamDisplayName || player.teamName || player.teamAbbreviation || player.teamId || player.league}
                </span>
              </h3>
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
            {/* Handle both nested stats object and direct stats properties */}
            {(() => {
              // For NFL and NHL players, stats are directly on the player object
              // For other players, stats are in player.stats
              const statsToDisplay = player.stats || player;
              const excludeKeys = ['_id', '__v', 'matchPositions', 'relevanceScore', 'isMatch', 'playerId', 'uid', 'guid', 'type', 'firstName', 'lastName', 'displayName', 'shortName', 'weight', 'height', 'age', 'jersey', 'position', 'college', 'teamId', 'teamName', 'teamAbbreviation', 'teamColor', 'teamAlternateColor', 'headshot', 'createdAt', 'updatedAt', 'league'];
              
              return Object.entries(statsToDisplay)
                .filter(([key, value]) => {
                  // Only filter out non-stat properties, show all actual stats
                  return !excludeKeys.includes(key) && value !== null && value !== undefined;
                })
                .map(([key, value]) => {
                  // Create a readable label for the stat
                  const statLabel = key
                    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
                    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
                    .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word
                  
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
                        {typeof value === 'number' 
                          ? (key.toLowerCase().includes('percentage') || key.toLowerCase().includes('pct') || key.toLowerCase().includes('avg') || value < 1
                              ? value.toFixed(2)
                              : (key === 'points' || key === 'avgPoints'
                                  ? value.toFixed(1)
                                  : Math.round(value)))
                          : (value || '0')}
                        {key.toLowerCase().includes('percentage') || key.toLowerCase().includes('pct') ? '%' : ''}
                      </span>
                    </div>
                  );
                });
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerModal;