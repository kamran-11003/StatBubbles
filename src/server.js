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
const { checkForSeasonChanges, clearSeasonCache } = require('./services/season-resolver');
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

let dataReady = true;
let executionCounter = 0;

// Function to refresh stats for all sports
async function refreshAllStats() {
  const executionId = ++executionCounter;
  console.log(`🔄 [Execution #${executionId}] Starting refreshAllStats...`, new Date().toISOString());
  try {
    const db = mongoose.connection.db;

    // Check for season changes before refreshing data
    console.log(`🔍 [Execution #${executionId}] Checking for season changes...`);
    const changedSports = await checkForSeasonChanges(db);
    if (changedSports.length > 0) {
      console.log(`🆕 [Execution #${executionId}] Season changes detected for: ${changedSports.join(', ')} — stale data has been cleaned`);
    }

    // Teams data processing
    console.log(`📊 [Execution #${executionId}] Processing NBA teams...`);
    await nbaTeamsService.processNbaData(db);
    console.log(`📊 [Execution #${executionId}] Processing WNBA teams...`);
    await wnbaTeamsService.processWnbaData(db);
    console.log(`📊 [Execution #${executionId}] Processing MLB teams...`);
    await mlbTeamsService.processMlbData(db);
    console.log(`📊 [Execution #${executionId}] Processing NFL teams...`);
    await nflTeamsService.processNflData(db);
    console.log(`📊 [Execution #${executionId}] Processing NHL teams...`);
    await nhlTeamsService.processNhlData(db);
    
    // Player stats processing
    console.log(`👥 [Execution #${executionId}] Processing NBA players...`);
    await nbaPlayerStatsService.processNbaPlayersWithStats(db);
    console.log(`👥 [Execution #${executionId}] Processing WNBA players...`);
    await wnbaPlayerStatsService.processWnbaPlayersWithStats(db);
    console.log(`👥 [Execution #${executionId}] Processing MLB players...`);
    await mlbPlayerStatsService.processActiveMlbPlayersWithStats(db);
    console.log(`👥 [Execution #${executionId}] Processing NFL players...`);
    await nflPlayerStatsService.processActiveNflPlayersWithStats(db);
    console.log(`👥 [Execution #${executionId}] Processing NHL players...`);
    await nhlPlayerStatsService.processNhlPlayersWithStats(db);
    // Broadcast updates to connected clients
    await socketService.broadcastUpdates();
    dataReady = true;
    console.log(`✅ [Execution #${executionId}] Data load complete, dataReady set to true`);
  } catch (error) {
    console.error(`❌ [Execution #${executionId}] Error refreshing stats:`, error);
    dataReady = false;
  }
}

// Function to schedule refresh at midnight US Eastern Time
function scheduleMidnightRefresh() {
  const getTimeUntilMidnight = () => {
    const now = new Date();
    
    // Get current time in Eastern Time
    const easternTimeString = now.toLocaleString("en-US", {timeZone: "America/New_York"});
    const easternNow = new Date(easternTimeString);
    
    // Create midnight in Eastern Time (next day)
    const easternMidnight = new Date(easternNow);
    easternMidnight.setDate(easternMidnight.getDate() + 1);
    easternMidnight.setHours(0, 0, 0, 0);
    
    // Convert to local time for setTimeout
    const localMidnight = new Date(easternMidnight.toLocaleString("en-US", {timeZone: "America/New_York"}));
    
    const timeUntilMidnight = localMidnight.getTime() - now.getTime();
    
    // If we get a negative or very small value, schedule for 24hours from now
    if (timeUntilMidnight <= 60000) { // Less than 1 minute
      console.log('⚠️ Time until midnight calculation resulted in immediate execution, scheduling for24hours from now');
      return 24 * 60* 60 *1000; // 24 hours in milliseconds
    }
    
    return timeUntilMidnight;
  };
  
  const scheduleNextRefresh = () => {
    const timeUntilMidnight = getTimeUntilMidnight();
    const minutesUntilMidnight = Math.round(timeUntilMidnight / 1000 / 60);
    console.log(`Scheduling next stats refresh for midnight US Eastern Time (in ${minutesUntilMidnight} minutes)`);
    
    setTimeout(async () => {
      console.log('🕛 Running scheduled midnight stats refresh...');
      dataReady = false;
      // Clear season cache so seasons are re-resolved from ESPN API
      clearSeasonCache();
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
  console.log('🚀 Starting server initialization...', new Date().toISOString());
  try {
    await connectDB();
    // Start server immediately
    httpServer.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
    
    // Start live monitoring immediately (shows live scores even while data is loading)
    console.log('🎮 Starting live monitoring immediately...');
    await LiveScoresService.startMonitoring();
    console.log('✅ Live monitoring started - users can see live scores');
    
    // Start data loading in the background (doesn't block live monitoring)
    (async () => {
      try {
        console.log('🔄 Starting background data load...');
        await refreshAllStats();
        console.log('✅ Background data load completed');
      } catch (err) {
        console.error('Error during background data load:', err);
      }
    })();
    
    // Schedule midnight refresh
    scheduleMidnightRefresh();
  } catch (error) {
    console.error('Failed to initialize:', error);
    process.exit(1);
  }
}

initialize();