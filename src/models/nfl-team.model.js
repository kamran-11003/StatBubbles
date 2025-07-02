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
  // NFL-specific stats
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  winpercent: { type: Number, default: 0 },
  gamesbehind: { type: Number, default: 0 },
  home: { type: String, default: '0-0' }, // Home record
  road: { type: String, default: '0-0' }, // Road record
  vsconf: { type: String, default: '0-0' }, // Conference record
  vsdiv: { type: String, default: '0-0' }, // Division record
  avgpointsfor: { type: Number, default: 0 }, // Points scored per game
  avgpointsagainst: { type: Number, default: 0 }, // Points allowed per game
  pointdifferential: { type: Number, default: 0 }, // Point differential
  streak: { type: String, default: '' },
  lasttengames: { type: String, default: '0-0' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  standingsUpdatedAt: { type: Date }
});

// Index for displayName
teamSchema.index({ displayName: 1 });

module.exports = mongoose.model('NFLTeam', teamSchema); 