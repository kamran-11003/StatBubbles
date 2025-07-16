import { useState, useMemo, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import Navbar from './components/Navbar';
import PlayerList from './components/PlayerList';
import TeamList from './components/TeamList';
import HomePage from './components/HomePage';
import LiveView from './components/LiveView';
import TeamPlayersView from './components/TeamPlayersView';

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
          fetch(`/api/teams/${activeLeague.toLowerCase()}/search?name=${encodeURIComponent(query)}`)
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
          fetch(`/api/stats/${activeLeague}/search?name=${encodeURIComponent(query)}`)
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
    socketRef.current = io('');
    fetch('/api/live-scores')
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
      fetch(`/api/stats/${activeLeague}/${selectedStat}`)
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
    setActiveLeague(leagueName);
    setViewMode('Players'); // Reset to Players view when switching leagues
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
        setSelectedStat('touchdowns');
        break;
    }
  };

  // Fetch teams when view mode changes to Teams
  useEffect(() => {
    if (activeLeague && viewMode === 'Teams') {
      console.log('Fetching teams for:', activeLeague);
      fetch(`/api/teams/${activeLeague.toLowerCase()}`)
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
      if (activeLeague === 'NBA' || activeLeague === 'WNBA' || activeLeague === 'MLB' || activeLeague === 'NFL' || activeLeague === 'NHL') {
        setSelectedStat('wins'); // Default to wins for teams
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
        defaultPlayerStat = 'touchdowns';
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
    setNavContext(viewMode === 'Teams' ? 'teams' : 'players');
    
    // If returning to players view, ensure a default player stat is set
    if (viewMode === 'Players' && activeLeague) {
      // Check if current stat is a valid player stat for the league
      const playerStats = ['points','avgPoints','rebounds','avgRebounds','offensiveRebounds','defensiveRebounds','assists','avgAssists','blocks','avgBlocks','steals','avgSteals','turnovers','avgTurnovers','fouls','avgFouls','fieldGoalsMade','fieldGoalsAttempted','fieldGoalPct','threePointFieldGoalsMade','threePointFieldGoalsAttempted','threePointFieldGoalPct','freeThrowsMade','freeThrowsAttempted','freeThrowPct','minutes','avgMinutes','gamesPlayed','gamesStarted','doubleDouble','tripleDouble','goals','plusMinus','penaltyMinutes','shotsTotal','powerPlayGoals','powerPlayAssists','shortHandedGoals','shortHandedAssists','gameWinningGoals','timeOnIcePerGame','production','strikeouts','touchdowns','passYards','rushYards','receivingYards','completionPercentage','interceptions','sacks','receptions','passAttempts','passCompletions','rushingAttempts','rushingYards'];
      
      // Add MLB-specific stats to the player stats list
      const mlbPlayerStats = ['batting_gamesPlayed','batting_atBats','batting_runs','batting_hits','batting_doubles','batting_triples','batting_homeRuns','batting_RBIs','batting_stolenBases','batting_caughtStealing','batting_walks','batting_strikeouts','batting_avg','batting_onBasePct','batting_slugAvg','fielding_gamesPlayed','fielding_gamesStarted','fielding_putOuts','fielding_assists','fielding_errors','fielding_fieldingPct','pitching_gamesPlayed','pitching_gamesStarted','pitching_completeGames','pitching_shutouts','pitching_innings','pitching_hits','pitching_runs','pitching_earnedRuns','pitching_homeRuns','pitching_walks','pitching_strikeouts'];
      
      const allPlayerStats = [...playerStats, ...mlbPlayerStats];
      
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
            defaultPlayerStat = 'touchdowns';
            break;
        }
        setSelectedStat(defaultPlayerStat);
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
      const playerStats = ['points','avgPoints','rebounds','avgRebounds','offensiveRebounds','defensiveRebounds','assists','avgAssists','blocks','avgBlocks','steals','avgSteals','turnovers','avgTurnovers','fouls','avgFouls','fieldGoalsMade','fieldGoalsAttempted','fieldGoalPct','threePointFieldGoalsMade','threePointFieldGoalsAttempted','threePointFieldGoalPct','freeThrowsMade','freeThrowsAttempted','freeThrowPct','minutes','avgMinutes','gamesPlayed','gamesStarted','doubleDouble','tripleDouble','goals','plusMinus','penaltyMinutes','shotsTotal','powerPlayGoals','powerPlayAssists','shortHandedGoals','shortHandedAssists','gameWinningGoals','timeOnIcePerGame','production','strikeouts','touchdowns','passYards','rushYards','receivingYards','completionPercentage','interceptions','sacks','receptions','passAttempts','passCompletions','rushingAttempts','rushingYards'];
      
      // Add MLB-specific stats to the player stats list
      const mlbPlayerStats = ['batting_gamesPlayed','batting_atBats','batting_runs','batting_hits','batting_doubles','batting_triples','batting_homeRuns','batting_RBIs','batting_stolenBases','batting_caughtStealing','batting_walks','batting_strikeouts','batting_avg','batting_onBasePct','batting_slugAvg','fielding_gamesPlayed','fielding_gamesStarted','fielding_putOuts','fielding_assists','fielding_errors','fielding_fieldingPct','pitching_gamesPlayed','pitching_gamesStarted','pitching_completeGames','pitching_shutouts','pitching_innings','pitching_hits','pitching_runs','pitching_earnedRuns','pitching_homeRuns','pitching_walks','pitching_strikeouts'];
      
      const allPlayerStats = [...playerStats, ...mlbPlayerStats];
      
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
            defaultPlayerStat = 'touchdowns';
            break;
        }
        setSelectedStat(defaultPlayerStat);
      }
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
