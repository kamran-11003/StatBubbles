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
   // Teams data processing
   //await nbaTeamsService.processNbaData(db);
    await wnbaTeamsService.processWnbaData(db);
    await mlbTeamsService.processMlbData(db);
   //await nflTeamsService.processNflData(db);
   //await nhlTeamsService.processNhlData(db);

   // Player stats processing 
   //await nbaPlayerStatsService.processNbaPlayersWithStats(db);
   await wnbaPlayerStatsService.processWnbaPlayersWithStats(db);
   await mlbPlayerStatsService.processActiveMlbPlayersWithStats(db);
   //await nflPlayerStatsService.processActiveNflPlayersWithStats(db);
   //await nhlPlayerStatsService.processNhlPlayersWithStats(db);
    // Broadcast updates to connected clients
    await socketService.broadcastUpdates();
    
  } catch (error) {
    console.error('Error refreshing stats:', error);
  }
}

// Function to schedule refresh at midnight US Eastern Time
function scheduleMidnightRefresh() {
  const getTimeUntilMidnight = () => {
    const now = new Date();
    const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
    const midnight = new Date(easternTime);
    midnight.setHours(24, 0, 0, 0); // Next midnight
    
    // Convert back to local time for comparison
    const localMidnight = new Date(midnight.toLocaleString("en-US", {timeZone: "America/New_York"}));
    const timeUntilMidnight = localMidnight.getTime() - now.getTime();
    
    return timeUntilMidnight;
  };

  const scheduleNextRefresh = () => {
    const timeUntilMidnight = getTimeUntilMidnight();
    
    console.log(`Scheduling next stats refresh for midnight US Eastern Time (in ${Math.round(timeUntilMidnight / 1000 / 60)} minutes)`);
    
    setTimeout(async () => {
      console.log('🕛 Running scheduled midnight stats refresh...');
      await refreshAllStats();
      console.log('✅ Midnight stats refresh completed');
      
      // Schedule the next refresh (24 hours later)
      scheduleNextRefresh();
    }, timeUntilMidnight);
  };

  // Start the scheduling
  scheduleNextRefresh();
}

// Initialize function
async function initialize() {
  try {
    await connectDB();

    // Initial stats fetch
    await refreshAllStats();

    // Start live scores monitoring
    await LiveScoresService.startMonitoring();

    // Start server
    httpServer.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
    
    // Schedule midnight refresh
    scheduleMidnightRefresh();
     
  } catch (error) {
    console.error('Failed to initialize:', error);
    process.exit(1);
  }
}

initialize();
