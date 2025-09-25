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
            rushingAttempts: 0,
            rushingYards: 0,
            yardsPerRushAttempt: 0,
            rushTouchdowns: 0,
            longestRush: 0,
            rushingFirstDowns: 0,
            rushingFumbles: 0,
            rushingFumblesLost: 0,
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

            // Handle v2 structure: splits.categories
            if (statsData.splits && statsData.splits.categories) {
              statsData.splits.categories.forEach(category => {
                console.log(`📊 Processing category: ${category.name} (${category.abbreviation})`);
                category.stats.forEach(stat => {
                  extractedStats[stat.name] = parseFloat(stat.value) || 0;
                  console.log(`📊 Mapped ${stat.name} = ${extractedStats[stat.name]} (2025 season)`);
                });
              });
            }

            // Parse combined fields
            if (extractedStats['fieldGoalsMade-fieldGoalAttempts']) {
              const [fgm, fga] = extractedStats['fieldGoalsMade-fieldGoalAttempts'].split('-').map(Number) || [0, 0];
              extractedStats.fieldGoalsMade = fgm;
              extractedStats.fieldGoalAttempts = fga;
              console.log(`📊 Parsed fieldGoalsMade=${fgm}, fieldGoalAttempts=${fga}`);
            }
            ['1_19', '20_29', '30_39', '40_49', '50'].forEach(range => {
              const key = `fieldGoalsMade${range}-fieldGoalAttempts${range}`;
              if (extractedStats[key]) {
                extractedStats[`fieldGoalsMade${range}`] = parseInt(extractedStats[key].split('-')[0]) || 0;
                console.log(`📊 Parsed ${key} to fieldGoalsMade${range}=${extractedStats[`fieldGoalsMade${range}`]}`);
              }
            });
            if (extractedStats['extraPointsMade-extraPointAttempts']) {
              const [xpm, xpa] = extractedStats['extraPointsMade-extraPointAttempts'].split('-').map(Number) || [0, 0];
              extractedStats.extraPointsMade = xpm;
              extractedStats.extraPointAttempts = xpa;
              console.log(`📊 Parsed extraPointsMade=${xpm}, extraPointAttempts=${xpa}`);
            }

            // Map to playerDoc
            playerDoc.gamesPlayed = Math.round(extractedStats.gamesPlayed || 0);
            // Passing
            playerDoc.passCompletions = Math.round(extractedStats.completions || extractedStats.CMP || 0);
            playerDoc.passAttempts = Math.round(extractedStats.passingAttempts || extractedStats.ATT || 0);
            playerDoc.completionPercentage = parseFloat((extractedStats.completionPct || extractedStats['CMP%'] || 0).toFixed(2));
            playerDoc.passYards = Math.round(extractedStats.passingYards || extractedStats.YDS || 0);
            playerDoc.yardsPerPassAttempt = parseFloat((extractedStats.yardsPerPassAttempt || extractedStats.AVG || 0).toFixed(2));
            playerDoc.passTouchdowns = Math.round(extractedStats.passingTouchdowns || extractedStats.TD || 0);
            playerDoc.interceptions = Math.round(extractedStats.interceptions || extractedStats.INT || 0);
            playerDoc.longestPass = Math.round(extractedStats.longPassing || extractedStats.LNG || 0);
            playerDoc.sacksTaken = Math.round(extractedStats.totalSacks || extractedStats.SACK || 0);
            playerDoc.sackYards = Math.round(extractedStats.sackYards || 0);
            playerDoc.passerRating = parseFloat((extractedStats.QBRating || extractedStats.RTG || 0).toFixed(2));
            playerDoc.qbr = parseFloat((extractedStats.adjQBR || extractedStats.QBR || 0).toFixed(2));
            // Rushing
            playerDoc.rushingAttempts = Math.round(extractedStats.rushingAttempts || extractedStats.CAR || 0);
            playerDoc.rushingYards = Math.round(extractedStats.rushingYards || extractedStats.YDS || 0);
            playerDoc.yardsPerRushAttempt = parseFloat((extractedStats.yardsPerRushAttempt || extractedStats.AVG || 0).toFixed(2));
            playerDoc.rushTouchdowns = Math.round(extractedStats.rushingTouchdowns || extractedStats.RUSH || 0);
            playerDoc.longestRush = Math.round(extractedStats.longRushing || extractedStats.LNG || 0);
            playerDoc.rushingFirstDowns = Math.round(extractedStats.rushingFirstDowns || 0);
            playerDoc.rushingFumbles = Math.round(extractedStats.rushingFumbles || extractedStats.FUM || 0);
            playerDoc.rushingFumblesLost = Math.round(extractedStats.rushingFumblesLost || extractedStats.LST || 0);
            // Receiving
            playerDoc.receptions = Math.round(extractedStats.receptions || extractedStats.REC || 0);
            playerDoc.receivingTargets = Math.round(extractedStats.receivingTargets || extractedStats.TGTS || 0);
            playerDoc.receivingYards = Math.round(extractedStats.receivingYards || extractedStats.YDS || 0);
            playerDoc.yardsPerReception = parseFloat((extractedStats.yardsPerReception || extractedStats.AVG || 0).toFixed(2));
            playerDoc.receivingYardsPerGame = parseFloat((playerDoc.receivingYards / (playerDoc.gamesPlayed || 1) || 0).toFixed(2));
            playerDoc.receivingTouchdowns = Math.round(extractedStats.receivingTouchdowns || extractedStats.TD || 0);
            playerDoc.longestReception = Math.round(extractedStats.longReception || extractedStats.LNG || 0);
            playerDoc.receivingFirstDowns = Math.round(extractedStats.receivingFirstDowns || 0);
            playerDoc.receivingFumbles = Math.round(extractedStats.receivingFumbles || extractedStats.FUM || 0);
            playerDoc.receivingFumblesLost = Math.round(extractedStats.receivingFumblesLost || extractedStats.LST || 0);
            playerDoc.catchPercentage = parseFloat((extractedStats.receptionPercentage || extractedStats['CATCH%'] || (playerDoc.receptions / (playerDoc.receivingTargets || 1) * 100) || 0).toFixed(2));
            // Defense
            playerDoc.totalTackles = Math.round(extractedStats.totalTackles || extractedStats.TOT || 0);
            playerDoc.soloTackles = Math.round(extractedStats.soloTackles || extractedStats.SOLO || 0);
            playerDoc.assistedTackles = Math.round(extractedStats.assistTackles || extractedStats.AST || 0);
            playerDoc.sacks = parseFloat((extractedStats.totalSacks || extractedStats.SACK || 0).toFixed(2));
            playerDoc.forcedFumbles = Math.round(extractedStats.forcedFumbles || extractedStats.FF || 0);
            playerDoc.fumbleRecoveries = Math.round(extractedStats.fumblesRecovered || extractedStats.FR || 0);
            playerDoc.fumbleRecoveryYards = Math.round(extractedStats.fumblesRecoveredYards || 0);
            playerDoc.defensiveInterceptions = Math.round(extractedStats.interceptions || extractedStats.INT || 0);
            playerDoc.interceptionYards = Math.round(extractedStats.interceptionYards || 0);
            playerDoc.avgInterceptionYards = parseFloat((extractedStats.avgInterceptionYards || 0).toFixed(2));
            playerDoc.interceptionTouchdowns = Math.round(extractedStats.defensiveTouchdowns || extractedStats.TD || 0);
            playerDoc.longestInterception = Math.round(extractedStats.longInterception || extractedStats.LNG || 0);
            playerDoc.passesDefended = Math.round(extractedStats.passesDefended || extractedStats.PD || 0);
            playerDoc.stuffs = Math.round(extractedStats.stuffs || extractedStats.STF || 0);
            playerDoc.stuffYards = Math.round(extractedStats.stuffYards || 0);
            playerDoc.kicksBlocked = Math.round(extractedStats.kicksBlocked || extractedStats.BK || 0);
            playerDoc.safeties = Math.round(extractedStats.safeties || extractedStats.SFTY || 0);
            // Scoring
            playerDoc.passingTouchdowns = Math.round(extractedStats.passingTouchdowns || extractedStats.TD || 0);
            playerDoc.rushingTouchdowns = Math.round(extractedStats.rushingTouchdowns || extractedStats.RUSH || 0);
            playerDoc.receivingTouchdowns = Math.round(extractedStats.receivingTouchdowns || extractedStats.TD || 0);
            playerDoc.returnTouchdowns = Math.round(extractedStats.returnTouchdowns || extractedStats.RET || 0);
            playerDoc.totalTouchdowns = Math.round(extractedStats.totalTouchdowns || (playerDoc.passingTouchdowns + playerDoc.rushingTouchdowns + playerDoc.receivingTouchdowns + playerDoc.returnTouchdowns) || 0);
            playerDoc.totalTwoPointConvs = Math.round(extractedStats.totalTwoPointConvs || 0);
            playerDoc.kickExtraPoints = Math.round(extractedStats.kickExtraPoints || extractedStats.XPM || 0);
            playerDoc.fieldGoals = Math.round(extractedStats.fieldGoals || extractedStats.FG || 0);
            playerDoc.totalPoints = Math.round(extractedStats.totalPoints || extractedStats.PTS || 0);
            // Kicking
            playerDoc.fieldGoalsMade = Math.round(extractedStats.fieldGoalsMade || extractedStats.FGM || 0);
            playerDoc.fieldGoalAttempts = Math.round(extractedStats.fieldGoalAttempts || extractedStats.FGA || 0);
            playerDoc.fieldGoalPercentage = parseFloat((extractedStats.fieldGoalPercentage || extractedStats['FG%'] || (playerDoc.fieldGoalsMade / (playerDoc.fieldGoalAttempts || 1) * 100) || 0).toFixed(2));
            playerDoc.fieldGoalsMade1_19 = Math.round(extractedStats.fieldGoalsMade1_19 || 0);
            playerDoc.fieldGoalsMade20_29 = Math.round(extractedStats.fieldGoalsMade20_29 || 0);
            playerDoc.fieldGoalsMade30_39 = Math.round(extractedStats.fieldGoalsMade30_39 || 0);
            playerDoc.fieldGoalsMade40_49 = Math.round(extractedStats.fieldGoalsMade40_49 || 0);
            playerDoc.fieldGoalsMade50 = Math.round(extractedStats.fieldGoalsMade50 || 0);
            playerDoc.longFieldGoalMade = Math.round(extractedStats.longestFieldGoal || extractedStats.LNG || 0);
            playerDoc.extraPointsMade = Math.round(extractedStats.extraPointsMade || extractedStats.XPM || 0);
            playerDoc.extraPointAttempts = Math.round(extractedStats.extraPointAttempts || extractedStats.XPA || 0);
            playerDoc.extraPointPercentage = parseFloat((extractedStats.extraPointPercentage || extractedStats['XP%'] || (playerDoc.extraPointsMade / (playerDoc.extraPointAttempts || 1) * 100) || 0).toFixed(2));
            playerDoc.totalKickingPoints = Math.round(extractedStats.totalPoints || extractedStats.PTS || 0);
            // Punting
            playerDoc.punts = Math.round(extractedStats.punts || extractedStats.PUNTS || 0);
            playerDoc.puntYards = Math.round(extractedStats.puntYards || extractedStats.YDS || 0);
            playerDoc.grossAvgPuntYards = parseFloat((extractedStats.puntAverage || extractedStats.AVG || 0).toFixed(2));
            playerDoc.netAvgPuntYards = parseFloat((extractedStats.netPuntAverage || extractedStats.NET || 0).toFixed(2));
            playerDoc.puntsInside20 = Math.round(extractedStats.puntsInside20 || extractedStats.IN20 || 0);
            playerDoc.puntTouchbacks = Math.round(extractedStats.touchbacks || extractedStats.TB || 0);
            playerDoc.longestPunt = Math.round(extractedStats.longestPunt || extractedStats.LNG || 0);
            playerDoc.blockedPunts = Math.round(extractedStats.blockedPunts || extractedStats.BP || 0);
            // Kick Returns
            playerDoc.kickReturnAttempts = Math.round(extractedStats.kickReturnAttempts || extractedStats.KR || 0);
            playerDoc.kickReturnYards = Math.round(extractedStats.kickReturnYards || extractedStats.YDS || 0);
            playerDoc.kickReturnAverage = parseFloat((extractedStats.kickReturnAverage || extractedStats.AVG || 0).toFixed(2));
            playerDoc.kickReturnTouchdowns = Math.round(extractedStats.kickReturnTouchdowns || extractedStats.RET || 0);
            playerDoc.longestKickReturn = Math.round(extractedStats.kickReturnLongest || extractedStats.LNG || 0);
            playerDoc.kickReturnFairCatches = Math.round(extractedStats.kickReturnFairCatches || extractedStats.KRFC || 0);
            // Punt Returns
            playerDoc.puntReturnAttempts = Math.round(extractedStats.puntReturnAttempts || extractedStats.PR || 0);
            playerDoc.puntReturnYards = Math.round(extractedStats.puntReturnYards || extractedStats.YDS || 0);
            playerDoc.puntReturnAverage = parseFloat((extractedStats.puntReturnAverage || extractedStats.AVG || 0).toFixed(2));
            playerDoc.puntReturnTouchdowns = Math.round(extractedStats.puntReturnTouchdowns || extractedStats.RET || 0);
            playerDoc.longestPuntReturn = Math.round(extractedStats.puntReturnLongest || extractedStats.LNG || 0);
            playerDoc.puntReturnFairCatches = Math.round(extractedStats.puntReturnFairCatches || extractedStats.FC || 0);

            // Derive additional fields
            playerDoc.totalTackles = Math.round((playerDoc.soloTackles || 0) + (playerDoc.assistedTackles || 0));
            if (playerDoc.receivingTargets > 0) {
              playerDoc.catchPercentage = parseFloat(((playerDoc.receptions / playerDoc.receivingTargets) * 100).toFixed(2));
            }
            if (playerDoc.fieldGoalAttempts > 0) {
              playerDoc.fieldGoalPercentage = parseFloat(((playerDoc.fieldGoalsMade / playerDoc.fieldGoalAttempts) * 100).toFixed(2));
            }
            if (playerDoc.extraPointAttempts > 0) {
              playerDoc.extraPointPercentage = parseFloat(((playerDoc.extraPointsMade / playerDoc.extraPointAttempts) * 100).toFixed(2));
            }
            // Derive sackYards if grossYards available
            if (extractedStats.grossYards && playerDoc.passYards) {
              playerDoc.sackYards = Math.round(extractedStats.grossYards - playerDoc.passYards);
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