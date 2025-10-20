const axios = require('axios');
const NFLPlayer = require('../models/nfl-player.model');

/**
 * NFL Player Stats Service - 2025 Season ONLY
 * 
 * Handles extraction of individual player statistics from a single ESPN API endpoint for the 2025 NFL regular season.
 * Endpoint: https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/2025/types/2/athletes/{athleteId}/statistics/0
 * Filters to 2025 season data (seasontype=2) and maps stats to the NFLPlayer schema based on provided ESPN stat breakdown.
 * Handles combined fields (e.g., 'fieldGoalsMade-fieldGoalAttempts') and derives fields (e.g., YPG, catch %).
 * Ensures proper data types: integers for counts (e.g., completions), floats for percentages/averages (e.g., completionPct).
 * 
 * Supported Categories:
 * - Passing: completions, passingAttempts, completionPct, passingYards, etc.
 * - Rushing: rushingAttempts, rushingYards, yardsPerRushAttempt, etc.
 * - Receiving: receptions, receivingTargets, receivingYards, etc.
 * - Defense: totalTackles, soloTackles, sacks, etc.
 * - Kicking: fieldGoalsMade, fieldGoalPercentage, extraPointsMade, etc.
 * - Punting: punts, puntYards, grossAvgPuntYards, etc.
 * - Returns: kickReturnAttempts, puntReturnYards, etc.
 */

async function processActiveNflPlayersWithStats(db) {
  const collection = db.collection('nflplayers');

  try {
    const teamsRes = await axios.get('https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams');
    const teams = teamsRes.data.sports[0].leagues[0].teams;

    for (const team of teams) {
      const teamId = team.team.id;
      const rosterUrl = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${teamId}/roster`;

      try {
        const rosterRes = await axios.get(rosterUrl);
        const players = rosterRes.data.athletes.flatMap(group => group.items);

        for (const player of players) {
          const athleteId = player.id;

          // Get team colors from nflteams collection
          let teamColor = null;
          let teamAlternateColor = null;
          let teamDisplayName = null;
          try {
            const teamDoc = await db.collection('nflteams').findOne({ teamId });
            if (teamDoc) {
              teamColor = teamDoc.color;
              teamAlternateColor = teamDoc.alternateColor;
              teamDisplayName = teamDoc.displayName;
              console.log(`Found team colors for ${team.team.name}: ${teamColor}, ${teamAlternateColor}`);
            } else {
              console.log(`No team document found for team ID: ${teamId}`);
            }
          } catch (err) {
            console.log(`Could not fetch team colors for team ${teamId}: ${err.message}`);
          }

          const playerDoc = {
            playerId: athleteId,
            uid: player.uid || athleteId,
            guid: player.guid,
            type: player.type,
            firstName: player.firstName || '',
            lastName: player.lastName || '',
            displayName: player.displayName,
            shortName: player.shortName,
            weight: player.weight,
            height: player.height,
            age: player.age,
            jersey: player.jersey || null,
            position: player.position?.abbreviation || null,
            college: player.college?.name || null,
            teamId: teamId,
            teamName: team.team.name,
            teamAbbreviation: team.team.abbreviation,
            teamDisplayName: teamDisplayName,
            teamColor: teamColor,
            teamAlternateColor: teamAlternateColor,
            headshot: player.headshot?.href || null,
            // Initialize stats
            gamesPlayed: 0,
            fumbles: 0,
            fumblesLost: 0,
            fumblesTouchdowns: 0,
            offensiveTwoPtReturns: 0,
            offensiveFumblesTouchdowns: 0,
            defensiveFumblesTouchdowns: 0,
            passCompletions: 0,
            passAttempts: 0,
            completionPercentage: 0,
            passYards: 0,
            yardsPerPassAttempt: 0,
            passTouchdowns: 0,
            interceptions: 0,
            longestPass: 0,
            sacksTaken: 0,
            sackYards: 0,
            passerRating: 0,
            qbr: 0,
            espnQBRating: 0,
            interceptionPct: 0,
            netPassingYards: 0,
            netPassingYardsPerGame: 0,
            netTotalYards: 0,
            netYardsPerGame: 0,
            passingBigPlays: 0,
            passingFirstDowns: 0,
            passingFumbles: 0,
            passingFumblesLost: 0,
            passingTouchdownPct: 0,
            passingYardsAfterCatch: 0,
            passingYardsAtCatch: 0,
            passingYardsPerGame: 0,
            netPassingAttempts: 0,
            teamGamesPlayed: 0,
            totalOffensivePlays: 0,
            totalPointsPerGame: 0,
            totalYards: 0,
            totalYardsFromScrimmage: 0,
            twoPointPassConvs: 0,
            twoPtPass: 0,
            twoPtPassAttempts: 0,
            yardsFromScrimmagePerGame: 0,
            yardsPerCompletion: 0,
            yardsPerGame: 0,
            netYardsPerPassAttempt: 0,
            adjQBR: 0,
            quarterbackRating: 0,
            rushingAttempts: 0,
            rushingYards: 0,
            yardsPerRushAttempt: 0,
            rushTouchdowns: 0,
            longestRush: 0,
            rushingFirstDowns: 0,
            rushingFumbles: 0,
            rushingFumblesLost: 0,
            espnRBRating: 0,
            rushingBigPlays: 0,
            rushingYardsPerGame: 0,
            twoPointRushConvs: 0,
            twoPtRush: 0,
            twoPtRushAttempts: 0,
            receptions: 0,
            receivingTargets: 0,
            receivingYards: 0,
            yardsPerReception: 0,
            receivingYardsPerGame: 0,
            receivingTouchdowns: 0,
            longestReception: 0,
            receivingFirstDowns: 0,
            receivingFumbles: 0,
            receivingFumblesLost: 0,
            catchPercentage: 0,
            espnWRRating: 0,
            receivingBigPlays: 0,
            receivingYardsAfterCatch: 0,
            receivingYardsAtCatch: 0,
            twoPointRecConvs: 0,
            twoPtReception: 0,
            twoPtReceptionAttempts: 0,
            totalTackles: 0,
            soloTackles: 0,
            assistedTackles: 0,
            sacks: 0,
            forcedFumbles: 0,
            fumbleRecoveries: 0,
            fumbleRecoveryYards: 0,
            defensiveInterceptions: 0,
            interceptionYards: 0,
            avgInterceptionYards: 0,
            interceptionTouchdowns: 0,
            longestInterception: 0,
            passesDefended: 0,
            stuffs: 0,
            stuffYards: 0,
            kicksBlocked: 0,
            safeties: 0,
            passingTouchdowns: 0,
            rushingTouchdowns: 0,
            receivingTouchdowns: 0,
            returnTouchdowns: 0,
            totalTouchdowns: 0,
            totalTwoPointConvs: 0,
            kickExtraPoints: 0,
            fieldGoals: 0,
            totalPoints: 0,
            defensivePoints: 0,
            kickExtraPointsMade: 0,
            miscPoints: 0,
            twoPointPassConvs: 0,
            twoPointRecConvs: 0,
            twoPointRushConvs: 0,
            onePtSafetiesMade: 0,
            fieldGoalsMade: 0,
            fieldGoalAttempts: 0,
            fieldGoalPercentage: 0,
            fieldGoalsMade1_19: 0,
            fieldGoalsMade20_29: 0,
            fieldGoalsMade30_39: 0,
            fieldGoalsMade40_49: 0,
            fieldGoalsMade50: 0,
            longFieldGoalMade: 0,
            extraPointsMade: 0,
            extraPointAttempts: 0,
            extraPointPercentage: 0,
            totalKickingPoints: 0,
            punts: 0,
            puntYards: 0,
            grossAvgPuntYards: 0,
            netAvgPuntYards: 0,
            puntsInside20: 0,
            puntTouchbacks: 0,
            longestPunt: 0,
            blockedPunts: 0,
            kickReturnAttempts: 0,
            kickReturnYards: 0,
            kickReturnAverage: 0,
            kickReturnTouchdowns: 0,
            longestKickReturn: 0,
            kickReturnFairCatches: 0,
            puntReturnAttempts: 0,
            puntReturnYards: 0,
            puntReturnAverage: 0,
            puntReturnTouchdowns: 0,
            longestPuntReturn: 0,
            puntReturnFairCatches: 0,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          // Handle headshot
          if (player.headshot && player.headshot.href) {
            playerDoc.headshot = player.headshot.href;
          } else if (player.headshot && typeof player.headshot === 'string') {
            playerDoc.headshot = player.headshot;
          }

          // Ensure team colors have hex prefix
          if (teamColor && !teamColor.startsWith('#')) {
            playerDoc.teamColor = `#${teamColor}`;
          }
          if (teamAlternateColor && !teamAlternateColor.startsWith('#')) {
            playerDoc.teamAlternateColor = `#${teamAlternateColor}`;
          }

          let statsFound = false;

          try {
            const endpoint = `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/2025/types/2/athletes/${athleteId}/statistics/0`;
            const statsRes = await axios.get(endpoint);
            const statsData = statsRes.data;

            console.log(`✅ Found stats for ${player.displayName} (${player.position?.abbreviation || 'Unknown'}) at ${endpoint}`);

            let extractedStats = {};

            // Handle actual API structure: splits.categories array
            if (statsData.splits && statsData.splits.categories && Array.isArray(statsData.splits.categories)) {
              statsData.splits.categories.forEach(category => {
                console.log(`📊 Processing category: ${category.name}`);
                if (category.stats && Array.isArray(category.stats)) {
                  category.stats.forEach(stat => {
                    // Handle category-specific field names to avoid conflicts
                    let fieldName = stat.name;
                    
                    // Defensive stats mapping
                    if (category.name === 'defensive' && stat.name === 'sacks') {
                      fieldName = 'defensiveSacks'; // Distinguish from offensive sacks taken
                    }
                    if (category.name === 'defensive' && stat.name === 'sackYards') {
                      fieldName = 'defensiveSackYards'; // Distinguish from offensive sack yards lost
                    }
                    if (category.name === 'defensive' && stat.name === 'assistTackles') {
                      fieldName = 'assistedTackles'; // Map to model field name
                    }
                    if (category.name === 'defensive' && stat.name === 'fumblesForced') {
                      fieldName = 'forcedFumbles'; // Map to model field name
                    }
                    if (category.name === 'defensive' && stat.name === 'fumblesRecovered') {
                      fieldName = 'fumbleRecoveries'; // Map to model field name
                    }
                    if (category.name === 'defensive' && stat.name === 'fumblesRecoveredYards') {
                      fieldName = 'fumbleRecoveryYards'; // Map to model field name
                    }
                    if (category.name === 'defensive' && stat.name === 'longInterception') {
                      fieldName = 'longestInterception'; // Map to model field name
                    }
                    if (category.name === 'defensive' && stat.name === 'passesBattedDown') {
                      fieldName = 'passesBattedDown'; // Keep as is
                    }
                    if (category.name === 'defensive' && stat.name === 'QBHits') {
                      fieldName = 'qbHits'; // Map to model field name
                    }
                    if (category.name === 'defensive' && stat.name === 'twoPtReturns') {
                      fieldName = 'twoPointReturns'; // Map to model field name
                    }
                    if (category.name === 'defensive' && stat.name === 'blockedFieldGoalTouchdowns') {
                      fieldName = 'blockedFieldGoalTouchdowns'; // Keep as is
                    }
                    if (category.name === 'defensive' && stat.name === 'blockedPuntTouchdowns') {
                      fieldName = 'blockedPuntTouchdowns'; // Keep as is
                    }
                    if (category.name === 'defensive' && stat.name === 'miscTouchdowns') {
                      fieldName = 'miscTouchdowns'; // Keep as is
                    }
                    if (category.name === 'defensive' && stat.name === 'tacklesForLoss') {
                      fieldName = 'tacklesForLoss'; // Keep as is
                    }
                    if (category.name === 'defensive' && stat.name === 'tacklesYardsLost') {
                      fieldName = 'tacklesYardsLost'; // Keep as is
                    }
                    if (category.name === 'defensive' && stat.name === 'yardsAllowed') {
                      fieldName = 'yardsAllowed'; // Keep as is
                    }
                    if (category.name === 'defensive' && stat.name === 'pointsAllowed') {
                      fieldName = 'pointsAllowed'; // Keep as is
                    }
                    if (category.name === 'defensive' && stat.name === 'onePtSafetiesMade') {
                      fieldName = 'onePtSafetiesMade'; // Keep as is
                    }
                    if (category.name === 'defensive' && stat.name === 'missedFieldGoalReturnTd') {
                      fieldName = 'missedFieldGoalReturnTd'; // Keep as is
                    }
                    if (category.name === 'defensive' && stat.name === 'blockedPuntEzRecTd') {
                      fieldName = 'blockedPuntEzRecTd'; // Keep as is
                    }
                    
                    // Offensive stats mapping
                    if (category.name === 'passing' && stat.name === 'sacks') {
                      fieldName = 'sacksTaken'; // Sacks taken by QB
                    }
                    if (category.name === 'passing' && stat.name === 'sackYardsLost') {
                      fieldName = 'sackYardsLost'; // Sack yards lost by QB
                    }
                    if (category.name === 'passing' && stat.name === 'completions') {
                      fieldName = 'passCompletions'; // Map to model field name
                    }
                    if (category.name === 'passing' && stat.name === 'passingAttempts') {
                      fieldName = 'passAttempts'; // Map to model field name
                    }
                    if (category.name === 'passing' && stat.name === 'completionPct') {
                      fieldName = 'completionPercentage'; // Map to model field name
                    }
                    if (category.name === 'passing' && stat.name === 'passingYards') {
                      fieldName = 'passYards'; // Map to model field name
                    }
                    if (category.name === 'passing' && stat.name === 'yardsPerPassAttempt') {
                      fieldName = 'yardsPerPassAttempt'; // Keep as is
                    }
                    if (category.name === 'passing' && stat.name === 'passingTouchdowns') {
                      fieldName = 'passTouchdowns'; // Map to model field name
                    }
                    if (category.name === 'passing' && stat.name === 'longPassing') {
                      fieldName = 'longestPass'; // Map to model field name
                    }
                    if (category.name === 'passing' && stat.name === 'QBRating') {
                      fieldName = 'passerRating'; // Map to model field name
                    }
                    if (category.name === 'passing' && stat.name === 'ESPNQBRating') {
                      fieldName = 'espnQBRating'; // Map to model field name
                    }
                    if (category.name === 'passing' && stat.name === 'interceptionPct') {
                      fieldName = 'interceptionPct'; // Keep as is
                    }
                    if (category.name === 'passing' && stat.name === 'netPassingYards') {
                      fieldName = 'netPassingYards'; // Keep as is
                    }
                    if (category.name === 'passing' && stat.name === 'netPassingYardsPerGame') {
                      fieldName = 'netPassingYardsPerGame'; // Keep as is
                    }
                    if (category.name === 'passing' && stat.name === 'netTotalYards') {
                      fieldName = 'netTotalYards'; // Keep as is
                    }
                    if (category.name === 'passing' && stat.name === 'netYardsPerGame') {
                      fieldName = 'netYardsPerGame'; // Keep as is
                    }
                    if (category.name === 'passing' && stat.name === 'passingBigPlays') {
                      fieldName = 'passingBigPlays'; // Keep as is
                    }
                    if (category.name === 'passing' && stat.name === 'passingFirstDowns') {
                      fieldName = 'passingFirstDowns'; // Keep as is
                    }
                    if (category.name === 'passing' && stat.name === 'passingFumbles') {
                      fieldName = 'passingFumbles'; // Keep as is
                    }
                    if (category.name === 'passing' && stat.name === 'passingFumblesLost') {
                      fieldName = 'passingFumblesLost'; // Keep as is
                    }
                    if (category.name === 'passing' && stat.name === 'passingTouchdownPct') {
                      fieldName = 'passingTouchdownPct'; // Keep as is
                    }
                    if (category.name === 'passing' && stat.name === 'passingYardsAfterCatch') {
                      fieldName = 'passingYardsAfterCatch'; // Keep as is
                    }
                    if (category.name === 'passing' && stat.name === 'passingYardsAtCatch') {
                      fieldName = 'passingYardsAtCatch'; // Keep as is
                    }
                    if (category.name === 'passing' && stat.name === 'passingYardsPerGame') {
                      fieldName = 'passingYardsPerGame'; // Keep as is
                    }
                    if (category.name === 'passing' && stat.name === 'netPassingAttempts') {
                      fieldName = 'netPassingAttempts'; // Keep as is
                    }
                    if (category.name === 'passing' && stat.name === 'teamGamesPlayed') {
                      fieldName = 'teamGamesPlayed'; // Keep as is
                    }
                    if (category.name === 'passing' && stat.name === 'totalOffensivePlays') {
                      fieldName = 'totalOffensivePlays'; // Keep as is
                    }
                    if (category.name === 'passing' && stat.name === 'totalPointsPerGame') {
                      fieldName = 'totalPointsPerGame'; // Keep as is
                    }
                    if (category.name === 'passing' && stat.name === 'totalYards') {
                      fieldName = 'totalYards'; // Keep as is
                    }
                    if (category.name === 'passing' && stat.name === 'totalYardsFromScrimmage') {
                      fieldName = 'totalYardsFromScrimmage'; // Keep as is
                    }
                    if (category.name === 'passing' && stat.name === 'twoPointPassConvs') {
                      fieldName = 'twoPointPassConvs'; // Keep as is
                    }
                    if (category.name === 'passing' && stat.name === 'twoPtPass') {
                      fieldName = 'twoPtPass'; // Keep as is
                    }
                    if (category.name === 'passing' && stat.name === 'twoPtPassAttempts') {
                      fieldName = 'twoPtPassAttempts'; // Keep as is
                    }
                    if (category.name === 'passing' && stat.name === 'yardsFromScrimmagePerGame') {
                      fieldName = 'yardsFromScrimmagePerGame'; // Keep as is
                    }
                    if (category.name === 'passing' && stat.name === 'yardsPerCompletion') {
                      fieldName = 'yardsPerCompletion'; // Keep as is
                    }
                    if (category.name === 'passing' && stat.name === 'yardsPerGame') {
                      fieldName = 'yardsPerGame'; // Keep as is
                    }
                    if (category.name === 'passing' && stat.name === 'netYardsPerPassAttempt') {
                      fieldName = 'netYardsPerPassAttempt'; // Keep as is
                    }
                    if (category.name === 'passing' && stat.name === 'QBR') {
                      fieldName = 'qbr'; // Map to model field name
                    }
                    if (category.name === 'passing' && stat.name === 'adjQBR') {
                      fieldName = 'adjQBR'; // Keep as is
                    }
                    if (category.name === 'passing' && stat.name === 'quarterbackRating') {
                      fieldName = 'quarterbackRating'; // Keep as is
                    }
                    
                    // Rushing stats mapping
                    if (category.name === 'rushing' && stat.name === 'rushingAttempts') {
                      fieldName = 'rushingAttempts'; // Keep as is
                    }
                    if (category.name === 'rushing' && stat.name === 'rushingYards') {
                      fieldName = 'rushingYards'; // Keep as is
                    }
                    if (category.name === 'rushing' && stat.name === 'yardsPerRushAttempt') {
                      fieldName = 'yardsPerRushAttempt'; // Keep as is
                    }
                    if (category.name === 'rushing' && stat.name === 'rushingTouchdowns') {
                      fieldName = 'rushTouchdowns'; // Map to model field name
                    }
                    if (category.name === 'rushing' && stat.name === 'longRushing') {
                      fieldName = 'longestRush'; // Map to model field name
                    }
                    if (category.name === 'rushing' && stat.name === 'rushingFirstDowns') {
                      fieldName = 'rushingFirstDowns'; // Keep as is
                    }
                    if (category.name === 'rushing' && stat.name === 'rushingFumbles') {
                      fieldName = 'rushingFumbles'; // Keep as is
                    }
                    if (category.name === 'rushing' && stat.name === 'rushingFumblesLost') {
                      fieldName = 'rushingFumblesLost'; // Keep as is
                    }
                    if (category.name === 'rushing' && stat.name === 'ESPNRBRating') {
                      fieldName = 'espnRBRating'; // Map to model field name
                    }
                    if (category.name === 'rushing' && stat.name === 'rushingBigPlays') {
                      fieldName = 'rushingBigPlays'; // Keep as is
                    }
                    if (category.name === 'rushing' && stat.name === 'rushingYardsPerGame') {
                      fieldName = 'rushingYardsPerGame'; // Keep as is
                    }
                    if (category.name === 'rushing' && stat.name === 'twoPointRushConvs') {
                      fieldName = 'twoPointRushConvs'; // Keep as is
                    }
                    if (category.name === 'rushing' && stat.name === 'twoPtRush') {
                      fieldName = 'twoPtRush'; // Keep as is
                    }
                    if (category.name === 'rushing' && stat.name === 'twoPtRushAttempts') {
                      fieldName = 'twoPtRushAttempts'; // Keep as is
                    }
                    if (category.name === 'rushing' && stat.name === 'stuffs') {
                      fieldName = 'stuffs'; // Keep as is
                    }
                    if (category.name === 'rushing' && stat.name === 'stuffYardsLost') {
                      fieldName = 'stuffYardsLost'; // Keep as is
                    }
                    
                    // Receiving stats mapping
                    if (category.name === 'receiving' && stat.name === 'receivingTargets') {
                      fieldName = 'receivingTargets'; // Keep as is
                    }
                    if (category.name === 'receiving' && stat.name === 'receivingTouchdowns') {
                      fieldName = 'receivingTouchdowns'; // Keep as is
                    }
                    if (category.name === 'receiving' && stat.name === 'receivingYards') {
                      fieldName = 'receivingYards'; // Keep as is
                    }
                    if (category.name === 'receiving' && stat.name === 'longReception') {
                      fieldName = 'longestReception'; // Map to model field name
                    }
                    if (category.name === 'receiving' && stat.name === 'receivingFirstDowns') {
                      fieldName = 'receivingFirstDowns'; // Keep as is
                    }
                    if (category.name === 'receiving' && stat.name === 'receivingFumbles') {
                      fieldName = 'receivingFumbles'; // Keep as is
                    }
                    if (category.name === 'receiving' && stat.name === 'receivingFumblesLost') {
                      fieldName = 'receivingFumblesLost'; // Keep as is
                    }
                    if (category.name === 'receiving' && stat.name === 'receivingYardsAfterCatch') {
                      fieldName = 'receivingYardsAfterCatch'; // Keep as is
                    }
                    if (category.name === 'receiving' && stat.name === 'receivingYardsAtCatch') {
                      fieldName = 'receivingYardsAtCatch'; // Keep as is
                    }
                    if (category.name === 'receiving' && stat.name === 'receivingYardsPerGame') {
                      fieldName = 'receivingYardsPerGame'; // Keep as is
                    }
                    if (category.name === 'receiving' && stat.name === 'receivingBigPlays') {
                      fieldName = 'receivingBigPlays'; // Keep as is
                    }
                    if (category.name === 'receiving' && stat.name === 'ESPNWRRating') {
                      fieldName = 'espnWRRating'; // Map to model field name
                    }
                    if (category.name === 'receiving' && stat.name === 'yardsPerReception') {
                      fieldName = 'yardsPerReception'; // Keep as is
                    }
                    if (category.name === 'receiving' && stat.name === 'twoPointRecConvs') {
                      fieldName = 'twoPointRecConvs'; // Keep as is
                    }
                    if (category.name === 'receiving' && stat.name === 'twoPtReception') {
                      fieldName = 'twoPtReception'; // Keep as is
                    }
                    if (category.name === 'receiving' && stat.name === 'twoPtReceptionAttempts') {
                      fieldName = 'twoPtReceptionAttempts'; // Keep as is
                    }
                    
                    // Kicking stats mapping
                    if (category.name === 'kicking') {
                      if (stat.name === 'fieldGoalsMade') {
                        fieldName = 'fieldGoalsMade'; // Keep as is
                      } else if (stat.name === 'fieldGoalAttempts') {
                        fieldName = 'fieldGoalAttempts'; // Keep as is
                      } else if (stat.name === 'fieldGoalPct') {
                        fieldName = 'fieldGoalPercentage'; // Map to model field name
                      } else if (stat.name === 'fieldGoalsMade1_19') {
                        fieldName = 'fieldGoalsMade1_19'; // Keep as is
                      } else if (stat.name === 'fieldGoalsMade20_29') {
                        fieldName = 'fieldGoalsMade20_29'; // Keep as is
                      } else if (stat.name === 'fieldGoalsMade30_39') {
                        fieldName = 'fieldGoalsMade30_39'; // Keep as is
                      } else if (stat.name === 'fieldGoalsMade40_49') {
                        fieldName = 'fieldGoalsMade40_49'; // Keep as is
                      } else if (stat.name === 'fieldGoalsMade50') {
                        fieldName = 'fieldGoalsMade50'; // Keep as is
                      } else if (stat.name === 'longFieldGoalMade') {
                        fieldName = 'longFieldGoalMade'; // Keep as is
                      } else if (stat.name === 'extraPointsMade') {
                        fieldName = 'extraPointsMade'; // Keep as is
                      } else if (stat.name === 'extraPointAttempts') {
                        fieldName = 'extraPointAttempts'; // Keep as is
                      } else if (stat.name === 'extraPointPct') {
                        fieldName = 'extraPointPercentage'; // Map to model field name
                      } else if (stat.name === 'totalKickingPoints') {
                        fieldName = 'totalKickingPoints'; // Keep as is
                      } else if (stat.name === 'kickoffs') {
                        fieldName = 'kickoffs'; // Keep as is
                      } else if (stat.name === 'kickoffYards') {
                        fieldName = 'kickoffYards'; // Keep as is
                      } else if (stat.name === 'avgKickoffYards') {
                        fieldName = 'avgKickoffYards'; // Keep as is
                      } else if (stat.name === 'touchbacks') {
                        fieldName = 'touchbacks'; // Keep as is
                      } else if (stat.name === 'touchbackPct') {
                        fieldName = 'touchbackPct'; // Keep as is
                      } else if (stat.name === 'kickoffReturns') {
                        fieldName = 'kickoffReturns'; // Keep as is
                      } else if (stat.name === 'kickoffReturnYards') {
                        fieldName = 'kickoffReturnYards'; // Keep as is
                      } else if (stat.name === 'avgKickoffReturnYards') {
                        fieldName = 'avgKickoffReturnYards'; // Keep as is
                      } else if (stat.name === 'kickoffReturnTouchdowns') {
                        fieldName = 'kickoffReturnTouchdowns'; // Keep as is
                      } else if (stat.name === 'longKickoff') {
                        fieldName = 'longKickoff'; // Keep as is
                      } else if (stat.name === 'longKickoffReturn') {
                        fieldName = 'longKickoffReturn'; // Keep as is
                      } else if (stat.name === 'fairCatches') {
                        fieldName = 'fairCatches'; // Keep as is
                      } else if (stat.name === 'fairCatchPct') {
                        fieldName = 'fairCatchPct'; // Keep as is
                      } else if (stat.name === 'fieldGoalAttempts1_19') {
                        fieldName = 'fieldGoalAttempts1_19'; // Keep as is
                      } else if (stat.name === 'fieldGoalAttempts20_29') {
                        fieldName = 'fieldGoalAttempts20_29'; // Keep as is
                      } else if (stat.name === 'fieldGoalAttempts30_39') {
                        fieldName = 'fieldGoalAttempts30_39'; // Keep as is
                      } else if (stat.name === 'fieldGoalAttempts40_49') {
                        fieldName = 'fieldGoalAttempts40_49'; // Keep as is
                      } else if (stat.name === 'fieldGoalAttempts50_59') {
                        fieldName = 'fieldGoalAttempts50_59'; // Keep as is
                      } else if (stat.name === 'fieldGoalAttempts60_99') {
                        fieldName = 'fieldGoalAttempts60_99'; // Keep as is
                      } else if (stat.name === 'fieldGoalAttempts50') {
                        fieldName = 'fieldGoalAttempts50'; // Keep as is
                      } else if (stat.name === 'fieldGoalAttemptYards') {
                        fieldName = 'fieldGoalAttemptYards'; // Keep as is
                      } else if (stat.name === 'fieldGoalsBlocked') {
                        fieldName = 'fieldGoalsBlocked'; // Keep as is
                      } else if (stat.name === 'fieldGoalsBlocked') {
                        fieldName = 'fieldGoalsBlocked'; // Keep as is
                      } else if (stat.name === 'fieldGoalsBlockedPct') {
                        fieldName = 'fieldGoalsBlockedPct'; // Keep as is
                      } else if (stat.name === 'fieldGoalsMade1_19') {
                        fieldName = 'fieldGoalsMade1_19'; // Keep as is
                      } else if (stat.name === 'fieldGoalsMade20_29') {
                        fieldName = 'fieldGoalsMade20_29'; // Keep as is
                      } else if (stat.name === 'fieldGoalsMade30_39') {
                        fieldName = 'fieldGoalsMade30_39'; // Keep as is
                      } else if (stat.name === 'fieldGoalsMade40_49') {
                        fieldName = 'fieldGoalsMade40_49'; // Keep as is
                      } else if (stat.name === 'fieldGoalsMade50_59') {
                        fieldName = 'fieldGoalsMade50_59'; // Keep as is
                      } else if (stat.name === 'fieldGoalsMade60_99') {
                        fieldName = 'fieldGoalsMade60_99'; // Keep as is
                      } else if (stat.name === 'fieldGoalsMade50') {
                        fieldName = 'fieldGoalsMade50'; // Keep as is
                      } else if (stat.name === 'fieldGoalsMadeYards') {
                        fieldName = 'fieldGoalsMadeYards'; // Keep as is
                      } else if (stat.name === 'fieldGoalsMissedYards') {
                        fieldName = 'fieldGoalsMissedYards'; // Keep as is
                      } else if (stat.name === 'longFieldGoalAttempt') {
                        fieldName = 'longFieldGoalAttempt'; // Keep as is
                      } else if (stat.name === 'longFieldGoalMade') {
                        fieldName = 'longFieldGoalMade'; // Keep as is
                      } else if (stat.name === 'longKickoff') {
                        fieldName = 'longKickoff'; // Keep as is
                      } else if (stat.name === 'extraPointsBlocked') {
                        fieldName = 'extraPointsBlocked'; // Keep as is
                      } else if (stat.name === 'extraPointsBlockedPct') {
                        fieldName = 'extraPointsBlockedPct'; // Keep as is
                      } else {
                        fieldName = stat.name; // Keep original name for other kicking stats
                      }
                    }
                    
                    // Punting stats mapping
                    if (category.name === 'punting') {
                      if (stat.name === 'punts') {
                        fieldName = 'punts'; // Keep as is
                      } else if (stat.name === 'puntYards') {
                        fieldName = 'puntYards'; // Keep as is
                      } else if (stat.name === 'grossAvgPuntYards') {
                        fieldName = 'grossAvgPuntYards'; // Keep as is
                      } else if (stat.name === 'netAvgPuntYards') {
                        fieldName = 'netAvgPuntYards'; // Keep as is
                      } else if (stat.name === 'puntsInside20') {
                        fieldName = 'puntsInside20'; // Keep as is
                      } else if (stat.name === 'puntsInside20Pct') {
                        fieldName = 'puntsInside20Pct'; // Keep as is
                      } else if (stat.name === 'puntsInside10') {
                        fieldName = 'puntsInside10'; // Keep as is
                      } else if (stat.name === 'puntsInside10Pct') {
                        fieldName = 'puntsInside10Pct'; // Keep as is
                      } else if (stat.name === 'touchbacks') {
                        fieldName = 'puntTouchbacks'; // Map to model field name
                      } else if (stat.name === 'touchbackPct') {
                        fieldName = 'puntTouchbackPct'; // Map to model field name
                      } else if (stat.name === 'longPunt') {
                        fieldName = 'longestPunt'; // Map to model field name
                      } else if (stat.name === 'puntsBlocked') {
                        fieldName = 'blockedPunts'; // Map to model field name
                      } else if (stat.name === 'puntsBlockedPct') {
                        fieldName = 'blockedPuntsPct'; // Map to model field name
                      } else if (stat.name === 'puntReturns') {
                        fieldName = 'puntReturns'; // Keep as is
                      } else if (stat.name === 'puntReturnYards') {
                        fieldName = 'puntReturnYards'; // Keep as is
                      } else if (stat.name === 'avgPuntReturnYards') {
                        fieldName = 'puntReturnAverage'; // Map to model field name
                      } else if (stat.name === 'puntReturnTouchdowns') {
                        fieldName = 'puntReturnTouchdowns'; // Keep as is
                      } else if (stat.name === 'longPuntReturn') {
                        fieldName = 'longestPuntReturn'; // Map to model field name
                      } else if (stat.name === 'puntReturnFairCatches') {
                        fieldName = 'puntReturnFairCatches'; // Keep as is
                      } else if (stat.name === 'puntReturnFairCatchPct') {
                        fieldName = 'puntReturnFairCatchPct'; // Keep as is
                      } else if (stat.name === 'puntReturnFumbles') {
                        fieldName = 'puntReturnFumbles'; // Keep as is
                      } else if (stat.name === 'puntReturnFumblesLost') {
                        fieldName = 'puntReturnFumblesLost'; // Keep as is
                      } else if (stat.name === 'puntReturnsStartedInsideThe10') {
                        fieldName = 'puntReturnsStartedInsideThe10'; // Keep as is
                      } else if (stat.name === 'puntReturnsStartedInsideThe20') {
                        fieldName = 'puntReturnsStartedInsideThe20'; // Keep as is
                      } else {
                        fieldName = stat.name; // Keep original name for other punting stats
                      }
                    }
                    
                    // Returning stats mapping
                    if (category.name === 'returning') {
                      if (stat.name === 'kickReturns') {
                        fieldName = 'kickReturnAttempts'; // Map to model field name
                      } else if (stat.name === 'kickReturnYards') {
                        fieldName = 'kickReturnYards'; // Keep as is
                      } else if (stat.name === 'yardsPerKickReturn') {
                        fieldName = 'kickReturnAverage'; // Map to model field name
                      } else if (stat.name === 'kickReturnTouchdowns') {
                        fieldName = 'kickReturnTouchdowns'; // Keep as is
                      } else if (stat.name === 'longKickReturn') {
                        fieldName = 'longestKickReturn'; // Map to model field name
                      } else if (stat.name === 'kickReturnFairCatches') {
                        fieldName = 'kickReturnFairCatches'; // Keep as is
                      } else if (stat.name === 'kickReturnFairCatchPct') {
                        fieldName = 'kickReturnFairCatchPct'; // Keep as is
                      } else if (stat.name === 'kickReturnFumbles') {
                        fieldName = 'kickReturnFumbles'; // Keep as is
                      } else if (stat.name === 'kickReturnFumblesLost') {
                        fieldName = 'kickReturnFumblesLost'; // Keep as is
                      } else if (stat.name === 'puntReturns') {
                        fieldName = 'puntReturnAttempts'; // Map to model field name
                      } else if (stat.name === 'puntReturnYards') {
                        fieldName = 'puntReturnYards'; // Keep as is
                      } else if (stat.name === 'yardsPerPuntReturn') {
                        fieldName = 'puntReturnAverage'; // Map to model field name
                      } else if (stat.name === 'puntReturnTouchdowns') {
                        fieldName = 'puntReturnTouchdowns'; // Keep as is
                      } else if (stat.name === 'longPuntReturn') {
                        fieldName = 'longestPuntReturn'; // Map to model field name
                      } else if (stat.name === 'puntReturnFairCatches') {
                        fieldName = 'puntReturnFairCatches'; // Keep as is
                      } else if (stat.name === 'puntReturnFairCatchPct') {
                        fieldName = 'puntReturnFairCatchPct'; // Keep as is
                      } else if (stat.name === 'puntReturnFumbles') {
                        fieldName = 'puntReturnFumbles'; // Keep as is
                      } else if (stat.name === 'puntReturnFumblesLost') {
                        fieldName = 'puntReturnFumblesLost'; // Keep as is
                      } else if (stat.name === 'puntReturnsStartedInsideThe10') {
                        fieldName = 'puntReturnsStartedInsideThe10'; // Keep as is
                      } else if (stat.name === 'puntReturnsStartedInsideThe20') {
                        fieldName = 'puntReturnsStartedInsideThe20'; // Keep as is
                      } else if (stat.name === 'defFumbleReturns') {
                        fieldName = 'defFumbleReturns'; // Keep as is
                      } else if (stat.name === 'defFumbleReturnYards') {
                        fieldName = 'defFumbleReturnYards'; // Keep as is
                      } else if (stat.name === 'fumbleRecoveries') {
                        fieldName = 'fumbleRecoveries'; // Keep as is
                      } else if (stat.name === 'fumbleRecoveryYards') {
                        fieldName = 'fumbleRecoveryYards'; // Keep as is
                      } else if (stat.name === 'miscFumbleReturns') {
                        fieldName = 'miscFumbleReturns'; // Keep as is
                      } else if (stat.name === 'miscFumbleReturnYards') {
                        fieldName = 'miscFumbleReturnYards'; // Keep as is
                      } else if (stat.name === 'oppFumbleRecoveries') {
                        fieldName = 'oppFumbleRecoveries'; // Keep as is
                      } else if (stat.name === 'oppFumbleRecoveryYards') {
                        fieldName = 'oppFumbleRecoveryYards'; // Keep as is
                      } else if (stat.name === 'oppSpecialTeamFumbleReturns') {
                        fieldName = 'oppSpecialTeamFumbleReturns'; // Keep as is
                      } else if (stat.name === 'oppSpecialTeamFumbleReturnYards') {
                        fieldName = 'oppSpecialTeamFumbleReturnYards'; // Keep as is
                      } else if (stat.name === 'specialTeamFumbleReturns') {
                        fieldName = 'specialTeamFumbleReturns'; // Keep as is
                      } else if (stat.name === 'specialTeamFumbleReturnYards') {
                        fieldName = 'specialTeamFumbleReturnYards'; // Keep as is
                      } else if (stat.name === 'yardsPerReturn') {
                        fieldName = 'yardsPerReturn'; // Keep as is
                      } else {
                        fieldName = stat.name; // Keep original name for other returning stats
                      }
                    }
                    
                    // Scoring stats mapping
                    if (category.name === 'scoring') {
                      if (stat.name === 'totalPoints') {
                        fieldName = 'totalPoints'; // Keep as is
                      } else if (stat.name === 'totalPointsPerGame') {
                        fieldName = 'totalPointsPerGame'; // Keep as is
                      } else if (stat.name === 'totalTouchdowns') {
                        fieldName = 'totalTouchdowns'; // Keep as is
                      } else if (stat.name === 'totalTwoPointConvs') {
                        fieldName = 'totalTwoPointConvs'; // Keep as is
                      } else if (stat.name === 'kickExtraPoints') {
                        fieldName = 'kickExtraPoints'; // Keep as is
                      } else if (stat.name === 'kickExtraPointsMade') {
                        fieldName = 'kickExtraPointsMade'; // Keep as is
                      } else if (stat.name === 'fieldGoals') {
                        fieldName = 'fieldGoals'; // Keep as is
                      } else if (stat.name === 'defensivePoints') {
                        fieldName = 'defensivePoints'; // Keep as is
                      } else if (stat.name === 'miscPoints') {
                        fieldName = 'miscPoints'; // Keep as is
                      } else if (stat.name === 'returnTouchdowns') {
                        fieldName = 'returnTouchdowns'; // Keep as is
                      } else if (stat.name === 'onePtSafetiesMade') {
                        fieldName = 'onePtSafetiesMade'; // Keep as is
                      } else {
                        fieldName = stat.name; // Keep original name for other scoring stats
                      }
                    }
                    
                    extractedStats[fieldName] = parseFloat(stat.value) || 0;
                    console.log(`📊 Mapped ${fieldName} = ${extractedStats[fieldName]} (from ${category.name} category)`);
                  });
                }
              });
            } else if (statsData.categories && Array.isArray(statsData.categories)) {
              // Fallback: Handle simplified structure if it exists
              statsData.categories.forEach(category => {
                console.log(`📊 Processing category: ${category.name}`);
                if (category.stats && Array.isArray(category.stats)) {
                  category.stats.forEach(stat => {
                    // Use the same mapping logic as above
                    let fieldName = stat.name;
                    
                    // Apply the same field name mappings as above
                    // (This is a simplified version - in practice, you'd want to extract this into a helper function)
                    
                    extractedStats[fieldName] = parseFloat(stat.value) || 0;
                    console.log(`📊 Mapped ${fieldName} = ${extractedStats[fieldName]} (from ${category.name} category)`);
                  });
                }
              });
            }

            // No need to parse combined fields with simplified API response

            // Map to playerDoc using simplified API response field names
            playerDoc.gamesPlayed = Math.round(extractedStats.gamesPlayed || 0);
            
            // General Stats
            playerDoc.fumbles = Math.round(extractedStats.fumbles || 0);
            playerDoc.fumblesLost = Math.round(extractedStats.fumblesLost || 0);
            playerDoc.fumblesTouchdowns = Math.round(extractedStats.fumblesTouchdowns || 0);
            playerDoc.offensiveTwoPtReturns = Math.round(extractedStats.offensiveTwoPtReturns || 0);
            playerDoc.offensiveFumblesTouchdowns = Math.round(extractedStats.offensiveFumblesTouchdowns || 0);
            playerDoc.defensiveFumblesTouchdowns = Math.round(extractedStats.defensiveFumblesTouchdowns || 0);
            
            // Passing Stats - USE MAPPED FIELD NAMES
            playerDoc.passCompletions = Math.round(extractedStats.passCompletions || 0);
            playerDoc.passAttempts = Math.round(extractedStats.passAttempts || 0);
            playerDoc.completionPercentage = parseFloat((extractedStats.completionPercentage || 0).toFixed(2));
            playerDoc.passYards = Math.round(extractedStats.passYards || 0);
            playerDoc.yardsPerPassAttempt = parseFloat((extractedStats.yardsPerPassAttempt || 0).toFixed(2));
            playerDoc.passTouchdowns = Math.round(extractedStats.passTouchdowns || 0);
            playerDoc.interceptions = Math.round(extractedStats.interceptions || 0);
            playerDoc.longestPass = Math.round(extractedStats.longestPass || 0);
            playerDoc.sacksTaken = Math.round(extractedStats.sacksTaken || 0); // Sacks taken by QB (from passing category)
            playerDoc.sackYards = Math.round(extractedStats.sackYards || 0); // Sack yards lost by QB (renamed from sackYardsLost)
            playerDoc.passerRating = parseFloat((extractedStats.passerRating || 0).toFixed(2));
            playerDoc.qbr = parseFloat((extractedStats.qbr || 0).toFixed(2));
            playerDoc.espnQBRating = Math.round(extractedStats.espnQBRating || 0);
            playerDoc.interceptionPct = parseFloat((extractedStats.interceptionPct || 0).toFixed(2));
            playerDoc.netPassingYards = Math.round(extractedStats.netPassingYards || 0);
            playerDoc.netPassingYardsPerGame = parseFloat((extractedStats.netPassingYardsPerGame || 0).toFixed(2));
            playerDoc.netTotalYards = Math.round(extractedStats.netTotalYards || 0);
            playerDoc.netYardsPerGame = parseFloat((extractedStats.netYardsPerGame || 0).toFixed(2));
            playerDoc.passingBigPlays = Math.round(extractedStats.passingBigPlays || 0);
            playerDoc.passingFirstDowns = Math.round(extractedStats.passingFirstDowns || 0);
            playerDoc.passingFumbles = Math.round(extractedStats.passingFumbles || 0);
            playerDoc.passingFumblesLost = Math.round(extractedStats.passingFumblesLost || 0);
            playerDoc.passingTouchdownPct = parseFloat((extractedStats.passingTouchdownPct || 0).toFixed(2));
            playerDoc.passingYardsAfterCatch = Math.round(extractedStats.passingYardsAfterCatch || 0);
            playerDoc.passingYardsAtCatch = Math.round(extractedStats.passingYardsAtCatch || 0);
            playerDoc.passingYardsPerGame = parseFloat((extractedStats.passingYardsPerGame || 0).toFixed(2));
            playerDoc.netPassingAttempts = Math.round(extractedStats.netPassingAttempts || 0);
            playerDoc.teamGamesPlayed = Math.round(extractedStats.teamGamesPlayed || 0);
            playerDoc.totalOffensivePlays = Math.round(extractedStats.totalOffensivePlays || 0);
            playerDoc.totalPointsPerGame = parseFloat((extractedStats.totalPointsPerGame || 0).toFixed(2));
            playerDoc.totalYards = Math.round(extractedStats.totalYards || 0);
            playerDoc.totalYardsFromScrimmage = Math.round(extractedStats.totalYardsFromScrimmage || 0);
            playerDoc.twoPointPassConvs = Math.round(extractedStats.twoPointPassConvs || 0);
            playerDoc.twoPtPass = Math.round(extractedStats.twoPtPass || 0);
            playerDoc.twoPtPassAttempts = Math.round(extractedStats.twoPtPassAttempts || 0);
            playerDoc.yardsFromScrimmagePerGame = parseFloat((extractedStats.yardsFromScrimmagePerGame || 0).toFixed(2));
            playerDoc.yardsPerCompletion = parseFloat((extractedStats.yardsPerCompletion || 0).toFixed(2));
            playerDoc.yardsPerGame = parseFloat((extractedStats.yardsPerGame || 0).toFixed(2));
            playerDoc.netYardsPerPassAttempt = parseFloat((extractedStats.netYardsPerPassAttempt || 0).toFixed(2));
            playerDoc.adjQBR = parseFloat((extractedStats.adjQBR || 0).toFixed(2));
            playerDoc.quarterbackRating = parseFloat((extractedStats.quarterbackRating || 0).toFixed(2));
            // Rushing Stats - USE MAPPED FIELD NAMES
            playerDoc.rushingAttempts = Math.round(extractedStats.rushingAttempts || 0);
            playerDoc.rushingYards = Math.round(extractedStats.rushingYards || 0);
            playerDoc.yardsPerRushAttempt = parseFloat((extractedStats.yardsPerRushAttempt || 0).toFixed(2));
            playerDoc.rushTouchdowns = Math.round(extractedStats.rushTouchdowns || 0);
            playerDoc.longestRush = Math.round(extractedStats.longestRush || 0);
            playerDoc.rushingFirstDowns = Math.round(extractedStats.rushingFirstDowns || 0);
            playerDoc.rushingFumbles = Math.round(extractedStats.rushingFumbles || 0);
            playerDoc.rushingFumblesLost = Math.round(extractedStats.rushingFumblesLost || 0);
            playerDoc.espnRBRating = Math.round(extractedStats.espnRBRating || 0);
            playerDoc.rushingBigPlays = Math.round(extractedStats.rushingBigPlays || 0);
            playerDoc.rushingYardsPerGame = parseFloat((extractedStats.rushingYardsPerGame || 0).toFixed(2));
            playerDoc.twoPointRushConvs = Math.round(extractedStats.twoPointRushConvs || 0);
            playerDoc.twoPtRush = Math.round(extractedStats.twoPtRush || 0);
            playerDoc.twoPtRushAttempts = Math.round(extractedStats.twoPtRushAttempts || 0);
            // Receiving Stats - USE MAPPED FIELD NAMES
            playerDoc.receptions = Math.round(extractedStats.receptions || 0);
            playerDoc.receivingTargets = Math.round(extractedStats.receivingTargets || 0);
            playerDoc.receivingYards = Math.round(extractedStats.receivingYards || 0);
            playerDoc.yardsPerReception = parseFloat((extractedStats.yardsPerReception || 0).toFixed(2));
            playerDoc.receivingYardsPerGame = parseFloat((extractedStats.receivingYardsPerGame || 0).toFixed(2));
            playerDoc.receivingTouchdowns = Math.round(extractedStats.receivingTouchdowns || 0);
            playerDoc.longestReception = Math.round(extractedStats.longestReception || 0);
            playerDoc.receivingFirstDowns = Math.round(extractedStats.receivingFirstDowns || 0);
            playerDoc.receivingFumbles = Math.round(extractedStats.receivingFumbles || 0);
            playerDoc.receivingFumblesLost = Math.round(extractedStats.receivingFumblesLost || 0);
            playerDoc.catchPercentage = parseFloat((playerDoc.receptions / (playerDoc.receivingTargets || 1) * 100 || 0).toFixed(2));
            playerDoc.espnWRRating = Math.round(extractedStats.espnWRRating || 0);
            playerDoc.receivingBigPlays = Math.round(extractedStats.receivingBigPlays || 0);
            playerDoc.receivingYardsAfterCatch = Math.round(extractedStats.receivingYardsAfterCatch || 0);
            playerDoc.receivingYardsAtCatch = Math.round(extractedStats.receivingYardsAtCatch || 0);
            playerDoc.twoPointRecConvs = Math.round(extractedStats.twoPointRecConvs || 0);
            playerDoc.twoPtReception = Math.round(extractedStats.twoPtReception || 0);
            playerDoc.twoPtReceptionAttempts = Math.round(extractedStats.twoPtReceptionAttempts || 0);
            // Defense Stats - USE MAPPED FIELD NAMES
            playerDoc.totalTackles = Math.round(extractedStats.totalTackles || 0);
            playerDoc.soloTackles = Math.round(extractedStats.soloTackles || 0);
            playerDoc.assistedTackles = Math.round(extractedStats.assistedTackles || 0); // Mapped from 'assistTackles'
            playerDoc.sacks = parseFloat((extractedStats.defensiveSacks || 0).toFixed(2)); // Defensive sacks (from defensive category)
            // Note: defensive sack yards are separate from offensive sack yards lost - handled separately above
            playerDoc.forcedFumbles = Math.round(extractedStats.forcedFumbles || 0); // Mapped from 'fumblesForced'
            playerDoc.fumbleRecoveries = Math.round(extractedStats.fumbleRecoveries || 0); // Mapped from 'fumblesRecovered'
            playerDoc.fumbleRecoveryYards = Math.round(extractedStats.fumbleRecoveryYards || 0); // Mapped from 'fumblesRecoveredYards'
            playerDoc.defensiveInterceptions = Math.round(extractedStats.interceptions || 0);
            playerDoc.interceptionYards = Math.round(extractedStats.interceptionYards || 0);
            playerDoc.avgInterceptionYards = parseFloat((extractedStats.avgInterceptionYards || 0).toFixed(2));
            playerDoc.interceptionTouchdowns = Math.round(extractedStats.interceptionTouchdowns || 0);
            playerDoc.longestInterception = Math.round(extractedStats.longestInterception || 0); // Mapped from 'longInterception'
            playerDoc.passesDefended = Math.round(extractedStats.passesDefended || 0);
            playerDoc.stuffs = Math.round(extractedStats.stuffs || 0);
            playerDoc.stuffYards = Math.round(extractedStats.stuffYards || 0);
            playerDoc.kicksBlocked = Math.round(extractedStats.kicksBlocked || 0);
            playerDoc.safeties = Math.round(extractedStats.safeties || 0);
            
            // Additional Defense Stats - USE MAPPED FIELD NAMES
            playerDoc.defensiveSacks = parseFloat((extractedStats.defensiveSacks || 0).toFixed(2));
            playerDoc.defensiveSackYards = Math.round(extractedStats.defensiveSackYards || 0);
            playerDoc.avgSackYards = parseFloat((extractedStats.avgSackYards || 0).toFixed(2));
            playerDoc.avgStuffYards = parseFloat((extractedStats.avgStuffYards || 0).toFixed(2));
            playerDoc.blockedFieldGoalTouchdowns = Math.round(extractedStats.blockedFieldGoalTouchdowns || 0);
            playerDoc.blockedPuntTouchdowns = Math.round(extractedStats.blockedPuntTouchdowns || 0);
            playerDoc.hurries = Math.round(extractedStats.hurries || 0);
            playerDoc.passesBattedDown = Math.round(extractedStats.passesBattedDown || 0);
            playerDoc.qbHits = Math.round(extractedStats.qbHits || 0);
            playerDoc.twoPointReturns = Math.round(extractedStats.twoPointReturns || 0);
            playerDoc.miscTouchdowns = Math.round(extractedStats.miscTouchdowns || 0);
            playerDoc.tacklesForLoss = Math.round(extractedStats.tacklesForLoss || 0);
            playerDoc.tacklesYardsLost = Math.round(extractedStats.tacklesYardsLost || 0);
            playerDoc.yardsAllowed = Math.round(extractedStats.yardsAllowed || 0);
            playerDoc.pointsAllowed = Math.round(extractedStats.pointsAllowed || 0);
            playerDoc.missedFieldGoalReturnTd = Math.round(extractedStats.missedFieldGoalReturnTd || 0);
            playerDoc.blockedPuntEzRecTd = Math.round(extractedStats.blockedPuntEzRecTd || 0);
            // Scoring Stats
            playerDoc.passingTouchdowns = Math.round(extractedStats.passingTouchdowns || 0);
            playerDoc.rushingTouchdowns = Math.round(extractedStats.rushingTouchdowns || 0);
            playerDoc.receivingTouchdowns = Math.round(extractedStats.receivingTouchdowns || 0);
            playerDoc.returnTouchdowns = Math.round(extractedStats.returnTouchdowns || 0);
            playerDoc.totalTouchdowns = Math.round(extractedStats.totalTouchdowns || 0);
            playerDoc.totalTwoPointConvs = Math.round(extractedStats.totalTwoPointConvs || 0);
            playerDoc.kickExtraPoints = Math.round(extractedStats.kickExtraPoints || 0);
            playerDoc.fieldGoals = Math.round(extractedStats.fieldGoals || 0);
            playerDoc.totalPoints = Math.round(extractedStats.totalPoints || 0);
            playerDoc.defensivePoints = Math.round(extractedStats.defensivePoints || 0);
            playerDoc.kickExtraPointsMade = Math.round(extractedStats.kickExtraPointsMade || 0);
            playerDoc.miscPoints = Math.round(extractedStats.miscPoints || 0);
            playerDoc.twoPointPassConvs = Math.round(extractedStats.twoPointPassConvs || 0);
            playerDoc.twoPointRecConvs = Math.round(extractedStats.twoPointRecConvs || 0);
            playerDoc.twoPointRushConvs = Math.round(extractedStats.twoPointRushConvs || 0);
            playerDoc.onePtSafetiesMade = Math.round(extractedStats.onePtSafetiesMade || 0);
            // Kicking Stats - USE MAPPED FIELD NAMES
            playerDoc.fieldGoalsMade = Math.round(extractedStats.fieldGoalsMade || 0);
            playerDoc.fieldGoalAttempts = Math.round(extractedStats.fieldGoalAttempts || 0);
            playerDoc.fieldGoalPercentage = parseFloat((extractedStats.fieldGoalPercentage || 0).toFixed(2));
            playerDoc.fieldGoalsMade1_19 = Math.round(extractedStats.fieldGoalsMade1_19 || 0);
            playerDoc.fieldGoalsMade20_29 = Math.round(extractedStats.fieldGoalsMade20_29 || 0);
            playerDoc.fieldGoalsMade30_39 = Math.round(extractedStats.fieldGoalsMade30_39 || 0);
            playerDoc.fieldGoalsMade40_49 = Math.round(extractedStats.fieldGoalsMade40_49 || 0);
            playerDoc.fieldGoalsMade50 = Math.round(extractedStats.fieldGoalsMade50 || 0);
            playerDoc.longFieldGoalMade = Math.round(extractedStats.longFieldGoalMade || 0);
            playerDoc.extraPointsMade = Math.round(extractedStats.extraPointsMade || 0);
            playerDoc.extraPointAttempts = Math.round(extractedStats.extraPointAttempts || 0);
            playerDoc.extraPointPercentage = parseFloat((extractedStats.extraPointPercentage || 0).toFixed(2));
            playerDoc.totalKickingPoints = Math.round(extractedStats.totalKickingPoints || 0);
            
            // Additional Kicking Stats
            playerDoc.fieldGoalAttempts1_19 = Math.round(extractedStats.fieldGoalAttempts1_19 || 0);
            playerDoc.fieldGoalAttempts20_29 = Math.round(extractedStats.fieldGoalAttempts20_29 || 0);
            playerDoc.fieldGoalAttempts30_39 = Math.round(extractedStats.fieldGoalAttempts30_39 || 0);
            playerDoc.fieldGoalAttempts40_49 = Math.round(extractedStats.fieldGoalAttempts40_49 || 0);
            playerDoc.fieldGoalAttempts50_59 = Math.round(extractedStats.fieldGoalAttempts50_59 || 0);
            playerDoc.fieldGoalAttempts60_99 = Math.round(extractedStats.fieldGoalAttempts60_99 || 0);
            playerDoc.fieldGoalAttempts50 = Math.round(extractedStats.fieldGoalAttempts50 || 0);
            playerDoc.fieldGoalAttemptYards = Math.round(extractedStats.fieldGoalAttemptYards || 0);
            playerDoc.fieldGoalsBlocked = Math.round(extractedStats.fieldGoalsBlocked || 0);
            playerDoc.fieldGoalsBlockedPct = parseFloat((extractedStats.fieldGoalsBlockedPct || 0).toFixed(2));
            playerDoc.fieldGoalsMade50_59 = Math.round(extractedStats.fieldGoalsMade50_59 || 0);
            playerDoc.fieldGoalsMade60_99 = Math.round(extractedStats.fieldGoalsMade60_99 || 0);
            playerDoc.fieldGoalsMadeYards = Math.round(extractedStats.fieldGoalsMadeYards || 0);
            playerDoc.fieldGoalsMissedYards = Math.round(extractedStats.fieldGoalsMissedYards || 0);
            playerDoc.longFieldGoalAttempt = Math.round(extractedStats.longFieldGoalAttempt || 0);
            playerDoc.kickoffs = Math.round(extractedStats.kickoffs || 0);
            playerDoc.kickoffYards = Math.round(extractedStats.kickoffYards || 0);
            playerDoc.avgKickoffYards = parseFloat((extractedStats.avgKickoffYards || 0).toFixed(2));
            playerDoc.touchbacks = Math.round(extractedStats.touchbacks || 0);
            playerDoc.touchbackPct = parseFloat((extractedStats.touchbackPct || 0).toFixed(2));
            playerDoc.kickoffReturns = Math.round(extractedStats.kickoffReturns || 0);
            playerDoc.kickoffReturnYards = Math.round(extractedStats.kickoffReturnYards || 0);
            playerDoc.avgKickoffReturnYards = parseFloat((extractedStats.avgKickoffReturnYards || 0).toFixed(2));
            playerDoc.kickoffReturnTouchdowns = Math.round(extractedStats.kickoffReturnTouchdowns || 0);
            playerDoc.longKickoff = Math.round(extractedStats.longKickoff || 0);
            playerDoc.longKickoffReturn = Math.round(extractedStats.longKickoffReturn || 0);
            playerDoc.fairCatches = Math.round(extractedStats.fairCatches || 0);
            playerDoc.fairCatchPct = parseFloat((extractedStats.fairCatchPct || 0).toFixed(2));
            playerDoc.extraPointsBlocked = Math.round(extractedStats.extraPointsBlocked || 0);
            playerDoc.extraPointsBlockedPct = parseFloat((extractedStats.extraPointsBlockedPct || 0).toFixed(2));
            
            // Punting Stats - USE MAPPED FIELD NAMES
            playerDoc.punts = Math.round(extractedStats.punts || 0);
            playerDoc.puntYards = Math.round(extractedStats.puntYards || 0);
            playerDoc.grossAvgPuntYards = parseFloat((extractedStats.grossAvgPuntYards || 0).toFixed(2));
            playerDoc.netAvgPuntYards = parseFloat((extractedStats.netAvgPuntYards || 0).toFixed(2));
            playerDoc.puntsInside20 = Math.round(extractedStats.puntsInside20 || 0);
            playerDoc.puntTouchbacks = Math.round(extractedStats.puntTouchbacks || 0);
            playerDoc.longestPunt = Math.round(extractedStats.longestPunt || 0);
            playerDoc.blockedPunts = Math.round(extractedStats.blockedPunts || 0);
            
            // Additional Punting Stats
            playerDoc.puntsInside20Pct = parseFloat((extractedStats.puntsInside20Pct || 0).toFixed(2));
            playerDoc.puntsInside10 = Math.round(extractedStats.puntsInside10 || 0);
            playerDoc.puntsInside10Pct = parseFloat((extractedStats.puntsInside10Pct || 0).toFixed(2));
            playerDoc.puntTouchbackPct = parseFloat((extractedStats.puntTouchbackPct || 0).toFixed(2));
            playerDoc.blockedPuntsPct = parseFloat((extractedStats.blockedPuntsPct || 0).toFixed(2));
            playerDoc.puntReturns = Math.round(extractedStats.puntReturns || 0);
            playerDoc.puntReturnYards = Math.round(extractedStats.puntReturnYards || 0);
            playerDoc.puntReturnAverage = parseFloat((extractedStats.puntReturnAverage || 0).toFixed(2));
            playerDoc.puntReturnTouchdowns = Math.round(extractedStats.puntReturnTouchdowns || 0);
            playerDoc.longestPuntReturn = Math.round(extractedStats.longestPuntReturn || 0);
            playerDoc.puntReturnFairCatches = Math.round(extractedStats.puntReturnFairCatches || 0);
            playerDoc.puntReturnFairCatchPct = parseFloat((extractedStats.puntReturnFairCatchPct || 0).toFixed(2));
            playerDoc.puntReturnFumbles = Math.round(extractedStats.puntReturnFumbles || 0);
            playerDoc.puntReturnFumblesLost = Math.round(extractedStats.puntReturnFumblesLost || 0);
            playerDoc.puntReturnsStartedInsideThe10 = Math.round(extractedStats.puntReturnsStartedInsideThe10 || 0);
            playerDoc.puntReturnsStartedInsideThe20 = Math.round(extractedStats.puntReturnsStartedInsideThe20 || 0);
            
            // Kick Returns Stats - USE MAPPED FIELD NAMES
            playerDoc.kickReturnAttempts = Math.round(extractedStats.kickReturnAttempts || 0);
            playerDoc.kickReturnYards = Math.round(extractedStats.kickReturnYards || 0);
            playerDoc.kickReturnAverage = parseFloat((extractedStats.kickReturnAverage || 0).toFixed(2));
            playerDoc.kickReturnTouchdowns = Math.round(extractedStats.kickReturnTouchdowns || 0);
            playerDoc.longestKickReturn = Math.round(extractedStats.longestKickReturn || 0);
            playerDoc.kickReturnFairCatches = Math.round(extractedStats.kickReturnFairCatches || 0);
            
            // Additional Return Stats
            playerDoc.kickReturnFairCatchPct = parseFloat((extractedStats.kickReturnFairCatchPct || 0).toFixed(2));
            playerDoc.kickReturnFumbles = Math.round(extractedStats.kickReturnFumbles || 0);
            playerDoc.kickReturnFumblesLost = Math.round(extractedStats.kickReturnFumblesLost || 0);
            
            // Punt Returns Stats - USE MAPPED FIELD NAMES
            playerDoc.puntReturnAttempts = Math.round(extractedStats.puntReturnAttempts || 0);
            playerDoc.puntReturnYards = Math.round(extractedStats.puntReturnYards || 0);
            playerDoc.puntReturnAverage = parseFloat((extractedStats.puntReturnAverage || 0).toFixed(2));
            playerDoc.puntReturnTouchdowns = Math.round(extractedStats.puntReturnTouchdowns || 0);
            playerDoc.longestPuntReturn = Math.round(extractedStats.longestPuntReturn || 0);
            playerDoc.puntReturnFairCatches = Math.round(extractedStats.puntReturnFairCatches || 0);
            
            // Special Teams Fumble Returns
            playerDoc.defFumbleReturns = Math.round(extractedStats.defFumbleReturns || 0);
            playerDoc.defFumbleReturnYards = Math.round(extractedStats.defFumbleReturnYards || 0);
            playerDoc.miscFumbleReturns = Math.round(extractedStats.miscFumbleReturns || 0);
            playerDoc.miscFumbleReturnYards = Math.round(extractedStats.miscFumbleReturnYards || 0);
            playerDoc.oppFumbleRecoveries = Math.round(extractedStats.oppFumbleRecoveries || 0);
            playerDoc.oppFumbleRecoveryYards = Math.round(extractedStats.oppFumbleRecoveryYards || 0);
            playerDoc.oppSpecialTeamFumbleReturns = Math.round(extractedStats.oppSpecialTeamFumbleReturns || 0);
            playerDoc.oppSpecialTeamFumbleReturnYards = Math.round(extractedStats.oppSpecialTeamFumbleReturnYards || 0);
            playerDoc.specialTeamFumbleReturns = Math.round(extractedStats.specialTeamFumbleReturns || 0);
            playerDoc.specialTeamFumbleReturnYards = Math.round(extractedStats.specialTeamFumbleReturnYards || 0);
            playerDoc.yardsPerReturn = parseFloat((extractedStats.yardsPerReturn || 0).toFixed(2));

            // Derive additional calculated fields
            // Calculate total tackles if not provided directly
            if (!extractedStats.totalTackles && (playerDoc.soloTackles > 0 || playerDoc.assistedTackles > 0)) {
            playerDoc.totalTackles = Math.round((playerDoc.soloTackles || 0) + (playerDoc.assistedTackles || 0));
            }
            
            // Calculate percentages if not provided directly
            if (playerDoc.receivingTargets > 0 && !extractedStats.catchPercentage) {
              playerDoc.catchPercentage = parseFloat(((playerDoc.receptions / playerDoc.receivingTargets) * 100).toFixed(2));
            }
            // Note: Kicking percentage calculations commented out since detailed kicking stats don't exist in the API response
            // if (playerDoc.fieldGoalAttempts > 0 && !extractedStats.fieldGoalPercentage) {
            //   playerDoc.fieldGoalPercentage = parseFloat(((playerDoc.fieldGoalsMade / playerDoc.fieldGoalAttempts) * 100).toFixed(2));
            // }
            // if (playerDoc.extraPointAttempts > 0 && !extractedStats.extraPointPercentage) {
            //   playerDoc.extraPointPercentage = parseFloat(((playerDoc.extraPointsMade / playerDoc.extraPointAttempts) * 100).toFixed(2));
            // }
            
            // Calculate total touchdowns if not provided
            if (!extractedStats.totalTouchdowns) {
              playerDoc.totalTouchdowns = Math.round((playerDoc.passingTouchdowns || 0) + (playerDoc.rushingTouchdowns || 0) + (playerDoc.receivingTouchdowns || 0) + (playerDoc.returnTouchdowns || 0));
            }
            
            // Calculate derived stats from raw data
            // Receiving yards per game (if not provided)
            if (playerDoc.gamesPlayed > 0 && !extractedStats.receivingYardsPerGame) {
              playerDoc.receivingYardsPerGame = parseFloat((playerDoc.receivingYards / playerDoc.gamesPlayed).toFixed(2));
            }
            
            // Rushing yards per game (if not provided)
            if (playerDoc.gamesPlayed > 0 && !extractedStats.rushingYardsPerGame) {
              playerDoc.rushingYardsPerGame = parseFloat((playerDoc.rushingYards / playerDoc.gamesPlayed).toFixed(2));
            }
            
            // Passing yards per game (if not provided)
            if (playerDoc.gamesPlayed > 0 && !extractedStats.passingYardsPerGame) {
              playerDoc.passingYardsPerGame = parseFloat((playerDoc.passYards / playerDoc.gamesPlayed).toFixed(2));
            }
            
            // Yards per completion (if not provided)
            if (playerDoc.passCompletions > 0 && !extractedStats.yardsPerCompletion) {
              playerDoc.yardsPerCompletion = parseFloat((playerDoc.passYards / playerDoc.passCompletions).toFixed(2));
            }
            
            // Yards per reception (if not provided)
            if (playerDoc.receptions > 0 && !extractedStats.yardsPerReception) {
              playerDoc.yardsPerReception = parseFloat((playerDoc.receivingYards / playerDoc.receptions).toFixed(2));
            }
            
            // Yards per rush attempt (if not provided)
            if (playerDoc.rushingAttempts > 0 && !extractedStats.yardsPerRushAttempt) {
              playerDoc.yardsPerRushAttempt = parseFloat((playerDoc.rushingYards / playerDoc.rushingAttempts).toFixed(2));
            }
            
            // Yards per pass attempt (if not provided)
            if (playerDoc.passAttempts > 0 && !extractedStats.yardsPerPassAttempt) {
              playerDoc.yardsPerPassAttempt = parseFloat((playerDoc.passYards / playerDoc.passAttempts).toFixed(2));
            }
            
            // Net yards per pass attempt (if not provided)
            if (playerDoc.netPassingAttempts > 0 && !extractedStats.netYardsPerPassAttempt) {
              playerDoc.netYardsPerPassAttempt = parseFloat((playerDoc.netPassingYards / playerDoc.netPassingAttempts).toFixed(2));
            }
            
            // Completion percentage (if not provided)
            if (playerDoc.passAttempts > 0 && !extractedStats.completionPct) {
              playerDoc.completionPercentage = parseFloat(((playerDoc.passCompletions / playerDoc.passAttempts) * 100).toFixed(2));
            }
            
            // Interception percentage (if not provided)
            if (playerDoc.passAttempts > 0 && !extractedStats.interceptionPct) {
              playerDoc.interceptionPct = parseFloat(((playerDoc.interceptions / playerDoc.passAttempts) * 100).toFixed(2));
            }
            
            // Touchdown percentage (if not provided)
            if (playerDoc.passAttempts > 0 && !extractedStats.passingTouchdownPct) {
              playerDoc.passingTouchdownPct = parseFloat(((playerDoc.passTouchdowns / playerDoc.passAttempts) * 100).toFixed(2));
            }
            
            // Total yards from scrimmage (if not provided)
            if (!extractedStats.totalYardsFromScrimmage) {
              playerDoc.totalYardsFromScrimmage = Math.round((playerDoc.rushingYards || 0) + (playerDoc.receivingYards || 0));
            }
            
            // Total yards from scrimmage per game (if not provided)
            if (playerDoc.gamesPlayed > 0 && !extractedStats.yardsFromScrimmagePerGame) {
              playerDoc.yardsFromScrimmagePerGame = parseFloat((playerDoc.totalYardsFromScrimmage / playerDoc.gamesPlayed).toFixed(2));
            }
            
            // Total points calculation (if not provided)
            if (!extractedStats.totalPoints) {
              let totalPoints = 0;
              totalPoints += (playerDoc.passingTouchdowns || 0) * 6;
              totalPoints += (playerDoc.rushingTouchdowns || 0) * 6;
              totalPoints += (playerDoc.receivingTouchdowns || 0) * 6;
              totalPoints += (playerDoc.returnTouchdowns || 0) * 6;
              totalPoints += (playerDoc.fieldGoalsMade || 0) * 3;
              totalPoints += (playerDoc.extraPointsMade || 0);
              totalPoints += (playerDoc.defensivePoints || 0);
              totalPoints += (playerDoc.miscPoints || 0);
              playerDoc.totalPoints = Math.round(totalPoints);
            }
            
            // Total two-point conversions (if not provided)
            if (!extractedStats.totalTwoPointConvs) {
              playerDoc.totalTwoPointConvs = Math.round((playerDoc.twoPointPassConvs || 0) + (playerDoc.twoPointRushConvs || 0) + (playerDoc.twoPointRecConvs || 0));
            }
            
            // Additional calculated fields
            // Net passing yards (if not provided)
            if (!extractedStats.netPassingYards && playerDoc.passYards && playerDoc.sackYards) {
              playerDoc.netPassingYards = Math.round(playerDoc.passYards - playerDoc.sackYards);
            }
            
            // Net passing attempts (if not provided)
            if (!extractedStats.netPassingAttempts && playerDoc.passAttempts && playerDoc.sacksTaken) {
              playerDoc.netPassingAttempts = Math.round(playerDoc.passAttempts + playerDoc.sacksTaken);
            }
            
            // Total yards (if not provided)
            if (!extractedStats.totalYards) {
              playerDoc.totalYards = Math.round((playerDoc.passYards || 0) + (playerDoc.rushingYards || 0) + (playerDoc.receivingYards || 0));
            }
            
            // Total yards per game (if not provided)
            if (playerDoc.gamesPlayed > 0 && !extractedStats.yardsPerGame) {
              playerDoc.yardsPerGame = parseFloat((playerDoc.totalYards / playerDoc.gamesPlayed).toFixed(2));
            }
            
            // Net yards per game (if not provided)
            if (playerDoc.gamesPlayed > 0 && !extractedStats.netYardsPerGame) {
              playerDoc.netYardsPerGame = parseFloat((playerDoc.netTotalYards / playerDoc.gamesPlayed).toFixed(2));
            }
            
            // Net total yards (if not provided)
            if (!extractedStats.netTotalYards && playerDoc.netPassingYards) {
              playerDoc.netTotalYards = Math.round((playerDoc.netPassingYards || 0) + (playerDoc.rushingYards || 0) + (playerDoc.receivingYards || 0));
            }
            
            // Total offensive plays (if not provided)
            if (!extractedStats.totalOffensivePlays) {
              playerDoc.totalOffensivePlays = Math.round((playerDoc.passAttempts || 0) + (playerDoc.rushingAttempts || 0) + (playerDoc.receivingTargets || 0));
            }
            
            // Total points per game (if not provided)
            if (playerDoc.gamesPlayed > 0 && !extractedStats.totalPointsPerGame) {
              playerDoc.totalPointsPerGame = parseFloat((playerDoc.totalPoints / playerDoc.gamesPlayed).toFixed(2));
            }
            
            // Team games played (if not provided)
            if (!extractedStats.teamGamesPlayed) {
              playerDoc.teamGamesPlayed = playerDoc.gamesPlayed;
            }

            if (Object.keys(extractedStats).length > 0) {
              statsFound = true;
              console.log(`✅ 2025 season stats loaded for ${player.displayName}: ${Object.keys(extractedStats).length} stats`);
              console.log(`📊 Sample mapped stats:`, {
                passYards: playerDoc.passYards,
                rushingYards: playerDoc.rushingYards,
                receivingYards: playerDoc.receivingYards,
                totalTackles: playerDoc.totalTackles,
                fieldGoalsMade: playerDoc.fieldGoalsMade,
                punts: playerDoc.punts,
                kickReturnYards: playerDoc.kickReturnYards
              });
            } else {
              console.log(`⚠️ No 2025 season stats found for ${player.displayName} - using default values (0)`);
            }

          } catch (err) {
            console.log(`❌ Stats error for ${player.displayName}: ${err.message}`);
            continue;
          }

          console.log(`✔ ${player.displayName} — ${statsFound ? 'Stats loaded' : 'No stats'}`);
          await collection.updateOne(
            { playerId: athleteId },
            { $set: playerDoc },
            { upsert: true }
          );
        }
      } catch (teamErr) {
        console.error(`❌ Failed team roster for team ID ${teamId}: ${teamErr.message}`);
      }
    }

    console.log('✅ All active NFL players processed.');
  } catch (err) {
    console.error('❌ Error fetching NFL teams:', err.message);
  }
}

async function getTopPlayers(statType, limit = 50) {
  try {
    const sortCriteria = {};
    sortCriteria[statType] = -1;

    const players = await NFLPlayer.find({ [statType]: { $exists: true, $ne: null } })
      .sort(sortCriteria)
      .limit(limit);

    console.log(`Found ${players.length} NFL players for stat: ${statType}`);
    return players;
  } catch (error) {
    console.error('Error fetching NFL players:', error);
    return [];
  }
}

async function getTeamPlayers(teamId, statType, limit = 50) {
  try {
    const sortCriteria = {};
    sortCriteria[statType] = -1;

    const players = await NFLPlayer.find({ 
      teamId: teamId,
      [statType]: { $exists: true, $ne: null } 
    })
      .sort(sortCriteria)
      .limit(limit);

    console.log(`Found ${players.length} NFL players for team ${teamId} sorted by ${statType}`);
    return players;
  } catch (error) {
    console.error('Error fetching NFL team players:', error);
    return [];
  }
}

async function searchPlayers(searchQuery) {
  try {
    const query = searchQuery.toLowerCase();
    const players = await NFLPlayer.find({
      $or: [
        { displayName: { $regex: query, $options: 'i' } },
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { shortName: { $regex: query, $options: 'i' } }
      ]
    });
    return players;
  } catch (error) {
    console.error('Error searching NFL players:', error);
    return [];
  }
}

async function refresh(homeTeamId, awayTeamId) {
  try {
    console.log(`🔄 Refreshing NFL stats for game: ${awayTeamId} @ ${homeTeamId}`);
    console.log(`✅ NFL stats refresh requested for game: ${awayTeamId} @ ${homeTeamId}`);
  } catch (error) {
    console.error(`❌ Error refreshing NFL stats for game: ${awayTeamId} @ ${homeTeamId}:`, error.message);
  }
}

module.exports = { 
  processActiveNflPlayersWithStats, 
  getTopPlayers, 
  getTeamPlayers,
  searchPlayers,
  refresh
};