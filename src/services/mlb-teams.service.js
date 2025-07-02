const axios = require('axios');
const MLBTeam = require('../models/mlb-team.model');

// ESPN API endpoints for MLB
const teamsApiUrl = 'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams';
const standingsApiUrl = 'https://site.web.api.espn.com/apis/v2/sports/baseball/mlb/standings?level=3';

async function processMlbData(db) {
  try {
    const collection = db.collection('mlbteams');

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

    // Updated desiredStats to match MLB API stat types
    const desiredStats = {
      wins: 'wins',
      losses: 'losses',
      winpercent: 'winpercent',
      gamesbehind: 'gamesbehind',
      home: 'home', // Maps to home record (e.g., "24-16")
      road: 'road', // Maps to road record (e.g., "21-18")
      vsconf: 'intraleague', // Maps to intraleague record (e.g., "31-22")
      avgpointsfor: 'avgpointsfor',
      avgpointsagainst: 'avgpointsagainst',
      differential: 'pointdifferential', // Maps to run differential
      streak: 'streak',
      lasttengames: 'lasttengames'
    };

    for (const conference of conferences) {
      // Iterate through divisions within each conference
      for (const division of conference.children) {
        const entries = division.standings.entries;

        for (const entry of entries) {
          const teamId = entry.team.id;

          const statsUpdate = {};
          for (const stat of entry.stats) {
            // Map the stat type to the desired field name
            const fieldName = Object.keys(desiredStats).find(
              key => desiredStats[key] === stat.type
            );
            if (fieldName) {
              // Use summary for records (e.g., home, road, intraleague, lasttengames)
              statsUpdate[fieldName] = stat.summary || stat.value || stat.displayValue;
            }
          }

          statsUpdate.standingsUpdatedAt = new Date();

          const result = await collection.updateOne(
            { teamId: teamId },
            { $set: statsUpdate },
            { upsert: false } // Avoid creating new documents for standings
          );

          if (result.matchedCount > 0) {
            console.log(`Updated standings for team ID: ${teamId}`);
          } else {
            console.log(`No team found with ID: ${teamId}`);
          }
        }
      }
    }

    console.log('All MLB data processed successfully');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function getAllTeams() {
  try {
    const teams = await MLBTeam.find();
    console.log(`Found ${teams.length} MLB teams`);
    if (teams.length > 0) {
      console.log('Sample team data:', {
        displayName: teams[0].displayName,
        wins: teams[0].wins,
        losses: teams[0].losses,
        availableStats: Object.keys(teams[0]).filter(key => 
          ['wins', 'losses', 'winpercent', 'gamesbehind', 'home', 'road', 
           'vsconf', 'avgpointsfor', 'avgpointsagainst', 'differential', 
           'streak', 'lasttengames'].includes(key)
        )
      });
    }
    return teams;
  } catch (error) {
    console.error('Error fetching MLB teams:', error);
    return [];
  }
}

async function searchTeams(searchQuery) {
  try {
    const query = searchQuery.toLowerCase();
    const teams = await MLBTeam.find({
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
    console.error('Error searching MLB teams:', error);
    return [];
  }
}

// Export the function
module.exports = { processMlbData, getAllTeams, searchTeams }; 