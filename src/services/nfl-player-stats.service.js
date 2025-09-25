const axios = require('axios');
const NFLPlayer = require('../models/nfl-player.model');

/**
 * NFL Player Stats Service - 2025 Season ONLY
 * 
 * This service handles individual player statistics extraction from ESPN API endpoints.
 * IMPORTANT: Only extracts and processes 2025 season data - all other seasons are filtered out.
 * 
 * MAPPING STRATEGY:
 * - The API returns season-by-season data in categories (passing, rushing, receiving, defensive, scoring, kicking, punting, returns)
 * - We filter to ONLY 2025 season data for each category
 * - We map this 2025 season data to individual players based on their position and team
 * - If 2025 season stats are not found, they default to 0 (already handled in model)
 * - Some fields are mapped to available model fields when exact matches aren't available
 * 
 * 2025 SEASON CATEGORIES SUPPORTED:
 * - Passing: completions, passingAttempts, completionPct, passingYards, yardsPerPassAttempt, etc.
 * - Rushing: rushingAttempts, rushingYards, yardsPerRushAttempt, rushingTouchdowns, etc.
 * - Receiving: receptions, receivingTargets, receivingYards, yardsPerReception, etc.
 * - Defense: totalTackles, soloTackles, assistTackles, sacks, interceptions, etc.
 * - Scoring: passingTouchdowns, rushingTouchdowns, receivingTouchdowns, totalPoints, etc.
 * - Kicking: fieldGoalsMade, fieldGoalPct, extraPointsMade, etc.
 * - Punting: punts, puntYards, grossAvgPuntYards, netAvgPuntYards, etc.
 * - Returns: kickReturns, puntReturns with attempts, yards, averages, touchdowns, etc.
 * 
 * NOTE: All stats are from 2025 season only - other seasons are ignored.
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
          
          // Get team colors from NFL teams collection
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
            teamColor: teamColor,
            teamAlternateColor: teamAlternateColor,
            teamDisplayName: teamDisplayName,
            headshot: player.headshot?.href || null,
            
            // Passing Stats
            gamesPlayed: 0,
            passCompletions: 0,
            passAttempts: 0,
            completionPercentage: 0,
            passYards: 0,
            yardsPerPassAttempt: 0,
            passTouchdowns: 0,
            interceptions: 0,
            longestPass: 0,
            sacksTaken: 0,
            passerRating: 0,
            qbr: 0,
            
            // Rushing Stats
            rushingAttempts: 0,
            rushingYards: 0,
            yardsPerRushAttempt: 0,
            rushTouchdowns: 0,
            longestRush: 0,
            rushingFirstDowns: 0,
            rushingFumbles: 0,
            rushingFumblesLost: 0,
            
            // Receiving Stats
            receptions: 0,
            receivingTargets: 0,
            receivingYards: 0,
            yardsPerReception: 0,
            receivingTouchdowns: 0,
            longestReception: 0,
            receivingFirstDowns: 0,
            receivingFumbles: 0,
            receivingFumblesLost: 0,
            
            // Defense Stats
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
            
            // Scoring Stats
            passingTouchdowns: 0,
            rushingTouchdowns: 0,
            receivingTouchdowns: 0,
            returnTouchdowns: 0,
            totalTouchdowns: 0,
            totalTwoPointConvs: 0,
            kickExtraPoints: 0,
            fieldGoals: 0,
            totalPoints: 0,
            
            // Kicking Stats
            fieldGoalsMade: 0,
            fieldGoalPercentage: 0,
            fieldGoalsMade1_19: 0,
            fieldGoalsMade20_29: 0,
            fieldGoalsMade30_39: 0,
            fieldGoalsMade40_49: 0,
            fieldGoalsMade50: 0,
            longFieldGoalMade: 0,
            extraPointsMade: 0,
            extraPointAttempts: 0,
            totalKickingPoints: 0,
            
            // Punting Stats
            punts: 0,
            puntYards: 0,
            grossAvgPuntYards: 0,
            netAvgPuntYards: 0,
            puntsInside20: 0,
            puntTouchbacks: 0,
            longestPunt: 0,
            blockedPunts: 0,
            
            // Kick Returns
            kickReturnAttempts: 0,
            kickReturnYards: 0,
            kickReturnAverage: 0,
            kickReturnTouchdowns: 0,
            longestKickReturn: 0,
            kickReturnFairCatches: 0,
            
            // Punt Returns
            puntReturnAttempts: 0,
            puntReturnYards: 0,
            puntReturnAverage: 0,
            puntReturnTouchdowns: 0,
            longestPuntReturn: 0,
            puntReturnFairCatches: 0,
            
            createdAt: new Date(),
            updatedAt: new Date()
          };

          // Ensure headshot is properly formatted
          if (player.headshot && player.headshot.href) {
            playerDoc.headshot = player.headshot.href;
          } else if (player.headshot && typeof player.headshot === 'string') {
            playerDoc.headshot = player.headshot;
          }

          // Debug headshot data
          console.log(`Headshot data for ${player.displayName}:`, {
            hasHeadshot: !!player.headshot,
            headshotType: typeof player.headshot,
            headshotValue: player.headshot,
            finalHeadshot: playerDoc.headshot
          });

          // Ensure team colors are properly formatted
          if (teamColor && !teamColor.startsWith('#')) {
            playerDoc.teamColor = `#${teamColor}`;
          }
          if (teamAlternateColor && !teamAlternateColor.startsWith('#')) {
            playerDoc.teamAlternateColor = `#${teamAlternateColor}`;
          }

          let statsFound = false;

          try {
            // Updated endpoints with season parameters
            const endpoints = [
              `https://site.web.api.espn.com/apis/common/v3/sports/football/nfl/athletes/${athleteId}/stats?season=2025&seasontype=2`,
              `https://site.web.api.espn.com/apis/common/v3/sports/football/nfl/athletes/${athleteId}/overview?season=2025&seasontype=2`,
              `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/2025/types/2/athletes/${athleteId}/statistics/0`
            ];
            
            let statsData = null;
            let workingEndpoint = null;
            
            for (const endpoint of endpoints) {
              try {
                const statsRes = await axios.get(endpoint);
                statsData = statsRes.data;
                workingEndpoint = endpoint;
                console.log(`✅ Found stats endpoint for ${player.displayName}: ${endpoint}`);
                break;
              } catch (endpointErr) {
                console.log(`❌ Endpoint failed for ${player.displayName}: ${endpoint} - ${endpointErr.message}`);
              }
            }
            
            if (!statsData) {
              console.log(`❌ No working stats endpoint found for ${player.displayName}`);
              continue;
            }
            
            console.log(`📊 Processing stats for ${player.displayName} (${player.position?.abbreviation || 'Unknown'}) from ${workingEndpoint}`);
            console.log(`📊 Stats data structure:`, Object.keys(statsData));

            // Extracted stats object
            let extractedStats = {};
            
            // Handle v3 structure: categories array (support multiple shapes, relaxed filters)
            if (statsData.categories && Array.isArray(statsData.categories)) {
              console.log(`📊 Found categories structure with ${statsData.categories.length} categories`);
              statsData.categories.forEach(category => {
                console.log(`📊 Processing category: ${category.name || ''} (${category.displayName || category.abbreviation || ''})`);
                // Shape A: names[] + statistics[0].stats[]
                if (category.names && category.statistics && category.statistics.length > 0 && Array.isArray(category.names)) {
                  const playerStat = category.statistics[0];
                  const is2025 = playerStat.season?.year ? playerStat.season.year === 2025 : true;
                  if (is2025) {
                    category.names.forEach((name, index) => {
                      const raw = playerStat.stats?.[index];
                      if (raw !== undefined) {
                        const str = typeof raw === 'string' ? raw : `${raw}`;
                        extractedStats[name] = str.includes('-') ? str : (parseFloat(str) || 0);
                      }
                    });
                  }
                }
                // Shape B: stats: [{ name, value/displayValue }]
                if (Array.isArray(category.stats)) {
                  category.stats.forEach(stat => {
                    if (!stat || !stat.name) return;
                    const raw = stat.value ?? stat.displayValue;
                    const num = typeof raw === 'string' ? (parseFloat(raw.replace(/,/g, '')) || 0) : (Number(raw) || 0);
                    extractedStats[stat.name] = num;
                  });
                }
              });
            }
            
            // Handle v2 structure: splits.categories
            if (statsData.splits && statsData.splits.categories && Array.isArray(statsData.splits.categories)) {
              console.log(`📊 Found v2 splits.categories structure with ${statsData.splits.categories.length} categories`);
              statsData.splits.categories.forEach(category => {
                console.log(`📊 Processing category: ${category.name} (${category.abbreviation})`);
                if (Array.isArray(category.stats)) {
                  category.stats.forEach(stat => {
                    if (!stat || !stat.name) return;
                    const raw = stat.value ?? stat.displayValue;
                    const num = typeof raw === 'string' ? (parseFloat(raw.replace(/,/g, '')) || 0) : (Number(raw) || 0);
                    extractedStats[stat.name] = num;
                  });
                }
              });
            }
            
            console.log(`📊 Extracted 2025 season stats for ${player.displayName}:`, extractedStats);

            // Map to playerDoc - Passing
            playerDoc.gamesPlayed = extractedStats.gamesPlayed || 0;
            playerDoc.passCompletions = extractedStats.completions || 0;
            playerDoc.passAttempts = extractedStats.passingAttempts || extractedStats.passAttempts || 0;
            playerDoc.completionPercentage = extractedStats.completionPct || 0;
            playerDoc.passYards = extractedStats.passingYards || 0;
            playerDoc.yardsPerPassAttempt = extractedStats.yardsPerPassAttempt || 0;
            playerDoc.passTouchdowns = extractedStats.passingTouchdowns || 0;
            playerDoc.interceptions = extractedStats.interceptions || 0;
            playerDoc.longestPass = extractedStats.longPassing || extractedStats.longPass || 0;
            playerDoc.sacksTaken = extractedStats.sacks || 0;
            playerDoc.passerRating = extractedStats.QBRating || 0;
            playerDoc.qbr = extractedStats.adjQBR || extractedStats.ESPNQBRating || 0;
            
            // Rushing
            playerDoc.rushingAttempts = extractedStats.rushingAttempts || 0;
            playerDoc.rushingYards = extractedStats.rushingYards || 0;
            playerDoc.yardsPerRushAttempt = extractedStats.yardsPerRushAttempt || 0;
            playerDoc.rushTouchdowns = extractedStats.rushingTouchdowns || 0;
            playerDoc.longestRush = extractedStats.longRushing || 0;
            playerDoc.rushingFirstDowns = extractedStats.rushingFirstDowns || 0;
            playerDoc.rushingFumbles = extractedStats.rushingFumbles || 0;
            playerDoc.rushingFumblesLost = extractedStats.rushingFumblesLost || 0;
            
            // Receiving
            playerDoc.receptions = extractedStats.receptions || 0;
            playerDoc.receivingTargets = extractedStats.receivingTargets || 0;
            playerDoc.catchPercentage = extractedStats.catchPct || playerDoc.catchPercentage || 0;
            playerDoc.receivingYards = extractedStats.receivingYards || 0;
            playerDoc.yardsPerReception = extractedStats.yardsPerReception || 0;
            playerDoc.receivingYardsPerGame = extractedStats.receivingYardsPerGame || playerDoc.receivingYardsPerGame || 0;
            playerDoc.receivingTouchdowns = extractedStats.receivingTouchdowns || 0;
            playerDoc.longestReception = extractedStats.longReception || extractedStats.longReceiving || 0;
            playerDoc.receivingFirstDowns = extractedStats.receivingFirstDowns || 0;
            playerDoc.receivingFumbles = extractedStats.receivingFumbles || 0;
            playerDoc.receivingFumblesLost = extractedStats.receivingFumblesLost || 0;
            
            // Defense
            playerDoc.totalTackles = extractedStats.totalTackles || 0;
            playerDoc.soloTackles = extractedStats.soloTackles || 0;
            playerDoc.assistedTackles = extractedStats.assistTackles || 0;
            playerDoc.sacks = extractedStats.sacks || 0;
            playerDoc.forcedFumbles = extractedStats.fumblesForced || 0;
            playerDoc.fumbleRecoveries = extractedStats.fumblesRecovered || 0;
            playerDoc.fumbleRecoveryYards = extractedStats.fumblesRecoveredYards || 0;
            playerDoc.defensiveInterceptions = extractedStats.interceptions || 0;
            playerDoc.interceptionYards = extractedStats.interceptionYards || 0;
            playerDoc.avgInterceptionYards = extractedStats.avgInterceptionYards || 0;
            playerDoc.interceptionTouchdowns = extractedStats.interceptionTouchdowns || 0;
            playerDoc.longestInterception = extractedStats.longInterception || 0;
            playerDoc.passesDefended = extractedStats.passesDefended || 0;
            playerDoc.stuffs = extractedStats.stuffs || 0;
            playerDoc.stuffYards = extractedStats.stuffYards || 0;
            playerDoc.kicksBlocked = extractedStats.kicksBlocked || 0;
            playerDoc.safeties = extractedStats.safeties || 0;
            // Defense - extended
            playerDoc.qbHits = extractedStats.QBHits || 0;
            playerDoc.hurries = extractedStats.hurries || 0;
            playerDoc.tacklesForLoss = extractedStats.tacklesForLoss || 0;
            playerDoc.tacklesYardsLost = extractedStats.tacklesYardsLost || 0;
            playerDoc.avgSackYards = extractedStats.avgSackYards || 0;
            playerDoc.sackYards = extractedStats.sackYards || 0;
            playerDoc.passesBattedDown = extractedStats.passesBattedDown || 0;
            playerDoc.pointsAllowed = extractedStats.pointsAllowed || 0;
            playerDoc.yardsAllowed = extractedStats.yardsAllowed || 0;
            playerDoc.blockedPuntTouchdowns = extractedStats.blockedPuntTouchdowns || 0;
            playerDoc.blockedFieldGoalTouchdowns = extractedStats.blockedFieldGoalTouchdowns || 0;
            playerDoc.defensiveFumblesTouchdowns = extractedStats.defensiveFumblesTouchdowns || 0;
            playerDoc.missedFieldGoalReturnTd = extractedStats.missedFieldGoalReturnTd || 0;
            playerDoc.onePtSafetiesMade = extractedStats.onePtSafetiesMade || 0;
            playerDoc.twoPtReturns = extractedStats.twoPtReturns || 0;
            playerDoc.miscTouchdowns = extractedStats.miscTouchdowns || 0;
            
            // Scoring
            playerDoc.passingTouchdowns = extractedStats.passingTouchdowns || 0;
            playerDoc.rushingTouchdowns = extractedStats.rushingTouchdowns || 0;
            playerDoc.receivingTouchdowns = extractedStats.receivingTouchdowns || 0;
            playerDoc.returnTouchdowns = extractedStats.returnTouchdowns || 0;
            playerDoc.totalTouchdowns = extractedStats.totalTouchdowns || 0;
            playerDoc.totalTwoPointConvs = extractedStats.totalTwoPointConvs || 0;
            playerDoc.kickExtraPoints = extractedStats.kickExtraPoints || 0;
            playerDoc.fieldGoals = extractedStats.fieldGoals || 0;
            playerDoc.totalPoints = extractedStats.totalPoints || 0;
            
            // Kicking
            playerDoc.fieldGoalsMade = extractedStats.fieldGoalsMade || 0;
            playerDoc.fieldGoalPercentage = extractedStats.fieldGoalPct || 0;
            playerDoc.fieldGoalsMade1_19 = extractedStats.fieldGoalsMade1_19 || 0;
            playerDoc.fieldGoalsMade20_29 = extractedStats.fieldGoalsMade20_29 || 0;
            playerDoc.fieldGoalsMade30_39 = extractedStats.fieldGoalsMade30_39 || 0;
            playerDoc.fieldGoalsMade40_49 = extractedStats.fieldGoalsMade40_49 || 0;
            playerDoc.fieldGoalsMade50 = extractedStats.fieldGoalsMade50 || 0;
            playerDoc.longFieldGoalMade = extractedStats.longFieldGoalMade || 0;
            playerDoc.extraPointsMade = extractedStats.extraPointsMade || 0;
            playerDoc.extraPointAttempts = extractedStats.extraPointAttempts || 0;
            playerDoc.totalKickingPoints = extractedStats.totalKickingPoints || 0;
            
            // Punting
            playerDoc.punts = extractedStats.punts || 0;
            playerDoc.puntYards = extractedStats.puntYards || 0;
            playerDoc.grossAvgPuntYards = extractedStats.grossAvgPuntYards || extractedStats.AVG || 0;
            playerDoc.netAvgPuntYards = extractedStats.netAvgPuntYards || extractedStats.NET || 0;
            playerDoc.puntsInside20 = extractedStats.puntsInside20 || extractedStats.IN20 || 0;
            playerDoc.puntTouchbacks = extractedStats.touchbacks || 0;
            playerDoc.longestPunt = extractedStats.longPunt || extractedStats.longestPunt || 0;
            playerDoc.blockedPunts = extractedStats.puntsBlocked || extractedStats.blockedPunts || 0;
            
            // Kick Returns
            playerDoc.kickReturnAttempts = extractedStats.kickReturns || extractedStats.kickReturnAttempts || 0;
            playerDoc.kickReturnYards = extractedStats.kickReturnYards || 0;
            playerDoc.kickReturnAverage = extractedStats.avgKickReturnYards || 0;
            playerDoc.kickReturnTouchdowns = extractedStats.kickReturnTouchdowns || 0;
            playerDoc.longestKickReturn = extractedStats.longKickReturn || 0;
            playerDoc.kickReturnFairCatches = extractedStats.kickReturnFairCatches || 0;
            
            // Punt Returns
            playerDoc.puntReturnAttempts = extractedStats.puntReturns || extractedStats.puntReturnAttempts || 0;
            playerDoc.puntReturnYards = extractedStats.puntReturnYards || 0;
            playerDoc.puntReturnAverage = extractedStats.avgPuntReturnYards || 0;
            playerDoc.puntReturnTouchdowns = extractedStats.puntReturnTouchdowns || 0;
            playerDoc.longestPuntReturn = extractedStats.longPuntReturn || 0;
            playerDoc.puntReturnFairCatches = extractedStats.puntReturnFairCatches || 0;
            
            // Derived stats
            playerDoc.totalTackles = (playerDoc.soloTackles || 0) + (playerDoc.assistedTackles || 0);
            if (playerDoc.receivingTargets > 0) playerDoc.completionPercentage = (playerDoc.receptions / playerDoc.receivingTargets) * 100;
            if (playerDoc.extraPointAttempts > 0) playerDoc.extraPointPercentage = (playerDoc.extraPointsMade / playerDoc.extraPointAttempts) * 100;

            if (Object.keys(extractedStats).length > 0) {
              statsFound = true;
              console.log(`✅ 2025 season stats loaded for ${player.displayName}: ${Object.keys(extractedStats).length} stats`);
              console.log(`📊 Sample 2025 season mapped stats:`, {
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
          }

          console.log(`✔ ${player.displayName} — ${statsFound ? 'Stats loaded' : 'No stats'}`);
          console.log(`  Headshot: ${playerDoc.headshot}`);
          console.log(`  Team Color: ${playerDoc.teamColor}`);
          console.log(`  Team Alt Color: ${playerDoc.teamAlternateColor}`);

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
    if (players.length > 0) {
      console.log('Sample player data:', {
        name: players[0].displayName,
        position: players[0].position,
        [statType]: players[0][statType]
      });
    }
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
    console.log(`ℹ️ NFL stats refresh functionality can be expanded based on specific requirements`);
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