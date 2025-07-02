require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const liveScoresRoutes = require('./routes/live-scores.routes');
const LiveScoresService = require('./services/live-scores.service');
const socketService = require('./services/socket.service');
const nbaTeamsService = require('./services/nba-teams.service');
const wnbaTeamsService = require('./services/wnba-teams.service');
const mlbTeamsService = require('./services/mlb-teams.service');
const nflTeamsService = require('./services/nfl-teams.service');
const nhlTeamsService = require('./services/nhl-teams.service');
const nbaPlayerStatsService = require('./services/nba-player-stats.service');
const wnbaPlayerStatsService = require('./services/wnba-player-stats.service');
const mlbPlayerStatsService = require('./services/mlb-player-stats.service');
const nflPlayerStatsService = require('./services/nfl-player-stats.service');
const nhlPlayerStatsService = require('./services/nhl-player-stats.service');
const teamsRoutes = require('./routes/teams.routes');
const statsRoutes = require('./routes/stats.routes');


const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, '../public/dist')));

// Routes
app.use('/api/live-scores', liveScoresRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/teams', teamsRoutes);

// Initialize socket.io
socketService.initialize(httpServer);

// Function to refresh stats for all sports
async function refreshAllStats() {
  try {
    const db = mongoose.connection.db;
    await nbaTeamsService.processNbaData(db);
    await wnbaTeamsService.processWnbaData(db);
    await mlbTeamsService.processMlbData(db);
   await nflTeamsService.processNflData(db);
   await nhlTeamsService.processNhlData(db);
   await nbaPlayerStatsService.processNbaPlayersWithStats(db);
  await wnbaPlayerStatsService.processWnbaPlayersWithStats(db);
  await mlbPlayerStatsService.processActiveMlbPlayersWithStats(db);
   await nflPlayerStatsService.processActiveNflPlayersWithStats(db);
   await nhlPlayerStatsService.processNhlPlayersWithStats(db);
    
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

   
     // Start live scores monitoring
     await LiveScoresService.startMonitoring();
    // Start server
    httpServer.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
    
     // Initial stats fetch
     await refreshAllStats();
    
     
     // Set up periodic refresh (every 6 hours)
     setInterval(refreshAllStats, 6 * 60 * 60 * 1000);
     
  } catch (error) {
    console.error('Failed to initialize:', error);
    process.exit(1);
  }
}

initialize();