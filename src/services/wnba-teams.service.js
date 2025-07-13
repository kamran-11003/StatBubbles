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

    for (const conference of conferences) {
      const entries = conference.standings.entries;

      for (const entry of entries) {
        const teamId = entry.team.id;

        const statsUpdate = {};
        for (const stat of entry.stats) {
          const fieldName = desiredStats[stat.type];
          if (fieldName) {
            // Handle special cases for records that use displayValue/summary
            if (stat.type === 'home' || stat.type === 'road' || stat.type === 'vsconf' || stat.type === 'lasttengames') {
              statsUpdate[fieldName] = stat.displayValue || stat.summary;
            } else {
              statsUpdate[fieldName] = stat.value;
            }
          }
        }

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