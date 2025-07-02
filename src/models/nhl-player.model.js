const mongoose = require('mongoose');

const nhlPlayerSchema = new mongoose.Schema({
  playerId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  uid: {
    type: String,
    required: true
  },
  guid: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  displayName: {
    type: String,
    required: true
  },
  shortName: {
    type: String,
    required: true
  },
  weight: {
    type: Number
  },
  height: {
    type: Number
  },
  age: {
    type: Number
  },
  jersey: {
    type: String
  },
  position: {
    type: String
  },
  college: {
    type: String
  },
  teamId: {
    type: String,
    required: true
  },
  teamName: {
    type: String,
    required: true
  },
  teamAbbreviation: {
    type: String,
    required: true
  },
  teamDisplayName: {
    type: String
  },
  teamColor: {
    type: String
  },
  teamAlternateColor: {
    type: String
  },
  headshot: {
    type: String
  },
  // NHL-specific stats
  goals: {
    type: Number,
    default: 0
  },
  assists: {
    type: Number,
    default: 0
  },
  points: {
    type: Number,
    default: 0
  },
  plusMinus: {
    type: Number,
    default: 0
  },
  penaltyMinutes: {
    type: Number,
    default: 0
  },
  shotsTotal: {
    type: Number,
    default: 0
  },
  powerPlayGoals: {
    type: Number,
    default: 0
  },
  powerPlayAssists: {
    type: Number,
    default: 0
  },
  shortHandedGoals: {
    type: Number,
    default: 0
  },
  shortHandedAssists: {
    type: Number,
    default: 0
  },
  gameWinningGoals: {
    type: Number,
    default: 0
  },
  timeOnIcePerGame: {
    type: Number,
    default: 0
  },
  production: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'nhlplayers'
});

// Index for efficient queries
nhlPlayerSchema.index({ playerId: 1 });
nhlPlayerSchema.index({ teamId: 1 });
nhlPlayerSchema.index({ displayName: 1 });

module.exports = mongoose.model('NHLPlayer', nhlPlayerSchema);