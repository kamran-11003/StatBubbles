const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  teamId: { type: String, required: true, unique: true },
  uid: { type: String, required: true },
  abbreviation: { type: String, required: true },
  displayName: { type: String, required: true },
  shortDisplayName: { type: String, required: true },
  name: { type: String, required: true },
  nickname: { type: String, required: true },
  location: { type: String, required: true },
  color: { type: String },
  alternateColor: { type: String },
  logos: [{
    href: { type: String, required: true },
    alt: { type: String },
    rel: [String],
    width: Number,
    height: Number
  }],
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  winPercentage: { type: Number, default: 0 },
  gamesBehind: { type: Number, default: 0 },
  homeRecord: { type: String, default: '0-0' },
  awayRecord: { type: String, default: '0-0' },
  conferenceRecord: { type: String, default: '0-0' },
  pointsPerGame: { type: Number, default: 0 },
  opponentPointsPerGame: { type: Number, default: 0 },
  pointDifferential: { type: Number, default: 0 },
  streak: { type: String, default: '' },
  lastTenGames: { type: String, default: '0-0' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  standingsUpdatedAt: { type: Date }
});

// Index for displayName
teamSchema.index({ displayName: 1 });

module.exports = mongoose.model('WNBATeam', teamSchema); 