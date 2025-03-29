const mongoose = require('mongoose');

const mlbSchema = new mongoose.Schema({
  name: String,
  team: String,
  teamColor: String,
  battingAverage: Number,
  homeRuns: Number,
  rbis: Number,
  ops: Number
});

module.exports = mongoose.model('MLBPlayer', mlbSchema);