const axios = require('axios');
const NHLPlayer = require('../models/nhl-player.model');

const desiredStats = [
  'goals', 'assists', 'points',
  'plusMinus', 'penaltyMinutes', 'shotsTotal',
  'powerPlayGoals', 'powerPlayAssists',
  'shortHandedGoals', 'shortHandedAssists',
  'gameWinningGoals', 'timeOnIcePerGame', 'production'
];

function getDefaultStats() {
  return desiredStats.reduce((acc, stat) => {
    acc[stat] = 0;
    return acc;
  }, {});
}

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
          
          // Get team colors from NHL teams collection
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
            console.log(`Could not fetch team colors for team ${teamId}`);
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
            // NHL-specific stats
            goals: 0,
            assists: 0,
            points: 0,
            plusMinus: 0,
            penaltyMinutes: 0,
            shotsTotal: 0,
            powerPlayGoals: 0,
            powerPlayAssists: 0,
            shortHandedGoals: 0,
            shortHandedAssists: 0,
            gameWinningGoals: 0,
            timeOnIcePerGame: 0,
            production: 0,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          let statsFound = false;

          try {
            const overviewUrl = `https://site.web.api.espn.com/apis/common/v3/sports/hockey/nhl/athletes/${athleteId}/overview`;
            const overviewRes = await axios.get(overviewUrl);
            const overview = overviewRes.data;

            let splits = [];
            let names = [];

            // Prioritize statistics block if skatingStats/goalieStats not available
            if (overview.statistics?.splits?.length > 0) {
              splits = overview.statistics.splits;
              names = overview.statistics.names;
            } else if (overview.skatingStats?.splits?.length > 0) {
              splits = overview.skatingStats.splits;
              names = overview.skatingStats.names;
            } else if (overview.goalieStats?.splits?.length > 0) {
              splits = overview.goalieStats.splits;
              names = overview.goalieStats.names;
            }

            const regularSeason = splits.find(split =>
              split.displayName.toLowerCase().includes('regular season')
            );

            if (regularSeason && regularSeason.stats?.length > 0 && names.length > 0) {
              const statMap = {};
              for (let i = 0; i < names.length; i++) {
                const statName = names[i];
                const statValue = regularSeason.stats[i];
                if (desiredStats.includes(statName)) {
                  // Map ESPN stats to our model fields
                  switch (statName) {
                    case 'goals':
                      playerDoc.goals = statValue;
                      break;
                    case 'assists':
                      playerDoc.assists = statValue;
                      break;
                    case 'points':
                      playerDoc.points = statValue;
                      break;
                    case 'plusMinus':
                      playerDoc.plusMinus = statValue;
                      break;
                    case 'penaltyMinutes':
                      playerDoc.penaltyMinutes = statValue;
                      break;
                    case 'shotsTotal':
                      playerDoc.shotsTotal = statValue;
                      break;
                    case 'powerPlayGoals':
                      playerDoc.powerPlayGoals = statValue;
                      break;
                    case 'powerPlayAssists':
                      playerDoc.powerPlayAssists = statValue;
                      break;
                    case 'shortHandedGoals':
                      playerDoc.shortHandedGoals = statValue;
                      break;
                    case 'shortHandedAssists':
                      playerDoc.shortHandedAssists = statValue;
                      break;
                    case 'gameWinningGoals':
                      playerDoc.gameWinningGoals = statValue;
                      break;
                    case 'timeOnIcePerGame':
                      playerDoc.timeOnIcePerGame = statValue;
                      break;
                    case 'production':
                      playerDoc.production = statValue;
                      break;
                  }
                  statsFound = true;
                }
              }
            }
          } catch (err) {
            console.log(`❌ Stats error for ${player.displayName}: ${err.message}`);
          }

          console.log(`✔ ${player.displayName} — ${statsFound ? 'Stats loaded' : 'No stats'}`);

          await collection.updateOne(
            { playerId: athleteId },
            { $set: playerDoc },
            { upsert: true }
          );
        }
      } catch (teamErr) {
        console.error(`❌ Roster fetch failed for team ${teamId}: ${teamErr.message}`);
      }
    }

    console.log('✅ NHL player data processing complete.');
  } catch (err) {
    console.error('❌ NHL processing error:', err.message);
  }
}

async function getTopPlayers(statType, limit = 50) {
  try {
    const sortCriteria = {};
    sortCriteria[statType] = -1; // Sort in descending order

    const players = await NHLPlayer.find({ [statType]: { $exists: true, $ne: null } })
      .sort(sortCriteria)
      .limit(limit);

    console.log(`Found ${players.length} NHL players for stat: ${statType}`);
    if (players.length > 0) {
      console.log('Sample player data:', {
        name: players[0].displayName,
        [statType]: players[0][statType],
        availableStats: Object.keys(players[0]).filter(key => 
          ['goals', 'assists', 'points', 'plusMinus', 'penaltyMinutes', 'shotsTotal',
           'powerPlayGoals', 'powerPlayAssists', 'shortHandedGoals', 'shortHandedAssists',
           'gameWinningGoals', 'timeOnIcePerGame', 'production'].includes(key)
        )
      });
    }
    return players;
  } catch (error) {
    console.error('Error fetching NHL players:', error);
    return [];
  }
}

async function getTeamPlayers(teamId, statType, limit = 50) {
  try {
    const sortCriteria = {};
    sortCriteria[statType] = -1; // Sort in descending order

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

// Function to refresh stats for a specific game (called during live games)
async function refresh(homeTeamId, awayTeamId) {
  try {
    console.log(`🔄 Refreshing NHL stats for game: ${awayTeamId} @ ${homeTeamId}`);
    
    // For NHL, we can refresh stats for both teams
    // This could involve updating player stats for the teams involved in the game
    // For now, we'll just log the refresh attempt
    
    console.log(`✅ NHL stats refresh requested for game: ${awayTeamId} @ ${homeTeamId}`);
    console.log(`ℹ️ NHL stats refresh functionality can be expanded based on specific requirements`);
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