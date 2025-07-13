const axios = require('axios');
const WNBAPlayer = require('../models/wnba.model');

// ESPN API endpoints
const athletesListUrl = 'https://sports.core.api.espn.com/v2/sports/basketball/leagues/wnba/athletes?limit=1000&page=1';
const athleteDetailsUrl = 'https://sports.core.api.espn.com/v2/sports/basketball/leagues/wnba/athletes/';

// Function to extract team ID from team $ref URL
function extractTeamId(teamRef) {
  const match = teamRef.match(/\/teams\/(\d+)/);
  return match ? match[1] : null;
}

// Desired stats to extract
const desiredStats = [
  'gamesPlayed', 'gamesStarted', 'minutes', 'avgMinutes',
  'points', 'avgPoints', 'fieldGoalsMade', 'fieldGoalsAttempted', 'fieldGoalPct',
  'threePointFieldGoalsMade', 'threePointFieldGoalsAttempted', 'threePointFieldGoalPct',
  'freeThrowsMade', 'freeThrowsAttempted', 'freeThrowPct',
  'offensiveRebounds', 'defensiveRebounds', 'rebounds', 'avgRebounds',
  'assists', 'avgAssists', 'turnovers', 'avgTurnovers',
  'steals', 'avgSteals', 'blocks', 'avgBlocks',
  'fouls', 'avgFouls', 'doubleDouble', 'tripleDouble'
];

// Create default stats object with zeros
function getDefaultStats() {
  return desiredStats.reduce((acc, stat) => {
    acc[stat] = 0;
    return acc;
  }, {});
}

async function processWnbaPlayersWithStats(db) {
  try {
    // Use Mongoose model instead of raw collection
    // const collection = db.collection('wnbapayers');

    // Fetch list of athlete IDs
    const athletesResponse = await axios.get(athletesListUrl);
    const athleteItems = athletesResponse.data.items;

    // Process each athlete
    for (const item of athleteItems) {
      const athleteId = item.$ref.match(/\/athletes\/(\d+)/)[1];

      // Fetch detailed athlete data
      let athlete;
      try {
        const athleteResponse = await axios.get(`${athleteDetailsUrl}${athleteId}?lang=en®ion=us`);
        athlete = athleteResponse.data;
      } catch (error) {
        console.log(`Error fetching details for player ID: ${athleteId}, skipping...`);
        continue;
      }

      // Extract team ID from team $ref
      const teamId = extractTeamId(athlete.team.$ref);

      // Fetch team data from teams collection
      let teamColor = null;
      let teamDisplayName = null;
      if (teamId) {
        try {
          const teamCollection = db.collection('wnbateams');
          const team = await teamCollection.findOne({ teamId: teamId });
          teamColor = team?.color || null;
          teamDisplayName = team?.displayName || null;
        } catch (error) {
          console.log(`Error fetching team data for team ID: ${teamId}`);
        }
      }

      // Prepare player document
      const playerDoc = {
        athleteId: athlete.id,
        uid: athlete.uid,
        guid: athlete.guid,
        firstName: athlete.firstName,
        lastName: athlete.lastName,
        fullName: athlete.fullName,
        displayName: athlete.displayName,
        shortName: athlete.shortName,
        height: athlete.height,
        displayHeight: athlete.displayHeight,
        age: athlete.age,
        headshot: athlete.headshot ? {
          href: athlete.headshot.href,
          alt: athlete.headshot.alt
        } : null,
        jersey: athlete.jersey,
        teamId: teamId,
        teamColor: teamColor,
        teamDisplayName: teamDisplayName,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Initialize stats with zeros
      let statsUpdate = getDefaultStats();
      let statsFound = false;

      // Fetch statistics log if available
      if (athlete.statisticslog && athlete.statisticslog.$ref) {
        try {
          const statsLogResponse = await axios.get(athlete.statisticslog.$ref);
          const statsLogEntries = statsLogResponse.data.entries;

          // Find 2024 season entry (WNBA season format)
          const season2025Entry = statsLogEntries.find(entry => 
            entry.season.$ref.includes('/seasons/2025')
          );

          if (season2025Entry) {
            // Find total statistics
            const totalStats = season2025Entry.statistics.find(stat => stat.type === 'total');
            if (totalStats && totalStats.statistics.$ref) {
              const statsResponse = await axios.get(totalStats.statistics.$ref);
              const statsData = statsResponse.data;

              // Extract desired stats
              if (statsData.splits && statsData.splits.categories) {
                const stats = statsData.splits.categories.flatMap(category => category.stats);
                statsUpdate = getDefaultStats(); // Reset to zeros
                for (const stat of stats) {
                  if (desiredStats.includes(stat.name)) {
                    statsUpdate[stat.name] = stat.value;
                  }
                }
                statsFound = true;
              } else {
                console.log(`Invalid stats structure for player ID: ${athleteId}`);
              }
            } else {
              console.log(`No total stats found for player ID: ${athleteId}`);
            }
          } else {
            console.log(`No 2025 season stats found for player ID: ${athleteId}`);
          }
        } catch (statsError) {
          console.log(`Error fetching stats for player ID: ${athleteId}: ${statsError.message}`);
        }
      } else {
        console.log(`No statistics log for player ID: ${athleteId}`);
      }

      // Set stats in player document
      playerDoc.stats = statsUpdate;
      playerDoc.statsUpdatedAt = new Date();

      // Log whether stats were found or defaulted to zeros
      console.log(`Processed player: ${athlete.displayName} (Stats ${statsFound ? 'found' : 'defaulted to zeros'})`);

      // Use Mongoose model for upsert
      await WNBAPlayer.updateOne(
        { athleteId: athlete.id },
        { $set: playerDoc },
        { upsert: true }
      );
    }

    console.log('All WNBA players and stats processed successfully');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Function to refresh players for a specific team
async function refreshTeamPlayers(teamId, db) {
  try {
    // Use Mongoose model instead of raw collection
    // const collection = db.collection('wnbapayers');

    // Find all players with the specified team ID
    const teamPlayers = await WNBAPlayer.find({ teamId: teamId });
    
    if (teamPlayers.length === 0) {
      console.log(`No players found for team ID: ${teamId}`);
      return;
    }

    console.log(`Found ${teamPlayers.length} players for team ID: ${teamId}`);

    // Process each player from the team
    for (const player of teamPlayers) {
      const athleteId = player.athleteId;

      // Fetch updated athlete data
      let athlete;
      try {
        const athleteResponse = await axios.get(`${athleteDetailsUrl}${athleteId}?lang=en®ion=us`);
        athlete = athleteResponse.data;
      } catch (error) {
        console.log(`Error fetching details for player ID: ${athleteId}, skipping...`);
        continue;
      }

      // Extract team ID from team $ref
      const updatedTeamId = extractTeamId(athlete.team.$ref);

      // Fetch team data from teams collection
      let updatedTeamColor = null;
      let updatedTeamDisplayName = null;
      if (updatedTeamId) {
        try {
          const teamCollection = db.collection('wnbateams');
          const team = await teamCollection.findOne({ teamId: updatedTeamId });
          updatedTeamColor = team?.color || null;
          updatedTeamDisplayName = team?.displayName || null;
        } catch (error) {
          console.log(`Error fetching team data for team ID: ${updatedTeamId}`);
        }
      }

      // Prepare updated player document
      const updatedPlayerDoc = {
        athleteId: athlete.id,
        uid: athlete.uid,
        guid: athlete.guid,
        firstName: athlete.firstName,
        lastName: athlete.lastName,
        fullName: athlete.fullName,
        displayName: athlete.displayName,
        shortName: athlete.shortName,
        height: athlete.height,
        displayHeight: athlete.displayHeight,
        age: athlete.age,
        headshot: athlete.headshot ? {
          href: athlete.headshot.href,
          alt: athlete.headshot.alt
        } : null,
        jersey: athlete.jersey,
        teamId: updatedTeamId,
        teamColor: updatedTeamColor,
        teamDisplayName: updatedTeamDisplayName,
        updatedAt: new Date()
      };

      // Initialize stats with zeros
      let statsUpdate = getDefaultStats();
      let statsFound = false;

      // Fetch updated statistics log if available
      if (athlete.statisticslog && athlete.statisticslog.$ref) {
        try {
          const statsLogResponse = await axios.get(athlete.statisticslog.$ref);
          const statsLogEntries = statsLogResponse.data.entries;

          const season2025Entry = statsLogEntries.find(entry => 
            entry.season.$ref.includes('/seasons/2025')
          );

          if (season2025Entry) {
            // Find total statistics
            const totalStats = season2025Entry.statistics.find(stat => stat.type === 'total');
            if (totalStats && totalStats.statistics.$ref) {
              const statsResponse = await axios.get(totalStats.statistics.$ref);
              const statsData = statsResponse.data;

              // Extract desired stats
              if (statsData.splits && statsData.splits.categories) {
                const stats = statsData.splits.categories.flatMap(category => category.stats);
                statsUpdate = getDefaultStats(); // Reset to zeros
                for (const stat of stats) {
                  if (desiredStats.includes(stat.name)) {
                    statsUpdate[stat.name] = stat.value;
                  }
                }
                statsFound = true;
              } else {
                console.log(`Invalid stats structure for player ID: ${athleteId}`);
              }
            } else {
              console.log(`No total stats found for player ID: ${athleteId}`);
            }
          } else {
            console.log(`No 2025 season stats found for player ID: ${athleteId}`);
          }
        } catch (statsError) {
          console.log(`Error fetching stats for player ID: ${athleteId}: ${statsError.message}`);
        }
      } else {
        console.log(`No statistics log for player ID: ${athleteId}`);
      }

      // Set updated stats in player document
      updatedPlayerDoc.stats = statsUpdate;
      updatedPlayerDoc.statsUpdatedAt = new Date();

      // Log whether stats were found or defaulted to zeros
      console.log(`Refreshed player: ${athlete.displayName} (Stats ${statsFound ? 'found' : 'defaulted to zeros'})`);

      // Use Mongoose model for update
      await WNBAPlayer.updateOne(
        { athleteId: athlete.id },
        { $set: updatedPlayerDoc }
      );
    }

    console.log(`All players for team ID ${teamId} refreshed successfully`);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Get top WNBA players by a stat with percentage filtering
async function getTopPlayers(statType, limit = 100) {
  // Define percentage stats that need games played filtering
  const percentageStats = ['fieldGoalPct', 'threePointFieldGoalPct', 'freeThrowPct'];
  
  if (percentageStats.includes(statType)) {
    // For percentage stats, apply games played filter
    // First, find the maximum games played to calculate the minimum threshold
    const maxGamesPlayer = await WNBAPlayer.findOne().sort({ 'stats.gamesPlayed': -1 });
    const maxGamesPlayed = maxGamesPlayer?.stats?.gamesPlayed || 40; // Default to 40 if no data
    
    // Calculate minimum games required (25% of max games played, minimum 10)
    const minGamesRequired = Math.max(10, Math.floor(maxGamesPlayed * 0.25));
    
    console.log(`WNBA ${statType} filter: Max games played = ${maxGamesPlayed}, Min games required = ${minGamesRequired}`);
    
    return WNBAPlayer.find({
      'stats.gamesPlayed': { $gte: minGamesRequired }
    }).sort({ ["stats." + statType]: -1 }).limit(limit);
  } else {
    // For non-percentage stats, return all players
    return WNBAPlayer.find().sort({ ["stats." + statType]: -1 }).limit(limit);
  }
}

// Get WNBA players from a specific team by a stat with percentage filtering
async function getTeamPlayers(teamId, statType, limit = 100) {
  // Define percentage stats that need games played filtering
  const percentageStats = ['fieldGoalPct', 'threePointFieldGoalPct', 'freeThrowPct'];
  
  if (percentageStats.includes(statType)) {
    // For percentage stats, apply games played filter
    // First, find the maximum games played to calculate the minimum threshold
    const maxGamesPlayer = await WNBAPlayer.findOne().sort({ 'stats.gamesPlayed': -1 });
    const maxGamesPlayed = maxGamesPlayer?.stats?.gamesPlayed || 40; // Default to 40 if no data
    
    // Calculate minimum games required (25% of max games played, minimum 10)
    const minGamesRequired = Math.max(10, Math.floor(maxGamesPlayed * 0.25));
    
    console.log(`WNBA ${statType} filter: Max games played = ${maxGamesPlayed}, Min games required = ${minGamesRequired}`);
    
    return WNBAPlayer.find({
      teamId: teamId,
      'stats.gamesPlayed': { $gte: minGamesRequired }
    }).sort({ ["stats." + statType]: -1 }).limit(limit);
  } else {
    // For non-percentage stats, return all team players
    return WNBAPlayer.find({ teamId: teamId }).sort({ ["stats." + statType]: -1 }).limit(limit);
  }
}

// Search WNBA players by name (case-insensitive, partial match)
async function searchPlayers(name) {
  const regex = new RegExp(name, 'i');
  return WNBAPlayer.find({ displayName: regex });
}

// Function to refresh stats for a specific game (called during live games)
async function refresh(homeTeamId, awayTeamId) {
  try {
    console.log(`🔄 Refreshing WNBA stats for game: ${awayTeamId} @ ${homeTeamId}`);
    
    // Refresh stats for both teams
    await refreshTeamPlayers(homeTeamId);
    await refreshTeamPlayers(awayTeamId);
    
    console.log(`✅ WNBA stats refreshed for game: ${awayTeamId} @ ${homeTeamId}`);
  } catch (error) {
    console.error(`❌ Error refreshing WNBA stats for game: ${awayTeamId} @ ${homeTeamId}:`, error.message);
  }
}

// Export the functions
module.exports = { 
  processWnbaPlayersWithStats, 
  refreshTeamPlayers, 
  getTopPlayers, 
  getTeamPlayers,
  searchPlayers,
  refresh
}; 