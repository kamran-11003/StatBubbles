const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  playerId: { type: String, required: true, unique: true },
  uid: { type: String, required: true },
  guid: { type: String },
  type: { type: String },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  displayName: { type: String, required: true },
  shortName: { type: String },
  weight: { type: Number },
  height: { type: Number },
  age: { type: Number },
  jersey: { type: String },
  position: { type: String },
  college: { type: String },
  teamId: { type: String },
  teamName: { type: String },
  teamAbbreviation: { type: String },
  teamDisplayName: { type: String },
  teamColor: { type: String },
  teamAlternateColor: { type: String },
  headshot: { type: String },
  // NFL-specific stats
  touchdowns: { type: Number, default: 0 },
  passYards: { type: Number, default: 0 },
  rushYards: { type: Number, default: 0 },
  completionPercentage: { type: Number, default: 0 },
  passAttempts: { type: Number, default: 0 },
  passCompletions: { type: Number, default: 0 },
  interceptions: { type: Number, default: 0 },
  sacks: { type: Number, default: 0 },
  rushingAttempts: { type: Number, default: 0 },
  rushingYards: { type: Number, default: 0 },
  receivingYards: { type: Number, default: 0 },
  receptions: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for displayName
playerSchema.index({ displayName: 1 });

module.exports = mongoose.model('NFLPlayer', playerSchema); 