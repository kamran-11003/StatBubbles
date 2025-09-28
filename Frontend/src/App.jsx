import { useState, useMemo, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import Navbar from './components/Navbar';
import PlayerList from './components/PlayerList';
import TeamList from './components/TeamList';
import HomePage from './components/HomePage';
import LiveView from './components/LiveView';
import TeamPlayersView from './components/TeamPlayersView';
import { apiConfig, buildApiUrl } from './config/api';

function App() {
  const [isDark, setIsDark] = useState(false);
  const [activeLeague, setActiveLeague] = useState('');
  const [selectedStat, setSelectedStat] = useState('');
  const [playerCount, setPlayerCount] = useState('10');
  const [searchQuery, setSearchQuery] = useState('');
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [viewMode, setViewMode] = useState('Players'); // 'Players' or 'Teams'
  const [liveGames, setLiveGames] = useState([]);
  const [navContext, setNavContext] = useState('players'); // 'players', 'teams', 'teamPlayers'
  const [teamPlayersViewTeam, setTeamPlayersViewTeam] = useState(null); // If set, show TeamPlayersView
  const socketRef = useRef(null);
  
  // Add debounce for search
  const searchTimeoutRef = useRef(null);

  // Debounced search function
  const debouncedSearch = (query, searchType) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      if (query && activeLeague) {
        if (searchType === 'teams' && (activeLeague === 'NBA' || activeLeague === 'WNBA' || activeLeague === 'MLB' || activeLeague === 'NFL' || activeLeague === 'NHL')) {
          fetch(buildApiUrl(apiConfig.endpoints.teamsSearch(activeLeague, query)))
            .then(res => {
              if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
              }
              return res.json();
            })
            .then(data => {
              if (Array.isArray(data)) {
                setTeams(currentTeams => {
                  const existingTeamsMap = new Map(
                    (currentTeams || []).map(team => [team.teamId, team])
                  );
                  data.forEach(newTeam => {
                    if (!existingTeamsMap.has(newTeam.teamId)) {
                      existingTeamsMap.set(newTeam.teamId, newTeam);
                    }
                  });
                  return Array.from(existingTeamsMap.values());
                });
              }
            })
            .catch(error => {
              console.error('Error searching teams:', error);
            });
        } else if (searchType === 'players') {
          fetch(buildApiUrl(apiConfig.endpoints.statsSearch(activeLeague, query)))
            .then(res => {
              if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
              }
              return res.json();
            })
            .then(data => {
              if (Array.isArray(data)) {
                setPlayers(currentPlayers => {
                  const existingPlayers = Array.isArray(currentPlayers) ? currentPlayers : [];
                  const existingPlayersMap = new Map(
                    existingPlayers.map(player => [player._id, player])
                  );
                  data.forEach(newPlayer => {
                    if (!existingPlayersMap.has(newPlayer._id)) {
                      existingPlayersMap.set(newPlayer._id, newPlayer);
                    }
                  });
                  return Array.from(existingPlayersMap.values());
                });
              }
            })
            .catch(error => {
              console.error('Error searching players:', error);
            });
        }
      }
    }, 500); // Increased to 500ms for better debouncing
  };

  // Handle debounced search when search query changes
  useEffect(() => {
    if (searchQuery && activeLeague) {
      if (viewMode === 'Teams' && (activeLeague === 'NBA' || activeLeague === 'WNBA' || activeLeague === 'MLB' || activeLeague === 'NFL' || activeLeague === 'NHL')) {
        debouncedSearch(searchQuery, 'teams');
      } else if (viewMode === 'Players') {
        debouncedSearch(searchQuery, 'players');
      }
    }
  }, [searchQuery, activeLeague, viewMode]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    socketRef.current = io(apiConfig.baseURL);
    fetch(buildApiUrl(apiConfig.endpoints.liveScores))
      .then(res => res.json())
      .then(games => {
        console.log('🎮 Initial live games fetched:', games);
        setLiveGames(games);
      })
      .catch(error => {
        console.error('❌ Error fetching live games:', error);
      });

    socketRef.current.on('connect', () => {
      console.log('🔌 Socket connected');
    });

    socketRef.current.on('liveScore', ({ sport, game }) => {
      console.log('📺 Live score update received:', { sport, game });
      setLiveGames(prev => {
        const updated = prev.filter(g => g.id !== game.id); 
        return [...updated, game];
      });
    });

    socketRef.current.on('gameRemoved', ({ gameId }) => {
      console.log('🗑️ Game removed:', gameId);
      setLiveGames(prev => prev.filter(game => game.id !== gameId));
    });

    socketRef.current.on('stats', ({ sport, statType, data }) => {
      if (sport === activeLeague) {
        setPlayers(data);
      }
    });

    return () => {
      socketRef.current.disconnect();
      socketRef.current = null;
    };
  }, []); 

  useEffect(() => {
    if (!socketRef.current) return;

    // Only fetch player stats when in Players view mode
    if (activeLeague && selectedStat && viewMode === 'Players') {
      socketRef.current.emit('subscribe', { sport: activeLeague, statType: selectedStat });
      if (!selectedStat) {
        switch (activeLeague) {
          case 'NBA':
            setSelectedStat('points');
            break;
          case 'WNBA':
            setSelectedStat('avgPoints');
            break;
          case 'NHL':
            setSelectedStat('goals');
            break;
          case 'MLB':
            setSelectedStat('batting_gamesPlayed');
            break;
          case 'NFL':
            setSelectedStat('touchdowns');
            break;
        }
      }
      fetch(buildApiUrl(apiConfig.endpoints.stats(activeLeague, selectedStat)))
        .then(res => res.json())
        .then(data => setPlayers(data));
    }

    return () => {
      if (socketRef.current && activeLeague && selectedStat) {
        socketRef.current.emit('unsubscribe', { sport: activeLeague, statType: selectedStat });
      }
    };
  }, [activeLeague, selectedStat, viewMode]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const handleLogoClick = () => {
    setActiveLeague('');
    setSelectedStat('');
    setSearchQuery('');
    setPlayerCount('10');
  };

  const handleLeagueSelect = (leagueName) => {
    setTeamPlayersViewTeam(null); // Always close TeamPlayersView when switching leagues
    setActiveLeague(leagueName);
    setViewMode('Players'); // Reset to Players view when switching leagues
    
    // Set default stats for all leagues including NFL
    switch (leagueName) {
      case 'NBA':
        setSelectedStat('points');
        break;
      case 'WNBA':
        setSelectedStat('avgPoints');
        break;
      case 'NHL':
        setSelectedStat('goals');
        break;
      case 'MLB':
        setSelectedStat('batting_gamesPlayed');
        break;
      case 'NFL':
        setSelectedStat('passYards'); // Default NFL player stat
        break;
    }
  };

  // Fetch teams when view mode changes to Teams
  useEffect(() => {
    if (activeLeague && viewMode === 'Teams') {
      console.log('Fetching teams for:', activeLeague);
      fetch(buildApiUrl(apiConfig.endpoints.teams(activeLeague)))
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          console.log('Teams fetched:', data);
          setTeams(data);
        })
        .catch(error => {
          console.error('Error fetching teams:', error);
          setTeams([]);
        });
    } else {
      setTeams([]);
    }
  }, [activeLeague, viewMode]);

  // Set default team stat when switching to teams view
  useEffect(() => {
    if (viewMode === 'Teams' && activeLeague) {
      if (activeLeague === 'NBA' || activeLeague === 'WNBA' || activeLeague === 'MLB' || activeLeague === 'NHL') {
        setSelectedStat('wins'); // Default to wins for teams
      } else if (activeLeague === 'NFL') {
        setSelectedStat('netPassingYards'); // Default NFL team stat (Offense > Passing Yards)
      }
    }
  }, [viewMode, activeLeague]);

  const filteredTeams = useMemo(() => {
    let filtered = [];
    try {
      if (teams && Array.isArray(teams)) {
        filtered = [...teams];
      }
    } catch (error) {
      console.error('Error filtering teams:', error);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      try {
        filtered = filtered.filter((team) => {
          if (!team || typeof team !== 'object') {
            return false;
          }
          // Search in multiple team name fields
          const teamName = (team.displayName || team.name || team.shortDisplayName || team.nickname || '').toLowerCase();
          const teamLocation = (team.location || '').toLowerCase();
          const teamAbbreviation = (team.abbreviation || '').toLowerCase();
          
          return teamName.includes(query) || 
                 teamLocation.includes(query) || 
                 teamAbbreviation.includes(query);
        });
      } catch (error) {
        console.error('Error filtering teams by search:', error);
      }
    }

    return filtered;
  }, [teams, searchQuery]);

  // Helper function to get stat value for a player (similar to bubbleVisualization.js)
  const getPlayerStatValue = (player, statKey) => {
    if (!player || !statKey) return 0;
    
    // For players, check both direct properties and nested stats object
    let value = player[statKey]; // Check direct property first (for NFL players)
    if (value === undefined || value === null) {
      value = player.stats?.[statKey]; // Check nested stats object (for NBA/WNBA/MLB players)
    }
    
    if (typeof value === 'number') {
      return value;
    } else if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const filteredPlayers = useMemo(() => {
    let filtered = [];
    try {
      if (players && Array.isArray(players)) {
        filtered = [...players];
      }
    } catch (error) {
      console.error('Error filtering players:', error);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      try {
        filtered = filtered.filter((player) => {
          if (!player || typeof player !== 'object') {
            return false;
          }
          // Search in multiple player name fields
          const playerName = (player.fullName || player.displayName || player.name || '').toLowerCase();
          const firstName = (player.firstName || '').toLowerCase();
          const lastName = (player.lastName || '').toLowerCase();
          const shortName = (player.shortName || '').toLowerCase();
          
          return playerName.includes(query) || 
                 firstName.includes(query) || 
                 lastName.includes(query) || 
                 shortName.includes(query);
        });
      } catch (error) {
        console.error('Error filtering players by search:', error);
      }
    } else {
      // When not searching, filter out players with zero stats and check qualifications for MLB
      try {
        filtered = filtered.filter((player) => {
          if (!player || typeof player !== 'object') {
            return false;
          }
          
          const statValue = getPlayerStatValue(player, selectedStat);
          
          // For MLB, check qualification based on stat type (only for league-wide stats, not team players)
          if (activeLeague === 'MLB' && navContext !== 'teamPlayers') {
            const isBattingStat = selectedStat.startsWith('batting_');
            const isFieldingStat = selectedStat.startsWith('fielding_');
            const isPitchingStat = selectedStat.startsWith('pitching_');
            
            // Check qualification requirements
            if (isBattingStat && !player.qualifiedBatting) {
              return false;
            }
            if (isFieldingStat && !player.qualifiedFielding) {
              return false;
            }
            if (isPitchingStat && !player.qualifiedPitching) {
              return false;
            }
          }
          
          return statValue > 0; // Only show players with non-zero stats
        });
      } catch (error) {
        console.error('Error filtering players by zero stats:', error);
      }
    }
    
    if (!activeLeague || !selectedStat) {
      return [];
    }

    try {
      const count = parseInt(playerCount, 10);
      if (!isNaN(count)) {
        filtered = filtered.slice(0, count);
      }
    } catch (error) {
      console.error('Error limiting player count:', error);
    }
    return filtered;
  }, [players, searchQuery, playerCount, activeLeague, selectedStat]);

  // --- NAV CONTEXT LOGIC ---
  // Helper to show TeamPlayersView from anywhere
  const showTeamPlayersView = (team) => {
    // If selectedStat is a team stat, switch to default player stat for the league
    let defaultPlayerStat = selectedStat;
    switch (activeLeague) {
      case 'NBA':
      case 'WNBA':
        defaultPlayerStat = 'points';
        break;
      case 'NHL':
        defaultPlayerStat = 'goals';
        break;
      case 'MLB':
        defaultPlayerStat = 'batting_gamesPlayed';
        break;
      case 'NFL':
        defaultPlayerStat = 'passYards';
        break;
    }
    // If the current stat is not a player stat, set it
    const playerStats = ['points','avgPoints','rebounds','avgRebounds','offensiveRebounds','defensiveRebounds','assists','avgAssists','blocks','avgBlocks','steals','avgSteals','turnovers','avgTurnovers','fouls','avgFouls','fieldGoalsMade','fieldGoalsAttempted','fieldGoalPct','threePointFieldGoalsMade','threePointFieldGoalsAttempted','threePointFieldGoalPct','freeThrowsMade','freeThrowsAttempted','freeThrowPct','minutes','avgMinutes','gamesPlayed','gamesStarted','doubleDouble','tripleDouble','goals','plusMinus','penaltyMinutes','shotsTotal','powerPlayGoals','powerPlayAssists','shortHandedGoals','shortHandedAssists','gameWinningGoals','timeOnIcePerGame','production','strikeouts','touchdowns','passYards','rushYards','receivingYards','completionPercentage','interceptions','sacks','receptions','passAttempts','passCompletions','rushingAttempts','rushingYards'];
    
    // Add MLB-specific stats to the player stats list
    const mlbPlayerStats = ['batting_gamesPlayed','batting_atBats','batting_runs','batting_hits','batting_doubles','batting_triples','batting_homeRuns','batting_RBIs','batting_stolenBases','batting_caughtStealing','batting_walks','batting_strikeouts','batting_avg','batting_onBasePct','batting_slugAvg','fielding_gamesPlayed','fielding_gamesStarted','fielding_putOuts','fielding_assists','fielding_errors','fielding_fieldingPct','pitching_gamesPlayed','pitching_gamesStarted','pitching_completeGames','pitching_shutouts','pitching_innings','pitching_hits','pitching_runs','pitching_earnedRuns','pitching_homeRuns','pitching_walks','pitching_strikeouts'];
    
    const allPlayerStats = [...playerStats, ...mlbPlayerStats];
    
    if (!allPlayerStats.includes(selectedStat)) {
      setSelectedStat(defaultPlayerStat);
    }
    setTeamPlayersViewTeam(team);
    setNavContext('teamPlayers');
  };
  // Helper to close TeamPlayersView
  const closeTeamPlayersView = () => {
    setTeamPlayersViewTeam(null);
    const returningToTeams = viewMode === 'Teams';
    setNavContext(returningToTeams ? 'teams' : 'players');

    if (activeLeague) {
      if (returningToTeams) {
        // Check if current stat is a valid team stat for the league
        const validTeamStats = [
          'wins','losses','winPercentage','winpercent','gamesBehind','gamesbehind','homeRecord','home','awayRecord','road','conferenceRecord','vsconf','divisionRecord','vsdiv','pointsPerGame','avgpointsfor','opponentPointsPerGame','avgpointsagainst','pointDifferential','pointdifferential','differential','streak','lasttengames','lastTenGames','goalsPerGame','goalsAgainstPerGame','goalDifferential',
          // NFL offense stats
          'totalPlays','totalYards','yardsPerPlay','pointsPerGame','firstDowns','thirdDownConversionPct','fourthDownConversionPct','redZoneEfficiencyPct','turnovers','timeOfPossession',
          // NFL defense stats
          'pointsAllowed','totalYardsAllowed','passingYardsAllowed','rushingYardsAllowed','takeaways','redZoneAllowedPct','thirdDownAllowedPct','fourthDownAllowedPct',
          // NFL special teams stats
          'fieldGoalsMade','fieldGoalsAttempted','fieldGoalPct','extraPointsMade','extraPointsAttempted','extraPointPct','puntAverage','netPuntAverage','puntsInside20','kickReturnAverage','puntReturnAverage','specialTeamsTDs','blockedKicks',
          // NFL penalties stats
          'totalPenalties','penaltyYards','penaltiesPerGame'
        ];
        if (!validTeamStats.includes(selectedStat)) {
          setSelectedStat(getDefaultTeamStat(activeLeague));
        }
      } else {
        // Returning to players view
        const playerStats = [
          'points','avgPoints','rebounds','avgRebounds','offensiveRebounds','defensiveRebounds','assists','avgAssists','blocks','avgBlocks','steals','avgSteals','turnovers','avgTurnovers','fouls','avgFouls','fieldGoalsMade','fieldGoalsAttempted','fieldGoalPct','threePointFieldGoalsMade','threePointFieldGoalsAttempted','threePointFieldGoalPct','freeThrowsMade','freeThrowsAttempted','freeThrowPct','minutes','avgMinutes','gamesPlayed','gamesStarted','doubleDouble','tripleDouble','goals','plusMinus','penaltyMinutes','shotsTotal','powerPlayGoals','powerPlayAssists','shortHandedGoals','shortHandedAssists','gameWinningGoals','timeOnIcePerGame','production','strikeouts',
          // NFL-specific - 2025 Season API Structure
          'gamesPlayed','passCompletions','passAttempts','completionPercentage','passYards','yardsPerPassAttempt','passTouchdowns','interceptions','longestPass','sacksTaken','sackYards','passerRating','qbr','rushingAttempts','rushingYards','yardsPerRushAttempt','rushTouchdowns','longestRush','rushingFirstDowns','rushingFumbles','rushingFumblesLost','receptions','receivingTargets','receivingYards','yardsPerReception','receivingYardsPerGame','receivingTouchdowns','longestReception','receivingFirstDowns','receivingFumbles','receivingFumblesLost','catchPercentage','totalTackles','soloTackles','assistedTackles','sacks','forcedFumbles','fumbleRecoveries','fumbleRecoveryYards','defensiveInterceptions','interceptionYards','avgInterceptionYards','interceptionTouchdowns','longestInterception','passesDefended','stuffs','stuffYards','kicksBlocked','safeties','passingTouchdowns','rushingTouchdowns','receivingTouchdowns','returnTouchdowns','totalTouchdowns','totalTwoPointConvs','kickExtraPoints','fieldGoals','totalPoints','fieldGoalsMade','fieldGoalAttempts','fieldGoalPercentage','fieldGoalsMade1_19','fieldGoalsMade20_29','fieldGoalsMade30_39','fieldGoalsMade40_49','fieldGoalsMade50','longFieldGoalMade','extraPointsMade','extraPointAttempts','extraPointPercentage','totalKickingPoints','punts','puntYards','grossAvgPuntYards','netAvgPuntYards','puntsInside20','puntTouchbacks','longestPunt','blockedPunts','kickReturnAttempts','kickReturnYards','kickReturnAverage','kickReturnTouchdowns','longestKickReturn','kickReturnFairCatches','puntReturnAttempts','puntReturnYards','puntReturnAverage','puntReturnTouchdowns','longestPuntReturn','puntReturnFairCatches',
          // MLB-specific
          'batting_gamesPlayed','batting_atBats','batting_runs','batting_hits','batting_doubles','batting_triples','batting_homeRuns','batting_RBIs','batting_stolenBases','batting_caughtStealing','batting_walks','batting_strikeouts','batting_avg','batting_onBasePct','batting_slugAvg','fielding_gamesPlayed','fielding_gamesStarted','fielding_putOuts','fielding_assists','fielding_errors','fielding_fieldingPct','pitching_gamesPlayed','pitching_gamesStarted','pitching_completeGames','pitching_shutouts','pitching_innings','pitching_hits','pitching_runs','pitching_earnedRuns','pitching_homeRuns','pitching_walks','pitching_strikeouts'
        ];
        if (!playerStats.includes(selectedStat)) {
          setSelectedStat(getDefaultPlayerStat(activeLeague));
        }
      }
    }
  };

  // Set navContext when viewMode changes (unless in teamPlayersView)
  useEffect(() => {
    if (!teamPlayersViewTeam) {
      setNavContext(viewMode === 'Teams' ? 'teams' : 'players');
    }
  }, [viewMode, teamPlayersViewTeam]);

  // Handler to change view mode and set default stat when switching to Players
  const handleViewModeChange = (mode) => {
    // If currently in TeamPlayersView, close it and switch to the selected view
    if (teamPlayersViewTeam) {
      setTeamPlayersViewTeam(null);
      setNavContext(mode === 'Teams' ? 'teams' : 'players');
    }
    setViewMode(mode);
    
    if (mode === 'Players' && activeLeague) {
      // Only set default if current stat is a team stat
      const playerStats = ['points','avgPoints','rebounds','avgRebounds','offensiveRebounds','defensiveRebounds','assists','avgAssists','blocks','avgBlocks','steals','avgSteals','turnovers','avgTurnovers','fouls','avgFouls','fieldGoalsMade','fieldGoalsAttempted','fieldGoalPct','threePointFieldGoalsMade','threePointFieldGoalsAttempted','threePointFieldGoalPct','freeThrowsMade','freeThrowsAttempted','freeThrowPct','minutes','avgMinutes','gamesPlayed','gamesStarted','doubleDouble','tripleDouble','goals','plusMinus','penaltyMinutes','shotsTotal','powerPlayGoals','powerPlayAssists','shortHandedGoals','shortHandedAssists','gameWinningGoals','timeOnIcePerGame','production','strikeouts'];
      
      // Add MLB-specific stats to the player stats list
      const mlbPlayerStats = ['batting_gamesPlayed','batting_atBats','batting_runs','batting_hits','batting_doubles','batting_triples','batting_homeRuns','batting_RBIs','batting_stolenBases','batting_caughtStealing','batting_walks','batting_strikeouts','batting_avg','batting_onBasePct','batting_slugAvg','fielding_gamesPlayed','fielding_gamesStarted','fielding_putOuts','fielding_assists','fielding_errors','fielding_fieldingPct','pitching_gamesPlayed','pitching_gamesStarted','pitching_completeGames','pitching_shutouts','pitching_innings','pitching_hits','pitching_runs','pitching_earnedRuns','pitching_homeRuns','pitching_walks','pitching_strikeouts'];
      
      // Add NFL-specific stats to the player stats list (updated with all new fields)
      const nflPlayerStats = [
        // General Stats
        'gamesPlayed','fumbles','fumblesLost','fumblesTouchdowns','offensiveTwoPtReturns','offensiveFumblesTouchdowns','defensiveFumblesTouchdowns',
        
        // Passing Stats
        'passCompletions','passAttempts','completionPercentage','passYards','yardsPerPassAttempt','passTouchdowns','interceptions','longestPass','sacksTaken','sackYards','passerRating','qbr',
        'espnQBRating','interceptionPct','netPassingYards','netPassingYardsPerGame','netTotalYards','netYardsPerGame','passingBigPlays','passingFirstDowns','passingFumbles','passingFumblesLost',
        'passingTouchdownPct','passingYardsAfterCatch','passingYardsAtCatch','passingYardsPerGame','netPassingAttempts','teamGamesPlayed','totalOffensivePlays','totalPointsPerGame',
        'totalYards','totalYardsFromScrimmage','twoPointPassConvs','twoPtPass','twoPtPassAttempts','yardsFromScrimmagePerGame','yardsPerCompletion','yardsPerGame',
        'netYardsPerPassAttempt','adjQBR','quarterbackRating',
        
        // Rushing Stats
        'rushingAttempts','rushingYards','yardsPerRushAttempt','longestRush','rushTouchdowns','rushingFirstDowns','rushingFumbles','rushingFumblesLost',
        'espnRBRating','rushingBigPlays','rushingYardsPerGame','twoPointRushConvs','twoPtRush','twoPtRushAttempts',
        
        // Receiving Stats
        'receptions','receivingTargets','receivingYards','yardsPerReception','receivingYardsPerGame','receivingTouchdowns','longestReception','receivingFirstDowns','receivingFumbles','receivingFumblesLost',
        'catchPercentage','espnWRRating','receivingBigPlays','receivingYardsAfterCatch','receivingYardsAtCatch','twoPointRecConvs','twoPtReception','twoPtReceptionAttempts',
        
        // Defense Stats
        'totalTackles','soloTackles','assistedTackles','sacks','forcedFumbles','fumbleRecoveries','fumbleRecoveryYards','defensiveInterceptions','interceptionYards','avgInterceptionYards',
        'interceptionTouchdowns','longestInterception','passesDefended','stuffs','stuffYards','kicksBlocked','safeties',
        
        // Scoring Stats
        'passingTouchdowns','rushingTouchdowns','receivingTouchdowns','returnTouchdowns','totalTouchdowns','totalTwoPointConvs','kickExtraPoints','fieldGoals','totalPoints',
        'defensivePoints','kickExtraPointsMade','miscPoints','twoPointPassConvs','twoPointRecConvs','twoPointRushConvs','onePtSafetiesMade',
        
        // Kicking Stats
        'fieldGoalsMade','fieldGoalAttempts','fieldGoalPercentage','fieldGoalsMade1_19','fieldGoalsMade20_29','fieldGoalsMade30_39','fieldGoalsMade40_49','fieldGoalsMade50',
        'longFieldGoalMade','extraPointsMade','extraPointAttempts','extraPointPercentage','totalKickingPoints',
        
        // Punting Stats
        'punts','puntYards','grossAvgPuntYards','netAvgPuntYards','puntsInside20','puntTouchbacks','longestPunt','blockedPunts',
        
        // Returns Stats
        'kickReturnAttempts','kickReturnYards','kickReturnAverage','kickReturnTouchdowns','longestKickReturn','kickReturnFairCatches',
        'puntReturnAttempts','puntReturnYards','puntReturnAverage','puntReturnTouchdowns','longestPuntReturn','puntReturnFairCatches'
      ];
      
      const allPlayerStats = [...playerStats, ...mlbPlayerStats, ...nflPlayerStats];
      
      if (!allPlayerStats.includes(selectedStat)) {
        let defaultPlayerStat = '';
        switch (activeLeague) {
          case 'NBA':
          case 'WNBA':
            defaultPlayerStat = 'points';
            break;
          case 'NHL':
            defaultPlayerStat = 'goals';
            break;
          case 'MLB':
            defaultPlayerStat = 'batting_gamesPlayed';
            break;
          case 'NFL':
            defaultPlayerStat = 'passYards';
            break;
        }
        setSelectedStat(defaultPlayerStat);
      }
    } else if (mode === 'Teams' && activeLeague) {
      // Only set default if current stat is a player stat
      const teamStats = ['wins','losses','winPercentage','gamesBehind','homeRecord','awayRecord','conferenceRecord','pointsPerGame','opponentPointsPerGame','pointDifferential','streak','lastTenGames','avgpointsfor','avgpointsagainst','differential','home','road','vsconf','vsdiv'];
      
      // Add NFL-specific team stats
      const nflTeamStats = ['totalPointsPerGame','totalPoints','totalTouchdowns','totalFirstDowns','rushingFirstDowns','passingFirstDowns','firstDownsByPenalty','thirdDownConversionPct','fourthDownConversionPct','completions','netPassingYards','yardsPerPassAttempt','netPassingYardsPerGame','passingTouchdowns','interceptions','sackYardsLost','rushingAttempts','rushingYards','yardsPerRushAttempt','rushingYardsPerGame','rushingTouchdowns','totalOffensivePlays','totalYards','yardsPerGame','kickReturns','avgKickoffReturnYards','puntReturns','avgPuntReturnYards','defensiveInterceptions','avgInterceptionYards','netAvgPuntYards','puntYards','fieldGoalsMade','touchbackPct','totalPenaltyYards','totalPenalties','possessionTimeSeconds','fumblesLost','turnoverDifferential'];
      
      const allTeamStats = [...teamStats, ...nflTeamStats];
      
      if (!allTeamStats.includes(selectedStat)) {
        let defaultTeamStat = '';
        switch (activeLeague) {
          case 'NBA':
          case 'WNBA':
          case 'MLB':
          case 'NHL':
            defaultTeamStat = 'wins';
            break;
          case 'NFL':
            defaultTeamStat = 'totalPointsPerGame';
            break;
        }
        setSelectedStat(defaultTeamStat);
      }
    }
  };

  // Helper to get default player stat for a league
  const getDefaultPlayerStat = (league) => {
    switch (league) {
      case 'NBA':
      case 'WNBA':
        return 'points';
      case 'NHL':
        return 'goals';
      case 'MLB':
        return 'batting_gamesPlayed';
      case 'NFL':
        return 'passYards'; // Most important passing stat
      default:
        return '';
    }
  };

  // Helper to get default team stat for a league
  const getDefaultTeamStat = (league) => {
    switch (league) {
      case 'NBA':
      case 'WNBA':
      case 'MLB':
      case 'NHL':
        return 'wins';
      case 'NFL':
        return 'totalPointsPerGame'; // Most important offensive stat - points per game
      default:
        return '';
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-[#f0ece3]'} transition-colors duration-200`}>
      <Navbar 
        selectedStat={selectedStat}
        onStatSelect={setSelectedStat}
        isDark={isDark}
        toggleTheme={toggleTheme}
        onLogoClick={handleLogoClick}
        selectedLeague={activeLeague}
        onLeagueSelect={handleLeagueSelect}
        playerCount={playerCount}
        onPlayerCountSelect={setPlayerCount}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        liveGames={liveGames}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        navContext={navContext}
      />
      <div className="h-[calc(100vh-56px)]">
        {activeLeague ? (
          teamPlayersViewTeam ? (
            <TeamPlayersView
              team={teamPlayersViewTeam}
              selectedStat={selectedStat}
              isDark={isDark}
              onBack={closeTeamPlayersView}
              activeLeague={activeLeague}
            />
          ) : viewMode === 'Teams' ? (
            <TeamList 
              teams={filteredTeams}
              selectedStat={selectedStat}
              isDark={isDark}
              activeLeague={activeLeague}
              playerCount={playerCount}
              showTeamPlayersView={showTeamPlayersView}
            />
          ) : (
            <PlayerList 
              players={filteredPlayers}
              selectedStat={selectedStat}
              isDark={isDark}
              activeLeague={activeLeague}
              playerCount={playerCount}
              showTeamPlayersView={showTeamPlayersView}
            />
          )
        ) : (
          <HomePage 
            isDark={isDark}
            onLeagueSelect={handleLeagueSelect}
            onStatSelect={setSelectedStat}
          />
        )}
      </div>
    </div>
  );
}
export default App;
