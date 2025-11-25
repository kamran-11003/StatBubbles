const { Server } = require('socket.io');
const nbaPlayerStatsService = require('./nba-player-stats.service');
const wnbaPlayerStatsService = require('./wnba-player-stats.service');
const nbaTeamsService = require('./nba-teams.service');
const wnbaTeamsService = require('./wnba-teams.service');

class SocketService {
  constructor() {
    this.io = null;
    this.activeSubscriptions = new Map();
    this.activeTeamSubscriptions = new Map();
    this.vLeagueSubscriptions = new Map(); // V League subscriptions
    this.liveScoresService = null; // Will be set by live-scores service
    this.vLeagueRefreshInterval = null; // Auto-refresh timer for V League
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    this.io.on('connection', (socket) => {
      console.log('Client connected with ID:', socket.id);

      socket.on('subscribe', async ({ sport, statType }) => {
        const subscriptionKey = `${socket.id}-${sport}-${statType}`;
        
        if (this.activeSubscriptions.has(subscriptionKey)) {
          return;
        }

        try {
          let stats;
          if (sport === 'NBA') {
            stats = await nbaPlayerStatsService.getTopPlayers(statType);
          } else if (sport === 'WNBA') {
            stats = await wnbaPlayerStatsService.getTopPlayers(statType);
          } else {
            // TODO: Handle other sports if needed
            stats = [];
          }
          socket.emit('stats', { sport, statType, data: stats });
          
          // Store subscription
          this.activeSubscriptions.set(subscriptionKey, { sport, statType });
        } catch (error) {
          socket.emit('error', { message: `Error fetching ${sport} stats` });
        }
      });

      // --- Teams subscription logic ---
      socket.on('subscribeTeams', async ({ league }) => {
        const teamSubKey = `${socket.id}-${league}`;
        if (this.activeTeamSubscriptions.has(teamSubKey)) {
          return;
        }
        try {
          let teams;
          if (league === 'nba') {
            teams = await nbaTeamsService.getAllTeams();
          } else if (league === 'wnba') {
            teams = await wnbaTeamsService.getAllTeams();
          } else {
            teams = [];
          }
          socket.emit('teams', { league, data: teams });
          this.activeTeamSubscriptions.set(teamSubKey, { league });
        } catch (error) {
          socket.emit('error', { message: `Error fetching ${league} teams` });
        }
      });

      socket.on('unsubscribeTeams', ({ league }) => {
        const teamSubKey = `${socket.id}-${league}`;
        this.activeTeamSubscriptions.delete(teamSubKey);
      });

      socket.on('unsubscribe', ({ sport, statType }) => {
        const subscriptionKey = `${socket.id}-${sport}-${statType}`;
        this.activeSubscriptions.delete(subscriptionKey);
      });

      // V League subscription (smart socket for sheets)
      socket.on('subscribeVLeague', async ({ statType }) => {
        const vLeagueKey = `${socket.id}-VLeague-${statType}`;
        
        if (this.vLeagueSubscriptions.has(vLeagueKey)) {
          return;
        }

        try {
          const VLeaguePlayerStatsService = require('./vleague-player-stats.service');
          const stats = await VLeaguePlayerStatsService.getTopPlayers(statType);
          socket.emit('vLeagueStats', { statType, data: stats });
          
          // Store subscription
          this.vLeagueSubscriptions.set(vLeagueKey, { statType, socketId: socket.id });
          console.log(`📊 Client ${socket.id} subscribed to V League ${statType} (Total: ${this.vLeagueSubscriptions.size})`);
          
          // Start auto-refresh if this is the first subscription
          if (this.vLeagueSubscriptions.size === 1) {
            this.startVLeagueAutoRefresh();
          }
        } catch (error) {
          console.error('Error fetching V League stats:', error);
          socket.emit('error', { message: `Error fetching V League stats` });
        }
      });

      socket.on('unsubscribeVLeague', ({ statType }) => {
        const vLeagueKey = `${socket.id}-VLeague-${statType}`;
        this.vLeagueSubscriptions.delete(vLeagueKey);
        console.log(`📊 Client ${socket.id} unsubscribed from V League ${statType} (Remaining: ${this.vLeagueSubscriptions.size})`);
        
        // Stop auto-refresh if no more subscriptions
        if (this.vLeagueSubscriptions.size === 0) {
          this.stopVLeagueAutoRefresh();
        }
      });

      socket.on('disconnect', () => {
        // Clean up subscriptions for disconnected client
        for (const [key] of this.activeSubscriptions) {
          if (key.startsWith(socket.id)) {
            this.activeSubscriptions.delete(key);
          }
        }
        for (const [key] of this.activeTeamSubscriptions) {
          if (key.startsWith(socket.id)) {
            this.activeTeamSubscriptions.delete(key);
          }
        }
        for (const [key] of this.vLeagueSubscriptions) {
          if (key.startsWith(socket.id)) {
            this.vLeagueSubscriptions.delete(key);
          }
        }
        
        // Stop auto-refresh if no more V League subscriptions
        if (this.vLeagueSubscriptions.size === 0) {
          this.stopVLeagueAutoRefresh();
        }
        
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  async broadcastUpdates() {
    if (!this.io) return;

    // Group subscriptions by sport and statType
    const subscriptionGroups = new Map();
    
    for (const [, subscription] of this.activeSubscriptions) {
      const key = `${subscription.sport}-${subscription.statType}`;
      if (!subscriptionGroups.has(key)) {
        subscriptionGroups.set(key, subscription);
      }
    }

    // Fetch and broadcast updates for each unique subscription
    for (const [, { sport, statType }] of subscriptionGroups) {
      try {
        let stats;
        if (sport === 'NBA') {
          stats = await nbaPlayerStatsService.getTopPlayers(statType);
        } else if (sport === 'WNBA') {
          stats = await wnbaPlayerStatsService.getTopPlayers(statType);
        } else {
          // TODO: Handle other sports if needed
          stats = [];
        }
        this.io.emit('stats', { sport, statType, data: stats });
      } catch (error) {
        console.error(`Error broadcasting ${sport} stats:`, error);
      }
    }

    // --- Broadcast team updates ---
    const teamGroups = new Map();
    for (const [, { league }] of this.activeTeamSubscriptions) {
      if (!teamGroups.has(league)) {
        teamGroups.set(league, league);
      }
    }
    for (const league of teamGroups.values()) {
      try {
        let teams;
        if (league === 'nba') {
          teams = await nbaTeamsService.getAllTeams();
        } else if (league === 'wnba') {
          teams = await wnbaTeamsService.getAllTeams();
        } else {
          teams = [];
        }
        this.io.emit('teams', { league, data: teams });
      } catch (error) {
        console.error(`Error broadcasting ${league} teams:`, error);
      }
    }
  }

  // Broadcast league live status to all clients
  broadcastLeagueLiveStatus() {
    if (!this.io || !this.liveScoresService) return;

    const liveLeagues = {
      NBA: false,
      WNBA: false,
      NFL: false,
      MLB: false,
      NHL: false
    };
    
    // Check which leagues have live games
    for (const [gameId, game] of this.liveScoresService.activeGames) {
      if (game.Status === 'InProgress') {
        liveLeagues[game.sport] = true;
      }
    }
    
    // Emit to all connected clients
    this.io.emit('leagueLiveStatus', liveLeagues);
    console.log('📡 Broadcasted league live status:', liveLeagues);
  }

  // Broadcast V League updates to subscribed clients
  async broadcastVLeagueUpdate(statType) {
    if (!this.io) return;

    try {
      const VLeaguePlayerStatsService = require('./vleague-player-stats.service');
      const stats = await VLeaguePlayerStatsService.getTopPlayers(statType);
      
      // Emit to all clients subscribed to this stat
      this.io.emit('vLeagueStats', { statType, data: stats });
      console.log(`📊 Broadcasted V League ${statType} update to all clients`);
    } catch (error) {
      console.error(`Error broadcasting V League ${statType}:`, error);
    }
  }

  // Manual trigger for V League refresh (call this from an API endpoint or admin)
  async refreshVLeague() {
    if (!this.io) return;

    console.log('🔄 Refreshing V League data for all active subscriptions...');
    
    // Get unique stat types from subscriptions
    const statTypes = new Set();
    for (const [key, subscription] of this.vLeagueSubscriptions) {
      statTypes.add(subscription.statType);
    }

    // Broadcast updates for each stat type
    for (const statType of statTypes) {
      await this.broadcastVLeagueUpdate(statType);
    }
  }

  // Start automatic V League refresh (every 2 minutes when users are subscribed)
  startVLeagueAutoRefresh() {
    // Don't start if already running
    if (this.vLeagueRefreshInterval) return;

    console.log('📊 Starting V League auto-refresh (every 1 minutes)...');
    
    this.vLeagueRefreshInterval = setInterval(async () => {
      // Only refresh if there are active subscriptions
      if (this.vLeagueSubscriptions.size > 0) {
        console.log(`🔄 Auto-refreshing V League (${this.vLeagueSubscriptions.size} subscriptions active)`);
        await this.refreshVLeague();
      }
    },  60 * 1000); // Every minutes
  }

  // Stop automatic V League refresh
  stopVLeagueAutoRefresh() {
    if (this.vLeagueRefreshInterval) {
      clearInterval(this.vLeagueRefreshInterval);
      this.vLeagueRefreshInterval = null;
      console.log('📊 Stopped V League auto-refresh');
    }
  }
}

module.exports = new SocketService();