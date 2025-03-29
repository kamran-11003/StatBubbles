const { Server } = require('socket.io');
const StatsService = require('./stats.service');

class SocketService {
  constructor() {
    this.io = null;
    this.activeSubscriptions = new Map();
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
          const stats = await StatsService.getTopPlayers(sport, statType);
          socket.emit('stats', { sport, statType, data: stats });
          
          // Store subscription
          this.activeSubscriptions.set(subscriptionKey, { sport, statType });
        } catch (error) {
          socket.emit('error', { message: `Error fetching ${sport} stats` });
        }
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
        const stats = await StatsService.getTopPlayers(sport, statType);
        this.io.emit('stats', { sport, statType, data: stats });
      } catch (error) {
        console.error(`Error broadcasting ${sport} stats:`, error);
      }
    }
  }
}

module.exports = new SocketService();