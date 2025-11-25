const mongoose = require('mongoose');

const vLeagueTeamSchema = new mongoose.Schema({
  // Basic Team Info
  Team: { type: String, required: true, unique: true },
  displayName: { type: String },
  shortName: { type: String },
  abbreviation: { type: String },
  
  // Team Visual Info
  color: { type: String },
  alternateColor: { type: String },
  logo: { type: String },
  
  // Team Record
  W: { type: Number, default: 0 },
  L: { type: Number, default: 0 },
  'WIN%': { type: Number, default: 0 },
  
  // Team Stats
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
  TOV: { type: Number, default: 0 },
  STL: { type: Number, default: 0 },
  BLK: { type: Number, default: 0 },
  PF: { type: Number, default: 0 },
  PFD: { type: Number, default: 0 },
  
  // Metadata
  teamId: { type: String, unique: true, sparse: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for faster queries
vLeagueTeamSchema.index({ Team: 1 });

module.exports = mongoose.model('VLeagueTeam', vLeagueTeamSchema, 'vleagueteams');


