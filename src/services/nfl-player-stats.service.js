const axios = require('axios');
const NFLPlayer = require('../models/nfl-player.model');

const desiredStats = [
  'passAttempts', 'passCompletions', 'passYards', 'passTouchdowns',
  'rushAttempts', 'rushYards', 'rushTouchdowns',
  'receptions', 'recYards', 'recTouchdowns',
  'tackles', 'sacks', 'interceptions', 'fumbles'
];

function getDefaultStats() {
  return desiredStats.reduce((acc, stat) => {
    acc[stat] = 0;
    return acc;
  }, {});
}

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
            // NFL-specific stats
            touchdowns: 0,
            passYards: 0,
            rushYards: 0,
            completionPercentage: 0,
            passAttempts: 0,
            passCompletions: 0,
            interceptions: 0,
            sacks: 0,
            rushingAttempts: 0,
            rushingYards: 0,
            receivingYards: 0,
            receptions: 0,
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
            const overviewUrl = `https://site.web.api.espn.com/apis/common/v3/sports/football/nfl/athletes/${athleteId}/overview`;
            const overviewRes = await axios.get(overviewUrl);
            const overview = overviewRes.data;
            const statSources = ['passingStats', 'rushingStats', 'receivingStats', 'defenseStats'];

            for (const source of statSources) {
              if (overview[source]?.stats) {
                overview[source].stats.forEach(stat => {
                  if (desiredStats.includes(stat.name)) {
                    // Map ESPN stats to our model fields
                    switch (stat.name) {
                      case 'passYards':
                        playerDoc.passYards = stat.value;
                        break;
                      case 'rushYards':
                        playerDoc.rushYards = stat.value;
                        break;
                      case 'recYards':
                        playerDoc.receivingYards = stat.value;
                        break;
                      case 'passAttempts':
                        playerDoc.passAttempts = stat.value;
                        break;
                      case 'passCompletions':
                        playerDoc.passCompletions = stat.value;
                        break;
                      case 'rushAttempts':
                        playerDoc.rushingAttempts = stat.value;
                        break;
                      case 'receptions':
                        playerDoc.receptions = stat.value;
                        break;
                      case 'sacks':
                        playerDoc.sacks = stat.value;
                        break;
                      case 'interceptions':
                        playerDoc.interceptions = stat.value;
                        break;
                      case 'passTouchdowns':
                      case 'rushTouchdowns':
                      case 'recTouchdowns':
                        playerDoc.touchdowns = (playerDoc.touchdowns || 0) + stat.value;
                        break;
                    }
                    statsFound = true;
                  }
                });
              }
            }

            // Calculate completion percentage
            if (playerDoc.passAttempts > 0) {
              playerDoc.completionPercentage = (playerDoc.passCompletions / playerDoc.passAttempts) * 100;
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
    sortCriteria[statType] = -1; // Sort in descending order

    const players = await NFLPlayer.find({ [statType]: { $exists: true, $ne: null } })
      .sort(sortCriteria)
      .limit(limit);

    console.log(`Found ${players.length} NFL players for stat: ${statType}`);
    if (players.length > 0) {
      console.log('Sample player data:', {
        name: players[0].displayName,
        [statType]: players[0][statType],
        availableStats: Object.keys(players[0]).filter(key => 
          ['touchdowns', 'passYards', 'rushYards', 'completionPercentage',
           'passAttempts', 'passCompletions', 'interceptions', 'sacks',
           'rushingAttempts', 'rushingYards', 'receivingYards', 'receptions'].includes(key)
        )
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
    sortCriteria[statType] = -1; // Sort in descending order

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

// Function to refresh stats for a specific game (called during live games)
async function refresh(homeTeamId, awayTeamId) {
  try {
    console.log(`🔄 Refreshing NFL stats for game: ${awayTeamId} @ ${homeTeamId}`);
    
    // For NFL, we can refresh stats for both teams
    // This could involve updating player stats for the teams involved in the game
    // For now, we'll just log the refresh attempt
    
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