const StatsService = require('../services/stats.service');

const validStats = {
  NHL: ['goals', 'assists', 'plusMinus'],
  NBA: ['points', 'rebounds', 'assists', 'ftPercentage', 'shootingPercentage'],
  MLB: ['battingAverage', 'homeRuns', 'rbis', 'ops'],
  NFL: ['touchdowns', 'interceptions', 'passingYards', 'rushingYards', 'completionPercentage']
};

const validSports = ['NHL', 'NBA', 'MLB', 'NFL'];

class StatsController {
  async getStats(req, res) {
    const { sport, statType } = req.params;
    
    if (!validStats[sport] || !validStats[sport].includes(statType)) {
      return res.status(400).json({ 
        error: `Invalid stat type for ${sport}. Valid options: ${validStats[sport].join(', ')}` 
      });
    }

    try {
      const topPlayers = await StatsService.getTopPlayers(sport, statType);
     
      res.json(topPlayers);
    } catch (error) {
      res.status(500).json({ error: `Error fetching ${sport} stats` });
    }
  }

  async searchPlayers(req, res) {
    const { sport } = req.params;
    const { name } = req.query;

    if (!validSports.includes(sport)) {
      return res.status(400).json({ 
        error: `Invalid sport. Valid options: ${validSports.join(', ')}` 
      });
    }

    if (!name) {
      return res.status(400).json({ 
        error: 'Search term (name) is required' 
      });
    }

    try {
      const players = await StatsService.searchPlayers(sport, name);
      res.json(players);
    } catch (error) {
      res.status(500).json({ error: `Error searching ${sport} players` });
    }
  }
}

module.exports = new StatsController();