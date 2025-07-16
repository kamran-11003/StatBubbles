import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronDown, Clock, Users, TrendingUp } from 'lucide-react';

const LiveView = ({ 
  isDark, 
  selectedLeague, 
  liveGames
}) => {
  const [liveMenuOpen, setLiveMenuOpen] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());
  const [currentGameIndex, setCurrentGameIndex] = useState(0);

  // Get current live game for selected league
  const getCurrentLiveGame = useMemo(() => {
    if (!liveGames || !selectedLeague) return null;
    
    const game = liveGames.find(g => g.sport === selectedLeague);
    if (!game) return null;

    // Format game data based on league
    switch (selectedLeague) {
      case 'NBA':
        return {
          homeTeam: { 
            abbr: game.HomeTeam, 
            name: game.HomeTeam, 
            score: game.HomeTeamScore || 0,
            color: game.HomeTeamColor || '#3b82f6'
          },
          awayTeam: { 
            abbr: game.AwayTeam, 
            name: game.AwayTeam, 
            score: game.AwayTeamScore || 0,
            color: game.AwayTeamColor || '#3b82f6'
          },
          period: `Q${game.Quarter || ''}`,
          time: game.TimeRemaining || '',
          status: game.Status,
          clock: game.Clock
        };

      case 'WNBA':
        return {
          homeTeam: { 
            abbr: game.HomeTeam, 
            name: game.HomeTeam, 
            score: game.HomeTeamScore || 0,
            color: game.HomeTeamColor || '#3b82f6'
          },
          awayTeam: { 
            abbr: game.AwayTeam, 
            name: game.AwayTeam, 
            score: game.AwayTeamScore || 0,
            color: game.AwayTeamColor || '#3b82f6'
          },
          period: `Q${game.Quarter || ''}`,
          time: game.TimeRemaining || '',
          status: game.Status,
          clock: game.Clock
        };

      case 'NFL':
        return {
          homeTeam: { 
            abbr: game.HomeTeam, 
            name: game.HomeTeam, 
            score: game.HomeScore || 0,
            color: game.HomeTeamColor || '#3b82f6'
          },
          awayTeam: { 
            abbr: game.AwayTeam, 
            name: game.AwayTeam, 
            score: game.AwayScore || 0,
            color: game.AwayTeamColor || '#3b82f6'
          },
          period: game.QuarterDescription || game.Quarter || '',
          time: game.TimeRemaining || '',
          situation: game.DownAndDistance || '',
          status: game.Status,
          clock: game.Clock
        };

      case 'MLB':
        return {
          homeTeam: { 
            abbr: game.HomeTeam, 
            name: game.HomeTeam, 
            score: game.HomeTeamRuns || 0,
            hits: game.HomeTeamHits || 0,
            errors: game.HomeTeamErrors || 0,
            color: game.HomeTeamColor || '#3b82f6'
          },
          awayTeam: { 
            abbr: game.AwayTeam, 
            name: game.AwayTeam, 
            score: game.AwayTeamRuns || 0,
            hits: game.AwayTeamHits || 0,
            errors: game.AwayTeamErrors || 0,
            color: game.AwayTeamColor || '#3b82f6'
          },
          period: game.Inning ? `${game.InningHalf} ${game.Inning}` : '',
          status: game.Status,
          clock: game.Clock
        };

      case 'NHL':
        return {
          homeTeam: { 
            abbr: game.HomeTeam, 
            name: game.HomeTeam, 
            score: game.HomeTeamScore || 0,
            color: game.HomeTeamColor || '#3b82f6'
          },
          awayTeam: { 
            abbr: game.AwayTeam, 
            name: game.AwayTeam, 
            score: game.AwayTeamScore || 0,
            color: game.AwayTeamColor || '#3b82f6'
          },
          period: `Period ${game.Period || ''}`,
          time: game.TimeRemaining || '',
          status: game.Status,
          clock: game.Clock
        };

      default:
        return null;
    }
  }, [liveGames, selectedLeague]);

  // Get the current game stats string based on league
  const getGameStatsString = (game) => {
    if (!game) return '';
    
    return `${game.awayTeam.abbr} ${game.awayTeam.score} - ${game.homeTeam.score} ${game.homeTeam.abbr}`;
  };

  // Filter live games for selected league
  const selectedLeagueLiveGames = useMemo(() => {
    const filtered = liveGames?.filter(game => game.sport === selectedLeague) || [];
    return filtered;
  }, [liveGames, selectedLeague]);

  // Auto-rotate through games every 8 seconds when multiple games are live (open or closed)
  useEffect(() => {
    if (selectedLeagueLiveGames.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentGameIndex(prevIndex => 
        prevIndex + 1 >= selectedLeagueLiveGames.length ? 0 : prevIndex + 1
      );
    }, 8000);

    return () => clearInterval(interval);
  }, [selectedLeagueLiveGames.length]);

  // Reset current game index when league or menu is opened/closed
  useEffect(() => {
    setCurrentGameIndex(0);
  }, [selectedLeague, liveMenuOpen]);

  // Get game status with appropriate styling
  const getGameStatus = (game) => {
    if (!game) return { text: '', color: '', icon: null };
    
    const status = game.status || game.Status;
    const clock = game.clock || game.Clock;
    const startTime = game.startTime || game.StartTime;
    
    if (status === 'InProgress' || status === 'in') {
      return {
        text: 'LIVE',
        color: 'text-red-500',
        icon: <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-1.5" />
      };
    } else if (status === 'Final' || status === 'post') {
      return {
        text: 'FINAL',
        color: 'text-gray-500',
        icon: <div className="w-2 h-2 bg-gray-500 rounded-full mr-1.5" />
      };
    } else if (status === 'Scheduled' || status === 'pre') {
      // Format the date for scheduled games
      let timeText = 'UPCOMING';
      
      if (startTime) {
        try {
          // Handle different date formats
          let gameDate;
          if (typeof startTime === 'string') {
            // Try parsing as ISO string first
            gameDate = new Date(startTime);
            
            // If that fails, try other formats
            if (isNaN(gameDate.getTime())) {
              // Try parsing as timestamp
              const timestamp = parseInt(startTime);
              if (!isNaN(timestamp)) {
                gameDate = new Date(timestamp);
              } else {
                // Try parsing as different date formats
                gameDate = new Date(startTime.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
              }
            }
          } else if (typeof startTime === 'number') {
            gameDate = new Date(startTime);
          } else {
            gameDate = new Date(startTime);
          }
          
          // Check if the date is valid
          if (isNaN(gameDate.getTime())) {
            timeText = 'TBD';
          } else {
            const now = new Date();
            
            // Debug: Log the dates to understand the issue
            console.log('🔍 Date Debug:', {
              originalStartTime: startTime,
              parsedGameDate: gameDate,
              gameDateUTC: gameDate.toISOString(),
              gameDateLocal: gameDate.toString(),
              now: now.toString(),
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            });
            
            // Convert UTC game date to local time for comparison
            const localGameDate = new Date(gameDate.getTime());
            
            // Compare dates by day rather than by hours for more reliable "Today/Tomorrow" detection
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            // Reset time to start of day for comparison
            const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const tomorrowStart = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
            const gameDateStart = new Date(localGameDate.getFullYear(), localGameDate.getMonth(), localGameDate.getDate());
            
            const diffInHours = (localGameDate - now) / (1000 * 60 * 60);
            
            console.log('🔍 Time Debug:', {
              diffInHours: diffInHours,
              todayStart: todayStart.toISOString(),
              tomorrowStart: tomorrowStart.toISOString(),
              gameDateStart: gameDateStart.toISOString(),
              isToday: gameDateStart.getTime() === todayStart.getTime(),
              isTomorrow: gameDateStart.getTime() === tomorrowStart.getTime()
            });
            
            if (diffInHours < 0) {
              // Game is in the past but still marked as scheduled
              timeText = 'TBD';
            } else if (gameDateStart.getTime() === todayStart.getTime()) {
              // Same day - show "Today" with time
              timeText = 'Today ' + localGameDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              });
            } else if (gameDateStart.getTime() === tomorrowStart.getTime()) {
              // Tomorrow - show "Tomorrow" with time
              timeText = 'Tomorrow ' + localGameDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              });
            } else {
              // Future date - show date and time
              timeText = localGameDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              }) + ' ' + localGameDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              });
            }
          }
        } catch (error) {
          timeText = 'TBD';
        }
      }
      
      return {
        text: timeText,
        color: 'text-blue-500',
        icon: <Clock className="w-3 h-3 mr-1.5" />
      };
    }
    
    return {
      text: status || 'UNKNOWN',
      color: 'text-gray-400',
      icon: null
    };
  };

  // Update last update time when live games change (from WebSocket updates)
  useEffect(() => {
    if (liveGames && liveGames.length > 0) {
      setLastUpdateTime(new Date());
    }
  }, [liveGames]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (liveMenuOpen && !event.target.closest('.live-menu-container') && !event.target.closest('.live-button')) {
        setLiveMenuOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [liveMenuOpen]);

  // Add CSS keyframes for the slow blinking animation
  const blinkingStyle = `
    @keyframes slowBlink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
    .text-blink {
      animation: slowBlink 2s ease-in-out infinite;
    }
    
    @keyframes pulseRed {
      0%, 100% { opacity: 1; background-color: rgba(220, 38, 38, 0.9); }
      50% { opacity: 0.6; background-color: rgba(185, 28, 28, 0.7); }
    }
    .dot-blink {
      animation: pulseRed 1.2s ease-in-out infinite;
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .spin {
      animation: spin 1s linear infinite;
    }
  `;

  // Update to handle multiple games
  const formatGameData = (game) => {
    if (!game) {
      console.warn('⚠️ formatGameData: Received null game');
      return null;
    }
    
    // Format game data based on league
    switch (game.sport) {
      case 'NBA':
        return {
          homeTeam: { 
            abbr: game.HomeTeamAbbr || game.HomeTeam, 
            name: game.HomeTeam, 
            score: game.HomeTeamScore || 0,
            color: game.HomeTeamColor || '#3b82f6',
            logo: game.HomeTeamLogo
          },
          awayTeam: { 
            abbr: game.AwayTeamAbbr || game.AwayTeam, 
            name: game.AwayTeam, 
            score: game.AwayTeamScore || 0,
            color: game.AwayTeamColor || '#3b82f6',
            logo: game.AwayTeamLogo
          },
          period: `Q${game.Quarter || ''}`,
          time: game.TimeRemaining || '',
          situation: game.DownAndDistance || '',
          status: game.Status,
          clock: game.Clock,
          startTime: game.StartTime
        };
      case 'WNBA':
        return {
          homeTeam: { 
            abbr: game.HomeTeamAbbr || game.HomeTeam, 
            name: game.HomeTeam, 
            score: game.HomeTeamScore || 0,
            color: game.HomeTeamColor || '#3b82f6',
            logo: game.HomeTeamLogo
          },
          awayTeam: { 
            abbr: game.AwayTeamAbbr || game.AwayTeam, 
            name: game.AwayTeam, 
            score: game.AwayTeamScore || 0,
            color: game.AwayTeamColor || '#3b82f6',
            logo: game.AwayTeamLogo
          },
          period: `Q${game.Quarter || ''}`,
          time: game.TimeRemaining || '',
          status: game.Status,
          clock: game.Clock,
          startTime: game.StartTime
        };
      case 'NFL':
        return {
          homeTeam: { 
            abbr: game.HomeTeamAbbr || game.HomeTeam, 
            name: game.HomeTeam, 
            score: game.HomeScore || 0,
            color: game.HomeTeamColor || '#3b82f6',
            logo: game.HomeTeamLogo
          },
          awayTeam: { 
            abbr: game.AwayTeamAbbr || game.AwayTeam, 
            name: game.AwayTeam, 
            score: game.AwayScore || 0,
            color: game.AwayTeamColor || '#3b82f6',
            logo: game.AwayTeamLogo
          },
          period: game.QuarterDescription || game.Quarter || '',
          time: game.TimeRemaining || '',
          situation: game.DownAndDistance || '',
          status: game.Status,
          clock: game.Clock,
          startTime: game.StartTime
        };
      case 'MLB':
        return {
          homeTeam: { 
            abbr: game.HomeTeamAbbr || game.HomeTeam, 
            name: game.HomeTeam, 
            score: game.HomeTeamRuns || 0,
            hits: game.HomeTeamHits || 0,
            errors: game.HomeTeamErrors || 0,
            color: game.HomeTeamColor || '#3b82f6',
            logo: game.HomeTeamLogo
          },
          awayTeam: { 
            abbr: game.AwayTeamAbbr || game.AwayTeam, 
            name: game.AwayTeam, 
            score: game.AwayTeamRuns || 0,
            hits: game.AwayTeamHits || 0,
            errors: game.AwayTeamErrors || 0,
            color: game.AwayTeamColor || '#3b82f6',
            logo: game.AwayTeamLogo
          },
          period: game.Inning ? `${game.InningHalf} ${game.Inning}` : '',
          status: game.Status,
          clock: game.Clock,
          startTime: game.StartTime
        };
      case 'NHL':
        return {
          homeTeam: { 
            abbr: game.HomeTeamAbbr || game.HomeTeam, 
            name: game.HomeTeam, 
            score: game.HomeTeamScore || 0,
            color: game.HomeTeamColor || '#3b82f6',
            logo: game.HomeTeamLogo
          },
          awayTeam: { 
            abbr: game.AwayTeamAbbr || game.AwayTeam, 
            name: game.AwayTeam, 
            score: game.AwayTeamScore || 0,
            color: game.AwayTeamColor || '#3b82f6',
            logo: game.AwayTeamLogo
          },
          period: `Period ${game.Period || ''}`,
          time: game.TimeRemaining || '',
          status: game.Status,
          clock: game.Clock,
          startTime: game.StartTime
        };
      default:
        console.warn('⚠️ formatGameData: Unknown sport:', game.sport);
        return null;
    }
  };

  // Update renderGameContent to show all games with enhanced UI
  const renderGameContent = () => {
    const games = selectedLeagueLiveGames.map(game => formatGameData(game)).filter(Boolean);
    
    if (!games.length) {
      return (
        <div className="text-center py-8">
          <Users className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            No live games for {selectedLeague} at the moment
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {games.map((game, index) => {
          const gameStatus = getGameStatus(game);
          return (
            <div 
              key={`${game.homeTeam?.abbr || 'away'}-${game.awayTeam?.abbr || 'home'}-${index}`}
              className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/40' : 'bg-gray-100/40'} backdrop-blur-md border ${isDark ? 'border-gray-600/30' : 'border-gray-200/50'}`}
            >
              {/* Game header with status and time */}
              <div className="flex justify-between items-center mb-3">
                <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-gray-800/60' : 'bg-white/60'}`}>
                  {gameStatus.icon}
                  <span className={gameStatus.color}>{gameStatus.text}</span>
                </div>
                
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {game.period || 'TBD'} {game.time ? `• ${game.time}` : ''}
                </div>
              </div>
              
              {/* Rotation indicator */}
              {games.length > 1 && (
                <div className={`text-xs font-semibold ${isDark ? 'text-blue-300' : 'text-blue-700'}`}
                     title="Auto-rotating live games">
                  {`${index + 1} / ${games.length}`}
                </div>
              )}
              
              {/* Teams and score */}
              <div className="flex justify-between items-center">
                <div className="flex flex-col items-center w-2/5 text-center">
                  {/* Away Team */}
                  <div className="flex flex-col items-center mb-2">
                    {game.awayTeam?.logo ? (
                      <img 
                        src={game.awayTeam.logo} 
                        alt={game.awayTeam.name}
                        className="w-10 h-10 object-contain mb-1"
                      />
                    ) : (
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center mb-1 shadow-lg"
                        style={{ backgroundColor: game.awayTeam?.color || '#3b82f6' }}
                      >
                        <span className="text-white text-xs font-bold">{game.awayTeam?.abbr || 'TBD'}</span>
                      </div>
                    )}
                    <span className={`${isDark ? 'text-white' : 'text-gray-800'} font-medium text-sm mb-1`}>
                      {game.awayTeam?.name || 'Away Team'}
                    </span>
                    {gameStatus.text === 'LIVE' || gameStatus.text === 'FINAL' ? (
                      <span className={`${isDark ? 'text-white' : 'text-gray-800'} text-3xl font-bold`}>
                        {game.awayTeam?.score || 0}
                      </span>
                    ) : (
                      <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                        {game.awayTeam?.abbr || 'TBD'}
                      </span>
                    )}
                  </div>
                  
                  {/* Additional stats for MLB */}
                  {selectedLeague === 'MLB' && (gameStatus.text === 'LIVE' || gameStatus.text === 'FINAL') && (
                    <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {game.awayTeam?.hits || 0}H {game.awayTeam?.errors || 0}E
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-center">
                  <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-xs mb-1`}>vs</span>
                  <div className={`w-12 h-0.5 ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                </div>
                
                <div className="flex flex-col items-center w-2/5 text-center">
                  {/* Home Team */}
                  <div className="flex flex-col items-center mb-2">
                    {game.homeTeam?.logo ? (
                      <img 
                        src={game.homeTeam.logo} 
                        alt={game.homeTeam.name}
                        className="w-10 h-10 object-contain mb-1"
                      />
                    ) : (
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center mb-1 shadow-lg"
                        style={{ backgroundColor: game.homeTeam?.color || '#3b82f6' }}
                      >
                        <span className="text-white text-xs font-bold">{game.homeTeam?.abbr || 'TBD'}</span>
                      </div>
                    )}
                    <span className={`${isDark ? 'text-white' : 'text-gray-800'} font-medium text-sm mb-1`}>
                      {game.homeTeam?.name || 'Home Team'}
                    </span>
                    {gameStatus.text === 'LIVE' || gameStatus.text === 'FINAL' ? (
                      <span className={`${isDark ? 'text-white' : 'text-gray-800'} text-3xl font-bold`}>
                        {game.homeTeam?.score || 0}
                      </span>
                    ) : (
                      <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                        {game.homeTeam?.abbr || 'TBD'}
                      </span>
                    )}
                  </div>
                  
                  {/* Additional stats for MLB */}
                  {selectedLeague === 'MLB' && (gameStatus.text === 'LIVE' || gameStatus.text === 'FINAL') && (
                    <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {game.homeTeam?.hits || 0}H {game.homeTeam?.errors || 0}E
                    </div>
                  )}
                </div>
              </div>
              
              {/* Additional game info based on league */}
              {selectedLeague === 'NFL' && game.situation && (
                <div className="mt-3 pt-3 border-t border-gray-500/20 text-center">
                  <span className={`text-xs font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                    {game.situation}
                  </span>
                </div>
              )}
              
              {/* Game clock for live games */}
              {gameStatus.text === 'LIVE' && game.clock && (
                <div className="mt-2 text-center">
                  <span className={`text-xs font-mono ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    {game.clock}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <style>{blinkingStyle}</style>
      
      {/* Live button extending from navbar - only show when league is selected and menu is closed */}
      {selectedLeague && !liveMenuOpen && selectedLeagueLiveGames.length > 0 && (
        (() => {
          const games = selectedLeagueLiveGames.map(game => formatGameData(game)).filter(Boolean);
          const liveGames = games.filter(game => getGameStatus(game).text === 'LIVE');
          if (liveGames.length === 0) {
            return (
              <div className="flex justify-center">
                <button 
                  className={`${isDark ? 'bg-gray-900' : 'bg-[#f0ece3]'} px-6 py-1 rounded-b-xl 
                    flex flex-row items-center justify-center 
                    transform -translate-y-1 hover:translate-y-0 transition-transform duration-200
                    border-t-0 ${isDark ? 'border-gray-700' : 'border-gray-300'} border-l border-r border-b live-button`}
                  style={{
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 -1px 0 0 rgba(0, 0, 0, 0.1) inset'
                  }}
                  onClick={() => setLiveMenuOpen(true)}
                >
                  <div 
                    className="dot-blink w-2.5 h-2.5 rounded-full mr-2 shadow-lg"
                    style={{
                      boxShadow: '0 0 8px 0 rgba(220, 38, 38, 0.5)'
                    }}
                  />
                  <span className={`font-medium text-sm text-red-600 mr-1`}>LIVE</span>
                  <ChevronDown className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`} size={14} />
                </button>
              </div>
            );
          }
          const displayIndex = currentGameIndex % liveGames.length;
          return (
            <div className="flex justify-center">
              <button 
                className={`${isDark ? 'bg-gray-900' : 'bg-[#f0ece3]'} px-6 py-1 rounded-b-xl 
                  flex flex-row items-center justify-center 
                  transform -translate-y-1 hover:translate-y-0 transition-transform duration-200
                  border-t-0 ${isDark ? 'border-gray-700' : 'border-gray-300'} border-l border-r border-b live-button`}
                style={{
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 -1px 0 0 rgba(0, 0, 0, 0.1) inset'
                }}
                onClick={() => setLiveMenuOpen(true)}
              >
                <div 
                  className="dot-blink w-2.5 h-2.5 rounded-full mr-2 shadow-lg"
                  style={{
                    boxShadow: '0 0 8px 0 rgba(220, 38, 38, 0.5)'
                  }}
                />
                <span className={`font-medium text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'} mr-1`}>
                  {getGameStatsString(liveGames[displayIndex])}
                </span>
                {liveGames.length > 1 && (
                  <span className={`text-xs font-semibold ${isDark ? 'text-blue-300' : 'text-blue-700'}`}
                        title="Auto-rotating live games">
                      {`${displayIndex + 1} / ${liveGames.length}`}
                  </span>
                )}
                <ChevronDown className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`} size={14} />
              </button>
            </div>
          );
        })()
      )}
      
      {/* Live dropdown menu - appears when LIVE button is clicked */}
      {selectedLeague && liveMenuOpen && (
        <div className="relative z-40 live-menu-container">
          {/* Close button (up arrow) - semicircular shape */}
          <div className="flex justify-center">
            <div className="relative">
              <div 
                className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-10 h-5 
                  ${isDark ? 'bg-gray-800/60' : 'bg-white/60'} 
                  rounded-t-full z-50 backdrop-blur-xl overflow-hidden`}
                style={{
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
                  borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRight: '1px solid rgba(255, 255, 255, 0.2)',
                  borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                  background: isDark 
                    ? 'linear-gradient(135deg, rgba(31, 41, 55, 0.65), rgba(17, 24, 39, 0.7))' 
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.75), rgba(240, 240, 240, 0.7))'
                }}
              >
                {/* Glassy highlight effect for semicircle */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1/2 opacity-50"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0))',
                    borderRadius: '9999px 9999px 0 0'
                  }}
                />
                
                {/* Arrow icon centered in semicircle */}
                <button
                  className="absolute inset-0 flex items-center justify-center"
                  onClick={() => setLiveMenuOpen(false)}
                  aria-label="Close live menu"
                >
                  <ChevronDown className={`${isDark ? 'text-gray-400' : 'text-gray-600'} transform rotate-180`} size={14} />
                </button>
              </div>
            </div>
          </div>
          
          {/* Live content panel with glassy effect */}
          <div 
            className={`absolute top-3 left-0 right-0 mx-auto w-[85%] max-w-md
              ${isDark ? 'bg-gray-800/60' : 'bg-white/60'} 
              rounded-xl backdrop-blur-xl shadow-lg
              border ${isDark ? 'border-gray-700' : 'border-gray-300'} overflow-hidden`}
            style={{
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              maxHeight: 'calc(100vh - 120px)',
              background: isDark 
                ? 'linear-gradient(135deg, rgba(31, 41, 55, 0.65), rgba(17, 24, 39, 0.7))' 
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.75), rgba(240, 240, 240, 0.7))',
              zIndex: 45
            }}
          >
            {/* Glass effect overlay */}
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                background: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3), transparent 70%),
                            radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.2), transparent 70%)`,
                pointerEvents: 'none'
              }}
            />
            
            {/* Header with LIVE title and toggle */}
            <div className="relative text-center py-3 border-b border-gray-200/20">
              <div className="flex items-center justify-center px-4">
                <div className="flex items-center">
                  <h2 className="text-lg font-bold text-red-600 text-blink">LIVE</h2>
                </div>
              </div>
              
              {/* Last update time */}
              <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Last updated: {lastUpdateTime.toLocaleTimeString()}
              </div>
            </div>
            
            {/* Content area */}
            <div className="p-4 relative z-10">
              {/* Content based on selected league */}
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <TrendingUp className={`w-5 h-5 mr-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                  <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {selectedLeague} Live Games
                  </h3>
                </div>
                <div className="overflow-y-auto max-h-[60vh] pr-2 space-y-4">
                  {renderGameContent()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LiveView;