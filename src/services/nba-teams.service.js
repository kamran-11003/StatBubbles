const axios = require('axios');
const NBATeam = require('../models/nba-team.model');

// ESPN API endpoints
const teamsApiUrl = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams';
const standingsApiUrl = 'https://site.web.api.espn.com/apis/v2/sports/basketball/nba/standings?level=3';

async function processNbaData(db) {
  try {
    const collection = db.collection('nbateams');

    // Step 1: Fetch and store team data
    const teamsResponse = await axios.get(teamsApiUrl);
    const teams = teamsResponse.data.sports[0].leagues[0].teams.map(item => item.team);

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
    }

    // Step 2: Fetch and update standings data
    const standingsResponse = await axios.get(standingsApiUrl);
    
    // Navigate through the nested structure to get all entries
    const allEntries = [];
    if (standingsResponse.data.children) {
      for (const conference of standingsResponse.data.children) {
        if (conference.children) {
          for (const division of conference.children) {
            if (division.standings && division.standings.entries) {
              allEntries.push(...division.standings.entries);
            }
          }
        }
      }
    }

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

    for (const entry of allEntries) {
      const teamId = entry.team.id;

      const statsUpdate = {};
      for (const stat of entry.stats) {
        const fieldName = desiredStats[stat.type];
        if (fieldName) {
          // Handle different value types
          if (stat.type === 'streak') {
            statsUpdate[fieldName] = stat.displayValue; // Use displayValue for streak (e.g., "W2")
          } else if (stat.type === 'home' || stat.type === 'road' || stat.type === 'vsconf' || stat.type === 'lasttengames') {
            statsUpdate[fieldName] = stat.displayValue; // Use displayValue for records (e.g., "28-13")
          } else {
            statsUpdate[fieldName] = stat.value; // Use value for numeric stats
          }
        }
      }

      statsUpdate.standingsUpdatedAt = new Date();

      await collection.updateOne(
        { teamId: teamId },
        { $set: statsUpdate }
      );
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function getAllTeams() {
  try {
    const teams = await NBATeam.find();
    console.log(`Found ${teams.length} NBA teams`);
    if (teams.length > 0) {
      console.log('Sample team data:', {
        displayName: teams[0].displayName,
        wins: teams[0].wins,
        losses: teams[0].losses,
        pointsPerGame: teams[0].pointsPerGame,
        availableStats: Object.keys(teams[0]).filter(key => 
          ['wins', 'losses', 'winPercentage', 'gamesBehind', 'homeRecord', 'awayRecord', 
           'conferenceRecord', 'pointsPerGame', 'opponentPointsPerGame', 'pointDifferential', 
           'streak', 'lastTenGames'].includes(key)
        )
      });
    }
    return teams;
  } catch (error) {
    console.error('Error fetching NBA teams:', error);
    return [];
  }
}

async function searchTeams(searchQuery) {
  try {
    const query = searchQuery.toLowerCase();
    const teams = await NBATeam.find({
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
    console.error('Error searching NBA teams:', error);
    return [];
  }
}

// Export the function
module.exports = { processNbaData, getAllTeams, searchTeams }; 