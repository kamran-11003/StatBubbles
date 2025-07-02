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
  // NHL-specific stats
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  winpercent: { type: Number, default: 0 },
  gamesbehind: { type: Number, default: 0 },
  home: { type: String, default: '0-0' },
  road: { type: String, default: '0-0' },
  vsdiv: { type: String, default: '0-0' },
  vsconf: { type: String, default: '0-0' },
  avgpointsfor: { type: Number, default: 0 },
  avgpointsagainst: { type: Number, default: 0 },
  pointdifferential: { type: Number, default: 0 },
  streak: { type: String, default: '' },
  lasttengames: { type: String, default: '0-0' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  standingsUpdatedAt: { type: Date }
});

teamSchema.index({ displayName: 1 });

module.exports = mongoose.model('NHLTeam', teamSchema); 