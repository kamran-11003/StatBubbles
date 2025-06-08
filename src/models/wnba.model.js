const mongoose = require('mongoose');

const wnbaPlayerSchema = new mongoose.Schema({
  name: String,
  team: String,
  teamColor: String,
  pointsPerGame: Number,
  reboundsPerGame: Number,
  assistsPerGame: Number,
  blocksPerGame: Number,
  stealsPerGame: Number,
  fieldGoalPercentage: Number,
  threePointersMade: Number,
  threePointPercentage: Number,
  fantasyPointsPerGame: Number
});

module.exports = mongoose.model('WNBAPlayer', wnbaPlayerSchema); 