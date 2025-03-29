const mongoose = require('mongoose');

const nflSchema = new mongoose.Schema({
  name: String,
  team: String,
  teamColor: String,
  touchdowns: Number,
  interceptions: Number,
  passingYards: Number,
  rushingYards: Number,
  completionPercentage: Number
});

module.exports = mongoose.model('NFLPlayer', nflSchema);