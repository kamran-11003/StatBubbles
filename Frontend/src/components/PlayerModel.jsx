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
                  {player.teamDisplayName || player.teamName}
                </span>
              </h3>
              
              {/* MLB Qualification Status */}
              {player.league === 'MLB' && (
                <div className="flex gap-2 mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${player.qualifiedBatting ? (isDark ? 'bg-green-600/20 text-green-400' : 'bg-green-100 text-green-800') : (isDark ? 'bg-red-600/20 text-red-400' : 'bg-red-100 text-red-800')}`}>
                    {player.qualifiedBatting ? '✓ Batting' : '✗ Batting'}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${player.qualifiedFielding ? (isDark ? 'bg-green-600/20 text-green-400' : 'bg-green-100 text-green-800') : (isDark ? 'bg-red-600/20 text-red-400' : 'bg-red-100 text-red-800')}`}>
                    {player.qualifiedFielding ? '✓ Fielding' : '✗ Fielding'}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${player.qualifiedPitching ? (isDark ? 'bg-green-600/20 text-green-400' : 'bg-green-100 text-green-800') : (isDark ? 'bg-red-600/20 text-red-400' : 'bg-red-100 text-red-800')}`}>
                    {player.qualifiedPitching ? '✓ Pitching' : '✗ Pitching'}
                  </span>
                </div>
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
            {/* Handle both nested stats object and direct stats properties */}
            {(() => {
              // For NFL and NHL players, stats are directly on the player object
              // For other players, stats are in player.stats
              const statsToDisplay = player.stats || player;
              const excludeKeys = [
                '_id', '__v', 'matchPositions', 'relevanceScore', 'isMatch',
                'playerId', 'uid', 'guid', 'type', 'firstName', 'lastName', 'displayName', 'shortName',
                'weight', 'height', 'age', 'jersey', 'position', 'college',
                'teamId', 'teamName', 'teamDisplayName', 'teamAbbreviation', 'teamColor', 'teamAlternateColor',
                'headshot', 'createdAt', 'updatedAt', 'league',
                // Non-stat UI/physics fields sometimes present
                'x', 'y', 'vx', 'vy', 'index',
                // Misc vendor/branding fields if present
                'fanatics'
              ];
              
              return Object.entries(statsToDisplay)
                .filter(([key, value]) => {
                  // Only filter out non-stat properties, show all actual stats
                  return !excludeKeys.includes(key) && value !== null && value !== undefined;
                })
                .map(([key, value]) => {
                  // MLB stat label mapping
                  const mlbStatLabels = {
                    batting_gamesPlayed: 'Games Played',
                    batting_atBats: 'At Bats',
                    batting_runs: 'Runs',
                    batting_hits: 'Hits',
                    batting_doubles: 'Doubles',
                    batting_triples: 'Triples',
                    batting_homeRuns: 'Home Runs',
                    batting_RBIs: 'RBIs',
                    batting_stolenBases: 'Stolen Bases',
                    batting_caughtStealing: 'Caught Stealing',
                    batting_walks: 'Walks',
                    batting_strikeouts: 'Strikeouts',
                    batting_avg: 'Batting Average',
                    batting_onBasePct: 'On Base %',
                    batting_slugAvg: 'Slugging',
                    fielding_gamesPlayed: 'Games Played',
                    fielding_putouts: 'Putouts',
                    fielding_assists: 'Assists',
                    fielding_errors: 'Errors',
                    fielding_fieldingPct: 'Fielding %',
                    pitching_gamesPlayed: 'Games Played',
                    pitching_gamesStarted: 'Games Started',
                    pitching_innings: 'Innings',
                    pitching_hits: 'Hits',
                    pitching_runs: 'Runs',
                    pitching_earnedRuns: 'Earned Runs',
                    pitching_homeRuns: 'Home Runs',
                    pitching_walks: 'Walks',
                    pitching_strikeouts: 'Strikeouts',
                    pitching_wins: 'Wins',
                    pitching_losses: 'Losses',
                    pitching_saves: 'Saves',
                    pitching_ERA: 'ERA',
                    pitching_WHIP: 'WHIP',
                  };
                  // Use mapping for MLB, fallback to current label logic
                  let statLabel = (player.league === 'MLB' && mlbStatLabels[key])
                    ? mlbStatLabels[key]
                    : key
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, str => str.toUpperCase())
                        .replace(/\b\w/g, l => l.toUpperCase());
                  // WNBA: Only add % sign to percentage stats, not averages
                  const wnbaPercentKeys = [
                    'fieldGoalPct', 'threePointFieldGoalPct', 'freeThrowPct'
                  ];
                  let displayValue = value;
                  if (player.league === 'MLB') {
                    if (typeof value === 'number') {
                      if (key.toLowerCase().includes('pct') || key.toLowerCase().includes('percentage')) {
                        displayValue = `${(value * 100).toFixed(0)}%`;
                      } else if (
                        key.toLowerCase().includes('avg') ||
                        key.toLowerCase().includes('era') ||
                        key.toLowerCase().includes('whip') ||
                        key.toLowerCase().includes('ops')
                      ) {
                        displayValue = value.toFixed(3);
                      } else {
                        displayValue = Math.round(value);
                      }
                    }
                  } else {
                    // Default formatting for other leagues
                    if (typeof value === 'number') {
                      if (player.league === 'WNBA' && wnbaPercentKeys.includes(key)) {
                        displayValue = `${(value * 100).toFixed(0)}%`;
                      } else {
                        displayValue = (key.toLowerCase().includes('percentage') || key.toLowerCase().includes('pct') || key.toLowerCase().includes('avg') || value < 1
                          ? value.toFixed(2)
                          : (key === 'points' || key === 'avgPoints'
                              ? value.toFixed(1)
                              : Math.round(value)));
                      }
                    }
                  }
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
                        {displayValue}
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