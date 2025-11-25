const axios = require('axios');
const { format, addDays } = require('date-fns');
const { utcToZonedTime } = require('date-fns-tz');
const socketService = require('./socket.service');

const SPORTS = {
  NBA: 'basketball/nba',
  WNBA: 'basketball/wnba',
  MLB: 'baseball/mlb',
  NFL: 'football/nfl',
  NHL: 'hockey/nhl'
};

class LiveScoresService {
  constructor() {
    this.activeGames = new Map();
    this.completedGames = new Set();
    this.lastUpdate = new Map();
    this.leagueRefreshIntervals = new Map(); // Per-league intervals
    this.leagueGameStatus = new Map(); // Track status per league
    
    // Set reference in socket service for live status broadcasting
    socketService.liveScoresService = this;
  }

  /**
   * Start per-league dynamic refresh intervals
   */
  startPerLeagueRefresh() {
    // Clear existing intervals
    this.clearAllLeagueIntervals();
    
    // Check current game status for each league
    this.updateLeagueGameStatus();
    
    // Set appropriate intervals for each league
    for (const [league, status] of this.leagueGameStatus) {
      if (status.hasLive) {
        console.log(`🔄 Starting 20-second refresh for ${league} (LIVE games)`);
        this.startLeagueLiveRefresh(league);
      } else if (status.hasScheduled) {
        console.log(`🔄 Starting dynamic refresh for ${league} (SCHEDULED games)`);
        this.startLeagueScheduledRefresh(league);
      } else {
        console.log(`🔄 Starting 6-hour refresh for ${league} (NO games)`);
        this.startLeagueDefaultRefresh(league);
      }
    }
  }

  /**
   * Clear all existing league refresh intervals
   */
  clearAllLeagueIntervals() {
    for (const [key, interval] of this.leagueRefreshIntervals) {
      clearInterval(interval);
      console.log(`🔄 Cleared interval for ${key}`);
    }
    this.leagueRefreshIntervals.clear();
  }

  /**
   * Start 20-second refresh for a specific league with live games
   */
  startLeagueLiveRefresh(league) {
    const interval = setInterval(async () => {
      console.log(`🔄 20-second refresh triggered for ${league} (LIVE)`);
      await this.checkAndUpdateLeagueGames(league, true); // true = include stats refresh
    }, 20 * 1000); // 20 seconds
    
    this.leagueRefreshIntervals.set(league, interval);
  }

  /**
   * Start dynamic refresh for a specific league with scheduled games
   */
  startLeagueScheduledRefresh(league) {
    // Calculate next refresh time based on upcoming games
    const nextRefreshTime = this.calculateNextScheduledRefresh(league);
    const timeUntilRefresh = Math.max(nextRefreshTime - Date.now(), 30 * 1000); // Minimum 30 seconds
    
    console.log(`🕐 ${league} next scheduled refresh in ${Math.round(timeUntilRefresh / 1000)} seconds`);
    
    const interval = setTimeout(async () => {
      console.log(`🔄 Dynamic refresh triggered for ${league} (SCHEDULED)`);
      await this.checkAndUpdateLeagueGames(league, false); // false = no stats refresh
      
      // Schedule next refresh after this one completes
      this.startLeagueScheduledRefresh(league);
    }, timeUntilRefresh);
    
    this.leagueRefreshIntervals.set(league, interval);
  }

  /**
   * Start 6-hour refresh for a specific league with no games
   */
  startLeagueDefaultRefresh(league) {
    const interval = setInterval(async () => {
      console.log(`🔄 6-hour refresh triggered for ${league} (NO games)`);
      await this.checkAndUpdateLeagueGames(league, false); // false = no stats refresh
    }, 6 * 60 * 60 * 1000); // 6 hours
    
    this.leagueRefreshIntervals.set(league, interval);
  }

  /**
   * Calculate the next refresh time for scheduled games
   */
  calculateNextScheduledRefresh(league) {
    const now = Date.now();
    const scheduledGames = Array.from(this.activeGames.values())
      .filter(game => game.sport === league && game.Status === 'Scheduled')
      .map(game => ({
        game,
        startTime: new Date(game.StartTime).getTime()
      }))
      .filter(game => game.startTime > now) // Only future games
      .sort((a, b) => a.startTime - b.startTime); // Sort by start time

    if (scheduledGames.length === 0) {
      // No scheduled games, refresh in 1 hour
      return now + (60 * 60 * 1000);
    }

    const nextGame = scheduledGames[0];
    const timeUntilGame = nextGame.startTime - now;
    
    // Refresh strategy based on time until game
    if (timeUntilGame <= 5 * 60 * 1000) {
      // Game starts in 5 minutes or less - refresh every 30 seconds
      return now + (30 * 1000);
    } else if (timeUntilGame <= 30 * 60 * 1000) {
      // Game starts in 30 minutes or less - refresh every 2 minutes
      return now + (2 * 60 * 1000);
    } else if (timeUntilGame <= 2 * 60 * 60 * 1000) {
      // Game starts in 2 hours or less - refresh every 10 minutes
      return now + (10 * 60 * 1000);
    } else if (timeUntilGame <= 6 * 60 * 60 * 1000) {
      // Game starts in 6 hours or less - refresh every 30 minutes
      return now + (30 * 60 * 1000);
    } else {
      // Game is far in the future - refresh every 2 hours
      return now + (2 * 60 * 60 * 1000);
    }
  }

  /**
   * Update game status flags for each league
   */
  updateLeagueGameStatus() {
    // Initialize status for all leagues
    for (const league of Object.keys(SPORTS)) {
      this.leagueGameStatus.set(league, { hasLive: false, hasScheduled: false });
    }
    
    // Check status for each active game
    for (const [gameId, game] of this.activeGames) {
      const league = game.sport;
      if (league && this.leagueGameStatus.has(league)) {
        const status = this.leagueGameStatus.get(league);
        
        if (game.Status === 'InProgress') {
          status.hasLive = true;
        } else if (game.Status === 'Scheduled') {
          status.hasScheduled = true;
        }
      }
    }
    
    // Log status for each league
    for (const [league, status] of this.leagueGameStatus) {
      console.log(`📊 ${league} status: Live=${status.hasLive}, Scheduled=${status.hasScheduled}`);
    }
  }

  /**
   * Check and update games for a specific league
   */
  async checkAndUpdateLeagueGames(league, includeStatsRefresh = false) {
    const sportPath = SPORTS[league];
    if (!sportPath) {
      console.warn(`⚠️ Unknown league: ${league}`);
      return;
    }

    try {
      const games = await this.fetchGamesForSport(sportPath);
      const allCurrentGames = new Set();
      let gameStatusChanged = false;

      for (const game of games) {
        const gameId = `${league}-${game.GameID}`;
        const isLive = game.Status === "InProgress";
        const isScheduled = game.Status === "Scheduled";
        const isComplete = game.Status === "Final" || game.Status === "F/OT" || game.Status === "F/SO";
        
        game.sport = league;
        game.id = gameId;

        console.log(`📋 ${league} game processed: ${game.AwayTeam} vs ${game.HomeTeam} - Status: ${game.Status}`);

        allCurrentGames.add(gameId);

        // Include both live and scheduled games
        if (isLive || isScheduled) {
          const existingGame = this.activeGames.get(gameId);
          const lastUpdateTime = this.lastUpdate.get(gameId) || 0;
          const currentTime = Date.now();
          
          if (
            !existingGame ||
              (JSON.stringify(existingGame) !== JSON.stringify(game) && 
              currentTime - lastUpdateTime > 30000)
          ) {
            this.activeGames.set(gameId, game);
            this.lastUpdate.set(gameId, currentTime);
            
            // Check if game status changed
            if (existingGame && existingGame.Status !== game.Status) {
              gameStatusChanged = true;
              console.log(`🔄 ${league} game status changed: ${game.AwayTeam} vs ${game.HomeTeam} - ${existingGame.Status} → ${game.Status}`);
            }
            
            console.log(`📺 ${isLive ? 'LIVE' : 'SCHEDULED'} ${league} game: ${game.AwayTeam} vs ${game.HomeTeam} (${game.Status})`);
            socketService.io?.emit('liveScore', { sport: league, game });
            
            // Refresh stats for live games if requested
            if (isLive && includeStatsRefresh && game.HomeTeamID && game.AwayTeamID) {
              await this.refreshLiveGameStats(game.HomeTeamID, game.AwayTeamID, league);
            }
          }
        } else if (isComplete) {
          if (this.activeGames.has(gameId)) {
            this.activeGames.delete(gameId);
            this.completedGames.add(gameId);
            gameStatusChanged = true;
            console.log(`📝 ${league} game complete: ${game.HomeTeam} vs ${game.AwayTeam}`);
            await socketService.broadcastUpdates();
        }
      }
    }

      // Remove games that are no longer active for this league
    for (const [gameId, game] of this.activeGames) {
        if (game.sport === league && !allCurrentGames.has(gameId)) {
        this.activeGames.delete(gameId);
        this.lastUpdate.delete(gameId);
          gameStatusChanged = true;
        socketService.io?.emit('gameRemoved', { gameId });
      }
    }

      // Update refresh intervals if game status changed for this league
      if (gameStatusChanged) {
        console.log(`🔄 ${league} game status changed, updating refresh intervals...`);
        this.updateLeagueGameStatus();
        this.startPerLeagueRefresh();
        // Broadcast live status to all clients
        socketService.broadcastLeagueLiveStatus();
      }

    } catch (error) {
      console.error(`❌ Error updating ${league} games:`, error.message);
    }
  }

  /**
   * Refresh stats for live games
   */
  async refreshLiveGameStats(homeTeamId, awayTeamId, sport) {
    try {
      console.log(`📈 Refreshing stats for ${sport} game: ${awayTeamId} @ ${homeTeamId}`);
      
      // Import stats services dynamically based on sport
      let statsService;
      switch (sport) {
        case 'NBA':
          statsService = require('./nba-player-stats.service');
          break;
        case 'WNBA':
          statsService = require('./wnba-player-stats.service');
          break;
        case 'MLB':
          statsService = require('./mlb-player-stats.service');
          break;
        case 'NFL':
          statsService = require('./nfl-player-stats.service');
          break;
        case 'NHL':
          statsService = require('./nhl-player-stats.service');
          break;
        default:
          console.warn(`⚠️ No stats service found for ${sport}`);
          return;
      }

      // Call the refresh method if it exists
      if (statsService && typeof statsService.refresh === 'function') {
        await statsService.refresh(homeTeamId, awayTeamId);
        console.log(`✅ Stats refreshed for ${sport} game`);
      } else {
        console.log(`ℹ️ No refresh method available for ${sport} stats service`);
      }
    } catch (error) {
      console.error(`❌ Error refreshing stats for ${sport} game:`, error.message);
    }
  }

  /**
   * Generic ESPN scoreboard fetcher for any sport and date
   */
  async fetchGamesBySportAndDate(sportPath, dateStr) {
    const url = `https://site.api.espn.com/apis/site/v2/sports/${sportPath}/scoreboard?dates=${dateStr}`;
    console.log(`🔎 Fetching ${sportPath} games for ${dateStr}...`);

    try {
      const response = await axios.get(url);
      const events = response.data.events || [];

      const games = [];

      for (const event of events) {
        const id = event.id;
        const name = event.name;
        const statusType = event.status?.type?.state || "pre";
        const gameDate = event.date;

        const competition = event.competitions?.[0];

        const home = competition?.competitors?.find(c => c.homeAway === "home");
        const away = competition?.competitors?.find(c => c.homeAway === "away");

        // Extract team information with logos and colors
        const homeTeam = home?.team;
        const awayTeam = away?.team;

        const game = {
          GameID: id,
          Status:
            statusType === "in" ? "InProgress" :
            statusType === "post" ? "Final" : "Scheduled",
          StartTime: gameDate,
          // Timezone information from ESPN API
          TimeZone: event.timeZone || competition?.venue?.timeZone || { id: "America/New_York", offset: -5 },
          // Team names
          HomeTeam: homeTeam?.displayName,
          AwayTeam: awayTeam?.displayName,
          // Team IDs
          HomeTeamID: homeTeam?.id,
          AwayTeamID: awayTeam?.id,
          // Team abbreviations
          HomeTeamAbbr: homeTeam?.abbreviation,
          AwayTeamAbbr: awayTeam?.abbreviation,
          // Team logos
          HomeTeamLogo: homeTeam?.logo,
          AwayTeamLogo: awayTeam?.logo,
          // Team colors
          HomeTeamColor: homeTeam?.color ? `#${homeTeam.color}` : '#3b82f6',
          AwayTeamColor: awayTeam?.color ? `#${awayTeam.color}` : '#3b82f6',
          // Scores (only for live/completed games)
          HomeScore: statusType === "pre" ? null : (home?.score || "0"),
          AwayScore: statusType === "pre" ? null : (away?.score || "0"),
          // Legacy score fields for compatibility
          HomeTeamRuns: statusType === "pre" ? null : (home?.score || "0"),
          AwayTeamRuns: statusType === "pre" ? null : (away?.score || "0"),
          HomeTeamScore: statusType === "pre" ? null : (home?.score || "0"),
          AwayTeamScore: statusType === "pre" ? null : (away?.score || "0"),
          // Game period information
          Quarter: competition?.status?.period || null,
          Period: competition?.status?.period || null,
          Inning: competition?.status?.period || null,
          InningHalf: competition?.status?.type?.description || null,
          TimeRemaining: competition?.status?.displayClock || null,
          QuarterDescription: competition?.status?.type?.description || null,
          DownAndDistance: competition?.status?.type?.description || null,
          Clock: competition?.status?.displayClock || null,
          // Venue information
          Venue: competition?.venue?.fullName || null,
          VenueCity: competition?.venue?.address?.city || null,
          VenueState: competition?.venue?.address?.state || null,
        };

        console.log(`📋 Game data: ${game.AwayTeam} vs ${game.HomeTeam} - Status: ${game.Status} - Date: ${gameDate}`);
        games.push(game);
      }

      return games;
    } catch (err) {
      console.error(`❌ Error fetching games for ${sportPath}:`, err.message);
      return [];
    }
  }

  /**
   * Looks for games today; if none → tomorrow → etc. (max 7 days ahead)
   */
  async fetchGamesForSport(sportPath) {
    let dayOffset = 0;
    let games = [];

    while (games.length === 0 && dayOffset < 7) {
      const timeZone = 'America/New_York';
      const zonedDate = utcToZonedTime(addDays(new Date(), dayOffset), timeZone);
      const dateStr = format(zonedDate, 'yyyyMMdd');

      games = await this.fetchGamesBySportAndDate(sportPath, dateStr);
      dayOffset++;
    }

    if (games.length === 0) {
      console.log(`⚠ No games found in the next week for ${sportPath}.`);
    } else {
      console.log(`✅ Found ${games.length} games for ${sportPath}.`);
    }

    return games;
  }

  /**
   * Returns games for all sports
   */
  async fetchLiveScores(sport) {
    const sportPath = SPORTS[sport];
    if (!sportPath) {
      console.error(`Unknown sport: ${sport}`);
      return [];
    }

    return await this.fetchGamesForSport(sportPath);
  }

  async startMonitoring() {
    // Clear any existing intervals
    this.clearAllLeagueIntervals();
    
    // Initialize all leagues
    for (const league of Object.keys(SPORTS)) {
      await this.checkAndUpdateLeagueGames(league, false);
    }
    
    // Start per-league dynamic refresh based on current game status
    this.startPerLeagueRefresh();
    
    console.log('🎮 Live scores monitoring started with per-league dynamic refresh intervals');
  }

  getActiveGames() {
    return Array.from(this.activeGames.values());
  }
}

module.exports = new LiveScoresService();
