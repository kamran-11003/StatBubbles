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
  
  // 🏈 TEAM STATS - Comprehensive mapping from API response
  
  // Scoring
  totalPointsPerGame: { type: Number, default: 0 },
  totalPoints: { type: Number, default: 0 },
  totalTouchdowns: { type: Number, default: 0 },
  returnTouchdowns: { type: Number, default: 0 },
  
  // 1st Downs
  totalFirstDowns: { type: Number, default: 0 },
  rushingFirstDowns: { type: Number, default: 0 },
  passingFirstDowns: { type: Number, default: 0 },
  firstDownsByPenalty: { type: Number, default: 0 },
  
  // Down Efficiency
  thirdDownConversions: { type: Number, default: 0 },
  thirdDownAttempts: { type: Number, default: 0 },
  thirdDownConversionPct: { type: Number, default: 0 },
  fourthDownConversions: { type: Number, default: 0 },
  fourthDownAttempts: { type: Number, default: 0 },
  fourthDownConversionPct: { type: Number, default: 0 },
  
  // Passing
  completions: { type: Number, default: 0 },
  passAttempts: { type: Number, default: 0 },
  completionPct: { type: Number, default: 0 },
  netPassingYards: { type: Number, default: 0 },
  yardsPerPassAttempt: { type: Number, default: 0 },
  netPassingYardsPerGame: { type: Number, default: 0 },
  passingTouchdowns: { type: Number, default: 0 },
  interceptions: { type: Number, default: 0 },
  sacks: { type: Number, default: 0 },
  sackYardsLost: { type: Number, default: 0 },
  
  // Rushing
  rushingAttempts: { type: Number, default: 0 },
  rushingYards: { type: Number, default: 0 },
  yardsPerRushAttempt: { type: Number, default: 0 },
  rushingYardsPerGame: { type: Number, default: 0 },
  rushingTouchdowns: { type: Number, default: 0 },
  
  // Offense Totals
  totalOffensivePlays: { type: Number, default: 0 },
  totalYards: { type: Number, default: 0 },
  yardsPerGame: { type: Number, default: 0 },
  yardsPerPlay: { type: Number, default: 0 },
  
  // Returns
  kickReturns: { type: Number, default: 0 },
  kickReturnYards: { type: Number, default: 0 },
  avgKickoffReturnYards: { type: Number, default: 0 },
  puntReturns: { type: Number, default: 0 },
  puntReturnYards: { type: Number, default: 0 },
  avgPuntReturnYards: { type: Number, default: 0 },
  defensiveInterceptions: { type: Number, default: 0 },
  interceptionYards: { type: Number, default: 0 },
  avgInterceptionYards: { type: Number, default: 0 },
  
  // Kicking
  fieldGoalsMade: { type: Number, default: 0 },
  fieldGoalAttempts: { type: Number, default: 0 },
  fieldGoalPct: { type: Number, default: 0 },
  longFieldGoalMade: { type: Number, default: 0 },
  extraPointsMade: { type: Number, default: 0 },
  extraPointAttempts: { type: Number, default: 0 },
  extraPointPct: { type: Number, default: 0 },
  totalKickingPoints: { type: Number, default: 0 },
  
  // Punting
  punts: { type: Number, default: 0 },
  puntYards: { type: Number, default: 0 },
  grossAvgPuntYards: { type: Number, default: 0 },
  netAvgPuntYards: { type: Number, default: 0 },
  puntsInside20: { type: Number, default: 0 },
  puntsBlocked: { type: Number, default: 0 },
  
  // Touchbacks
  touchbacks: { type: Number, default: 0 },
  touchbackPct: { type: Number, default: 0 },
  
  // Penalties
  totalPenalties: { type: Number, default: 0 },
  totalPenaltyYards: { type: Number, default: 0 },
  penaltiesPerGame: { type: Number, default: 0 },
  
  // Time of Possession
  possessionTimeSeconds: { type: Number, default: 0 },
  
  // Miscellaneous
  fumbles: { type: Number, default: 0 },
  fumblesLost: { type: Number, default: 0 },
  fumblesForced: { type: Number, default: 0 },
  fumblesRecovered: { type: Number, default: 0 },
  turnoverDifferential: { type: Number, default: 0 },
  totalGiveaways: { type: Number, default: 0 },
  totalTakeaways: { type: Number, default: 0 },
  kicksBlocked: { type: Number, default: 0 },
  
  // Red Zone
  redzoneEfficiencyPct: { type: Number, default: 0 },
  redzoneTouchdownPct: { type: Number, default: 0 },
  redzoneFieldGoalPct: { type: Number, default: 0 },
  redzoneScoringPct: { type: Number, default: 0 },
  
  // Games Played
  gamesPlayed: { type: Number, default: 0 },
  
  // OPPONENT STATISTICS - What opponents have done against this team
  
  // Opponent Scoring
  opponentPointsPerGame: { type: Number, default: 0 },
  opponentTotalPoints: { type: Number, default: 0 },
  opponentTotalTouchdowns: { type: Number, default: 0 },
  
  // Opponent 1st Downs
  opponentTotalFirstDowns: { type: Number, default: 0 },
  opponentRushingFirstDowns: { type: Number, default: 0 },
  opponentPassingFirstDowns: { type: Number, default: 0 },
  opponentFirstDownsByPenalty: { type: Number, default: 0 },
  
  // Opponent Down Efficiency
  opponentThirdDownConversions: { type: Number, default: 0 },
  opponentThirdDownAttempts: { type: Number, default: 0 },
  opponentThirdDownConversionPct: { type: Number, default: 0 },
  opponentFourthDownConversions: { type: Number, default: 0 },
  opponentFourthDownAttempts: { type: Number, default: 0 },
  opponentFourthDownConversionPct: { type: Number, default: 0 },
  
  // Opponent Passing
  opponentCompletions: { type: Number, default: 0 },
  opponentPassAttempts: { type: Number, default: 0 },
  opponentCompletionPct: { type: Number, default: 0 },
  opponentNetPassingYards: { type: Number, default: 0 },
  opponentYardsPerPassAttempt: { type: Number, default: 0 },
  opponentNetPassingYardsPerGame: { type: Number, default: 0 },
  opponentPassingTouchdowns: { type: Number, default: 0 },
  opponentInterceptions: { type: Number, default: 0 },
  opponentSacks: { type: Number, default: 0 },
  opponentSackYardsLost: { type: Number, default: 0 },
  
  // Opponent Rushing
  opponentRushingAttempts: { type: Number, default: 0 },
  opponentRushingYards: { type: Number, default: 0 },
  opponentYardsPerRushAttempt: { type: Number, default: 0 },
  opponentRushingYardsPerGame: { type: Number, default: 0 },
  opponentRushingTouchdowns: { type: Number, default: 0 },
  
  // Opponent Offense Totals
  opponentTotalOffensivePlays: { type: Number, default: 0 },
  opponentTotalYards: { type: Number, default: 0 },
  opponentYardsPerGame: { type: Number, default: 0 },
  
  // Opponent Returns
  opponentKickReturns: { type: Number, default: 0 },
  opponentKickReturnYards: { type: Number, default: 0 },
  opponentAvgKickoffReturnYards: { type: Number, default: 0 },
  opponentPuntReturns: { type: Number, default: 0 },
  opponentPuntReturnYards: { type: Number, default: 0 },
  opponentAvgPuntReturnYards: { type: Number, default: 0 },
  opponentDefensiveInterceptions: { type: Number, default: 0 },
  opponentInterceptionYards: { type: Number, default: 0 },
  opponentAvgInterceptionYards: { type: Number, default: 0 },
  
  // Opponent Kicking
  opponentFieldGoalsMade: { type: Number, default: 0 },
  opponentFieldGoalAttempts: { type: Number, default: 0 },
  opponentFieldGoalPct: { type: Number, default: 0 },
  opponentLongFieldGoalMade: { type: Number, default: 0 },
  opponentExtraPointsMade: { type: Number, default: 0 },
  opponentExtraPointAttempts: { type: Number, default: 0 },
  opponentExtraPointPct: { type: Number, default: 0 },
  opponentTotalKickingPoints: { type: Number, default: 0 },
  
  // Opponent Punting
  opponentPunts: { type: Number, default: 0 },
  opponentPuntYards: { type: Number, default: 0 },
  opponentGrossAvgPuntYards: { type: Number, default: 0 },
  opponentNetAvgPuntYards: { type: Number, default: 0 },
  opponentPuntsInside20: { type: Number, default: 0 },
  opponentPuntsBlocked: { type: Number, default: 0 },
  
  // Opponent Touchbacks
  opponentTouchbacks: { type: Number, default: 0 },
  opponentTouchbackPct: { type: Number, default: 0 },
  
  // Opponent Penalties
  opponentTotalPenalties: { type: Number, default: 0 },
  opponentTotalPenaltyYards: { type: Number, default: 0 },
  
  // Opponent Time of Possession
  opponentPossessionTimeSeconds: { type: Number, default: 0 },
  
  // Opponent Miscellaneous
  opponentFumbles: { type: Number, default: 0 },
  opponentFumblesLost: { type: Number, default: 0 },
  opponentFumblesForced: { type: Number, default: 0 },
  opponentFumblesRecovered: { type: Number, default: 0 },
  opponentTurnoverDifferential: { type: Number, default: 0 },
  
  // Opponent Red Zone
  opponentRedzoneEfficiencyPct: { type: Number, default: 0 },
  opponentRedzoneTouchdownPct: { type: Number, default: 0 },
  opponentRedzoneFieldGoalPct: { type: Number, default: 0 },
  opponentRedzoneScoringPct: { type: Number, default: 0 },
  
  // Derived defensive aliases (for convenience in UI)
  pointsAllowed: { type: Number, default: 0 },
  totalYardsAllowed: { type: Number, default: 0 },
  passingYardsAllowed: { type: Number, default: 0 },
  rushingYardsAllowed: { type: Number, default: 0 },
  redZoneAllowedPct: { type: Number, default: 0 },
  thirdDownAllowedPct: { type: Number, default: 0 },
  fourthDownAllowedPct: { type: Number, default: 0 },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  standingsUpdatedAt: { type: Date },
  statsUpdatedAt: { type: Date }
});

// Index for displayName
teamSchema.index({ displayName: 1 });

module.exports = mongoose.model('NFLTeam', teamSchema);