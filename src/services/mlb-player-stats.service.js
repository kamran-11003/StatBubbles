const axios = require('axios');
const MLBPlayer = require('../models/mlb-player.model');

const desiredStats = [
  'gamesPlayed', 'gamesStarted', 'completeGames', 'shutouts',
  'innings', 'hits', 'runs', 'earnedRuns', 'homeRuns',
  'walks', 'strikeouts'
];

function getDefaultStats() {
  return desiredStats.reduce((acc, stat) => {
    acc[stat] = 0;
    return acc;
  }, {});
}

async function getLatestSeasonId() {
  const seasonsUrl = `https://sports.core.api.espn.com/v2/sports/baseball/leagues/mlb/seasons`;
  try {
    const response = await axios.get(seasonsUrl);
    const items = response.data.items || [];

    const sorted = items
      .map(item => {
        const seasonId = item.$ref.match(/\/seasons\/(\d+)/)?.[1];
        return seasonId ? parseInt(seasonId) : null;
      })
      .filter(Boolean)
      .sort((a, b) => b - a);

    if (sorted.length > 0) {
      console.log(`✅ Latest MLB season: ${sorted[0]}`);
      return sorted[0];
    }
  } catch (error) {
    console.log("⚠ Error fetching seasons. Defaulting to 2025.", error.message);
  }
  return 2025;
}

async function processActiveMlbPlayersWithStats(db) {
  const collection = db.collection('mlbplayers');

  try {
    // Step 1: Get latest season
    const latestSeasonId = await getLatestSeasonId();

    // Step 2: Get all teams
    const teamsRes = await axios.get(
      'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams'
    );
    const teams = teamsRes.data.sports[0].leagues[0].teams;

    for (const team of teams) {
      const teamId = team.team.id;
      const rosterUrl = `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams/${teamId}/roster`;

      let teamColor = null;
      let teamDisplayName = null;
      if (teamId) {
      try {
        const teamCollection = db.collection('mlbteams');
          const team = await teamCollection.findOne({ teamId: teamId });
          teamColor = team?.color || null;
          teamDisplayName = team?.displayName || null;
      } catch (error) {
          console.log(`Error fetching team data for team ID: ${teamId}`);
        }
      }

      const rosterRes = await axios.get(rosterUrl);
      const players = rosterRes.data.athletes.flatMap(group => group.items);

      for (const player of players) {
        const athleteId = player.id;

        const playerDoc = {
          athleteId,
          fullName: player.fullName,
          displayName: player.displayName,
          jersey: player.jersey || null,
          position: player.position?.abbreviation || null,
          teamId,
          teamColor,
          teamDisplayName,
          headshot: player.headshot
            ? {
            href: player.headshot.href,
            alt: player.headshot.alt
              }
            : null,
          stats: {}, // will be filled below
          statsUpdatedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        };

        let statsFound = false;

        try {
          // STEP 3: Fetch statisticslog for the player
          const statsLogUrl = `https://sports.core.api.espn.com/v2/sports/baseball/leagues/mlb/athletes/${athleteId}/statisticslog`;
          const logResponse = await axios.get(statsLogUrl);

          const entries = logResponse.data.entries || [];

          // Find the correct season entry (latest season)
          const seasonEntry = entries.find(entry =>
            entry.season?.$ref.includes(`/seasons/${latestSeasonId}`)
          );

          if (seasonEntry) {
            // Find total stats record
            const totalStats = seasonEntry.statistics.find(
              stat => stat.type === "total"
            );

            if (totalStats?.statistics?.$ref) {
              const statsUrl = totalStats.statistics.$ref + "?lang=en&region=us";
              const statsResponse = await axios.get(statsUrl);
              const splits = statsResponse.data.splits;

              if (splits?.categories?.length > 0) {
                for (const category of splits.categories) {
                  if (category.stats && Array.isArray(category.stats)) {
                    for (const stat of category.stats) {
                      if (typeof stat.name === 'string' && stat.value !== undefined) {
                        // Add category prefix to avoid conflicts between different stat types
                        const statKey = `${category.name}_${stat.name}`;
                        playerDoc.stats[statKey] = stat.value;
                        statsFound = true;
                      }
                    }
                  }
                }
              }
            } else {
              console.log(`⚠ No total stats found for ${player.displayName}`);
            }
          } else {
            console.log(`⚠ No stats for ${player.displayName} in season ${latestSeasonId}`);
          }
        } catch (error) {
          console.log(`❌ Error fetching stats for ${player.displayName}: ${error.message}`);
        }

        console.log(`✔ ${player.displayName} — ${statsFound ? 'Stats loaded' : 'No stats'}`);

        await collection.updateOne(
          { athleteId },
          { $set: playerDoc },
          { upsert: true }
        );
      }
    }

    console.log('✅ All active MLB players processed via statisticslog.');
  } catch (err) {
    console.error('❌ Error fetching MLB data:', err.message);
  }
}

async function getTopPlayers(statType, limit = 50) {
  try {
    const players = await MLBPlayer.find()
      .sort({ [`stats.${statType}`]: -1 })
      .limit(limit);
    console.log(`Found ${players.length} MLB players sorted by ${statType}`);
    return players;
  } catch (error) {
    console.error('Error fetching MLB players:', error);
    return [];
  }
}

async function getTeamPlayers(teamId, statType, limit = 50) {
  try {
    const players = await MLBPlayer.find({ teamId: teamId })
      .sort({ [`stats.${statType}`]: -1 })
      .limit(limit);
    console.log(`Found ${players.length} MLB players for team ${teamId} sorted by ${statType}`);
    return players;
  } catch (error) {
    console.error('Error fetching MLB team players:', error);
    return [];
  }
}

async function searchPlayers(searchQuery) {
  try {
    const query = searchQuery.toLowerCase();
    const players = await MLBPlayer.find({
      $or: [
        { fullName: { $regex: query, $options: 'i' } },
        { displayName: { $regex: query, $options: 'i' } }
      ]
    });
    return players;
  } catch (error) {
    console.error('Error searching MLB players:', error);
    return [];
  }
}

// Function to refresh stats for a specific game (called during live games)
async function refresh(homeTeamId, awayTeamId) {
  try {
    console.log(`🔄 Refreshing MLB stats for game: ${awayTeamId} @ ${homeTeamId}`);
    
    // For MLB, we can refresh stats for both teams
    // This could involve updating player stats for the teams involved in the game
    // For now, we'll just log the refresh attempt
    
    console.log(`✅ MLB stats refresh requested for game: ${awayTeamId} @ ${homeTeamId}`);
    console.log(`ℹ️ MLB stats refresh functionality can be expanded based on specific requirements`);
  } catch (error) {
    console.error(`❌ Error refreshing MLB stats for game: ${awayTeamId} @ ${homeTeamId}:`, error.message);
  }
}

module.exports = { 
  processActiveMlbPlayersWithStats, 
  getTopPlayers, 
  getTeamPlayers,
  searchPlayers,
  refresh
}; 