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
  // General Stats
  games: { type: Number, default: 0 },
  gameStarted: { type: Number, default: 0 },
  teamGamesPlayed: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  ties: { type: Number, default: 0 },
  plusMinus: { type: Number, default: 0 },
  timeOnIce: { type: Number, default: 0 },
  timeOnIcePerGame: { type: Number, default: 0 },
  shifts: { type: Number, default: 0 },
  shiftsPerGame: { type: Number, default: 0 },
  production: { type: Number, default: 0 },
  
  // Offensive Stats
  goals: { type: Number, default: 0 },
  avgGoals: { type: Number, default: 0 },
  assists: { type: Number, default: 0 },
  shotsTotal: { type: Number, default: 0 },
  avgShots: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  pointsPerGame: { type: Number, default: 0 },
  powerPlayGoals: { type: Number, default: 0 },
  powerPlayAssists: { type: Number, default: 0 },
  shortHandedGoals: { type: Number, default: 0 },
  shortHandedAssists: { type: Number, default: 0 },
  shootoutAttempts: { type: Number, default: 0 },
  shootoutGoals: { type: Number, default: 0 },
  shootoutShotPct: { type: Number, default: 0 },
  shootingPct: { type: Number, default: 0 },
  totalFaceOffs: { type: Number, default: 0 },
  faceoffsWon: { type: Number, default: 0 },
  faceoffsLost: { type: Number, default: 0 },
  faceoffPercent: { type: Number, default: 0 },
  gameTyingGoals: { type: Number, default: 0 },
  gameWinningGoals: { type: Number, default: 0 },
  
  // Defensive Stats
  goalsAgainst: { type: Number, default: 0 },
  avgGoalsAgainst: { type: Number, default: 0 },
  shotsAgainst: { type: Number, default: 0 },
  avgShotsAgainst: { type: Number, default: 0 },
  shootoutSaves: { type: Number, default: 0 },
  shootoutShotsAgainst: { type: Number, default: 0 },
  shootoutSavePct: { type: Number, default: 0 },
  emptyNetGoalsAgainst: { type: Number, default: 0 },
  shutouts: { type: Number, default: 0 },
  saves: { type: Number, default: 0 },
  savePct: { type: Number, default: 0 },
  overtimeLosses: { type: Number, default: 0 },
  blockedShots: { type: Number, default: 0 },
  hits: { type: Number, default: 0 },
  evenStrengthSaves: { type: Number, default: 0 },
  powerPlaySaves: { type: Number, default: 0 },
  shortHandedSaves: { type: Number, default: 0 },
  
  // Penalties
  penaltyMinutes: { type: Number, default: 0 },
  majorPenalties: { type: Number, default: 0 },
  minorPenalties: { type: Number, default: 0 },
  matchPenalties: { type: Number, default: 0 },
  misconducts: { type: Number, default: 0 },
  gameMisconducts: { type: Number, default: 0 },
  boardingPenalties: { type: Number, default: 0 },
  unsportsmanlikePenalties: { type: Number, default: 0 },
  fightingPenalties: { type: Number, default: 0 },
  avgFights: { type: Number, default: 0 },
  timeBetweenFights: { type: Number, default: 0 },
  instigatorPenalties: { type: Number, default: 0 },
  chargingPenalties: { type: Number, default: 0 },
  hookingPenalties: { type: Number, default: 0 },
  trippingPenalties: { type: Number, default: 0 },
  roughingPenalties: { type: Number, default: 0 },
  holdingPenalties: { type: Number, default: 0 },
  interferencePenalties: { type: Number, default: 0 },
  slashingPenalties: { type: Number, default: 0 },
  highStickingPenalties: { type: Number, default: 0 },
  crossCheckingPenalties: { type: Number, default: 0 },
  stickHoldingPenalties: { type: Number, default: 0 },
  goalieInterferencePenalties: { type: Number, default: 0 },
  elbowingPenalties: { type: Number, default: 0 },
  divingPenalties: { type: Number, default: 0 },
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