const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  athleteId: { type: String, required: true, unique: true },
  uid: { type: String, required: true },
  guid: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  fullName: { type: String, required: true },
  displayName: { type: String, required: true },
  shortName: { type: String, required: true },
  height: { type: Number },
  displayHeight: { type: String },
  age: { type: Number },
  headshot: {
    href: { type: String },
    alt: { type: String }
  },
  jersey: { type: String },
  teamId: { type: String, required: true },
  teamColor: { type: String },
  teamDisplayName: { type: String },
  stats: {
    gamesPlayed: { type: Number, default: 0 },
    gamesStarted: { type: Number, default: 0 },
    minutes: { type: Number, default: 0 },
    avgMinutes: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    avgPoints: { type: Number, default: 0 },
    fieldGoalsMade: { type: Number, default: 0 },
    fieldGoalsAttempted: { type: Number, default: 0 },
    fieldGoalPct: { type: Number, default: 0 },
    threePointFieldGoalsMade: { type: Number, default: 0 },
    threePointFieldGoalsAttempted: { type: Number, default: 0 },
    threePointFieldGoalPct: { type: Number, default: 0 },
    freeThrowsMade: { type: Number, default: 0 },
    freeThrowsAttempted: { type: Number, default: 0 },
    freeThrowPct: { type: Number, default: 0 },
    offensiveRebounds: { type: Number, default: 0 },
    defensiveRebounds: { type: Number, default: 0 },
    rebounds: { type: Number, default: 0 },
    avgRebounds: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    avgAssists: { type: Number, default: 0 },
    turnovers: { type: Number, default: 0 },
    avgTurnovers: { type: Number, default: 0 },
    steals: { type: Number, default: 0 },
    avgSteals: { type: Number, default: 0 },
    blocks: { type: Number, default: 0 },
    avgBlocks: { type: Number, default: 0 },
    fouls: { type: Number, default: 0 },
    avgFouls: { type: Number, default: 0 },
    doubleDouble: { type: Number, default: 0 },
    tripleDouble: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  statsUpdatedAt: { type: Date }
});

// Indexes for displayName, teamId, and common stats
playerSchema.index({ displayName: 1 });
playerSchema.index({ 'stats.avgPoints': -1 });
playerSchema.index({ 'stats.points': -1 });
playerSchema.index({ 'stats.avgRebounds': -1 });
playerSchema.index({ 'stats.avgAssists': -1 });

module.exports = mongoose.model('WNBAPlayer', playerSchema); 