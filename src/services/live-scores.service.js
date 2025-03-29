const axios = require('axios');
const { API_KEYS, SCORES_URLS } = require('../config/constants');
const { format } = require('date-fns');
const { utcToZonedTime } = require('date-fns-tz');
const StatsService = require('./stats.service');
const socketService = require('./socket.service');

class LiveScoresService {
  constructor() {
    this.activeGames = new Map();
    this.completedGames = new Set();
    this.lastUpdate = new Map(); // Track last update time for each game
  }

  async fetchLiveScores(sport) {
    try {
      
        const timeZone = 'America/New_York';
        const zonedDate = utcToZonedTime(new Date(), timeZone);

        const today = format(zonedDate, 'yyyy-MMM-dd').toUpperCase();
      const url = `${SCORES_URLS[sport]}/${"today"}`;
      
      const response = await axios.get(url, {
        headers: { "Ocp-Apim-Subscription-Key": API_KEYS[sport] }
      });

      return response.data;
    } catch (error) {
      console.error(`Error fetching ${sport} live scores:`, error);
      return [];
    }
  }

  async checkAndUpdateGames() {
    const allCurrentGames = new Map(); // Track all current games by sport
    
    for (const sport of ["NHL", "NBA", "MLB", "NFL"]) {
      const games = await this.fetchLiveScores(sport);
      
      // Group games by sport
      if (!allCurrentGames.has(sport)) {
        allCurrentGames.set(sport, new Set());
      }

      for (const game of games) {
        const gameId = `${sport}-${game.GameID}`;
        const isLive = game.Status === "InProgress";
        const isComplete = game.Status === "Final" || game.Status === "F/OT" || game.Status === "F/SO";
        
        game.sport = sport;
        game.id = gameId; // Ensure consistent ID field
        
        allCurrentGames.get(sport).add(gameId);

        if (isLive) {
          const existingGame = this.activeGames.get(gameId);
          const lastUpdateTime = this.lastUpdate.get(gameId) || 0;
          const currentTime = Date.now();
          
          // Only update if game is new or data has changed and enough time has passed
          if (!existingGame || 
              (JSON.stringify(existingGame) !== JSON.stringify(game) && 
               currentTime - lastUpdateTime > 30000)) { // 30 second minimum between updates
            
            this.activeGames.set(gameId, game);
            this.lastUpdate.set(gameId, currentTime);
            socketService.io?.emit('liveScore', { sport, game });
          }
        } else if (isComplete) {
          if (this.activeGames.has(gameId)) {
            this.activeGames.delete(gameId);
            this.completedGames.add(gameId);
            await StatsService.fetchAndSaveStats(sport);
            await socketService.broadcastUpdates();
          }
        }
      }
    }

    // Clean up games that are no longer active
    for (const [gameId, game] of this.activeGames) {
      const sport = game.sport;
      if (!allCurrentGames.get(sport)?.has(gameId)) {
        this.activeGames.delete(gameId);
        this.lastUpdate.delete(gameId);
        // Notify clients about removed game
        socketService.io?.emit('gameRemoved', { gameId });
      }
    }

  }

  async startMonitoring() {
    // Check for games every 30 minutes
    setInterval(async () => {
      await this.checkAndUpdateGames();
    }, 3 * 60 * 1000);

    // Update live scores every minute if there are active games
    setInterval(async () => {
      if (this.activeGames.size > 0) {
        await this.checkAndUpdateGames();
      }
    }, 60 * 1000);

    // Initial check
    await this.checkAndUpdateGames();
  }

  getActiveGames() {
    return Array.from(this.activeGames.values());
  }
}

module.exports = new LiveScoresService();