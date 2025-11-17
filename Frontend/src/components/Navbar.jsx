import React, { useState, useEffect, useMemo } from 'react';
import { Search, Moon, Sun, Database, ChevronDown, Users, Menu, X } from 'lucide-react';
import LiveView from './LiveView';
import ComingSoonModal from './ComingSoonModal';

const Navbar = ({ 
  selectedStat,
  onStatSelect, 
  isDark, 
  toggleTheme, 
  onLogoClick, 
  selectedLeague,
  onLeagueSelect,
  playerCount,
  onPlayerCountSelect,
  searchQuery,
  onSearchQueryChange,
  liveGames,
  viewMode,
  onViewModeChange,
  navContext
}) => {
  const [statsDropdownOpen, setStatsDropdownOpen] = useState(false);
  const [playerCountDropdownOpen, setPlayerCountDropdownOpen] = useState(false);
  const [showLiveInNav, setShowLiveInNav] = useState(false);
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [comingSoonLeague, setComingSoonLeague] = useState('');

  const leagues = [
    { name: 'NBA' },
    { name: 'WNBA' },
    { name: 'NFL' },
    { name: 'MLB' },
    { name: 'NHL' }
  ];
  
  const playerCounts = [
    { label: 'Top 10', value: '10' },
    { label: 'Top 50', value: '50' }
  ];

  const leagueStats = {
    NBA: [
      { label: 'Avg Points', key: 'avgPoints' },
      { label: 'Points', key: 'points' },
      { label: 'Rebounds', key: 'rebounds' },
      { label: 'Avg Rebounds', key: 'avgRebounds' },
      { label: 'Offensive Rebounds', key: 'offensiveRebounds' },
      { label: 'Defensive Rebounds', key: 'defensiveRebounds' },
      { label: 'Assists', key: 'assists' },
      { label: 'Avg Assists', key: 'avgAssists' },
      { label: 'Blocks', key: 'blocks' },
      { label: 'Avg Blocks', key: 'avgBlocks' },
      { label: 'Steals', key: 'steals' },
      { label: 'Avg Steals', key: 'avgSteals' },
      { label: 'Turnovers', key: 'turnovers' },
      { label: 'Avg Turnovers', key: 'avgTurnovers' },
      { label: 'Fouls', key: 'fouls' },
      { label: 'Avg Fouls', key: 'avgFouls' },
      { label: 'Field Goals Made', key: 'fieldGoalsMade' },
      { label: 'Field Goals Attempted', key: 'fieldGoalsAttempted' },
      { label: 'Field Goal %', key: 'fieldGoalPct' },
      { label: '3PT Made', key: 'threePointFieldGoalsMade' },
      { label: '3PT Attempted', key: 'threePointFieldGoalsAttempted' },
      { label: '3PT %', key: 'threePointFieldGoalPct' },
      { label: 'Free Throws Made', key: 'freeThrowsMade' },
      { label: 'Free Throws Attempted', key: 'freeThrowsAttempted' },
      { label: 'Free Throw %', key: 'freeThrowPct' },
      { label: 'Minutes', key: 'minutes' },
      { label: 'Avg Minutes', key: 'avgMinutes' },
      { label: 'Games Played', key: 'gamesPlayed' },
      { label: 'Games Started', key: 'gamesStarted' },
      { label: 'Double Doubles', key: 'doubleDouble' },
      { label: 'Triple Doubles', key: 'tripleDouble' }
    ],
    NHL: [
      // General Stats
      { label: 'Games', key: 'games', category: 'General' },
      { label: 'Games Started', key: 'gameStarted', category: 'General' },
      { label: 'Team Games Played', key: 'teamGamesPlayed', category: 'General' },
      { label: 'Time On Ice', key: 'timeOnIce', category: 'General' },
      { label: 'Time On Ice/Game', key: 'timeOnIcePerGame', category: 'General' },
      { label: 'Shifts', key: 'shifts', category: 'General' },
      { label: 'Shifts/Game', key: 'shiftsPerGame', category: 'General' },
      { label: 'Production', key: 'production', category: 'General' },
      { label: '+/-', key: 'plusMinus', category: 'General' },
      // Offensive Stats
      { label: 'Goals', key: 'goals', category: 'Offensive' },
      { label: 'Avg Goals', key: 'avgGoals', category: 'Offensive' },
      { label: 'Assists', key: 'assists', category: 'Offensive' },
      { label: 'Points', key: 'points', category: 'Offensive' },
      { label: 'Points/Game', key: 'pointsPerGame', category: 'Offensive' },
      { label: 'Shots', key: 'shotsTotal', category: 'Offensive' },
      { label: 'Avg Shots', key: 'avgShots', category: 'Offensive' },
      { label: 'Shooting %', key: 'shootingPct', category: 'Offensive' },
      { label: 'Power Play Goals', key: 'powerPlayGoals', category: 'Offensive' },
      { label: 'Power Play Assists', key: 'powerPlayAssists', category: 'Offensive' },
      { label: 'Short Handed Goals', key: 'shortHandedGoals', category: 'Offensive' },
      { label: 'Short Handed Assists', key: 'shortHandedAssists', category: 'Offensive' },
      { label: 'Game Winning Goals', key: 'gameWinningGoals', category: 'Offensive' },
      { label: 'Game Tying Goals', key: 'gameTyingGoals', category: 'Offensive' },
      { label: 'Total Faceoffs', key: 'totalFaceOffs', category: 'Offensive' },
      { label: 'Faceoffs Won', key: 'faceoffsWon', category: 'Offensive' },
      { label: 'Faceoffs Lost', key: 'faceoffsLost', category: 'Offensive' },
      { label: 'Faceoff %', key: 'faceoffPercent', category: 'Offensive' },
      { label: 'Shootout Attempts', key: 'shootoutAttempts', category: 'Offensive' },
      { label: 'Shootout Goals', key: 'shootoutGoals', category: 'Offensive' },
      { label: 'Shootout Shot %', key: 'shootoutShotPct', category: 'Offensive' },
      // Defensive/Goalie Stats
      { label: 'Wins', key: 'wins', category: 'Goalie' },
      { label: 'Losses', key: 'losses', category: 'Goalie' },
      { label: 'Ties', key: 'ties', category: 'Goalie' },
      { label: 'Goals Against', key: 'goalsAgainst', category: 'Goalie' },
      { label: 'Goals Against Avg', key: 'avgGoalsAgainst', category: 'Goalie' },
      { label: 'Saves', key: 'saves', category: 'Goalie' },
      { label: 'Save %', key: 'savePct', category: 'Goalie' },
      { label: 'Shots Against', key: 'shotsAgainst', category: 'Goalie' },
      { label: 'Avg Shots Against', key: 'avgShotsAgainst', category: 'Goalie' },
      { label: 'Shutouts', key: 'shutouts', category: 'Goalie' },
      { label: 'Overtime Losses', key: 'overtimeLosses', category: 'Goalie' },
      { label: 'Blocked Shots', key: 'blockedShots', category: 'Defensive' },
      { label: 'Hits', key: 'hits', category: 'Defensive' },
      { label: 'Shootout Saves', key: 'shootoutSaves', category: 'Goalie' },
      { label: 'Shootout Shots Against', key: 'shootoutShotsAgainst', category: 'Goalie' },
      { label: 'Shootout Save %', key: 'shootoutSavePct', category: 'Goalie' },
      { label: 'Empty Net Goals Against', key: 'emptyNetGoalsAgainst', category: 'Goalie' },
      { label: 'Even Strength Saves', key: 'evenStrengthSaves', category: 'Goalie' },
      { label: 'Power Play Saves', key: 'powerPlaySaves', category: 'Goalie' },
      { label: 'Short Handed Saves', key: 'shortHandedSaves', category: 'Goalie' },
      // Penalties
      { label: 'Penalty Minutes', key: 'penaltyMinutes', category: 'Penalties' },
      { label: 'Major Penalties', key: 'majorPenalties', category: 'Penalties' },
      { label: 'Minor Penalties', key: 'minorPenalties', category: 'Penalties' },
      { label: 'Match Penalties', key: 'matchPenalties', category: 'Penalties' },
      { label: 'Misconducts', key: 'misconducts', category: 'Penalties' },
      { label: 'Game Misconducts', key: 'gameMisconducts', category: 'Penalties' },
      { label: 'Fighting Penalties', key: 'fightingPenalties', category: 'Penalties' },
      { label: 'Avg Fights', key: 'avgFights', category: 'Penalties' },
      { label: 'Boarding Penalties', key: 'boardingPenalties', category: 'Penalties' },
      { label: 'Charging Penalties', key: 'chargingPenalties', category: 'Penalties' },
      { label: 'Hooking Penalties', key: 'hookingPenalties', category: 'Penalties' },
      { label: 'Tripping Penalties', key: 'trippingPenalties', category: 'Penalties' },
      { label: 'Slashing Penalties', key: 'slashingPenalties', category: 'Penalties' },
      { label: 'High Sticking Penalties', key: 'highStickingPenalties', category: 'Penalties' },
      { label: 'Cross Checking Penalties', key: 'crossCheckingPenalties', category: 'Penalties' },
      { label: 'Holding Penalties', key: 'holdingPenalties', category: 'Penalties' },
      { label: 'Interference Penalties', key: 'interferencePenalties', category: 'Penalties' },
      { label: 'Roughing Penalties', key: 'roughingPenalties', category: 'Penalties' },
      { label: 'Unsportsmanlike Penalties', key: 'unsportsmanlikePenalties', category: 'Penalties' },
      { label: 'Instigator Penalties', key: 'instigatorPenalties', category: 'Penalties' },
      { label: 'Stick Holding Penalties', key: 'stickHoldingPenalties', category: 'Penalties' },
      { label: 'Goalie Interference Penalties', key: 'goalieInterferencePenalties', category: 'Penalties' },
      { label: 'Elbowing Penalties', key: 'elbowingPenalties', category: 'Penalties' },
      { label: 'Diving Penalties', key: 'divingPenalties', category: 'Penalties' }
    ],
    MLB: [
      // Batting stats
      { label: 'Games Played', key: 'batting_gamesPlayed', category: 'Batting' },
      //{ label: 'Games Started', key: 'batting_gamesStarted', category: 'Batting' },
      { label: 'At Bats', key: 'batting_atBats', category: 'Batting' },
      { label: 'Runs', key: 'batting_runs', category: 'Batting' },
      { label: 'Hits', key: 'batting_hits', category: 'Batting' },
      { label: 'Doubles', key: 'batting_doubles', category: 'Batting' },
      { label: 'Triples', key: 'batting_triples', category: 'Batting' },
      { label: 'Home Runs', key: 'batting_homeRuns', category: 'Batting' },
      { label: 'RBIs', key: 'batting_RBIs', category: 'Batting' },
      { label: 'Stolen Bases', key: 'batting_stolenBases', category: 'Batting' },
      { label: 'Caught Stealing', key: 'batting_caughtStealing', category: 'Batting' },
      { label: 'Walks', key: 'batting_walks', category: 'Batting' },
      { label: 'Strikeouts', key: 'batting_strikeouts', category: 'Batting' },
      { label: 'Batting Average', key: 'batting_avg', category: 'Batting' },
      { label: 'On Base %', key: 'batting_onBasePct', category: 'Batting' },
      { label: 'Slugging', key: 'batting_slugAvg', category: 'Batting' },
      { label: 'OPS', key: 'batting_OPS', category: 'Batting' },
      
      // Fielding stats
      { label: 'Games Played', key: 'fielding_gamesPlayed', category: 'Fielding' },
     // { label: 'Games Started', key: 'fielding_gamesStarted', category: 'Fielding' },
      { label: 'Innings', key: 'fielding_fullInningsPlayed', category: 'Fielding' },
      { label: 'Chances', key: 'fielding_totalChances', category: 'Fielding' },
      { label: 'Put Outs', key: 'fielding_putouts', category: 'Fielding' },
      { label: 'Assists', key: 'fielding_assists', category: 'Fielding' },
      { label: 'Errors', key: 'fielding_errors', category: 'Fielding' },
      //{ label: 'Fielding %', key: 'fielding_fieldingPct', category: 'Fielding' },
      { label: 'Double Plays', key: 'fielding_doublePlays', category: 'Fielding' },
      { label: 'Triple Plays', key: 'fielding_triplePlays', category: 'Fielding' },
      
      // Pitching stats
      { label: 'Games Played', key: 'pitching_gamesPlayed', category: 'Pitching' },
      { label: 'Games Started', key: 'pitching_gamesStarted', category: 'Pitching' },
      { label: 'Complete Games', key: 'pitching_completeGames', category: 'Pitching' },
      { label: 'Shutouts', key: 'pitching_shutouts', category: 'Pitching' },
      { label: 'Innings', key: 'pitching_innings', category: 'Pitching' },
      { label: 'Hits', key: 'pitching_hits', category: 'Pitching' },
      { label: 'Runs', key: 'pitching_runs', category: 'Pitching' },
      { label: 'Earned Runs', key: 'pitching_earnedRuns', category: 'Pitching' },
      { label: 'Home Runs', key: 'pitching_homeRuns', category: 'Pitching' },
      { label: 'Walks', key: 'pitching_walks', category: 'Pitching' },
      { label: 'Strikeouts', key: 'pitching_strikeouts', category: 'Pitching' },
      { label: 'Wins', key: 'pitching_wins', category: 'Pitching' },
      { label: 'Losses', key: 'pitching_losses', category: 'Pitching' },
      { label: 'Saves', key: 'pitching_saves', category: 'Pitching' },
      { label: 'Holds', key: 'pitching_holds', category: 'Pitching' },
      { label: 'Blown Saves', key: 'pitching_blownSaves', category: 'Pitching' },
      { label: 'ERA', key: 'pitching_ERA', category: 'Pitching' },
      { label: 'WHIP', key: 'pitching_WHIP', category: 'Pitching' }
    ],
    NFL: [
      // General Stats
      { label: 'Games Played (GP)', key: 'gamesPlayed', category: 'General' },
      { label: 'Fumbles (FUM)', key: 'fumbles', category: 'General' },
      { label: 'Fumbles Lost (LST)', key: 'fumblesLost', category: 'General' },
      { label: 'Fumble TDs (TD)', key: 'fumblesTouchdowns', category: 'General' },
      { label: 'Offensive 2PT Returns', key: 'offensiveTwoPtReturns', category: 'General' },
      { label: 'Offensive Fumble TDs', key: 'offensiveFumblesTouchdowns', category: 'General' },
      { label: 'Defensive Fumble TDs', key: 'defensiveFumblesTouchdowns', category: 'General' },
      
      // Passing (QB)
      { label: 'Completions (CMP)', key: 'passCompletions', category: 'Passing' },
      { label: 'Attempts (ATT)', key: 'passAttempts', category: 'Passing' },
      { label: 'Completion % (PCT)', key: 'completionPercentage', category: 'Passing' },
      { label: 'Passing Yards (YDS)', key: 'passYards', category: 'Passing' },
      { label: 'Yards per Attempt (YPA)', key: 'yardsPerPassAttempt', category: 'Passing' },
      { label: 'Touchdowns (TD)', key: 'passTouchdowns', category: 'Passing' },
      { label: 'Interceptions (INT)', key: 'interceptions', category: 'Passing' },
      { label: 'Longest Pass (LNG)', key: 'longestPass', category: 'Passing' },
      { label: 'Sacks Taken (SK)', key: 'sacksTaken', category: 'Passing' },
      { label: 'Sack Yards (SYD)', key: 'sackYards', category: 'Passing' },
      { label: 'Passer Rating (RATE)', key: 'passerRating', category: 'Passing' },
      { label: 'QBR', key: 'qbr', category: 'Passing' },
      { label: 'ESPN QBR', key: 'espnQBRating', category: 'Passing' },
      { label: 'Interception %', key: 'interceptionPct', category: 'Passing' },
      { label: 'Net Passing Yards', key: 'netPassingYards', category: 'Passing' },
      { label: 'Net Yards per Game', key: 'netPassingYardsPerGame', category: 'Passing' },
      { label: 'Net Total Yards', key: 'netTotalYards', category: 'Passing' },
      { label: 'Net Yards per Game', key: 'netYardsPerGame', category: 'Passing' },
      { label: 'Big Plays', key: 'passingBigPlays', category: 'Passing' },
      { label: 'First Downs', key: 'passingFirstDowns', category: 'Passing' },
      { label: 'Passing Fumbles', key: 'passingFumbles', category: 'Passing' },
      { label: 'Passing Fumbles Lost', key: 'passingFumblesLost', category: 'Passing' },
      { label: 'Touchdown %', key: 'passingTouchdownPct', category: 'Passing' },
      { label: 'Yards After Catch', key: 'passingYardsAfterCatch', category: 'Passing' },
      { label: 'Yards at Catch', key: 'passingYardsAtCatch', category: 'Passing' },
      { label: 'Yards per Game', key: 'passingYardsPerGame', category: 'Passing' },
      { label: 'Net Attempts', key: 'netPassingAttempts', category: 'Passing' },
      { label: 'Team Games', key: 'teamGamesPlayed', category: 'Passing' },
      { label: 'Total Offensive Plays', key: 'totalOffensivePlays', category: 'Passing' },
      { label: 'Points per Game', key: 'totalPointsPerGame', category: 'Passing' },
      { label: 'Total Yards', key: 'totalYards', category: 'Passing' },
      { label: 'Yards from Scrimmage', key: 'totalYardsFromScrimmage', category: 'Passing' },
      { label: '2PT Conversions', key: 'twoPointPassConvs', category: 'Passing' },
      { label: '2PT Passes', key: 'twoPtPass', category: 'Passing' },
      { label: '2PT Pass Attempts', key: 'twoPtPassAttempts', category: 'Passing' },
      { label: 'Yards from Scrimmage/G', key: 'yardsFromScrimmagePerGame', category: 'Passing' },
      { label: 'Yards per Completion', key: 'yardsPerCompletion', category: 'Passing' },
      { label: 'Yards per Game', key: 'yardsPerGame', category: 'Passing' },
      { label: 'Net Yards per Attempt', key: 'netYardsPerPassAttempt', category: 'Passing' },
      { label: 'Adjusted QBR', key: 'adjQBR', category: 'Passing' },
      { label: 'Quarterback Rating', key: 'quarterbackRating', category: 'Passing' },
      
      // Rushing (RB/QB/WR)
      { label: 'Attempts (ATT)', key: 'rushingAttempts', category: 'Rushing' },
      { label: 'Yards (YDS)', key: 'rushingYards', category: 'Rushing' },
      { label: 'Yards per Carry (AVG)', key: 'yardsPerRushAttempt', category: 'Rushing' },
      { label: 'Longest Run (LNG)', key: 'longestRush', category: 'Rushing' },
      { label: 'Touchdowns (TD)', key: 'rushTouchdowns', category: 'Rushing' },
      { label: 'Fumbles (FUM)', key: 'rushingFumbles', category: 'Rushing' },
      { label: 'Lost (LST)', key: 'rushingFumblesLost', category: 'Rushing' },
      { label: 'ESPN RB Rating', key: 'espnRBRating', category: 'Rushing' },
      { label: 'Big Plays', key: 'rushingBigPlays', category: 'Rushing' },
      { label: 'First Downs', key: 'rushingFirstDowns', category: 'Rushing' },
      { label: 'Yards per Game', key: 'rushingYardsPerGame', category: 'Rushing' },
      { label: '2PT Rush Conversions', key: 'twoPointRushConvs', category: 'Rushing' },
      { label: '2PT Rushes', key: 'twoPtRush', category: 'Rushing' },
      { label: '2PT Rush Attempts', key: 'twoPtRushAttempts', category: 'Rushing' },

      // Receiving (WR/TE/RB)
      { label: 'Targets (TGT)', key: 'receivingTargets', category: 'Receiving' },
      { label: 'Receptions (REC)', key: 'receptions', category: 'Receiving' },
      { label: 'Catch % (CATCH%)', key: 'catchPercentage', category: 'Receiving' },
      { label: 'Yards (YDS)', key: 'receivingYards', category: 'Receiving' },
      { label: 'Avg per Reception (AVG)', key: 'yardsPerReception', category: 'Receiving' },
      { label: 'Yards per Game (YPG)', key: 'receivingYardsPerGame', category: 'Receiving' },
      { label: 'Longest Reception (LNG)', key: 'longestReception', category: 'Receiving' },
      { label: 'Touchdowns (TD)', key: 'receivingTouchdowns', category: 'Receiving' },
      { label: 'Fumbles (FUM)', key: 'receivingFumbles', category: 'Receiving' },
      { label: 'Lost (LST)', key: 'receivingFumblesLost', category: 'Receiving' },
      { label: 'ESPN WR Rating', key: 'espnWRRating', category: 'Receiving' },
      { label: 'Big Plays', key: 'receivingBigPlays', category: 'Receiving' },
      { label: 'First Downs', key: 'receivingFirstDowns', category: 'Receiving' },
      { label: 'Yards After Catch', key: 'receivingYardsAfterCatch', category: 'Receiving' },
      { label: 'Yards at Catch', key: 'receivingYardsAtCatch', category: 'Receiving' },
      { label: '2PT Reception Conversions', key: 'twoPointRecConvs', category: 'Receiving' },
      { label: '2PT Receptions', key: 'twoPtReception', category: 'Receiving' },
      { label: '2PT Reception Attempts', key: 'twoPtReceptionAttempts', category: 'Receiving' },

      // Defense (Individual)
      { label: 'Total Tackles (TOT)', key: 'totalTackles', category: 'Defense' },
      { label: 'Solo (SOLO)', key: 'soloTackles', category: 'Defense' },
      { label: 'Assisted (AST)', key: 'assistedTackles', category: 'Defense' },
      { label: 'Sacks (SACK)', key: 'sacks', category: 'Defense' },
      { label: 'Interceptions (INT)', key: 'defensiveInterceptions', category: 'Defense' },
      { label: 'Passes Defended (PD)', key: 'passesDefended', category: 'Defense' },
      { label: 'Forced Fumbles (FF)', key: 'forcedFumbles', category: 'Defense' },
      { label: 'Fumble Recoveries (FR)', key: 'fumbleRecoveries', category: 'Defense' },
      { label: 'Defensive TDs (TD)', key: 'interceptionTouchdowns', category: 'Defense' },
      { label: 'Safeties (SFTY)', key: 'safeties', category: 'Defense' },
      { label: 'Blocked Kicks (BK)', key: 'kicksBlocked', category: 'Defense' },
      { label: 'Fumble Recovery Yards', key: 'fumbleRecoveryYards', category: 'Defense' },
      { label: 'Interception Yards', key: 'interceptionYards', category: 'Defense' },
      { label: 'Avg Interception Yards', key: 'avgInterceptionYards', category: 'Defense' },
      { label: 'Longest Interception', key: 'longestInterception', category: 'Defense' },
      { label: 'Stuffs', key: 'stuffs', category: 'Defense' },
      { label: 'Stuff Yards', key: 'stuffYards', category: 'Defense' },

      // Scoring Stats
      { label: 'Passing TDs', key: 'passingTouchdowns', category: 'Scoring' },
      { label: 'Rushing TDs', key: 'rushingTouchdowns', category: 'Scoring' },
      { label: 'Receiving TDs', key: 'receivingTouchdowns', category: 'Scoring' },
      { label: 'Return TDs', key: 'returnTouchdowns', category: 'Scoring' },
      { label: 'Total TDs', key: 'totalTouchdowns', category: 'Scoring' },
      { label: 'Two Point Conversions', key: 'totalTwoPointConvs', category: 'Scoring' },
      { label: 'Kick Extra Points', key: 'kickExtraPoints', category: 'Scoring' },
      { label: 'Field Goals', key: 'fieldGoals', category: 'Scoring' },
      { label: 'Total Points', key: 'totalPoints', category: 'Scoring' },
      { label: 'Defensive Points', key: 'defensivePoints', category: 'Scoring' },
      { label: 'Kick Extra Points Made', key: 'kickExtraPointsMade', category: 'Scoring' },
      { label: 'Misc Points', key: 'miscPoints', category: 'Scoring' },
      { label: '2PT Pass Conversions', key: 'twoPointPassConvs', category: 'Scoring' },
      { label: '2PT Rec Conversions', key: 'twoPointRecConvs', category: 'Scoring' },
      { label: '2PT Rush Conversions', key: 'twoPointRushConvs', category: 'Scoring' },
      { label: '1PT Safeties Made', key: 'onePtSafetiesMade', category: 'Scoring' },

      // Special Teams - Kicking
      { label: 'Field Goals Made (FGM)', key: 'fieldGoalsMade', category: 'Kicking' },
      { label: 'Field Goals Attempted (FGA)', key: 'fieldGoalAttempts', category: 'Kicking' },
      { label: 'FG % (FG%)', key: 'fieldGoalPercentage', category: 'Kicking' },
      { label: 'Longest FG (LNG)', key: 'longFieldGoalMade', category: 'Kicking' },
      { label: 'Extra Points Made (XPM)', key: 'extraPointsMade', category: 'Kicking' },
      { label: 'Extra Points Attempted (XPA)', key: 'extraPointAttempts', category: 'Kicking' },
      { label: 'Extra Point % (XP%)', key: 'extraPointPercentage', category: 'Kicking' },
      { label: 'Points (PTS)', key: 'totalKickingPoints', category: 'Kicking' },
      { label: 'FG Made 1-19', key: 'fieldGoalsMade1_19', category: 'Kicking' },
      { label: 'FG Made 20-29', key: 'fieldGoalsMade20_29', category: 'Kicking' },
      { label: 'FG Made 30-39', key: 'fieldGoalsMade30_39', category: 'Kicking' },
      { label: 'FG Made 40-49', key: 'fieldGoalsMade40_49', category: 'Kicking' },
      { label: 'FG Made 50+', key: 'fieldGoalsMade50', category: 'Kicking' },

      // Special Teams - Punting
      { label: 'Punts (PUNTS)', key: 'punts', category: 'Punting' },
      { label: 'Yards (YDS)', key: 'puntYards', category: 'Punting' },
      { label: 'Avg (AVG)', key: 'grossAvgPuntYards', category: 'Punting' },
      { label: 'Net Avg (NET)', key: 'netAvgPuntYards', category: 'Punting' },
      { label: 'Inside 20 (IN20)', key: 'puntsInside20', category: 'Punting' },
      { label: 'Touchbacks (TB)', key: 'puntTouchbacks', category: 'Punting' },
      { label: 'Longest Punt (LNG)', key: 'longestPunt', category: 'Punting' },
      { label: 'Blocked Punts (BP)', key: 'blockedPunts', category: 'Punting' },

      // Special Teams - Returns
      { label: 'Kick Returns: Attempts (ATT)', key: 'kickReturnAttempts', category: 'Returns' },
      { label: 'Kick Returns: Yards (YDS)', key: 'kickReturnYards', category: 'Returns' },
      { label: 'Kick Returns: Avg (AVG)', key: 'kickReturnAverage', category: 'Returns' },
      { label: 'Kick Returns: TDs', key: 'kickReturnTouchdowns', category: 'Returns' },
      { label: 'Kick Returns: Longest (LNG)', key: 'longestKickReturn', category: 'Returns' },
      { label: 'Punt Returns: Attempts (ATT)', key: 'puntReturnAttempts', category: 'Returns' },
      { label: 'Punt Returns: Yards (YDS)', key: 'puntReturnYards', category: 'Returns' },
      { label: 'Punt Returns: Avg (AVG)', key: 'puntReturnAverage', category: 'Returns' },
      { label: 'Punt Returns: TDs', key: 'puntReturnTouchdowns', category: 'Returns' },
      { label: 'Punt Returns: Longest (LNG)', key: 'longestPuntReturn', category: 'Returns' },
      { label: 'Kick Returns: Fair Catches', key: 'kickReturnFairCatches', category: 'Returns' },
      { label: 'Punt Returns: Fair Catches', key: 'puntReturnFairCatches', category: 'Returns' }
    ],
    WNBA: [
      { label: 'Avg Points', key: 'avgPoints' },
      { label: 'Points', key: 'points' },
      { label: 'Avg Rebounds', key: 'avgRebounds' },
      { label: 'Rebounds', key: 'rebounds' },
      { label: 'Offensive Rebounds', key: 'offensiveRebounds' },
      { label: 'Defensive Rebounds', key: 'defensiveRebounds' },
      { label: 'Avg Assists', key: 'avgAssists' },
      { label: 'Assists', key: 'assists' },
      { label: 'Avg Blocks', key: 'avgBlocks' },
      { label: 'Blocks', key: 'blocks' },
      { label: 'Avg Steals', key: 'avgSteals' },
      { label: 'Steals', key: 'steals' },
      { label: 'Avg Turnovers', key: 'avgTurnovers' },
      { label: 'Turnovers', key: 'turnovers' },
      { label: 'Avg Fouls', key: 'avgFouls' },
      { label: 'Fouls', key: 'fouls' },
      { label: 'Field Goals Attempted', key: 'fieldGoalsAttempted' },
      { label: 'Field Goals Made', key: 'fieldGoalsMade' },
      { label: 'Field Goal %', key: 'fieldGoalPct' },
      { label: '3PT Attempted', key: 'threePointFieldGoalsAttempted' },
      { label: '3PT Made', key: 'threePointFieldGoalsMade' },
      { label: '3PT %', key: 'threePointFieldGoalPct' },
      { label: 'Free Throws Attempted', key: 'freeThrowsAttempted' },
      { label: 'Free Throws Made', key: 'freeThrowsMade' },
      { label: 'Free Throw %', key: 'freeThrowPct' },
      { label: 'Minutes', key: 'minutes' },
      { label: 'Avg Minutes', key: 'avgMinutes' },
      { label: 'Games Played', key: 'gamesPlayed' },
      { label: 'Games Started', key: 'gamesStarted' },
      { label: 'Double Doubles', key: 'doubleDouble' },
      { label: 'Triple Doubles', key: 'tripleDouble' }
    ]
  };

  // Add team stats for NBA
  const nbaTeamStats = [
    { label: 'Wins', key: 'wins' },
    { label: 'Losses', key: 'losses' },
    { label: 'Win %', key: 'winPercentage' },
    { label: 'Games Behind', key: 'gamesBehind' },
    { label: 'Home Record', key: 'homeRecord' },
    { label: 'Away Record', key: 'awayRecord' },
    { label: 'Conference Record', key: 'conferenceRecord' },
    { label: 'Points Per Game', key: 'pointsPerGame' },
    { label: 'Opponent Points Per Game', key: 'opponentPointsPerGame' },
    { label: 'Point Differential', key: 'pointDifferential' },
    { label: 'Streak', key: 'streak' },
    { label: 'Last 10 Games', key: 'lastTenGames' }
  ];

  // Add team stats for WNBA
  const wnbaTeamStats = [
    { label: 'Wins', key: 'wins' },
    { label: 'Losses', key: 'losses' },
    { label: 'Win %', key: 'winPercentage' },
    { label: 'Games Behind', key: 'gamesBehind' },
    { label: 'Home Record', key: 'homeRecord' },
    { label: 'Away Record', key: 'awayRecord' },
    { label: 'Conference Record', key: 'conferenceRecord' },
    { label: 'Points Per Game', key: 'pointsPerGame' },
    { label: 'Opponent Points Per Game', key: 'opponentPointsPerGame' },
    { label: 'Point Differential', key: 'pointDifferential' },
    { label: 'Streak', key: 'streak' },
    { label: 'Last 10 Games', key: 'lastTenGames' }
  ];

  // Add team stats for MLB
  const mlbTeamStats = [
    { label: 'Wins', key: 'wins' },
    { label: 'Losses', key: 'losses' },
    { label: 'Win %', key: 'winpercent' },
    { label: 'Games Behind', key: 'gamesbehind' },
    { label: 'Home Record', key: 'home' },
    { label: 'Road Record', key: 'road' },
    { label: 'Intraleague Record', key: 'vsconf' },
    { label: 'Runs Per Game', key: 'avgpointsfor' },
    { label: 'Runs Allowed Per Game', key: 'avgpointsagainst' },
    { label: 'Run Differential', key: 'differential' },
    { label: 'Streak', key: 'streak' },
    { label: 'Last 10 Games', key: 'lasttengames' }
  ];

  // NFL Team Stats (strict categories and order)
  const nflTeamStats = [
    // Offense
    { label: 'Passing Yards (YDS)', key: 'netPassingYards', category: 'Offense' },
    { label: 'Rushing Yards (YDS)', key: 'rushingYards', category: 'Offense' },
    { label: 'Total Yards (YDS)', key: 'totalYards', category: 'Offense' },
    { label: 'Yards per Play (AVG)', key: 'yardsPerPlay', category: 'Offense' },
    { label: 'Points per Game (PTS/G)', key: 'totalPointsPerGame', category: 'Offense' },
    { label: '1st Downs (1D)', key: 'totalFirstDowns', category: 'Offense' },
    { label: '3rd Down % (3D%)', key: 'thirdDownConversionPct', category: 'Offense' },
    { label: '4th Down % (4D%)', key: 'fourthDownConversionPct', category: 'Offense' },
    { label: 'Red Zone % (RZ%)', key: 'redzoneScoringPct', category: 'Offense' },
    { label: 'Turnovers (TO)', key: 'totalGiveaways', category: 'Offense' },
    { label: 'Time of Possession (TOP)', key: 'possessionTimeSeconds', category: 'Offense' },

    // Defense
    { label: 'Points Allowed (PA)', key: 'pointsAllowed', category: 'Defense' },
    { label: 'Total Yards Allowed (YDSA)', key: 'totalYardsAllowed', category: 'Defense' },
    { label: 'Passing Yards Allowed (PYDSA)', key: 'passingYardsAllowed', category: 'Defense' },
    { label: 'Rushing Yards Allowed (RYDSA)', key: 'rushingYardsAllowed', category: 'Defense' },
    { label: 'Takeaways (TAKE)', key: 'totalTakeaways', category: 'Defense' },
    { label: 'Red Zone % Allowed (RZA)', key: 'redZoneAllowedPct', category: 'Defense' },
    { label: '3rd Down % Allowed (3DA)', key: 'thirdDownAllowedPct', category: 'Defense' },
    { label: '4th Down % Allowed (4DA)', key: 'fourthDownAllowedPct', category: 'Defense' },

    // Special Teams
    { label: 'Field Goal % (FG%)', key: 'fieldGoalPct', category: 'Special Teams' },
    { label: 'Extra Point % (XP%)', key: 'extraPointPct', category: 'Special Teams' },
    { label: 'Punt Avg (PUNT AVG)', key: 'grossAvgPuntYards', category: 'Special Teams' },
    { label: 'Net (NET)', key: 'netAvgPuntYards', category: 'Special Teams' },
    { label: 'Punts Inside 20 (IN20)', key: 'puntsInside20', category: 'Special Teams' },
    { label: 'Kick Return Avg (KR AVG)', key: 'avgKickoffReturnYards', category: 'Special Teams' },
    { label: 'Punt Return Avg (PR AVG)', key: 'avgPuntReturnYards', category: 'Special Teams' },
    { label: 'Special Teams TDs (STTD)', key: 'specialTeamsTDs', category: 'Special Teams' },
    { label: 'Blocked Kicks (BK)', key: 'blockedKicks', category: 'Special Teams' },
    
    // Penalties
    { label: 'Total Penalties (PEN)', key: 'totalPenalties', category: 'Penalties' },
    { label: 'Penalty Yards (PEN YDS)', key: 'totalPenaltyYards', category: 'Penalties' },
    { label: 'Penalties per Game (PEN/G)', key: 'penaltiesPerGame', category: 'Penalties' }
  ];

  // Add team stats for NHL
  const nhlTeamStats = [
    // Core standings
    { label: 'Wins', key: 'wins' },
    { label: 'Losses', key: 'losses' },
    { label: 'Games Played', key: 'gamesplayed' },
    { label: 'Games Behind', key: 'gamesbehind' },
    { label: 'Points For', key: 'pointsfor' },
    { label: 'Points Against', key: 'pointsagainst' },
    { label: 'Point Differential', key: 'pointdifferential' },
    { label: 'Points Diff', key: 'pointsdiff' },
    { label: 'Differential', key: 'differential' },
    { label: 'Home Record', key: 'home' },
    { label: 'Road Record', key: 'road' },
    { label: 'Division Record', key: 'vsdiv' },
    { label: 'Total Record', key: 'total' },
    { label: 'Last 10 Games', key: 'lasttengames' },
    { label: 'Streak', key: 'streak' },
    // Overtime/Shootout standings
    { label: 'OT Losses', key: 'otlosses' },
    { label: 'Overtime Wins', key: 'overtimewins' },
    { label: 'Shootout Losses', key: 'shootoutlosses' },
    { label: 'Shootout Wins', key: 'shootoutwins' },
    // Regulation
    { label: 'Regulation Losses', key: 'reglosses' },
    { label: 'Regulation Wins', key: 'regwins' },
    { label: 'ROT Losses', key: 'rotlosses' },
    { label: 'ROT Wins', key: 'rotwins' },
    // Playoff
    { label: 'Playoff Seed', key: 'playoffseed' },
    // Game Stats
    { label: 'Games', key: 'games' },
    { label: 'Time On Ice', key: 'timeOnIce' },
    { label: 'Time On Ice/Game', key: 'timeOnIcePerGame' },
    { label: 'Plus/Minus', key: 'plusMinus' },
    { label: 'Production', key: 'production' },
    { label: 'Shifts', key: 'shifts' },
    // Offensive Stats
    { label: 'Goals', key: 'goals' },
    { label: 'Assists', key: 'assists' },
    { label: 'Points', key: 'points' },
    { label: 'Faceoffs Won', key: 'faceoffsWon' },
    { label: 'Faceoffs Lost', key: 'faceoffsLost' },
    { label: 'Faceoff %', key: 'faceoffPercent' },
    { label: 'Game Winning Goals', key: 'gameWinningGoals' },
    { label: 'Power Play Goals', key: 'powerPlayGoals' },
    { label: 'Power Play Assists', key: 'powerPlayAssists' },
    { label: 'Short Handed Goals', key: 'shortHandedGoals' },
    { label: 'Short Handed Assists', key: 'shortHandedAssists' },
    { label: 'Shots', key: 'shotsTotal' },
    { label: 'Shooting %', key: 'shootingPct' },
    { label: 'Shootout Attempts', key: 'shootoutAttempts' },
    { label: 'Shootout Goals', key: 'shootoutGoals' },
    { label: 'Shootout Shot %', key: 'shootoutShotPct' },
    // Defensive Stats
    { label: 'Goals Against Avg', key: 'avgGoalsAgainst' },
    { label: 'Goals Against', key: 'goalsAgainst' },
    { label: 'Saves', key: 'saves' },
    { label: 'Save %', key: 'savePct' },
    { label: 'Shots Against', key: 'shotsAgainst' },
    { label: 'Overtime Losses', key: 'overtimeLosses' },
    { label: 'Shootout Saves', key: 'shootoutSaves' },
    { label: 'Shootout Shots Against', key: 'shootoutShotsAgainst' },
    { label: 'Shootout Save %', key: 'shootoutSavePct' },
    // Penalties
    { label: 'Penalty Minutes', key: 'penaltyMinutes' }
  ];

  // Map for team stats by league
  const teamStatsByLeague = {
    NBA: nbaTeamStats,
    WNBA: wnbaTeamStats,
    NFL: nflTeamStats,
    MLB: mlbTeamStats,
    NHL: nhlTeamStats
  };

  // Determine which stat list to show
  let statList = [];
  if (navContext === 'players' || navContext === 'teamPlayers') {
    statList = leagueStats[selectedLeague] || [];
  } else if (navContext === 'teams') {
    statList = teamStatsByLeague[selectedLeague] || [];
  }

  // Determine if player count dropdown should be shown
  const showPlayerCountDropdown = navContext === 'players';

  const handlePlayerCountSelect = (count) => {
    onPlayerCountSelect(count);
    setPlayerCountDropdownOpen(false);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    onSearchQueryChange(value);
  };

  const handleStatSelect = (statKey) => {
    onStatSelect(statKey);
    setStatsDropdownOpen(false);
  };

  const handleLogoClick = () => {
    onLogoClick();
  };

  const handleLeagueClick = (leagueName) => {
    // Show coming soon modal - currently none
    if ([].includes(leagueName)) {
      setComingSoonLeague(leagueName);
      setShowComingSoon(true);
      return;
    }
    
    if (leagueName !== selectedLeague) {
      onLeagueSelect(leagueName);
      const defaultStat = leagueStats[leagueName]?.[0]?.key;
      if (defaultStat) {
        handleStatSelect(defaultStat);
      }
    }
  };
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setStatsDropdownOpen(false);
        setPlayerCountDropdownOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Filter live games for selected league
  const currentLeagueLiveGames = useMemo(() => {
    return liveGames?.filter(game => game.sport === selectedLeague) || [];
  }, [liveGames, selectedLeague]);

  // Get current live game based on index
  const getCurrentLiveGame = useMemo(() => {
    if (!currentLeagueLiveGames.length || currentGameIndex >= currentLeagueLiveGames.length) return null;
    
    const game = currentLeagueLiveGames[currentGameIndex];
    if (!game) return null;

    // Format game data based on league
    switch (selectedLeague) {
      case 'NBA':
      return {
          homeTeam: { 
            abbr: game.HomeTeam, 
            name: game.HomeTeam, 
            score: game.HomeTeamScore || 0,
            color: game.HomeTeamColor || '#3b82f6'
          },
          awayTeam: { 
            abbr: game.AwayTeam, 
            name: game.AwayTeam, 
            score: game.AwayTeamScore || 0,
            color: game.AwayTeamColor || '#3b82f6'
          },
          period: `Q${game.Quarter || ''}`,
          time: game.TimeRemaining || ''
        };

      case 'NFL':
      return {
          homeTeam: { 
            abbr: game.HomeTeam, 
            name: game.HomeTeam, 
            score: game.HomeScore || 0,
            color: game.HomeTeamColor || '#3b82f6'
          },
          awayTeam: { 
            abbr: game.AwayTeam, 
            name: game.AwayTeam, 
            score: game.AwayScore || 0,
            color: game.AwayTeamColor || '#3b82f6'
          },
          period: game.QuarterDescription || game.Quarter || '',
          time: game.TimeRemaining || ''
        };

      case 'MLB':
      return {
          homeTeam: { 
            abbr: game.HomeTeam, 
            name: game.HomeTeam, 
            score: game.HomeTeamRuns || 0,
            color: game.HomeTeamColor || '#3b82f6'
          },
          awayTeam: { 
            abbr: game.AwayTeam, 
            name: game.AwayTeam, 
            score: game.AwayTeamRuns || 0,
            color: game.AwayTeamColor || '#3b82f6'
          },
          period: game.Inning ? `${game.InningHalf} ${game.Inning}` : '',
          time: ''
        };

      case 'NHL':
      return {
          homeTeam: { 
            abbr: game.HomeTeam, 
            name: game.HomeTeam, 
            score: game.HomeTeamScore || 0,
            color: game.HomeTeamColor || '#3b82f6'
          },
          awayTeam: { 
            abbr: game.AwayTeam, 
            name: game.AwayTeam, 
            score: game.AwayTeamScore || 0,
            color: game.AwayTeamColor || '#3b82f6'
          },
          period: `Period ${game.Period || ''}`,
          time: game.TimeRemaining || ''
        };

      default:
        return null;
    }
  }, [currentLeagueLiveGames, currentGameIndex, selectedLeague]);

  // Auto-rotate through games every 8 seconds when multiple games are live
  useEffect(() => {
    if (!showLiveInNav || currentLeagueLiveGames.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentGameIndex(prevIndex => 
        prevIndex + 1 >= currentLeagueLiveGames.length ? 0 : prevIndex + 1
      );
    }, 8000);

    return () => clearInterval(interval);
  }, [showLiveInNav, currentLeagueLiveGames.length]);

  // Reset current game index when league changes
  useEffect(() => {
    setCurrentGameIndex(0);
  }, [selectedLeague]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setStatsDropdownOpen(false);
    setPlayerCountDropdownOpen(false);
  };

  return (
    <div className="w-full bg-transparent sticky top-0 z-50">
      <nav className={`w-full ${isDark ? 'bg-gray-900' : 'bg-[#f0ece3]'} py-4 px-4 relative`}>
        <div className="max-w-7xl mx-auto px-0 sm:px-4">
          <div className="flex items-center justify-between flex-nowrap">
            {/* Logo and Hamburger in a row, spaced apart on mobile */}
            <div className="flex flex-row items-center w-full lg:w-auto gap-2">
              <div className="flex-shrink-0" style={{ marginLeft: 0, minWidth: 60 }}>
                <img
                  src="/S-4.png"
                  alt="Logo"
                  className="h-6 sm:h-8 w-auto cursor-pointer transform scale-[2.5] sm:scale-[3.5]"
                  onClick={handleLogoClick}
                />
              </div>
              {/* Mobile dropdowns (centered on mobile, hidden on home) */}
              {selectedLeague && (
                <div className="flex-1 flex items-center gap-2 lg:hidden justify-center">
                  {/* Player stats + player count */}
                  {(navContext === 'players') && (
                    <>
                      {/* Stat dropdown (player) */}
                      <div className="relative dropdown-container" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setStatsDropdownOpen(!statsDropdownOpen);
                            setPlayerCountDropdownOpen(false);
                          }}
                          className={`flex items-center px-3 py-1 rounded-lg text-xs ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'} focus:outline-none`}
                        >
                          <span className="font-medium mr-2 truncate max-w-[120px]">
                            {leagueStats[selectedLeague]?.find(stat => stat.key === selectedStat)?.label || 'Select Stat'}
                          </span>
                          <ChevronDown size={14} />
                        </button>
                        {statsDropdownOpen && (
                          <div className={`absolute left-0 right-0 mt-2 py-2 w-56 rounded-md shadow-lg max-h-80 overflow-y-auto ${isDark ? 'bg-gray-800' : 'bg-white'} ring-1 ring-black ring-opacity-5 z-50`}>
                            {selectedLeague === 'MLB' ? (
                              <>
                                {/* Batting Category */}
                                <div className="px-3 py-1 border-b border-gray-200 dark:border-gray-700">
                                  <h3 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Batting
                                  </h3>
                                </div>
                                {leagueStats[selectedLeague]?.filter(stat => stat.category === 'Batting').map(stat => (
                                  <button
                                    key={stat.key}
                                    className={`block w-full text-left px-4 py-2 text-sm ${selectedStat === stat.key ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                                    onClick={() => handleStatSelect(stat.key)}
                                  >
                                    {stat.label}
                                  </button>
                                ))}
                                
                                {/* Fielding Category */}
                                <div className="px-3 py-1 border-b border-gray-200 dark:border-gray-700">
                                  <h3 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Fielding
                                  </h3>
                                </div>
                                {leagueStats[selectedLeague]?.filter(stat => stat.category === 'Fielding').map(stat => (
                                  <button
                                    key={stat.key}
                                    className={`block w-full text-left px-4 py-2 text-sm ${selectedStat === stat.key ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                                    onClick={() => handleStatSelect(stat.key)}
                                  >
                                    {stat.label}
                                  </button>
                                ))}
                                
                                {/* Pitching Category */}
                                <div className="px-3 py-1 border-b border-gray-200 dark:border-gray-700">
                                  <h3 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Pitching
                                  </h3>
                                </div>
                                {leagueStats[selectedLeague]?.filter(stat => stat.category === 'Pitching').map(stat => (
                                  <button
                                    key={stat.key}
                                    className={`block w-full text-left px-4 py-2 text-sm ${selectedStat === stat.key ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                                    onClick={() => handleStatSelect(stat.key)}
                                  >
                                    {stat.label}
                                  </button>
                                ))}
                              </>
                            ) : selectedLeague === 'NFL' ? (
                              <>
                                {/* General Category */}
                                <div className="px-3 py-1 border-b border-gray-200 dark:border-gray-700">
                                  <h3 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    General
                                  </h3>
                                </div>
                                {leagueStats[selectedLeague]?.filter(stat => stat.category === 'General').map(stat => (
                                  <button
                                    key={stat.key}
                                    className={`block w-full text-left px-4 py-2 text-sm ${selectedStat === stat.key ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                                    onClick={() => handleStatSelect(stat.key)}
                                  >
                                    {stat.label}
                                  </button>
                                ))}
                                
                                {/* Passing Category */}
                                <div className="px-3 py-1 border-b border-gray-200 dark:border-gray-700">
                                  <h3 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Passing
                                  </h3>
                                </div>
                                {leagueStats[selectedLeague]?.filter(stat => stat.category === 'Passing').map(stat => (
                                  <button
                                    key={stat.key}
                                    className={`block w-full text-left px-4 py-2 text-sm ${selectedStat === stat.key ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                                    onClick={() => handleStatSelect(stat.key)}
                                  >
                                    {stat.label}
                                  </button>
                                ))}
                                
                                {/* Rushing Category */}
                                <div className="px-3 py-1 border-b border-gray-200 dark:border-gray-700">
                                  <h3 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Rushing
                                  </h3>
                                </div>
                                {leagueStats[selectedLeague]?.filter(stat => stat.category === 'Rushing').map(stat => (
                                  <button
                                    key={stat.key}
                                    className={`block w-full text-left px-4 py-2 text-sm ${selectedStat === stat.key ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                                    onClick={() => handleStatSelect(stat.key)}
                                  >
                                    {stat.label}
                                  </button>
                                ))}
                                
                                {/* Receiving Category */}
                                <div className="px-3 py-1 border-b border-gray-200 dark:border-gray-700">
                                  <h3 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Receiving
                                  </h3>
                                </div>
                                {leagueStats[selectedLeague]?.filter(stat => stat.category === 'Receiving').map(stat => (
                                  <button
                                    key={stat.key}
                                    className={`block w-full text-left px-4 py-2 text-sm ${selectedStat === stat.key ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                                    onClick={() => handleStatSelect(stat.key)}
                                  >
                                    {stat.label}
                                  </button>
                                ))}
                                
                                {/* Defense Category */}
                                <div className="px-3 py-1 border-b border-gray-200 dark:border-gray-700">
                                  <h3 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Defense
                                  </h3>
                                </div>
                                {leagueStats[selectedLeague]?.filter(stat => stat.category === 'Defense').map(stat => (
                                  <button
                                    key={stat.key}
                                    className={`block w-full text-left px-4 py-2 text-sm ${selectedStat === stat.key ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                                    onClick={() => handleStatSelect(stat.key)}
                                  >
                                    {stat.label}
                                  </button>
                                ))}
                                
                                {/* Scoring Category */}
                                <div className="px-3 py-1 border-b border-gray-200 dark:border-gray-700">
                                  <h3 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Scoring
                                  </h3>
                                </div>
                                {leagueStats[selectedLeague]?.filter(stat => stat.category === 'Scoring').map(stat => (
                                  <button
                                    key={stat.key}
                                    className={`block w-full text-left px-4 py-2 text-sm ${selectedStat === stat.key ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                                    onClick={() => handleStatSelect(stat.key)}
                                  >
                                    {stat.label}
                                  </button>
                                ))}
                                
                                {/* Kicking Category */}
                                <div className="px-3 py-1 border-b border-gray-200 dark:border-gray-700">
                                  <h3 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Kicking
                                  </h3>
                                </div>
                                {leagueStats[selectedLeague]?.filter(stat => stat.category === 'Kicking').map(stat => (
                                  <button
                                    key={stat.key}
                                    className={`block w-full text-left px-4 py-2 text-sm ${selectedStat === stat.key ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                                    onClick={() => handleStatSelect(stat.key)}
                                  >
                                    {stat.label}
                                  </button>
                                ))}
                                
                                {/* Punting Category */}
                                <div className="px-3 py-1 border-b border-gray-200 dark:border-gray-700">
                                  <h3 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Punting
                                  </h3>
                                </div>
                                {leagueStats[selectedLeague]?.filter(stat => stat.category === 'Punting').map(stat => (
                                  <button
                                    key={stat.key}
                                    className={`block w-full text-left px-4 py-2 text-sm ${selectedStat === stat.key ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                                    onClick={() => handleStatSelect(stat.key)}
                                  >
                                    {stat.label}
                                  </button>
                                ))}
                                
                                {/* Returns Category */}
                                <div className="px-3 py-1 border-b border-gray-200 dark:border-gray-700">
                                  <h3 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Returns
                                  </h3>
                                </div>
                                {leagueStats[selectedLeague]?.filter(stat => stat.category === 'Returns').map(stat => (
                                  <button
                                    key={stat.key}
                                    className={`block w-full text-left px-4 py-2 text-sm ${selectedStat === stat.key ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                                    onClick={() => handleStatSelect(stat.key)}
                                  >
                                    {stat.label}
                                  </button>
                                ))}
                              </>
                            ) : (
                              leagueStats[selectedLeague]?.map(stat => (
                                <button
                                  key={stat.key}
                                  className={`block w-full text-left px-4 py-2 text-xs ${selectedStat === stat.key ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                                  onClick={() => handleStatSelect(stat.key)}
                                >
                                  {stat.label}
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                      {/* Player count dropdown */}
                      <div className="relative dropdown-container" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setPlayerCountDropdownOpen(!playerCountDropdownOpen);
                            setStatsDropdownOpen(false);
                          }}
                          className={`flex items-center px-3 py-1 rounded-lg text-xs ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'} focus:outline-none`}
                        >
                          <Users className="mr-1" size={14} />
                          <span className="font-medium mr-2 truncate">
                            {playerCounts.find(p => p.value === playerCount)?.label || 'All Players'}
                          </span>
                          <ChevronDown size={14} />
                        </button>
                        {playerCountDropdownOpen && (
                          <div className={`absolute left-0 mt-2 py-2 w-36 rounded-md shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'} ring-1 ring-black ring-opacity-5 z-10`}>
                            {playerCounts.map(option => (
                              <button
                                key={option.value}
                                className={`block w-full text-left px-4 py-2 text-xs ${playerCount === option.value ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                                onClick={() => handlePlayerCountSelect(option.value)}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  {/* Team stats only */}
                  {navContext === 'teams' && (
                    <div className="relative dropdown-container" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setStatsDropdownOpen(!statsDropdownOpen)}
                        className={`flex items-center px-3 py-1 rounded-lg text-xs ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'} focus:outline-none`}
                      >
                        <span className="font-medium mr-2 truncate max-w-[80px]">
                          {(teamStatsByLeague[selectedLeague]?.find(stat => stat.key === selectedStat)?.label) || 'Select Stat'}
                        </span>
                        <ChevronDown size={14} />
                      </button>
                      {statsDropdownOpen && (
                        <div className={`absolute left-0 mt-2 py-2 w-44 rounded-md shadow-lg max-h-60 overflow-y-auto ${isDark ? 'bg-gray-800' : 'bg-white'} ring-1 ring-black ring-opacity-5 z-10`}>
                          {selectedLeague === 'NFL' ? (
                            <>
                              <div className="px-3 py-1 border-b border-gray-200 dark:border-gray-700">
                                <h3 className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-[10px] font-semibold uppercase tracking-wide`}>Offense</h3>
                              </div>
                              {nflTeamStats.filter(s => s.category === 'Offense').map(stat => (
                            <button
                              key={stat.key}
                              className={`block w-full text-left px-4 py-2 text-xs ${selectedStat === stat.key ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                              onClick={() => handleStatSelect(stat.key)}
                            >
                              {stat.label}
                            </button>
                          ))}
                              <div className="px-3 py-1 border-b border-gray-200 dark:border-gray-700">
                                <h3 className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-[10px] font-semibold uppercase tracking-wide`}>Defense</h3>
                              </div>
                              {nflTeamStats.filter(s => s.category === 'Defense').map(stat => (
                                <button
                                  key={stat.key}
                                  className={`block w-full text-left px-4 py-2 text-xs ${selectedStat === stat.key ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                                  onClick={() => handleStatSelect(stat.key)}
                                >
                                  {stat.label}
                                </button>
                              ))}
                              <div className="px-3 py-1 border-b border-gray-200 dark:border-gray-700">
                                <h3 className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-[10px] font-semibold uppercase tracking-wide`}>Special Teams</h3>
                              </div>
                              {nflTeamStats.filter(s => s.category === 'Special Teams').map(stat => (
                                <button
                                  key={stat.key}
                                  className={`block w-full text-left px-4 py-2 text-xs ${selectedStat === stat.key ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                                  onClick={() => handleStatSelect(stat.key)}
                                >
                                  {stat.label}
                                </button>
                              ))}
                              <div className="px-3 py-1 border-b border-gray-200 dark:border-gray-700">
                                <h3 className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-[10px] font-semibold uppercase tracking-wide`}>Penalties</h3>
                              </div>
                              {nflTeamStats.filter(s => s.category === 'Penalties').map(stat => (
                                <button
                                  key={stat.key}
                                  className={`block w-full text-left px-4 py-2 text-xs ${selectedStat === stat.key ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                                  onClick={() => handleStatSelect(stat.key)}
                                >
                                  {stat.label}
                                </button>
                              ))}
                            </>
                          ) : (
                            teamStatsByLeague[selectedLeague]?.map(stat => (
                              <button
                                key={stat.key}
                                className={`block w-full text-left px-4 py-2 text-xs ${selectedStat === stat.key ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                                onClick={() => handleStatSelect(stat.key)}
                              >
                                {stat.label}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {/* TeamPlayersView: player stat dropdown only */}
                  {navContext === 'teamPlayers' && (
                    <div className="relative dropdown-container" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setStatsDropdownOpen(!statsDropdownOpen)}
                        className={`flex items-center px-3 py-1 rounded-lg text-xs ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'} focus:outline-none`}
                      >
                        <span className="font-medium mr-2 truncate max-w-[80px]">
                          {leagueStats[selectedLeague]?.find(stat => stat.key === selectedStat)?.label || 'Select Stat'}
                        </span>
                        <ChevronDown size={14} />
                      </button>
                      {statsDropdownOpen && (
                        <div className={`absolute left-0 mt-2 py-2 w-44 rounded-md shadow-lg max-h-60 overflow-y-auto ${isDark ? 'bg-gray-800' : 'bg-white'} ring-1 ring-black ring-opacity-5 z-10`}>
                          {selectedLeague === 'MLB' ? (
                            <>
                              {/* Batting Category */}
                              <div className="px-3 py-1 border-b border-gray-200 dark:border-gray-700">
                                <h3 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Batting
                                </h3>
                              </div>
                              {leagueStats[selectedLeague]?.filter(stat => stat.category === 'Batting').map(stat => (
                                <button
                                  key={stat.key}
                                  className={`block w-full text-left px-4 py-2 text-xs ${selectedStat === stat.key ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                                  onClick={() => handleStatSelect(stat.key)}
                                >
                                  {stat.label}
                                </button>
                              ))}
                              
                              {/* Fielding Category */}
                              <div className="px-3 py-1 border-b border-gray-200 dark:border-gray-700">
                                <h3 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Fielding
                                </h3>
                              </div>
                              {leagueStats[selectedLeague]?.filter(stat => stat.category === 'Fielding').map(stat => (
                                <button
                                  key={stat.key}
                                  className={`block w-full text-left px-4 py-2 text-xs ${selectedStat === stat.key ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                                  onClick={() => handleStatSelect(stat.key)}
                                >
                                  {stat.label}
                                </button>
                              ))}
                              
                              {/* Pitching Category */}
                              <div className="px-3 py-1 border-b border-gray-200 dark:border-gray-700">
                                <h3 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Pitching
                                </h3>
                              </div>
                              {leagueStats[selectedLeague]?.filter(stat => stat.category === 'Pitching').map(stat => (
                                <button
                                  key={stat.key}
                                  className={`block w-full text-left px-4 py-2 text-xs ${selectedStat === stat.key ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                                  onClick={() => handleStatSelect(stat.key)}
                                >
                                  {stat.label}
                                </button>
                              ))}
                            </>
                          ) : selectedLeague === 'NFL' ? (
                            <>
                              {/* General Category */}
                              <div className="px-3 py-1 border-b border-gray-200 dark:border-gray-700">
                                <h3 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  General
                                </h3>
                              </div>
                              {leagueStats[selectedLeague]?.filter(stat => stat.category === 'General').map(stat => (
                                <button
                                  key={stat.key}
                                  className={`block w-full text-left px-4 py-2 text-xs ${selectedStat === stat.key ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                                  onClick={() => handleStatSelect(stat.key)}
                                >
                                  {stat.label}
                                </button>
                              ))}
                              
                              {/* Passing Category */}
                              <div className="px-3 py-1 border-b border-gray-200 dark:border-gray-700">
                                <h3 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Passing
                                </h3>
                              </div>
                              {leagueStats[selectedLeague]?.filter(stat => stat.category === 'Passing').map(stat => (
                                <button
                                  key={stat.key}
                                  className={`block w-full text-left px-4 py-2 text-xs ${selectedStat === stat.key ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                                  onClick={() => handleStatSelect(stat.key)}
                                >
                                  {stat.label}
                                </button>
                              ))}
                              
                              {/* Rushing Category */}
                              <div className="px-3 py-1 border-b border-gray-200 dark:border-gray-700">
                                <h3 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Rushing
                                </h3>
                              </div>
                              {leagueStats[selectedLeague]?.filter(stat => stat.category === 'Rushing').map(stat => (
                                <button
                                  key={stat.key}
                                  className={`block w-full text-left px-4 py-2 text-xs ${selectedStat === stat.key ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                                  onClick={() => handleStatSelect(stat.key)}
                                >
                                  {stat.label}
                                </button>
                              ))}
                              
                              {/* Receiving Category */}
                              <div className="px-3 py-1 border-b border-gray-200 dark:border-gray-700">
                                <h3 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Receiving
                                </h3>
                              </div>
                              {leagueStats[selectedLeague]?.filter(stat => stat.category === 'Receiving').map(stat => (
                                <button
                                  key={stat.key}
                                  className={`block w-full text-left px-4 py-2 text-xs ${selectedStat === stat.key ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                                  onClick={() => handleStatSelect(stat.key)}
                                >
                                  {stat.label}
                                </button>
                              ))}
                              
                              {/* Defense Category */}
                              <div className="px-3 py-1 border-b border-gray-200 dark:border-gray-700">
                                <h3 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Defense
                                </h3>
                              </div>
                              {leagueStats[selectedLeague]?.filter(stat => stat.category === 'Defense').map(stat => (
                                <button
                                  key={stat.key}
                                  className={`block w-full text-left px-4 py-2 text-xs ${selectedStat === stat.key ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                                  onClick={() => handleStatSelect(stat.key)}
                                >
                                  {stat.label}
                                </button>
                              ))}
                              
                              {/* Scoring Category */}
                              <div className="px-3 py-1 border-b border-gray-200 dark:border-gray-700">
                                <h3 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Scoring
                                </h3>
                              </div>
                              {leagueStats[selectedLeague]?.filter(stat => stat.category === 'Scoring').map(stat => (
                                <button
                                  key={stat.key}
                                  className={`block w-full text-left px-4 py-2 text-xs ${selectedStat === stat.key ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                                  onClick={() => handleStatSelect(stat.key)}
                                >
                                  {stat.label}
                                </button>
                              ))}
                              
                              {/* Kicking Category */}
                              <div className="px-3 py-1 border-b border-gray-200 dark:border-gray-700">
                                <h3 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Kicking
                                </h3>
                              </div>
                              {leagueStats[selectedLeague]?.filter(stat => stat.category === 'Kicking').map(stat => (
                                <button
                                  key={stat.key}
                                  className={`block w-full text-left px-4 py-2 text-xs ${selectedStat === stat.key ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                                  onClick={() => handleStatSelect(stat.key)}
                                >
                                  {stat.label}
                                </button>
                              ))}
                              
                              {/* Punting Category */}
                              <div className="px-3 py-1 border-b border-gray-200 dark:border-gray-700">
                                <h3 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Punting
                                </h3>
                              </div>
                              {leagueStats[selectedLeague]?.filter(stat => stat.category === 'Punting').map(stat => (
                                <button
                                  key={stat.key}
                                  className={`block w-full text-left px-4 py-2 text-xs ${selectedStat === stat.key ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                                  onClick={() => handleStatSelect(stat.key)}
                                >
                                  {stat.label}
                                </button>
                              ))}
                              
                              {/* Returns Category */}
                              <div className="px-3 py-1 border-b border-gray-200 dark:border-gray-700">
                                <h3 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Returns
                                </h3>
                              </div>
                              {leagueStats[selectedLeague]?.filter(stat => stat.category === 'Returns').map(stat => (
                                <button
                                  key={stat.key}
                                  className={`block w-full text-left px-4 py-2 text-xs ${selectedStat === stat.key ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                                  onClick={() => handleStatSelect(stat.key)}
                                >
                                  {stat.label}
                                </button>
                              ))}
                              
                            </>
                          ) : (
                            leagueStats[selectedLeague]?.map(stat => (
                              <button
                                key={stat.key}
                                className={`block w-full text-left px-4 py-2 text-xs ${selectedStat === stat.key ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                                onClick={() => handleStatSelect(stat.key)}
                              >
                                {stat.label}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {/* Hamburger menu for mobile, right-aligned */}
              <div className="lg:hidden ml-auto">
                <div className="absolute right-2 top-2 z-50 sm:static">
                  <button
                    onClick={toggleMobileMenu}
                    className={`p-2 rounded-md ${
                      isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                  </button>
                </div>
              </div>
            </div>
            {/* Navbar content */}
            <div className="flex-1 flex items-center justify-between gap-5 ml-16 min-w-0">
              {/* Desktop Navigation */}
              <div className="hidden lg:flex flex-1 items-center justify-end gap-5">
                {/* League selection with dropdowns */}
                <div className="flex items-center">
                  {leagues.map((league) => (
                    <div key={league.name} className="mr-5">
                      <div className={`flex items-center ${
                        selectedLeague === league.name 
                          ? `p-2 bg-opacity-10 rounded-xl ${isDark ? 'bg-blue-400' : 'bg-blue-500'}` 
                          : ''
                      }`}>
                        <div className="flex items-center">
                          <button
                            onClick={() => handleLeagueClick(league.name)}
                            className={`px-4 py-1 rounded-lg transition-all duration-300 ${
                              selectedLeague === league.name 
                                ? 'bg-blue-500 text-white' 
                                : `${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-50'}`
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          >
                            <span className="font-medium">
                              {league.name}
                            </span>
                          </button>
                          
                          {/* Live score mini display when enabled */}
                          {showLiveInNav && selectedLeague === league.name && getCurrentLiveGame && (
                            <div 
                              className={`ml-3 px-3 py-1.5 rounded-xl ${isDark ? 'bg-gray-800/90' : 'bg-white/90'} 
                              backdrop-blur-md border ${isDark ? 'border-gray-700/50' : 'border-gray-200/50'} 
                              shadow-lg flex items-center min-w-[220px] group cursor-pointer relative`}
                              onClick={() => {
                                if (currentLeagueLiveGames.length > 1) {
                                  setCurrentGameIndex(prevIndex => 
                                    prevIndex + 1 >= currentLeagueLiveGames.length ? 0 : prevIndex + 1
                                  );
                                }
                              }}
                              style={{
                                boxShadow: isDark 
                                  ? '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                                  : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                              }}
                            >
                              {/* Game count indicator for multiple games */}
                              {currentLeagueLiveGames.length > 1 && (
                                <div className="absolute -top-1 -right-1">
                                  <span className={`
                                    px-1.5 py-0.5 text-[10px] font-bold rounded-full
                                    ${isDark ? 'bg-blue-500 text-white' : 'bg-blue-500 text-white'}
                                  `}>
                                    {`${currentGameIndex + 1}/${currentLeagueLiveGames.length}`}
                                  </span>
                                </div>
                              )}

                              {/* Hover instruction for multiple games */}
                              {currentLeagueLiveGames.length > 1 && (
                                <div className={`
                                  absolute -bottom-8 left-1/2 transform -translate-x-1/2 
                                  opacity-0 group-hover:opacity-100 transition-opacity duration-200
                                  text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}
                                `}>
                                  Click to cycle games
                                </div>
                              )}

                              <div className="flex items-center space-x-3 w-full justify-between">
                                {/* Live indicator and period/time */}
                                <div className="flex items-center min-w-[50px]">
                                  <div className="relative">
                                    <span className="absolute inset-0 rounded-full animate-ping bg-red-500/30"></span>
                                    <span className="relative block w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                  </div>
                                  <span className={`ml-2 text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {getCurrentLiveGame.period}
                                    {getCurrentLiveGame.time && (
                                      <span className="mx-1">•</span>
                                    )}
                                    {getCurrentLiveGame.time}
                                  </span>
                                </div>

                                {/* Divider */}
                                <div className={`h-3.5 w-px ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}></div>

                                {/* Teams and Score */}
                                <div className="flex items-center space-x-3 flex-1 justify-center min-w-[110px]">
                                  {/* Away Team */}
                                  <div className="flex items-center">
                                    <div 
                                      className="w-6 h-6 rounded-full flex items-center justify-center shadow-inner"
                                      style={{ 
                                        backgroundColor: getCurrentLiveGame.awayTeam.color,
                                        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
                                      }}
                                    >
                                      <span className="text-white text-[11px] font-bold">
                                        {getCurrentLiveGame.awayTeam.abbr}
                                      </span>
                                    </div>
                                    <span className={`ml-2 text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {getCurrentLiveGame.awayTeam.score}
                                    </span>
                                  </div>

                                  {/* Score Separator */}
                                  <span className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                    -
                                  </span>

                                  {/* Home Team */}
                                  <div className="flex items-center">
                                    <span className={`mr-2 text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                      {getCurrentLiveGame.homeTeam.score}
                                    </span>
                                    <div 
                                      className="w-6 h-6 rounded-full flex items-center justify-center shadow-inner"
                                      style={{ 
                                        backgroundColor: getCurrentLiveGame.homeTeam.color,
                                        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
                                      }}
                                    >
                                      <span className="text-white text-[11px] font-bold">
                                        {getCurrentLiveGame.homeTeam.abbr}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Additional Info for specific leagues */}
                                {selectedLeague === 'NFL' && getCurrentLiveGame.situation && (
                                  <>
                                    <div className={`h-3.5 w-px ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                                    <div className="min-w-[80px] text-right">
                                      <span className={`text-xs font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                                        {getCurrentLiveGame.situation}
                                      </span>
                                    </div>
                                  </>
                                )}
                                {selectedLeague === 'MLB' && getCurrentLiveGame.bases && (
                                  <>
                                    <div className={`h-3.5 w-px ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                                    <div className="min-w-[60px] text-right">
                                      <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {getCurrentLiveGame.outs} Out
                                      </span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Show dropdowns only for selected league */}
                        {selectedLeague === league.name && (
                          <div className="flex items-center ml-3 gap-3">
                            {/* NBA Players/Teams toggle */}
                            {selectedLeague === 'NBA' && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => onViewModeChange('Players')}
                                  className={`px-3 py-1 rounded-lg font-medium transition-all duration-200 ${
                                    viewMode === 'Players'
                                      ? isDark ? 'bg-blue-300 text-blue-900' : 'bg-blue-100 text-blue-700'
                                      : isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-50'
                                  }`}
                                >
                                  Players
                                </button>
                                <button
                                  onClick={() => onViewModeChange('Teams')}
                                  className={`px-3 py-1 rounded-lg font-medium transition-all duration-200 ${
                                    viewMode === 'Teams'
                                      ? isDark ? 'bg-blue-300 text-blue-900' : 'bg-blue-100 text-blue-700'
                                      : isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-50'
                                  }`}
                                >
                                  Teams
                                </button>
                              </div>
                            )}
                            {/* WNBA Players/Teams toggle */}
                            {selectedLeague === 'WNBA' && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => onViewModeChange('Players')}
                                  className={`px-3 py-1 rounded-lg font-medium transition-all duration-200 ${
                                    viewMode === 'Players'
                                      ? isDark ? 'bg-blue-300 text-blue-900' : 'bg-blue-100 text-blue-700'
                                      : isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-50'
                                  }`}
                                >
                                  Players
                                </button>
                                <button
                                  onClick={() => onViewModeChange('Teams')}
                                  className={`px-3 py-1 rounded-lg font-medium transition-all duration-200 ${
                                    viewMode === 'Teams'
                                      ? isDark ? 'bg-blue-300 text-blue-900' : 'bg-blue-100 text-blue-700'
                                      : isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-50'
                                  }`}
                                >
                                  Teams
                                </button>
                              </div>
                            )}
                            {/* MLB Players/Teams toggle */}
                            {selectedLeague === 'MLB' && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => onViewModeChange('Players')}
                                  className={`px-3 py-1 rounded-lg font-medium transition-all duration-200 ${
                                    viewMode === 'Players'
                                      ? isDark ? 'bg-blue-300 text-blue-900' : 'bg-blue-100 text-blue-700'
                                      : isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-50'
                                  }`}
                                >
                                  Players
                                </button>
                                <button
                                  onClick={() => onViewModeChange('Teams')}
                                  className={`px-3 py-1 rounded-lg font-medium transition-all duration-200 ${
                                    viewMode === 'Teams'
                                      ? isDark ? 'bg-blue-300 text-blue-900' : 'bg-blue-100 text-blue-700'
                                      : isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-50'
                                  }`}
                                >
                                  Teams
                                </button>
                              </div>
                            )}
                            {/* NFL Players/Teams toggle */}
                            {selectedLeague === 'NFL' && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => onViewModeChange('Players')}
                                  className={`px-3 py-1 rounded-lg font-medium transition-all duration-200 ${
                                    viewMode === 'Players'
                                      ? isDark ? 'bg-blue-300 text-blue-900' : 'bg-blue-100 text-blue-700'
                                      : isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-50'
                                  }`}
                                >
                                  Players
                                </button>
                                <button
                                  onClick={() => onViewModeChange('Teams')}
                                  className={`px-3 py-1 rounded-lg font-medium transition-all duration-200 ${
                                    viewMode === 'Teams'
                                      ? isDark ? 'bg-blue-300 text-blue-900' : 'bg-blue-100 text-blue-700'
                                      : isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-50'
                                  }`}
                                >
                                  Teams
                                </button>
                              </div>
                            )}
                            {/* NHL Players/Teams toggle */}
                            {selectedLeague === 'NHL' && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => onViewModeChange('Players')}
                                  className={`px-3 py-1 rounded-lg font-medium transition-all duration-200 ${
                                    viewMode === 'Players'
                                      ? isDark ? 'bg-blue-300 text-blue-900' : 'bg-blue-100 text-blue-700'
                                      : isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-50'
                                  }`}
                                >
                                  Players
                                </button>
                                <button
                                  onClick={() => onViewModeChange('Teams')}
                                  className={`px-3 py-1 rounded-lg font-medium transition-all duration-200 ${
                                    viewMode === 'Teams'
                                      ? isDark ? 'bg-blue-300 text-blue-900' : 'bg-blue-100 text-blue-700'
                                      : isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-50'
                                  }`}
                                >
                                  Teams
                                </button>
                              </div>
                            )}
                            {/* NFL Players Stats dropdown with categories */}
                            {selectedLeague === 'NFL' && (navContext === 'players' || navContext === 'teamPlayers') && (
                              <div className="relative dropdown-container" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => {
                                    setStatsDropdownOpen(!statsDropdownOpen);
                                    setPlayerCountDropdownOpen(false);
                                  }}
                                  className={`flex items-center px-4 py-1 rounded-lg transition-all duration-300 ${
                                    isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-50'
                                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                >
                                  <span className="text-sm font-medium truncate max-w-[200px]">
                                    {leagueStats[selectedLeague]?.find(stat => stat.key === selectedStat)?.label || ''}
                                  </span>
                                  <ChevronDown size={14} />
                                </button>
                                {statsDropdownOpen && (
                                  <div className={`absolute left-0 mt-2 py-2 w-56 rounded-md shadow-lg max-h-80 overflow-y-auto ${isDark ? 'bg-gray-800' : 'bg-white'} ring-1 ring-black ring-opacity-5 z-10`}>
                                    {/* General Category */}
                                    <div className="px-3 py-1 border-b border-gray-200 dark:border-gray-700">
                                      <h3 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        General
                                      </h3>
                                    </div>
                                    {leagueStats[selectedLeague]?.filter(stat => stat.category === 'General').map(stat => (
                                      <button
                                        key={stat.key}
                                        className={`flex items-center w-full text-left px-4 py-2 text-xs h-8 ${selectedStat === stat.key ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                                        onClick={() => handleStatSelect(stat.key)}
                                      >
                                        <span className="truncate whitespace-nowrap w-full max-w-[200px]">{stat.label}</span>
                                      </button>
                                    ))}
                                    
                                    {/* Passing Category */}
                                    <div className="px-3 py-1 border-b border-gray-200 dark:border-gray-700">
                                      <h3 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Passing
                                      </h3>
                                    </div>
                                    {leagueStats[selectedLeague]?.filter(stat => stat.category === 'Passing').map(stat => (
                                      <button
                                        key={stat.key}
                                        className={`flex items-center w-full text-left px-4 py-2 text-xs h-8 ${selectedStat === stat.key ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                                        onClick={() => handleStatSelect(stat.key)}
                                      >
                                        <span className="truncate whitespace-nowrap w-full max-w-[200px]">{stat.label}</span>
                                      </button>
                                    ))}
                                    
                                    {/* Rushing Category */}
                                    <div className="px-3 py-1 border-b border-gray-200 dark:border-gray-700">
                                      <h3 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Rushing
                                      </h3>
                                    </div>
                                    {leagueStats[selectedLeague]?.filter(stat => stat.category === 'Rushing').map(stat => (
                                      <button
                                        key={stat.key}
                                        className={`flex items-center w-full text-left px-4 py-2 text-xs h-8 ${selectedStat === stat.key ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                                        onClick={() => handleStatSelect(stat.key)}
                                      >
                                        <span className="truncate whitespace-nowrap w-full max-w-[200px]">{stat.label}</span>
                                      </button>
                                    ))}
                                    
                                    {/* Receiving Category */}
                                    <div className="px-3 py-1 border-b border-gray-200 dark:border-gray-700">
                                      <h3 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Receiving
                                      </h3>
                                    </div>
                                    {leagueStats[selectedLeague]?.filter(stat => stat.category === 'Receiving').map(stat => (
                                      <button
                                        key={stat.key}
                                        className={`flex items-center w-full text-left px-4 py-2 text-xs h-8 ${selectedStat === stat.key ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                                        onClick={() => handleStatSelect(stat.key)}
                                      >
                                        <span className="truncate whitespace-nowrap w-full max-w-[200px]">{stat.label}</span>
                                      </button>
                                    ))}
                                    
                                    {/* Defense Category */}
                                    <div className="px-3 py-1 border-b border-gray-200 dark:border-gray-700">
                                      <h3 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Defense
                                      </h3>
                                    </div>
                                    {leagueStats[selectedLeague]?.filter(stat => stat.category === 'Defense').map(stat => (
                                      <button
                                        key={stat.key}
                                        className={`flex items-center w-full text-left px-4 py-2 text-xs h-8 ${selectedStat === stat.key ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                                        onClick={() => handleStatSelect(stat.key)}
                                      >
                                        <span className="truncate whitespace-nowrap w-full max-w-[200px]">{stat.label}</span>
                                      </button>
                                    ))}
                                    
                                    {/* Scoring Category */}
                                    <div className="px-3 py-1 border-b border-gray-200 dark:border-gray-700">
                                      <h3 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Scoring
                                      </h3>
                                    </div>
                                    {leagueStats[selectedLeague]?.filter(stat => stat.category === 'Scoring').map(stat => (
                                      <button
                                        key={stat.key}
                                        className={`flex items-center w-full text-left px-4 py-2 text-xs h-8 ${selectedStat === stat.key ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                                        onClick={() => handleStatSelect(stat.key)}
                                      >
                                        <span className="truncate whitespace-nowrap w-full max-w-[200px]">{stat.label}</span>
                                      </button>
                                    ))}
                                    
                                    {/* Kicking Category */}
                                    <div className="px-3 py-1 border-b border-gray-200 dark:border-gray-700">
                                      <h3 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Kicking
                                      </h3>
                                    </div>
                                    {leagueStats[selectedLeague]?.filter(stat => stat.category === 'Kicking').map(stat => (
                                      <button
                                        key={stat.key}
                                        className={`flex items-center w-full text-left px-4 py-2 text-xs h-8 ${selectedStat === stat.key ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                                        onClick={() => handleStatSelect(stat.key)}
                                      >
                                        <span className="truncate whitespace-nowrap w-full max-w-[200px]">{stat.label}</span>
                                      </button>
                                    ))}
                                    
                                    {/* Punting Category */}
                                    <div className="px-3 py-1 border-b border-gray-200 dark:border-gray-700">
                                      <h3 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Punting
                                      </h3>
                                    </div>
                                    {leagueStats[selectedLeague]?.filter(stat => stat.category === 'Punting').map(stat => (
                                      <button
                                        key={stat.key}
                                        className={`flex items-center w-full text-left px-4 py-2 text-xs h-8 ${selectedStat === stat.key ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                                        onClick={() => handleStatSelect(stat.key)}
                                      >
                                        <span className="truncate whitespace-nowrap w-full max-w-[200px]">{stat.label}</span>
                                      </button>
                                    ))}
                                    
                                    {/* Returns Category */}
                                    <div className="px-3 py-1 border-b border-gray-200 dark:border-gray-700">
                                      <h3 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Returns
                                      </h3>
                                    </div>
                                    {leagueStats[selectedLeague]?.filter(stat => stat.category === 'Returns').map(stat => (
                                      <button
                                        key={stat.key}
                                        className={`flex items-center w-full text-left px-4 py-2 text-xs h-8 ${selectedStat === stat.key ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                                        onClick={() => handleStatSelect(stat.key)}
                                      >
                                        <span className="truncate whitespace-nowrap w-full max-w-[200px]">{stat.label}</span>
                                      </button>
                                    ))}
                                    
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* MLB Players Stats dropdown with categories */}
                            {selectedLeague === 'MLB' && (navContext === 'players' || navContext === 'teamPlayers') && (
                              <div className="relative dropdown-container" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => {
                                    setStatsDropdownOpen(!statsDropdownOpen);
                                    setPlayerCountDropdownOpen(false);
                                  }}
                                  className={`flex items-center px-4 py-1 rounded-lg transition-all duration-300 ${
                                    isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-50'
                                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                >
                                  <span className="font-medium mr-2 truncate max-w-[120px]">
                                    {leagueStats[selectedLeague].find(stat => stat.key === selectedStat)?.label || 'Select Stat'}
                                  </span>
                                  <ChevronDown size={16} />
                                </button>
                                {statsDropdownOpen && (
                                  <div 
                                    className={`absolute left-0 mt-2 py-2 w-56 rounded-md shadow-lg max-h-80 overflow-y-auto ${
                                      isDark ? 'bg-gray-800' : 'bg-white'
                                    } ring-1 ring-black ring-opacity-5 z-10`}
                                  >
                                    {/* Batting Category */}
                                    <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                      <h3 className={`text-xs font-semibold uppercase tracking-wide ${
                                        isDark ? 'text-gray-400' : 'text-gray-500'
                                      }`}>
                                        Batting
                                      </h3>
                                    </div>
                                    {leagueStats[selectedLeague]
                                      .filter(stat => stat.category === 'Batting')
                                      .map((stat) => (
                                        <button
                                          key={stat.key}
                                          className={`block w-full text-left px-4 py-2 text-sm ${
                                            selectedStat === stat.key
                                              ? isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600'
                                              : isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                                          }`}
                                          onClick={() => handleStatSelect(stat.key)}
                                        >
                                          {stat.label}
                                        </button>
                                      ))}
                                    
                                    {/* Fielding Category */}
                                    <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                      <h3 className={`text-xs font-semibold uppercase tracking-wide ${
                                        isDark ? 'text-gray-400' : 'text-gray-500'
                                      }`}>
                                        Fielding
                                      </h3>
                                    </div>
                                    {leagueStats[selectedLeague]
                                      .filter(stat => stat.category === 'Fielding')
                                      .map((stat) => (
                                        <button
                                          key={stat.key}
                                          className={`block w-full text-left px-4 py-2 text-sm ${
                                            selectedStat === stat.key
                                              ? isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600'
                                              : isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                                          }`}
                                          onClick={() => handleStatSelect(stat.key)}
                                        >
                                          {stat.label}
                                        </button>
                                      ))}
                                    
                                    {/* Pitching Category */}
                                    <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                      <h3 className={`text-xs font-semibold uppercase tracking-wide ${
                                        isDark ? 'text-gray-400' : 'text-gray-500'
                                      }`}>
                                        Pitching
                                      </h3>
                                    </div>
                                    {leagueStats[selectedLeague]
                                      .filter(stat => stat.category === 'Pitching')
                                      .map((stat) => (
                                        <button
                                          key={stat.key}
                                          className={`block w-full text-left px-4 py-2 text-sm ${
                                            selectedStat === stat.key
                                              ? isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600'
                                              : isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                                          }`}
                                          onClick={() => handleStatSelect(stat.key)}
                                        >
                                          {stat.label}
                                        </button>
                                      ))}
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Stats dropdown for other leagues */}
                            {((selectedLeague !== 'NBA' && selectedLeague !== 'WNBA' && selectedLeague !== 'MLB' && selectedLeague !== 'NFL' && selectedLeague !== 'NHL') || 
                              (selectedLeague === 'NBA' && (navContext === 'players' || navContext === 'teamPlayers')) || 
                              (selectedLeague === 'WNBA' && (navContext === 'players' || navContext === 'teamPlayers')) ||
                              (selectedLeague === 'NHL' && (navContext === 'players' || navContext === 'teamPlayers'))) && leagueStats[selectedLeague] && (
                              <div className="relative dropdown-container" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => {
                                    setStatsDropdownOpen(!statsDropdownOpen);
                                    setPlayerCountDropdownOpen(false);
                                  }}
                                  className={`flex items-center px-4 py-1 rounded-lg transition-all duration-300 ${
                                    isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-50'
                                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                >
                                  <span className="font-medium mr-2 truncate max-w-[120px]">
                                    {leagueStats[selectedLeague].find(stat => stat.key === selectedStat)?.label || 'Select Stat'}
                                  </span>
                                  <ChevronDown size={16} />
                                </button>
                                {statsDropdownOpen && (
                                  <div 
                                    className={`absolute left-0 mt-2 py-2 w-48 rounded-md shadow-lg max-h-60 overflow-y-auto ${
                                      isDark ? 'bg-gray-800' : 'bg-white'
                                    } ring-1 ring-black ring-opacity-5 z-10`}
                                  >
                                    {leagueStats[selectedLeague].map((stat) => (
                                      <button
                                        key={stat.key}
                                        className={`block w-full text-left px-4 py-2 text-sm ${
                                          selectedStat === stat.key
                                            ? isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600'
                                            : isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                        onClick={() => handleStatSelect(stat.key)}
                                      >
                                        <span className="truncate whitespace-nowrap w-full max-w-[200px]">{stat.label}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                            {/* NBA Team stats dropdown */}
                            {selectedLeague === 'NBA' && navContext === 'teams' && (
                              <div className="relative dropdown-container" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => {
                                    setStatsDropdownOpen(!statsDropdownOpen);
                                    setPlayerCountDropdownOpen(false);
                                  }}
                                  className={`flex items-center px-4 py-1 rounded-lg transition-all duration-300 ${
                                    isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-50'
                                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                >
                                  <span className="font-medium mr-2 truncate max-w-[120px]">
                                    {nbaTeamStats.find(stat => stat.key === selectedStat)?.label || 'Select Stat'}
                                  </span>
                                  <ChevronDown size={16} />
                                </button>
                                {statsDropdownOpen && (
                                  <div 
                                    className={`absolute left-0 mt-2 py-2 w-48 rounded-md shadow-lg max-h-60 overflow-y-auto ${
                                      isDark ? 'bg-gray-800' : 'bg-white'
                                    } ring-1 ring-black ring-opacity-5 z-10`}
                                  >
                                    {nbaTeamStats.map((stat) => (
                                      <button
                                        key={stat.key}
                                        className={`block w-full text-left px-4 py-2 text-sm ${
                                          selectedStat === stat.key
                                            ? isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600'
                                            : isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                        onClick={() => handleStatSelect(stat.key)}
                                      >
                                        <span className="truncate whitespace-nowrap w-full max-w-[200px]">{stat.label}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                            {/* WNBA Team stats dropdown */}
                            {selectedLeague === 'WNBA' && navContext === 'teams' && (
                              <div className="relative dropdown-container" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => {
                                    setStatsDropdownOpen(!statsDropdownOpen);
                                    setPlayerCountDropdownOpen(false);
                                  }}
                                  className={`flex items-center px-4 py-1 rounded-lg transition-all duration-300 ${
                                    isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-50'
                                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                >
                                  <span className="font-medium mr-2 truncate max-w-[120px]">
                                    {wnbaTeamStats.find(stat => stat.key === selectedStat)?.label || 'Select Stat'}
                                  </span>
                                  <ChevronDown size={16} />
                                </button>
                                {statsDropdownOpen && (
                                  <div 
                                    className={`absolute left-0 mt-2 py-2 w-48 rounded-md shadow-lg max-h-60 overflow-y-auto ${
                                      isDark ? 'bg-gray-800' : 'bg-white'
                                    } ring-1 ring-black ring-opacity-5 z-10`}
                                  >
                                    {wnbaTeamStats.map((stat) => (
                                      <button
                                        key={stat.key}
                                        className={`block w-full text-left px-4 py-2 text-sm ${
                                          selectedStat === stat.key
                                            ? isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600'
                                            : isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                        onClick={() => handleStatSelect(stat.key)}
                                      >
                                        <span className="truncate whitespace-nowrap w-full max-w-[200px]">{stat.label}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                            {/* MLB Team stats dropdown */}
                            {selectedLeague === 'MLB' && navContext === 'teams' && (
                              <div className="relative dropdown-container" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => {
                                    setStatsDropdownOpen(!statsDropdownOpen);
                                    setPlayerCountDropdownOpen(false);
                                  }}
                                  className={`flex items-center px-4 py-1 rounded-lg transition-all duration-300 ${
                                    isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-50'
                                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                >
                                  <span className="font-medium mr-2 truncate max-w-[120px]">
                                    {mlbTeamStats.find(stat => stat.key === selectedStat)?.label || 'Select Stat'}
                                  </span>
                                  <ChevronDown size={16} />
                                </button>
                                {statsDropdownOpen && (
                                  <div 
                                    className={`absolute left-0 mt-2 py-2 w-48 rounded-md shadow-lg max-h-60 overflow-y-auto ${
                                      isDark ? 'bg-gray-800' : 'bg-white'
                                    } ring-1 ring-black ring-opacity-5 z-10`}
                                  >
                                    {mlbTeamStats.map((stat) => (
                                      <button
                                        key={stat.key}
                                        className={`block w-full text-left px-4 py-2 text-sm ${
                                          selectedStat === stat.key
                                            ? isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600'
                                            : isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                        onClick={() => handleStatSelect(stat.key)}
                                      >
                                        <span className="truncate whitespace-nowrap w-full max-w-[200px]">{stat.label}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                            {/* NFL Team stats dropdown with simplified categories */}
                            {selectedLeague === 'NFL' && navContext === 'teams' && (
                              <div className="relative dropdown-container" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => {
                                    setStatsDropdownOpen(!statsDropdownOpen);
                                    setPlayerCountDropdownOpen(false);
                                  }}
                                  className={`flex items-center px-4 py-1 rounded-lg transition-all duration-300 ${
                                    isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-50'
                                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                >
                                  <span className="font-medium mr-2 truncate max-w-[120px]">
                                    {nflTeamStats.find(stat => stat.key === selectedStat)?.label || ''}
                                  </span>
                                  <ChevronDown size={16} />
                                </button>
                                {statsDropdownOpen && (
                                  <div 
                                    className={`absolute left-0 mt-2 py-2 w-56 rounded-md shadow-lg max-h-80 overflow-y-auto ${
                                      isDark ? 'bg-gray-800' : 'bg-white'
                                    } ring-1 ring-black ring-opacity-5 z-10`}
                                  >
                                    {/* Offense */}
                                    <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                      <h3 className={`text-xs font-semibold uppercase tracking-wide ${
                                        isDark ? 'text-gray-400' : 'text-gray-500'
                                      }`}>
                                        Offense
                                      </h3>
                                    </div>
                                    {nflTeamStats.filter(stat => stat.category === 'Offense').map((stat) => (
                                        <button
                                          key={stat.key}
                                          className={`block w-full text-left px-4 py-2 text-sm ${
                                            selectedStat === stat.key
                                              ? isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600'
                                              : isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                                          }`}
                                          onClick={() => handleStatSelect(stat.key)}
                                        >
                                          {stat.label}
                                        </button>
                                      ))}
                                    
                                    {/* Defense */}
                                    <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                      <h3 className={`text-xs font-semibold uppercase tracking-wide ${
                                        isDark ? 'text-gray-400' : 'text-gray-500'
                                      }`}>
                                        Defense
                                      </h3>
                                    </div>
                                    {nflTeamStats.filter(stat => stat.category === 'Defense').map((stat) => (
                                        <button
                                          key={stat.key}
                                          className={`block w-full text-left px-4 py-2 text-sm ${
                                            selectedStat === stat.key
                                              ? isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600'
                                              : isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                                          }`}
                                          onClick={() => handleStatSelect(stat.key)}
                                        >
                                          {stat.label}
                                        </button>
                                      ))}
                                    
                                    {/* Special Teams */}
                                    <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                      <h3 className={`text-xs font-semibold uppercase tracking-wide ${
                                        isDark ? 'text-gray-400' : 'text-gray-500'
                                      }`}>
                                        Special Teams
                                      </h3>
                                    </div>
                                    {nflTeamStats.filter(stat => stat.category === 'Special Teams').map((stat) => (
                                        <button
                                          key={stat.key}
                                          className={`block w-full text-left px-4 py-2 text-sm ${
                                            selectedStat === stat.key
                                              ? isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600'
                                              : isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                                          }`}
                                          onClick={() => handleStatSelect(stat.key)}
                                        >
                                          {stat.label}
                                        </button>
                                      ))}
                                    
                                    {/* Penalties */}
                                    <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                      <h3 className={`text-xs font-semibold uppercase tracking-wide ${
                                        isDark ? 'text-gray-400' : 'text-gray-500'
                                      }`}>
                                        Penalties
                                      </h3>
                                    </div>
                                    {nflTeamStats.filter(stat => stat.category === 'Penalties').map((stat) => (
                                      <button
                                        key={stat.key}
                                        className={`block w-full text-left px-4 py-2 text-sm ${
                                          selectedStat === stat.key
                                            ? isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600'
                                            : isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                        onClick={() => handleStatSelect(stat.key)}
                                      >
                                        <span className="truncate whitespace-nowrap w-full max-w-[200px]">{stat.label}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                            {/* NHL Team stats dropdown */}
                            {selectedLeague === 'NHL' && navContext === 'teams' && (
                              <div className="relative dropdown-container" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => {
                                    setStatsDropdownOpen(!statsDropdownOpen);
                                    setPlayerCountDropdownOpen(false);
                                  }}
                                  className={`flex items-center px-4 py-1 rounded-lg transition-all duration-300 ${
                                    isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-50'
                                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                >
                                  <span className="font-medium mr-2 truncate max-w-[120px]">
                                    {nhlTeamStats.find(stat => stat.key === selectedStat)?.label || 'Select Stat'}
                                  </span>
                                  <ChevronDown size={16} />
                                </button>
                                {statsDropdownOpen && (
                                  <div 
                                    className={`absolute left-0 mt-2 py-2 w-48 rounded-md shadow-lg max-h-60 overflow-y-auto ${
                                      isDark ? 'bg-gray-800' : 'bg-white'
                                    } ring-1 ring-black ring-opacity-5 z-10`}
                                  >
                                    {nhlTeamStats.map((stat) => (
                                      <button
                                        key={stat.key}
                                        className={`block w-full text-left px-4 py-2 text-sm ${
                                          selectedStat === stat.key
                                            ? isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600'
                                            : isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                        onClick={() => handleStatSelect(stat.key)}
                                      >
                                        <span className="truncate whitespace-nowrap w-full max-w-[200px]">{stat.label}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                            {/* Player count dropdown (only for Players view) */}
                            {showPlayerCountDropdown && (
                              <div className="relative dropdown-container" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => {
                                    setPlayerCountDropdownOpen(!playerCountDropdownOpen);
                                    setStatsDropdownOpen(false);
                                  }}
                                  className={`flex items-center px-4 py-1 rounded-lg transition-all duration-300 ${
                                    isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-50'
                                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                >
                                  <Users className="mr-1" size={16} />
                                  <span className="font-medium mr-2 truncate">
                                    {playerCounts.find(p => p.value === playerCount)?.label || 'All Players'}
                                  </span>
                                  <ChevronDown size={16} />
                                </button>
                                {playerCountDropdownOpen && (
                                  <div 
                                    className={`absolute left-0 mt-2 py-2 w-40 rounded-md shadow-lg ${
                                      isDark ? 'bg-gray-800' : 'bg-white'
                                    } ring-1 ring-black ring-opacity-5 z-10`}
                                  >
                                    {playerCounts.map((option) => (
                                      <button
                                        key={option.value}
                                        className={`block w-full text-left px-4 py-2 text-sm ${
                                          playerCount === option.value
                                            ? isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600'
                                            : isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                        onClick={() => handlePlayerCountSelect(option.value)}
                                      >
                                        {option.label}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Search and theme toggle */}
                <div className="flex items-center gap-4">
                  <div className="relative w-48 flex items-center">
                    <Search className="absolute left-2 text-gray-400 pointer-events-none" size={16} />
                    <input
                      type="text"
                      placeholder="Search..."
                      className={`w-full pl-8 pr-3 py-1 rounded-full ${
                        isDark 
                          ? 'bg-gray-700 text-white placeholder-gray-400' 
                          : 'bg-white text-gray-800 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`p-1 rounded-full ${
                      isDark 
                        ? 'text-gray-400 hover:bg-gray-700' 
                        : 'text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 z-50 mt-2 px-4 py-4 rounded-b-xl shadow-lg"
              style={{
                background: isDark 
                  ? 'linear-gradient(to bottom, rgba(17, 24, 39, 0.95), rgba(17, 24, 39, 0.98))'
                  : 'linear-gradient(to bottom, rgba(240, 236, 227, 0.95), rgba(240, 236, 227, 0.98))',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                borderBottom: isDark 
                  ? '1px solid rgba(75, 85, 99, 0.2)'
                  : '1px solid rgba(229, 231, 235, 0.5)'
              }}>
              {/* Mobile Search */}
              <div className="mb-4">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search..."
                    className={`w-full pl-10 pr-3 py-2 rounded-lg ${
                      isDark 
                        ? 'bg-gray-700 text-white placeholder-gray-400' 
                        : 'bg-white text-gray-800 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>

              {/* Mobile League Selection */}
              <div className="space-y-2">
                {leagues.map((league) => (
                  <button
                    key={league.name}
                    onClick={() => {
                      handleLeagueClick(league.name);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full px-4 py-2 rounded-lg transition-all duration-300 ${
                      selectedLeague === league.name 
                        ? 'bg-blue-500 text-white' 
                        : `${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-50'}`
                    }`}
                  >
                    <span className="font-medium">{league.name}</span>
                  </button>
                ))}
              </div>

              {/* NBA Players/Teams toggle for mobile */}
              {selectedLeague === 'NBA' && (
                <div className="flex items-center gap-2 mt-4 mb-2 justify-center">
                  <button
                    onClick={() => onViewModeChange('Players')}
                    className={`px-3 py-1 rounded-lg font-medium transition-all duration-200 ${
                      viewMode === 'Players'
                        ? isDark ? 'bg-blue-300 text-blue-900' : 'bg-blue-100 text-blue-700'
                        : isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    Players
                  </button>
                  <button
                    onClick={() => onViewModeChange('Teams')}
                    className={`px-3 py-1 rounded-lg font-medium transition-all duration-200 ${
                      viewMode === 'Teams'
                        ? isDark ? 'bg-blue-300 text-blue-900' : 'bg-blue-100 text-blue-700'
                        : isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    Teams
                  </button>
                </div>
              )}

              {/* WNBA Players/Teams toggle for mobile */}
              {selectedLeague === 'WNBA' && (
                <div className="flex items-center gap-2 mt-4 mb-2 justify-center">
                  <button
                    onClick={() => onViewModeChange('Players')}
                    className={`px-3 py-1 rounded-lg font-medium transition-all duration-200 ${
                      viewMode === 'Players'
                        ? isDark ? 'bg-blue-300 text-blue-900' : 'bg-blue-100 text-blue-700'
                        : isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    Players
                  </button>
                  <button
                    onClick={() => onViewModeChange('Teams')}
                    className={`px-3 py-1 rounded-lg font-medium transition-all duration-200 ${
                      viewMode === 'Teams'
                        ? isDark ? 'bg-blue-300 text-blue-900' : 'bg-blue-100 text-blue-700'
                        : isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    Teams
                  </button>
                </div>
              )}

              {/* MLB Players/Teams toggle for mobile */}
              {selectedLeague === 'MLB' && (
                <div className="flex items-center gap-2 mt-4 mb-2 justify-center">
                  <button
                    onClick={() => onViewModeChange('Players')}
                    className={`px-3 py-1 rounded-lg font-medium transition-all duration-200 ${
                      viewMode === 'Players'
                        ? isDark ? 'bg-blue-300 text-blue-900' : 'bg-blue-100 text-blue-700'
                        : isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    Players
                  </button>
                  <button
                    onClick={() => onViewModeChange('Teams')}
                    className={`px-3 py-1 rounded-lg font-medium transition-all duration-200 ${
                      viewMode === 'Teams'
                        ? isDark ? 'bg-blue-300 text-blue-900' : 'bg-blue-100 text-blue-700'
                        : isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    Teams
                  </button>
                </div>
              )}

              {/* NFL Players/Teams toggle for mobile */}
              {selectedLeague === 'NFL' && (
                <div className="flex items-center gap-2 mt-4 mb-2 justify-center">
                  <button
                    onClick={() => onViewModeChange('Players')}
                    className={`px-3 py-1 rounded-lg font-medium transition-all duration-200 ${
                      viewMode === 'Players'
                        ? isDark ? 'bg-blue-300 text-blue-900' : 'bg-blue-100 text-blue-700'
                        : isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    Players
                  </button>
                  <button
                    onClick={() => onViewModeChange('Teams')}
                    className={`px-3 py-1 rounded-lg font-medium transition-all duration-200 ${
                      viewMode === 'Teams'
                        ? isDark ? 'bg-blue-300 text-blue-900' : 'bg-blue-100 text-blue-700'
                        : isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    Teams
                  </button>
                </div>
              )}

              {/* NHL Players/Teams toggle for mobile */}
              {selectedLeague === 'NHL' && (
                <div className="flex items-center gap-2 mt-4 mb-2 justify-center">
                  <button
                    onClick={() => onViewModeChange('Players')}
                    className={`px-3 py-1 rounded-lg font-medium transition-all duration-200 ${
                      viewMode === 'Players'
                        ? isDark ? 'bg-blue-300 text-blue-900' : 'bg-blue-100 text-blue-700'
                        : isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    Players
                  </button>
                  <button
                    onClick={() => onViewModeChange('Teams')}
                    className={`px-3 py-1 rounded-lg font-medium transition-all duration-200 ${
                      viewMode === 'Teams'
                        ? isDark ? 'bg-blue-300 text-blue-900' : 'bg-blue-100 text-blue-700'
                        : isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    Teams
                  </button>
                </div>
              )}

              {/* Mobile Stats and Player Count */}
              {selectedLeague && (
                <div className="mt-4 space-y-2">
                  <select
                    value={selectedStat}
                    onChange={(e) => handleStatSelect(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg ${
                      isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'
                    }`}
                  >
                    {statList.map((stat) => (
                        <option key={stat.key} value={stat.key}>
                          {stat.label}
                        </option>
                    ))}
                  </select>

                  {showPlayerCountDropdown && (
                    <select
                      value={playerCount}
                      onChange={(e) => handlePlayerCountSelect(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg ${
                        isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'
                      }`}
                    >
                      {playerCounts.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Mobile Theme Toggle */}
              <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Theme
                  </span>
                  <button
                    onClick={toggleTheme}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Live View Component */}
      <LiveView 
        isDark={isDark}
        selectedLeague={selectedLeague}
        showLiveInNav={showLiveInNav}
        onToggleLiveInNav={setShowLiveInNav}
        liveGames={liveGames}
      />

      {/* Coming Soon Modal */}
      <ComingSoonModal
        isOpen={showComingSoon}
        onClose={() => setShowComingSoon(false)}
        leagueName={comingSoonLeague}
        isDark={isDark}
      />
    </div>
  );
};

export default Navbar;