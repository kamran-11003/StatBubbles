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
}

module.exports = new SocketService();