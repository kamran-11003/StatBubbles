const axios = require('axios');
const NHLTeam = require('../models/nhl-team.model');

const teamsApiUrl = 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams';
const standingsApiUrl = 'https://site.web.api.espn.com/apis/v2/sports/hockey/nhl/standings?level=3';

async function processNhlData(db) {
  try {
    const collection = db.collection('nhlteams');

    // Step 1: Fetch NHL Teams
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

      console.log(`✔ Processed NHL team: ${team.displayName}`);
    }

    // Step 2: Fetch and Update NHL Standings
    const standingsResponse = await axios.get(standingsApiUrl);
    const conferences = standingsResponse.data.children;

    const desiredStats = {
      wins: 'wins',
      losses: 'losses',
      winpercent: 'winpercent',
      gamesbehind: 'gamesbehind',
      home: 'home',
      road: 'road',
      vsdiv: 'vsdiv',
      vsconf: 'vsconf',
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
            { upsert: false } // Avoid creating new documents for standings
          );

          if (result.matchedCount > 0) {
            console.log(`✔ Updated standings for team ID: ${teamId}`);
          } else {
            console.log(`⚠ No team found with ID: ${teamId}`);
          }
        }
      }
    }

    console.log('✅ All NHL team data processed successfully');
  } catch (error) {
    console.error('❌ Error processing NHL data:', error.message);
  }
}

async function getAllTeams() {
  try {
    const teams = await NHLTeam.find();
    return teams;
  } catch (error) {
    console.error('Error fetching NHL teams:', error);
    return [];
  }
}

async function searchTeams(searchQuery) {
  try {
    const query = searchQuery.toLowerCase();
    const teams = await NHLTeam.find({
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
    console.error('Error searching NHL teams:', error);
    return [];
  }
}

module.exports = { processNhlData, getAllTeams, searchTeams }; 