const axios = require('axios');
const NHLPlayer = require('../models/nhl-player.model');

/**
 * NHL Player Stats Service - 2025 Season ONLY
 * 
 * Handles extraction of individual player statistics from ESPN API endpoint for the 2025 NHL regular season.
 * Endpoint: https://sports.core.api.espn.com/v2/sports/hockey/leagues/nhl/seasons/2025/types/2/athletes/{athleteId}/statistics/0
 * Filters to 2025 season data (seasontype=2) and maps stats to the NHLPlayer schema.
 * Handles both skating players and goaltenders with comprehensive stats.
 * 
 * Supported Categories:
 * - General: games, wins, losses, timeOnIce, shifts, production, etc.
 * - Offensive: goals, assists, points, faceoffs, power play, shooting, shootout, etc.
 * - Defensive: goalsAgainst, saves, savePct, shotsAgainst, shutouts, blocked shots, hits, etc.
 * - Penalties: penaltyMinutes, major/minor penalties, specific penalty types, etc.
 */

async function processNhlPlayersWithStats(db) {
  const collection = db.collection('nhlplayers');

  try {
    const teamsRes = await axios.get('https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams');
    const teams = teamsRes.data.sports[0].leagues[0].teams;

    for (const team of teams) {
      const teamId = team.team.id;
      const rosterUrl = `https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams/${teamId}/roster`;

      try {
        const rosterRes = await axios.get(rosterUrl);
        const players = rosterRes.data.athletes.flatMap(group => group.items);

        for (const player of players) {
          const athleteId = player.id;
          
          // Get team colors from nhlteams collection
          let teamColor = null;
          let teamAlternateColor = null;
          let teamDisplayName = null;
          try {
            const teamDoc = await db.collection('nhlteams').findOne({ teamId });
            if (teamDoc) {
              teamColor = teamDoc.color;
              teamAlternateColor = teamDoc.alternateColor;
              teamDisplayName = teamDoc.displayName;
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
            // Initialize all stats to 0
            games: 0,
            gameStarted: 0,
            teamGamesPlayed: 0,
            wins: 0,
            losses: 0,
            ties: 0,
            plusMinus: 0,
            timeOnIce: 0,
            timeOnIcePerGame: 0,
            shifts: 0,
            shiftsPerGame: 0,
            production: 0,
            goals: 0,
            avgGoals: 0,
            assists: 0,
            shotsTotal: 0,
            avgShots: 0,
            points: 0,
            pointsPerGame: 0,
            powerPlayGoals: 0,
            powerPlayAssists: 0,
            shortHandedGoals: 0,
            shortHandedAssists: 0,
            shootoutAttempts: 0,
            shootoutGoals: 0,
            shootoutShotPct: 0,
            shootingPct: 0,
            totalFaceOffs: 0,
            faceoffsWon: 0,
            faceoffsLost: 0,
            faceoffPercent: 0,
            gameTyingGoals: 0,
            gameWinningGoals: 0,
            goalsAgainst: 0,
            avgGoalsAgainst: 0,
            shotsAgainst: 0,
            avgShotsAgainst: 0,
            shootoutSaves: 0,
            shootoutShotsAgainst: 0,
            shootoutSavePct: 0,
            emptyNetGoalsAgainst: 0,
            shutouts: 0,
            saves: 0,
            savePct: 0,
            overtimeLosses: 0,
            blockedShots: 0,
            hits: 0,
            evenStrengthSaves: 0,
            powerPlaySaves: 0,
            shortHandedSaves: 0,
            penaltyMinutes: 0,
            majorPenalties: 0,
            minorPenalties: 0,
            matchPenalties: 0,
            misconducts: 0,
            gameMisconducts: 0,
            boardingPenalties: 0,
            unsportsmanlikePenalties: 0,
            fightingPenalties: 0,
            avgFights: 0,
            timeBetweenFights: 0,
            instigatorPenalties: 0,
            chargingPenalties: 0,
            hookingPenalties: 0,
            trippingPenalties: 0,
            roughingPenalties: 0,
            holdingPenalties: 0,
            interferencePenalties: 0,
            slashingPenalties: 0,
            highStickingPenalties: 0,
            crossCheckingPenalties: 0,
            stickHoldingPenalties: 0,
            goalieInterferencePenalties: 0,
            elbowingPenalties: 0,
            divingPenalties: 0,
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
            const endpoint = `https://sports.core.api.espn.com/v2/sports/hockey/leagues/nhl/seasons/2025/types/2/athletes/${athleteId}/statistics/0`;
            const statsRes = await axios.get(endpoint);
            const statsData = statsRes.data;

            console.log(`✅ Found stats for ${player.displayName} (${player.position?.abbreviation || 'Unknown'}) at ${endpoint}`);

            let extractedStats = {};

            // Handle API structure: splits.categories array
            if (statsData.splits && statsData.splits.categories && Array.isArray(statsData.splits.categories)) {
              statsData.splits.categories.forEach(category => {
                console.log(`📊 Processing category: ${category.name}`);
                if (category.stats && Array.isArray(category.stats)) {
                  category.stats.forEach(stat => {
                    const fieldName = stat.name;
                    const value = parseFloat(stat.value) || 0;
                    extractedStats[fieldName] = value;
                    console.log(`📊 Mapped ${fieldName} = ${value} (from ${category.name} category)`);
                  });
                }
              });
            }

            // Map extracted stats to playerDoc
            // General Stats
            playerDoc.games = Math.round(extractedStats.games || 0);
            playerDoc.gameStarted = Math.round(extractedStats.gameStarted || 0);
            playerDoc.teamGamesPlayed = Math.round(extractedStats.teamGamesPlayed || 0);
            playerDoc.wins = Math.round(extractedStats.wins || 0);
            playerDoc.losses = Math.round(extractedStats.losses || 0);
            playerDoc.ties = Math.round(extractedStats.ties || 0);
            playerDoc.plusMinus = Math.round(extractedStats.plusMinus || 0);
            playerDoc.timeOnIce = Math.round(extractedStats.timeOnIce || 0);
            playerDoc.timeOnIcePerGame = parseFloat((extractedStats.timeOnIcePerGame || 0).toFixed(3));
            playerDoc.shifts = Math.round(extractedStats.shifts || 0);
            playerDoc.shiftsPerGame = parseFloat((extractedStats.shiftsPerGame || 0).toFixed(3));
            playerDoc.production = parseFloat((extractedStats.production || 0).toFixed(3));

            // Offensive Stats
            playerDoc.goals = Math.round(extractedStats.goals || 0);
            playerDoc.avgGoals = parseFloat((extractedStats.avgGoals || 0).toFixed(3));
            playerDoc.assists = Math.round(extractedStats.assists || 0);
            playerDoc.shotsTotal = Math.round(extractedStats.shotsTotal || 0);
            playerDoc.avgShots = parseFloat((extractedStats.avgShots || 0).toFixed(3));
            playerDoc.points = Math.round(extractedStats.points || 0);
            playerDoc.pointsPerGame = parseFloat((extractedStats.pointsPerGame || 0).toFixed(3));
            playerDoc.powerPlayGoals = Math.round(extractedStats.powerPlayGoals || 0);
            playerDoc.powerPlayAssists = Math.round(extractedStats.powerPlayAssists || 0);
            playerDoc.shortHandedGoals = Math.round(extractedStats.shortHandedGoals || 0);
            playerDoc.shortHandedAssists = Math.round(extractedStats.shortHandedAssists || 0);
            playerDoc.shootoutAttempts = Math.round(extractedStats.shootoutAttempts || 0);
            playerDoc.shootoutGoals = Math.round(extractedStats.shootoutGoals || 0);
            playerDoc.shootoutShotPct = parseFloat((extractedStats.shootoutShotPct || 0).toFixed(3));
            playerDoc.shootingPct = parseFloat((extractedStats.shootingPct || 0).toFixed(3));
            playerDoc.totalFaceOffs = Math.round(extractedStats.totalFaceOffs || 0);
            playerDoc.faceoffsWon = Math.round(extractedStats.faceoffsWon || 0);
            playerDoc.faceoffsLost = Math.round(extractedStats.faceoffsLost || 0);
            playerDoc.faceoffPercent = parseFloat((extractedStats.faceoffPercent || 0).toFixed(3));
            playerDoc.gameTyingGoals = Math.round(extractedStats.gameTyingGoals || 0);
            playerDoc.gameWinningGoals = Math.round(extractedStats.gameWinningGoals || 0);

            // Defensive Stats
            playerDoc.goalsAgainst = Math.round(extractedStats.goalsAgainst || 0);
            playerDoc.avgGoalsAgainst = parseFloat((extractedStats.avgGoalsAgainst || 0).toFixed(3));
            playerDoc.shotsAgainst = Math.round(extractedStats.shotsAgainst || 0);
            playerDoc.avgShotsAgainst = parseFloat((extractedStats.avgShotsAgainst || 0).toFixed(3));
            playerDoc.shootoutSaves = Math.round(extractedStats.shootoutSaves || 0);
            playerDoc.shootoutShotsAgainst = Math.round(extractedStats.shootoutShotsAgainst || 0);
            playerDoc.shootoutSavePct = parseFloat((extractedStats.shootoutSavePct || 0).toFixed(3));
            playerDoc.emptyNetGoalsAgainst = Math.round(extractedStats.emptyNetGoalsAgainst || 0);
            playerDoc.shutouts = Math.round(extractedStats.shutouts || 0);
            playerDoc.saves = Math.round(extractedStats.saves || 0);
            playerDoc.savePct = parseFloat((extractedStats.savePct || 0).toFixed(3));
            playerDoc.overtimeLosses = Math.round(extractedStats.overtimeLosses || 0);
            playerDoc.blockedShots = Math.round(extractedStats.blockedShots || 0);
            playerDoc.hits = Math.round(extractedStats.hits || 0);
            playerDoc.evenStrengthSaves = Math.round(extractedStats.evenStrengthSaves || 0);
            playerDoc.powerPlaySaves = Math.round(extractedStats.powerPlaySaves || 0);
            playerDoc.shortHandedSaves = Math.round(extractedStats.shortHandedSaves || 0);

            // Penalties
            playerDoc.penaltyMinutes = Math.round(extractedStats.penaltyMinutes || 0);
            playerDoc.majorPenalties = Math.round(extractedStats.majorPenalties || 0);
            playerDoc.minorPenalties = Math.round(extractedStats.minorPenalties || 0);
            playerDoc.matchPenalties = Math.round(extractedStats.matchPenalties || 0);
            playerDoc.misconducts = Math.round(extractedStats.misconducts || 0);
            playerDoc.gameMisconducts = Math.round(extractedStats.gameMisconducts || 0);
            playerDoc.boardingPenalties = Math.round(extractedStats.boardingPenalties || 0);
            playerDoc.unsportsmanlikePenalties = Math.round(extractedStats.unsportsmanlikePenalties || 0);
            playerDoc.fightingPenalties = Math.round(extractedStats.fightingPenalties || 0);
            playerDoc.avgFights = parseFloat((extractedStats.avgFights || 0).toFixed(3));
            playerDoc.timeBetweenFights = Math.round(extractedStats.timeBetweenFights || 0);
            playerDoc.instigatorPenalties = Math.round(extractedStats.instigatorPenalties || 0);
            playerDoc.chargingPenalties = Math.round(extractedStats.chargingPenalties || 0);
            playerDoc.hookingPenalties = Math.round(extractedStats.hookingPenalties || 0);
            playerDoc.trippingPenalties = Math.round(extractedStats.trippingPenalties || 0);
            playerDoc.roughingPenalties = Math.round(extractedStats.roughingPenalties || 0);
            playerDoc.holdingPenalties = Math.round(extractedStats.holdingPenalties || 0);
            playerDoc.interferencePenalties = Math.round(extractedStats.interferencePenalties || 0);
            playerDoc.slashingPenalties = Math.round(extractedStats.slashingPenalties || 0);
            playerDoc.highStickingPenalties = Math.round(extractedStats.highStickingPenalties || 0);
            playerDoc.crossCheckingPenalties = Math.round(extractedStats.crossCheckingPenalties || 0);
            playerDoc.stickHoldingPenalties = Math.round(extractedStats.stickHoldingPenalties || 0);
            playerDoc.goalieInterferencePenalties = Math.round(extractedStats.goalieInterferencePenalties || 0);
            playerDoc.elbowingPenalties = Math.round(extractedStats.elbowingPenalties || 0);
            playerDoc.divingPenalties = Math.round(extractedStats.divingPenalties || 0);

            if (Object.keys(extractedStats).length > 0) {
                  statsFound = true;
              console.log(`✅ 2025 season stats loaded for ${player.displayName}: ${Object.keys(extractedStats).length} stats`);
              console.log(`📊 Sample mapped stats:`, {
                games: playerDoc.games,
                goals: playerDoc.goals,
                assists: playerDoc.assists,
                points: playerDoc.points,
                saves: playerDoc.saves,
                savePct: playerDoc.savePct,
                position: player.position?.abbreviation
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

    console.log('✅ All NHL players processed.');
  } catch (err) {
    console.error('❌ Error fetching NHL teams:', err.message);
  }
}

async function getTopPlayers(statType, limit = 50) {
  try {
    const sortCriteria = {};
    sortCriteria[statType] = -1;

    const players = await NHLPlayer.find({ [statType]: { $exists: true, $ne: null } })
      .sort(sortCriteria)
      .limit(limit);

    console.log(`Found ${players.length} NHL players for stat: ${statType}`);
    return players;
  } catch (error) {
    console.error('Error fetching NHL players:', error);
    return [];
  }
}

async function getTeamPlayers(teamId, statType, limit = 50) {
  try {
    const sortCriteria = {};
    sortCriteria[statType] = -1;

    const players = await NHLPlayer.find({ 
      teamId: teamId,
      [statType]: { $exists: true, $ne: null } 
    })
      .sort(sortCriteria)
      .limit(limit);

    console.log(`Found ${players.length} NHL players for team ${teamId} sorted by ${statType}`);
    return players;
  } catch (error) {
    console.error('Error fetching NHL team players:', error);
    return [];
  }
}

async function searchPlayers(searchQuery) {
  try {
    const query = searchQuery.toLowerCase();
    const players = await NHLPlayer.find({
      $or: [
        { displayName: { $regex: query, $options: 'i' } },
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { shortName: { $regex: query, $options: 'i' } }
      ]
    });
    return players;
  } catch (error) {
    console.error('Error searching NHL players:', error);
    return [];
  }
}

async function refresh(homeTeamId, awayTeamId) {
  try {
    console.log(`🔄 Refreshing NHL stats for game: ${awayTeamId} @ ${homeTeamId}`);
    console.log(`✅ NHL stats refresh requested for game: ${awayTeamId} @ ${homeTeamId}`);
  } catch (error) {
    console.error(`❌ Error refreshing NHL stats for game: ${awayTeamId} @ ${homeTeamId}:`, error.message);
  }
}

module.exports = { 
  processNhlPlayersWithStats, 
  getTopPlayers, 
  getTeamPlayers,
  searchPlayers,
  refresh
}; 
