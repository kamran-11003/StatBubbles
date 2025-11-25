const express = require('express');
const router = express.Router();
const StatsController = require('../controllers/stats.controller');

// V League info endpoint - Data is read directly from Google Sheets (no sync needed)
router.get('/vleague/info', async (req, res) => {
  try {
    res.json({ 
      success: true, 
      message: 'V League reads data directly from Google Sheets!',
      info: 'No sync needed - any updates in the sheet are reflected immediately.',
      spreadsheetId: process.env.VLEAGUE_SPREADSHEET_ID || 'Not configured'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Error', 
      details: error.message 
    });
  }
});

// V League manual refresh endpoint - Broadcasts updates to all connected clients
router.post('/vleague/refresh', async (req, res) => {
  try {
    const socketService = require('../services/socket.service');
    await socketService.refreshVLeague();
    
    res.json({ 
      success: true, 
      message: 'V League data refreshed and broadcasted to all connected clients!',
      activeSubscriptions: socketService.vLeagueSubscriptions.size
    });
  } catch (error) {
    console.error('Error refreshing V League:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error refreshing V League data', 
      details: error.message 
    });
  }
});

// Dynamic routes - these come AFTER specific routes
router.get('/:sport/search', StatsController.searchPlayers.bind(StatsController));
router.get('/:sport/:statType', StatsController.getStats.bind(StatsController));
router.get('/:sport/team/:teamId/:statType', StatsController.getTeamPlayers.bind(StatsController));

module.exports = router;