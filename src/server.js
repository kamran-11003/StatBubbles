const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const path = require('path');
const connectDB = require('./config/database');
const statsRoutes = require('./routes/stats.routes');
const liveScoresRoutes = require('./routes/live-scores.routes');
const StatsService = require('./services/stats.service');
const LiveScoresService = require('./services/live-scores.service');
const socketService = require('./services/socket.service');

const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, '../public/dist')));

// Routes
app.use('/api/stats', statsRoutes);
app.use('/api/live-scores', liveScoresRoutes);

// Initialize socket.io
socketService.initialize(httpServer);

// Function to refresh stats for all sports
async function refreshAllStats() {
  try {
    for (const sport of ["NHL", "NBA", "MLB", "NFL"]) {
      await StatsService.fetchAndSaveStats(sport);
    }
    
    // Broadcast updates to connected clients
    await socketService.broadcastUpdates();
    
  } catch (error) {
    console.error('Error refreshing stats:', error);
  }
}

// Initialize function
async function initialize() {
  try {
    // Connect to MongoDB
    await connectDB();

    // Initial stats fetch
    await refreshAllStats();
    
    // Start live scores monitoring
    await LiveScoresService.startMonitoring();
    
    // Set up periodic refresh (every 6 hours)
    setInterval(refreshAllStats, 6 * 60 * 60 * 1000);
    
    // Start server
    httpServer.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to initialize:', error);
    process.exit(1);
  }
}

initialize();