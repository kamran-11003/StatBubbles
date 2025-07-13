const NbaPlayerStatsService = require('../services/nba-player-stats.service');
const WnbaPlayerStatsService = require('../services/wnba-player-stats.service');
const MlbPlayerStatsService = require('../services/mlb-player-stats.service');
const NflPlayerStatsService = require('../services/nfl-player-stats.service');
const NhlPlayerStatsService = require('../services/nhl-player-stats.service');

const validStats = {
  NBA: [
    'gamesPlayed', 'gamesStarted', 'minutes', 'avgMinutes',
    'points', 'avgPoints', 'fieldGoalsMade', 'fieldGoalsAttempted', 'fieldGoalPct',
    'threePointFieldGoalsMade', 'threePointFieldGoalsAttempted', 'threePointFieldGoalPct',
    'freeThrowsMade', 'freeThrowsAttempted', 'freeThrowPct',
    'offensiveRebounds', 'defensiveRebounds', 'rebounds', 'avgRebounds',
    'assists', 'avgAssists', 'turnovers', 'avgTurnovers',
    'steals', 'avgSteals', 'blocks', 'avgBlocks',
    'fouls', 'avgFouls', 'doubleDouble', 'tripleDouble'
  ],
  WNBA: [
    'gamesPlayed', 'gamesStarted', 'minutes', 'avgMinutes',
    'points', 'avgPoints', 'fieldGoalsMade', 'fieldGoalsAttempted', 'fieldGoalPct',
    'threePointFieldGoalsMade', 'threePointFieldGoalsAttempted', 'threePointFieldGoalPct',
    'freeThrowsMade', 'freeThrowsAttempted', 'freeThrowPct',
    'offensiveRebounds', 'defensiveRebounds', 'rebounds', 'avgRebounds',
    'assists', 'avgAssists', 'turnovers', 'avgTurnovers',
    'steals', 'avgSteals', 'blocks', 'avgBlocks',
    'fouls', 'avgFouls', 'doubleDouble', 'tripleDouble'
  ],
  MLB: [
    // Pitching stats
    'pitching_gamesPlayed', 'pitching_gamesStarted', 'pitching_completeGames', 'pitching_shutouts',
    'pitching_innings', 'pitching_hits', 'pitching_runs', 'pitching_earnedRuns', 'pitching_homeRuns',
    'pitching_walks', 'pitching_strikeouts', 'pitching_wins', 'pitching_losses', 'pitching_saves',
    'pitching_holds', 'pitching_blownSaves', 'pitching_ERA', 'pitching_WHIP', 'pitching_battersFaced',
    'pitching_battersHit', 'pitching_wildPitches', 'pitching_balks', 'pitching_intentionalWalks',
    'pitching_groundOuts', 'pitching_airOuts', 'pitching_doublePlays', 'pitching_triplePlays',
    
    // Batting stats
    'batting_gamesPlayed', 'batting_gamesStarted', 'batting_atBats', 'batting_runs', 'batting_hits',
    'batting_doubles', 'batting_triples', 'batting_homeRuns', 'batting_RBIs', 'batting_stolenBases',
    'batting_caughtStealing', 'batting_walks', 'batting_strikeouts', 'batting_avg',
    'batting_onBasePct', 'batting_slugAvg', 'batting_OPS', 'batting_sacrificeFlies',
    'batting_sacrificeBunts', 'batting_intentionalWalks', 'batting_hitByPitch', 'batting_groundOuts',
    'batting_airOuts', 'batting_groundIntoDoublePlays', 'batting_numberOfPitches', 'batting_plateAppearances',
    'batting_totalBases', 'batting_runsCreated', 'batting_extraBaseHits', 'batting_totalBases',
    
    // Fielding stats
    'fielding_gamesPlayed', 'fielding_gamesStarted', 'fielding_fullInningsPlayed', 'fielding_totalChances',
    'fielding_putouts', 'fielding_assists', 'fielding_errors', 'fielding_fieldingPct',
    'fielding_rangeFactorPerGame', 'fielding_rangeFactorPer9Innings', 'fielding_doublePlays',
    'fielding_triplePlays', 'fielding_passedBalls', 'fielding_outfieldAssists', 'fielding_catcherInterference'
  ],
  NFL: [
    'touchdowns', 'passYards', 'rushYards', 'completionPercentage',
    'passAttempts', 'passCompletions', 'interceptions', 'sacks',
    'rushingAttempts', 'rushingYards', 'receivingYards', 'receptions'
  ],
  NHL: [
    'goals', 'assists', 'points', 'plusMinus', 'penaltyMinutes', 'shotsTotal',
    'powerPlayGoals', 'powerPlayAssists', 'shortHandedGoals', 'shortHandedAssists',
    'gameWinningGoals', 'timeOnIcePerGame', 'production'
  ]
};

const validSports = ['NBA', 'WNBA', 'MLB', 'NFL', 'NHL'];

class StatsController {
  async getStats(req, res) {
    const { sport, statType } = req.params;
    
    
    if (!validStats[sport] || !validStats[sport].includes(statType)) {
      return res.status(400).json({ 
        error: `Invalid stat type for ${sport}. Valid options: ${validStats[sport]?.join(', ') || 'No valid stats found for this sport'}` 
      });
    }

    try {
      let topPlayers;
      if (sport === 'NBA') {
        topPlayers = await NbaPlayerStatsService.getTopPlayers(statType);
      } else if (sport === 'wnba' || sport === 'WNBA') {
        topPlayers = await WnbaPlayerStatsService.getTopPlayers(statType);
      } else if (sport === 'MLB') {
        topPlayers = await MlbPlayerStatsService.getTopPlayers(statType);
      } else if (sport === 'NFL') {
        topPlayers = await NflPlayerStatsService.getTopPlayers(statType);
      } else if (sport === 'NHL') {
        topPlayers = await NhlPlayerStatsService.getTopPlayers(statType);
      } else {
        topPlayers = await StatsService.getTopPlayers(sport, statType);
      }
     
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
      let players;
      if (sport === 'NBA') {
        players = await NbaPlayerStatsService.searchPlayers(name);
      } else if (sport === 'wnba' || sport === 'WNBA') {
        players = await WnbaPlayerStatsService.searchPlayers(name);
      } else if (sport === 'MLB') {
        players = await MlbPlayerStatsService.searchPlayers(name);
      } else if (sport === 'NFL') {
        players = await NflPlayerStatsService.searchPlayers(name);
      } else if (sport === 'NHL') {
        players = await NhlPlayerStatsService.searchPlayers(name);
      } else {
        players = await StatsService.searchPlayers(sport, name);
      }
      res.json(players);
    } catch (error) {
      res.status(500).json({ error: `Error searching ${sport} players` });
    }
  }

  async getTeamPlayers(req, res) {
    const { sport, teamId, statType } = req.params;
    const { limit = 100 } = req.query;
    
    if (!validSports.includes(sport)) {
      return res.status(400).json({ 
        error: `Invalid sport. Valid options: ${validSports.join(', ')}` 
      });
    }

    if (!validStats[sport] || !validStats[sport].includes(statType)) {
      return res.status(400).json({ 
        error: `Invalid stat type for ${sport}. Valid options: ${validStats[sport]?.join(', ') || 'No valid stats found for this sport'}` 
      });
    }

    if (!teamId) {
      return res.status(400).json({ 
        error: 'Team ID is required' 
      });
    }

    try {
      let teamPlayers;
      if (sport === 'NBA') {
        teamPlayers = await NbaPlayerStatsService.getTeamPlayers(teamId, statType, parseInt(limit));
      } else if (sport === 'wnba' || sport === 'WNBA') {
        teamPlayers = await WnbaPlayerStatsService.getTeamPlayers(teamId, statType, parseInt(limit));
      } else if (sport === 'MLB') {
        teamPlayers = await MlbPlayerStatsService.getTeamPlayers(teamId, statType, parseInt(limit));
      } else if (sport === 'NFL') {
        teamPlayers = await NflPlayerStatsService.getTeamPlayers(teamId, statType, parseInt(limit));
      } else if (sport === 'NHL') {
        teamPlayers = await NhlPlayerStatsService.getTeamPlayers(teamId, statType, parseInt(limit));
      } else {
        teamPlayers = await StatsService.getTeamPlayers(sport, teamId, statType, parseInt(limit));
      }
     
      res.json(teamPlayers);
    } catch (error) {
      res.status(500).json({ error: `Error fetching ${sport} team players` });
    }
  }
}

module.exports = new StatsController();