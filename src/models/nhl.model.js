const mongoose = require('mongoose');

const nhlSchema = new mongoose.Schema({
  name: String,
  team: String,
  teamColor: String,
  goals: Number,
  assists: Number,
  plusMinus: Number
});

module.exports = mongoose.model('NHLPlayer', nhlSchema);