const axios = require('axios');
const NFLTeam = require('../models/nfl-team.model');

const teamsApiUrl = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams';
const standingsApiUrl = 'https://site.web.api.espn.com/apis/v2/sports/football/nfl/standings?level=3';

async function processNflData(db) {
  try {
    const collection = db.collection('nflteams');

    // Step 1: Fetch NFL teams
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

    // Step 2: Update NFL standings
    const standingsResponse = await axios.get(standingsApiUrl);
    const conferences = standingsResponse.data.children;

    const desiredStats = {
      wins: 'wins',
      losses: 'losses',
      winpercent: 'winpercent',
      gamesbehind: 'gamesbehind',
      home: 'home',
      road: 'road',
      vsconf: 'vsconf',
      vsdiv: 'vsdiv',
      avgpointsfor: 'avgpointsfor',
      avgpointsagainst: 'avgpointsagainst',
      pointdifferential: 'pointdifferential',
      streak: 'streak',
      lasttengames: 'lasttengames'
    };

    for (const conference of conferences) {
      for (const division of conference.children) {
        const entries = division.standings.entries;

        for (const entry of entries) {
          const teamId = entry.team.id;

          const statsUpdate = {};
          for (const stat of entry.stats) {
            const fieldName = Object.keys(desiredStats).find(
              key => desiredStats[key] === stat.type
            );
            if (fieldName) {
              statsUpdate[fieldName] = stat.summary || stat.value || stat.displayValue;
            }
          }

          statsUpdate.standingsUpdatedAt = new Date();

          const result = await collection.updateOne(
            { teamId },
            { $set: statsUpdate },
            { upsert: false }
          );

          if (result.matchedCount > 0) {
            console.log(`Updated standings for team ID: ${teamId}`);
          } else {
            console.log(`No team found with ID: ${teamId}`);
          }
        }
      }
    }

    console.log('✅ All NFL data processed successfully');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function getAllTeams() {
  try {
    const teams = await NFLTeam.find();
    console.log(`Found ${teams.length} NFL teams`);
    if (teams.length > 0) {
      console.log('Sample team data:', {
        displayName: teams[0].displayName,
        wins: teams[0].wins,
        losses: teams[0].losses,
        availableStats: Object.keys(teams[0]).filter(key => 
          ['wins', 'losses', 'winpercent', 'gamesbehind', 'home', 'road', 
           'vsconf', 'vsdiv', 'avgpointsfor', 'avgpointsagainst', 'pointdifferential', 
           'streak', 'lasttengames'].includes(key)
        )
      });
    }
    return teams;
  } catch (error) {
    console.error('Error fetching NFL teams:', error);
    return [];
  }
}

async function searchTeams(searchQuery) {
  try {
    const query = searchQuery.toLowerCase();
    const teams = await NFLTeam.find({
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
    console.error('Error searching NFL teams:', error);
    return [];
  }
}

module.exports = { processNflData, getAllTeams, searchTeams }; 