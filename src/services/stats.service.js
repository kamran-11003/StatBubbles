const axios = require('axios');
const { API_KEYS, BASE_URLS, TEAM_COLORS } = require('../config/constants');
const NHLPlayer = require('../models/nhl.model');
const NBAPlayer = require('../models/nba.model');
const MLBPlayer = require('../models/mlb.model');
const NFLPlayer = require('../models/nfl.model');

const models = {
  NHL: NHLPlayer,
  NBA: NBAPlayer,
  MLB: MLBPlayer,
  NFL: NFLPlayer
};

class StatsService {
  async fetchAndSaveStats(sport) {
    try {
      const response = await axios.get(BASE_URLS[sport], {
        headers: { "Ocp-Apim-Subscription-Key": API_KEYS[sport] }
      });

      const playersData = response.data;
      let formattedData = this._formatData(sport, playersData);
      await models[sport].deleteMany({});
      await models[sport].insertMany(formattedData);
    } catch (error) {
      console.error(`Error for ${sport}:`, error.response ? error.response.status : error.message);
      throw error;
    }
  }

  _formatData(sport, playersData) {
    switch(sport) {
      case 'NHL':
        return this._formatNHLData(playersData);
      case 'NBA':
        return this._formatNBAData(playersData);
      case 'MLB':
        return this._formatMLBData(playersData);
      case 'NFL':
        return this._formatNFLData(playersData);
      default:
        throw new Error(`Invalid sport: ${sport}`);
    }
  }

  _formatNHLData(playersData) {
    return playersData.map(player => ({
      name: player.Name,
      team: player.Team,
      teamColor: TEAM_COLORS.NHL[player.Team] || "#000000",
      goals: player.Games ? Number((player.Goals || 0) / player.Games).toFixed(2) : 0,
      assists: player.Games ? Number((player.Assists || 0) / player.Games).toFixed(2) : 0,
      plusMinus: player.Games ? Number((player.PlusMinus || 0) / player.Games).toFixed(2) : 0
    }));
  }

  _formatNBAData(playersData) {
    const MIN_FREE_THROWS = 125; // Minimum free throws to qualify for FT%
    const MIN_FIELD_GOALS = 300; // Minimum field goals to qualify for FG%
    
    return playersData.map(player => ({
      name: player.Name,
      team: player.Team,
      teamColor: TEAM_COLORS.NBA[player.Team] || "#000000",
      points: player.Games ? Number((player.Points || 0) / player.Games).toFixed(1) : 0,
      rebounds: player.Games ? Number((player.Rebounds || 0) / player.Games).toFixed(1) : 0,
      assists: player.Games ? Number((player.Assists || 0) / player.Games).toFixed(1) : 0,
      ftPercentage: player.FreeThrowsAttempted >= MIN_FREE_THROWS ? player.FreeThrowsPercentage : null,
      shootingPercentage: player.FieldGoalsAttempted >= MIN_FIELD_GOALS ? player.FieldGoalsPercentage : null
    }));
  }

  _formatMLBData(playersData) {
    const MIN_PLATE_APPEARANCES = 70;
    return playersData.map(player => ({
      name: player.Name,
      team: player.Team,
      teamColor: TEAM_COLORS.MLB[player.Team] || "#000000",
      battingAverage: player.PlateAppearances >= MIN_PLATE_APPEARANCES ? Number(player.BattingAverage || 0).toFixed(3) : null,
      homeRuns: Number(player.HomeRuns || 0),
      rbis: Number(player.RunsBattedIn || 0),
      ops: player.PlateAppearances >= MIN_PLATE_APPEARANCES ? Number(player.OnBasePlusSlugging || 0).toFixed(3) : null
    }));
  }

  _formatNFLData(playersData) {
    return playersData.map(player => ({
      name: player.Name,
      team: player.Team,
      teamColor: TEAM_COLORS.NFL[player.Team] || "#000000",
      touchdowns: Number((player.PassingTouchdowns || 0)),
      interceptions: Number(player.PassingInterceptions || 0),
      passingYards: Number(player.PassingYards || 0),
      rushingYards: Number(player.RushingYards || 0),
      completionPercentage: player.PassingAttempts > 200 ? Number(player.PassingCompletionPercentage || 0).toFixed(1) : null
    }));
  }

  async getTopPlayers(sport, statType) {
    const model = models[sport];
    return await model.find().sort({ [statType]: -1 }).limit(100);
  }

  async searchPlayers(sport, searchTerm) {
    const model = models[sport];
    if (!model) {
      throw new Error(`Invalid sport: ${sport}`);
    }

    // Case-insensitive search for player names
    const regex = new RegExp(searchTerm, 'i');
    return await model.find({ name: regex });
  }
}

module.exports = new StatsService();