const mongoose = require('mongoose');

const vLeaguePlayerSchema = new mongoose.Schema({
  // Basic Info
  Team: { type: String, required: true },
  PlayerName: { type: String, required: true },
  shortName: { type: String },
  displayName: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  jerseyNumber: { type: String },
  position: { type: String },
  
  // Images/Colors
  headshot: {
    href: { type: String },
    alt: { type: String }
  },
  teamColor: { type: String },
  teamLogo: { type: String },
  teamShortName: { type: String },
  
  // Player Stats
  PTS: { type: Number, default: 0 },
  FGM: { type: Number, default: 0 },
  FGA: { type: Number, default: 0 },
  'FG%': { type: Number, default: 0 },
  '3PM': { type: Number, default: 0 },
  '3PA': { type: Number, default: 0 },
  '3P%': { type: Number, default: 0 },
  FTM: { type: Number, default: 0 },
  FTA: { type: Number, default: 0 },
  'FT%': { type: Number, default: 0 },
  OREB: { type: Number, default: 0 },
  DREB: { type: Number, default: 0 },
  REB: { type: Number, default: 0 },
  AST: { type: Number, default: 0 },
  STL: { type: Number, default: 0 },
  BLK: { type: Number, default: 0 },
  TOV: { type: Number, default: 0 },
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for faster queries
vLeaguePlayerSchema.index({ PlayerName: 1 });
vLeaguePlayerSchema.index({ Team: 1 });

module.exports = mongoose.model('VLeaguePlayer', vLeaguePlayerSchema, 'vleagueplayers');

