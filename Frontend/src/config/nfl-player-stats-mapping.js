/**
 * NFL Player Stats Mapping Configuration
 * 
 * This file maps frontend dropdown options to backend database field names.
 * Each stat includes: displayName, backendField, abbreviation, and category.
 */

export const NFL_PLAYER_STATS = {
  // PASSING STATS (QB)
  passing: {
    completions: {
      displayName: 'Completions',
      backendField: 'passCompletions',
      abbreviation: 'CMP',
      category: 'Passing'
    },
    attempts: {
      displayName: 'Attempts',
      backendField: 'passAttempts',
      abbreviation: 'ATT',
      category: 'Passing'
    },
    completionPercentage: {
      displayName: 'Completion %',
      backendField: 'completionPercentage',
      abbreviation: 'PCT',
      category: 'Passing'
    },
    passingYards: {
      displayName: 'Passing Yards',
      backendField: 'passYards',
      abbreviation: 'YDS',
      category: 'Passing'
    },
    yardsPerAttempt: {
      displayName: 'Yards per Attempt',
      backendField: 'yardsPerPassAttempt',
      abbreviation: 'YPA',
      category: 'Passing'
    },
    passingTouchdowns: {
      displayName: 'Touchdowns',
      backendField: 'passTouchdowns',
      abbreviation: 'TD',
      category: 'Passing'
    },
    interceptions: {
      displayName: 'Interceptions',
      backendField: 'interceptions',
      abbreviation: 'INT',
      category: 'Passing'
    },
    longestPass: {
      displayName: 'Longest Pass',
      backendField: 'longestPass',
      abbreviation: 'LNG',
      category: 'Passing'
    },
    sacksTaken: {
      displayName: 'Sacks Taken',
      backendField: 'sacksTaken',
      abbreviation: 'SK',
      category: 'Passing'
    },
    sackYards: {
      displayName: 'Sack Yards',
      backendField: 'sackYards',
      abbreviation: 'SYD',
      category: 'Passing'
    },
    passerRating: {
      displayName: 'Passer Rating',
      backendField: 'passerRating',
      abbreviation: 'RATE',
      category: 'Passing'
    },
    qbr: {
      displayName: 'QBR',
      backendField: 'qbr',
      abbreviation: 'QBR',
      category: 'Passing'
    }
  },

  // RUSHING STATS (RB/QB/WR)
  rushing: {
    rushingAttempts: {
      displayName: 'Attempts',
      backendField: 'rushingAttempts',
      abbreviation: 'ATT',
      category: 'Rushing'
    },
    rushingYards: {
      displayName: 'Yards',
      backendField: 'rushingYards',
      abbreviation: 'YDS',
      category: 'Rushing'
    },
    yardsPerRush: {
      displayName: 'Yards per Carry',
      backendField: 'yardsPerRushAttempt',
      abbreviation: 'AVG',
      category: 'Rushing'
    },
    longestRush: {
      displayName: 'Longest Run',
      backendField: 'longestRush',
      abbreviation: 'LNG',
      category: 'Rushing'
    },
    rushTouchdowns: {
      displayName: 'Touchdowns',
      backendField: 'rushTouchdowns',
      abbreviation: 'TD',
      category: 'Rushing'
    },
    rushingFumbles: {
      displayName: 'Fumbles',
      backendField: 'rushingFumbles',
      abbreviation: 'FUM',
      category: 'Rushing'
    },
    rushingFumblesLost: {
      displayName: 'Fumbles Lost',
      backendField: 'rushingFumblesLost',
      abbreviation: 'LST',
      category: 'Rushing'
    }
  },

  // RECEIVING STATS (WR/TE/RB)
  receiving: {
    receivingTargets: {
      displayName: 'Targets',
      backendField: 'receivingTargets',
      abbreviation: 'TGT',
      category: 'Receiving'
    },
    receptions: {
      displayName: 'Receptions',
      backendField: 'receptions',
      abbreviation: 'REC',
      category: 'Receiving'
    },
    catchPercentage: {
      displayName: 'Catch %',
      backendField: 'catchPercentage',
      abbreviation: 'CATCH%',
      category: 'Receiving'
    },
    receivingYards: {
      displayName: 'Yards',
      backendField: 'receivingYards',
      abbreviation: 'YDS',
      category: 'Receiving'
    },
    yardsPerReception: {
      displayName: 'Avg per Reception',
      backendField: 'yardsPerReception',
      abbreviation: 'AVG',
      category: 'Receiving'
    },
    longestReception: {
      displayName: 'Longest Reception',
      backendField: 'longestReception',
      abbreviation: 'LNG',
      category: 'Receiving'
    },
    receivingTouchdowns: {
      displayName: 'Touchdowns',
      backendField: 'receivingTouchdowns',
      abbreviation: 'TD',
      category: 'Receiving'
    },
    receivingFumbles: {
      displayName: 'Fumbles',
      backendField: 'receivingFumbles',
      abbreviation: 'FUM',
      category: 'Receiving'
    },
    receivingFumblesLost: {
      displayName: 'Fumbles Lost',
      backendField: 'receivingFumblesLost',
      abbreviation: 'LST',
      category: 'Receiving'
    },
    receivingYardsPerGame: {
      displayName: 'Yards per Game',
      backendField: 'receivingYardsPerGame',
      abbreviation: 'YPG',
      category: 'Receiving'
    }
  },

  // DEFENSE STATS (Individual)
  defense: {
    totalTackles: {
      displayName: 'Total Tackles',
      backendField: 'totalTackles',
      abbreviation: 'TOT',
      category: 'Defense'
    },
    soloTackles: {
      displayName: 'Solo',
      backendField: 'soloTackles',
      abbreviation: 'SOLO',
      category: 'Defense'
    },
    assistedTackles: {
      displayName: 'Assisted',
      backendField: 'assistedTackles',
      abbreviation: 'AST',
      category: 'Defense'
    },
    sacks: {
      displayName: 'Sacks',
      backendField: 'sacks',
      abbreviation: 'SACK',
      category: 'Defense'
    },
    defensiveInterceptions: {
      displayName: 'Interceptions',
      backendField: 'defensiveInterceptions',
      abbreviation: 'INT',
      category: 'Defense'
    },
    passesDefended: {
      displayName: 'Passes Defended',
      backendField: 'passesDefended',
      abbreviation: 'PD',
      category: 'Defense'
    },
    forcedFumbles: {
      displayName: 'Forced Fumbles',
      backendField: 'forcedFumbles',
      abbreviation: 'FF',
      category: 'Defense'
    },
    fumbleRecoveries: {
      displayName: 'Fumble Recoveries',
      backendField: 'fumbleRecoveries',
      abbreviation: 'FR',
      category: 'Defense'
    },
    interceptionTouchdowns: {
      displayName: 'Defensive TDs',
      backendField: 'interceptionTouchdowns',
      abbreviation: 'TD',
      category: 'Defense'
    },
    safeties: {
      displayName: 'Safeties',
      backendField: 'safeties',
      abbreviation: 'SFTY',
      category: 'Defense'
    },
    kicksBlocked: {
      displayName: 'Blocked Kicks',
      backendField: 'kicksBlocked',
      abbreviation: 'BK',
      category: 'Defense'
    }
  },

  // KICKING STATS
  kicking: {
    fieldGoalsMade: {
      displayName: 'Field Goals Made',
      backendField: 'fieldGoalsMade',
      abbreviation: 'FGM',
      category: 'Kicking'
    },
    fieldGoalAttempts: {
      displayName: 'Field Goals Attempted',
      backendField: 'fieldGoalAttempts',
      abbreviation: 'FGA',
      category: 'Kicking'
    },
    fieldGoalPercentage: {
      displayName: 'FG %',
      backendField: 'fieldGoalPercentage',
      abbreviation: 'FG%',
      category: 'Kicking'
    },
    longFieldGoalMade: {
      displayName: 'Longest FG',
      backendField: 'longFieldGoalMade',
      abbreviation: 'LNG',
      category: 'Kicking'
    },
    extraPointsMade: {
      displayName: 'Extra Points Made',
      backendField: 'extraPointsMade',
      abbreviation: 'XPM',
      category: 'Kicking'
    },
    extraPointAttempts: {
      displayName: 'Extra Points Attempted',
      backendField: 'extraPointAttempts',
      abbreviation: 'XPA',
      category: 'Kicking'
    },
    extraPointPercentage: {
      displayName: 'Extra Point %',
      backendField: 'extraPointPercentage',
      abbreviation: 'XP%',
      category: 'Kicking'
    },
    totalKickingPoints: {
      displayName: 'Points',
      backendField: 'totalKickingPoints',
      abbreviation: 'PTS',
      category: 'Kicking'
    }
  },

  // PUNTING STATS
  punting: {
    punts: {
      displayName: 'Punts',
      backendField: 'punts',
      abbreviation: 'PUNTS',
      category: 'Punting'
    },
    puntYards: {
      displayName: 'Yards',
      backendField: 'puntYards',
      abbreviation: 'YDS',
      category: 'Punting'
    },
    grossAvgPuntYards: {
      displayName: 'Avg',
      backendField: 'grossAvgPuntYards',
      abbreviation: 'AVG',
      category: 'Punting'
    },
    netAvgPuntYards: {
      displayName: 'Net Avg',
      backendField: 'netAvgPuntYards',
      abbreviation: 'NET',
      category: 'Punting'
    },
    puntsInside20: {
      displayName: 'Inside 20',
      backendField: 'puntsInside20',
      abbreviation: 'IN20',
      category: 'Punting'
    },
    puntTouchbacks: {
      displayName: 'Touchbacks',
      backendField: 'puntTouchbacks',
      abbreviation: 'TB',
      category: 'Punting'
    },
    longestPunt: {
      displayName: 'Longest Punt',
      backendField: 'longestPunt',
      abbreviation: 'LNG',
      category: 'Punting'
    },
    blockedPunts: {
      displayName: 'Blocked Punts',
      backendField: 'blockedPunts',
      abbreviation: 'BP',
      category: 'Punting'
    }
  },

  // KICK RETURNS
  kickReturns: {
    kickReturnAttempts: {
      displayName: 'Kick Return Attempts',
      backendField: 'kickReturnAttempts',
      abbreviation: 'ATT',
      category: 'Returns'
    },
    kickReturnYards: {
      displayName: 'Kick Return Yards',
      backendField: 'kickReturnYards',
      abbreviation: 'YDS',
      category: 'Returns'
    },
    kickReturnAverage: {
      displayName: 'Kick Return Avg',
      backendField: 'kickReturnAverage',
      abbreviation: 'AVG',
      category: 'Returns'
    },
    kickReturnTouchdowns: {
      displayName: 'Kick Return TDs',
      backendField: 'kickReturnTouchdowns',
      abbreviation: 'TD',
      category: 'Returns'
    },
    longestKickReturn: {
      displayName: 'Longest Kick Return',
      backendField: 'longestKickReturn',
      abbreviation: 'LNG',
      category: 'Returns'
    }
  },

  // PUNT RETURNS
  puntReturns: {
    puntReturnAttempts: {
      displayName: 'Punt Return Attempts',
      backendField: 'puntReturnAttempts',
      abbreviation: 'ATT',
      category: 'Returns'
    },
    puntReturnYards: {
      displayName: 'Punt Return Yards',
      backendField: 'puntReturnYards',
      abbreviation: 'YDS',
      category: 'Returns'
    },
    puntReturnAverage: {
      displayName: 'Punt Return Avg',
      backendField: 'puntReturnAverage',
      abbreviation: 'AVG',
      category: 'Returns'
    },
    puntReturnTouchdowns: {
      displayName: 'Punt Return TDs',
      backendField: 'puntReturnTouchdowns',
      abbreviation: 'TD',
      category: 'Returns'
    },
    longestPuntReturn: {
      displayName: 'Longest Punt Return',
      backendField: 'longestPuntReturn',
      abbreviation: 'LNG',
      category: 'Returns'
    }
  }
};

// Helper function to get all stats as a flat array for dropdown
export const getAllNFLPlayerStats = () => {
  const allStats = [];
  
  Object.values(NFL_PLAYER_STATS).forEach(category => {
    Object.values(category).forEach(stat => {
      allStats.push({
        value: stat.backendField,
        label: stat.displayName,
        abbreviation: stat.abbreviation,
        category: stat.category
      });
    });
  });
  
  return allStats;
};

// Helper function to get stats by category
export const getNFLPlayerStatsByCategory = (category) => {
  return NFL_PLAYER_STATS[category] || {};
};

export default NFL_PLAYER_STATS;
