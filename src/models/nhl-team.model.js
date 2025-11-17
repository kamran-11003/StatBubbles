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
  // NHL Standings Stats (from standings API)
  gamesplayed: { type: Number, default: 0 },
  gamesbehind: { type: Number, default: 0 },
  pointsfor: { type: Number, default: 0 },
  pointsagainst: { type: Number, default: 0 },
  pointdifferential: { type: Number, default: 0 },
  pointsdiff: { type: Number, default: 0 },
  differential: { type: Number, default: 0 },
  home: { type: String, default: '0-0' },
  road: { type: String, default: '0-0' },
  vsdiv: { type: String, default: '0-0' },
  total: { type: String, default: '0-0-0' },
  lasttengames: { type: String, default: '0-0-0' },
  streak: { type: Number, default: 0 },
  otlosses: { type: Number, default: 0 },
  overtimewins: { type: Number, default: 0 },
  shootoutlosses: { type: Number, default: 0 },
  shootoutwins: { type: Number, default: 0 },
  reglosses: { type: Number, default: 0 },
  regwins: { type: Number, default: 0 },
  rotlosses: { type: Number, default: 0 },
  rotwins: { type: Number, default: 0 },
  playoffseed: { type: Number, default: 0 },
  
  // NHL Team Statistics (from team stats API endpoint)
  // General Stats
  games: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  timeOnIce: { type: Number, default: 0 },
  timeOnIcePerGame: { type: Number, default: 0 },
  plusMinus: { type: Number, default: 0 },
  production: { type: Number, default: 0 },
  shifts: { type: Number, default: 0 },
  
  // Offensive Stats
  goals: { type: Number, default: 0 },
  assists: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  faceoffsWon: { type: Number, default: 0 },
  faceoffsLost: { type: Number, default: 0 },
  faceoffPercent: { type: Number, default: 0 },
  gameWinningGoals: { type: Number, default: 0 },
  powerPlayGoals: { type: Number, default: 0 },
  powerPlayAssists: { type: Number, default: 0 },
  shortHandedGoals: { type: Number, default: 0 },
  shortHandedAssists: { type: Number, default: 0 },
  shotsTotal: { type: Number, default: 0 },
  shootingPct: { type: Number, default: 0 },
  shootoutAttempts: { type: Number, default: 0 },
  shootoutGoals: { type: Number, default: 0 },
  shootoutShotPct: { type: Number, default: 0 },
  
  // Defensive Stats
  avgGoalsAgainst: { type: Number, default: 0 },
  goalsAgainst: { type: Number, default: 0 },
  saves: { type: Number, default: 0 },
  savePct: { type: Number, default: 0 },
  shotsAgainst: { type: Number, default: 0 },
  overtimeLosses: { type: Number, default: 0 },
  shootoutSaves: { type: Number, default: 0 },
  shootoutShotsAgainst: { type: Number, default: 0 },
  shootoutSavePct: { type: Number, default: 0 },
  
  // Penalties
  penaltyMinutes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  standingsUpdatedAt: { type: Date },
  statsUpdatedAt: { type: Date }
});

teamSchema.index({ displayName: 1 });

module.exports = mongoose.model('NHLTeam', teamSchema); 