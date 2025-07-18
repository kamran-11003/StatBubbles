const axios = require('axios');
const WNBATeam = require('../models/wnba-team.model');

// ESPN API endpoints
const teamsApiUrl = 'https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/teams';
const standingsApiUrl = 'https://site.web.api.espn.com/apis/v2/sports/basketball/wnba/standings?level=3';

async function processWnbaData(db) {
  try {
    const collection = db.collection('wnbateams');

    // Step 1: Fetch and store team data
    const teamsResponse = await axios.get(teamsApiUrl);
    let teams = teamsResponse.data.sports[0].leagues[0].teams.map(item => item.team);

    // Filter out Toyota Antelopes by displayName or name
    teams = teams.filter(team => team.displayName !== 'Toyota Antelopes' && team.name !== 'Toyota Antelopes');

    for (const team of teams) {
      const teamDoc = {
        teamId: team.id,
        uid: team.uid,
        abbreviation: team.abbreviation,
        displayName: team.displayName,
        shortDisplayName: team.shortDisplayName,
        name: team.name,
        nickname: team.nickname,
        location: team.location,
        color: team.color,
        alternateColor: team.alternateColor,
        logos: team.logos,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await collection.updateOne(
        { teamId: team.id },
        { $set: teamDoc },
        { upsert: true }
      );
      console.log(`Processed team: ${team.displayName}`);
    }

    // Step 2: Fetch and update standings data
    const standingsResponse = await axios.get(standingsApiUrl);
    const conferences = standingsResponse.data.children;

    const desiredStats = {
      wins: 'wins',
      losses: 'losses',
      winpercent: 'winPercentage',
      gamesbehind: 'gamesBehind',
      home: 'homeRecord',
      road: 'awayRecord',
      vsconf: 'conferenceRecord',
      avgpointsfor: 'pointsPerGame',
      avgpointsagainst: 'opponentPointsPerGame',
      differential: 'pointDifferential',
      streak: 'streak',
      lasttengames: 'lastTenGames'
    };

    // Find the league leader (team with most wins, fewest losses)
    let leagueLeader = null;
    let maxWins = -1;
    let minLosses = Number.MAX_SAFE_INTEGER;
    for (const conference of conferences) {
      for (const entry of conference.standings.entries) {
        const wins = entry.stats.find(s => s.type === 'wins')?.value || 0;
        const losses = entry.stats.find(s => s.type === 'losses')?.value || 0;
        if (
          wins > maxWins ||
          (wins === maxWins && losses < minLosses)
        ) {
          leagueLeader = entry;
          maxWins = wins;
          minLosses = losses;
        }
      }
    }
    const leaderWins = leagueLeader?.stats.find(s => s.type === 'wins')?.value || 0;
    const leaderLosses = leagueLeader?.stats.find(s => s.type === 'losses')?.value || 0;

    for (const conference of conferences) {
      const entries = conference.standings.entries;
      for (const entry of entries) {
        const teamId = entry.team.id;
        const statsUpdate = {};
        let teamWins = 0;
        let teamLosses = 0;
        for (const stat of entry.stats) {
          const fieldName = desiredStats[stat.type];
          if (fieldName) {
            if (stat.type === 'home' || stat.type === 'road' || stat.type === 'vsconf' || stat.type === 'lasttengames') {
              statsUpdate[fieldName] = stat.displayValue || stat.summary;
            } else {
              statsUpdate[fieldName] = stat.value;
            }
          }
          if (stat.type === 'wins') teamWins = stat.value;
          if (stat.type === 'losses') teamLosses = stat.value;
        }
        // Calculate gamesBehind using the league leader
        const gamesBehind = ((leaderWins - teamWins) + (teamLosses - leaderLosses)) / 2;
        statsUpdate.gamesBehind = gamesBehind;
        statsUpdate.standingsUpdatedAt = new Date();
        const result = await collection.updateOne(
          { teamId: teamId },
          { $set: statsUpdate }
        );
        if (result.matchedCount > 0) {
          console.log(`Updated standings for team ID: ${teamId}`);
        } else {
          console.log(`No team found with ID: ${teamId}`);
        }
      }
    }

    console.log('All WNBA data processed successfully');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function getAllTeams() {
  return WNBATeam.find();
}

async function searchTeams(searchQuery) {
  try {
    const query = searchQuery.toLowerCase();
    const teams = await WNBATeam.find({
      $or: [
        { displayName: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } },
        { shortDisplayName: { $regex: query, $options: 'i' } },
        { nickname: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } },
        { abbreviation: { $regex: query, $options: 'i' } }
      ]
    });
    return teams;
  } catch (error) {
    console.error('Error searching WNBA teams:', error);
    return [];
  }
}

// Export the function
module.exports = { processWnbaData, getAllTeams, searchTeams }; 