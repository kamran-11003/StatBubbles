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
      goals: player.Goals || 0,
      assists: player.Assists || 0,
      plusMinus: player.PlusMinus || 0
    }));
  }

  _formatNBAData(playersData) {
    return playersData.map(player => ({
      name: player.Name,
      team: player.Team,
      teamColor: TEAM_COLORS.NBA[player.Team] || "#000000",
      points: player.Games ? Number((player.Points || 0) / player.Games).toFixed(1) : 0,
      rebounds: player.Rebounds,
      assists: player.Assists,
      ftPercentage: player.FreeThrowsPercentage,
      shootingPercentage: player.FieldGoalsPercentage
    }));
  }

  _formatMLBData(playersData) {
    return playersData.map(player => ({
      name: player.Name,
      team: player.Team,
      teamColor: TEAM_COLORS.MLB[player.Team] || "#000000",
      battingAverage: Number(player.BattingAverage || 0).toFixed(3),
      homeRuns: player.HomeRuns || 0,
      rbis: player.RunsBattedIn || 0,
      ops: Number(player.OnBasePlusSlugging || 0).toFixed(3)
    }));
  }

  _formatNFLData(playersData) {
    return playersData.map(player => ({
      name: player.Name,
      team: player.Team,
      teamColor: TEAM_COLORS.NFL[player.Team] || "#000000",
      touchdowns: Number((player.PassingTouchdowns || 0) + (player.RushingTouchdowns || 0) + (player.ReceivingTouchdowns || 0)).toFixed(1),
      interceptions: player.PassingInterceptions || 0,
      passingYards: player.PassingYards || 0,
      rushingYards: player.RushingYards || 0,
      completionPercentage: Number(player.PassingCompletionPercentage || 0).toFixed(1)
    }));
  }

  async getTopPlayers(sport, statType) {
    const model = models[sport];
    return await model.find().sort({ [statType]: -1 }).limit(100);
  }
}

module.exports = new StatsService();