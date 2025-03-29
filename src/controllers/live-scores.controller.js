const LiveScoresService = require('../services/live-scores.service');

class LiveScoresController {
  async getLiveScores(req, res) {
    try {
      const activeGames = LiveScoresService.getActiveGames();
      res.json(activeGames);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching live scores' });
    }
  }
}

module.exports = new LiveScoresController();