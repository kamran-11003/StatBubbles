const mongoose = require('mongoose');

const nbaSchema = new mongoose.Schema({
  name: String,
  team: String,
  teamColor: String,
  points: Number,
  rebounds: Number,
  assists: Number,
  ftPercentage: Number,
  shootingPercentage: Number
});

module.exports = mongoose.model('NBAPlayer', nbaSchema);