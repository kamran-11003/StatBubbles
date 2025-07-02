const LiveScoresService = require('../services/live-scores.service');

class LiveScoresController {
  async getLiveScores(req, res) {
    try {
      const activeGames = LiveScoresService.getActiveGames();
      console.log('🎮 Controller: Returning active games:', activeGames.length);
      
      // Log the first few games in detail
      activeGames.slice(0, 3).forEach((game, index) => {
        console.log(`🎮 Game ${index + 1}:`, {
          id: game.id,
          sport: game.sport,
          homeTeam: game.HomeTeam,
          awayTeam: game.AwayTeam,
          status: game.Status,
          homeScore: game.HomeScore,
          awayScore: game.AwayScore
        });
      });
      
      res.json(activeGames);
    } catch (error) {
      console.error('❌ Controller: Error fetching live scores:', error);
      res.status(500).json({ error: 'Error fetching live scores' });
    }
  }
}

module.exports = new LiveScoresController();