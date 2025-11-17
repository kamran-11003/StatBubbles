const axios = require('axios');
const NHLTeam = require('../models/nhl-team.model');

const teamsApiUrl = 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams';
const standingsApiUrl = 'https://site.web.api.espn.com/apis/v2/sports/hockey/nhl/standings?level=3';
const teamStatsApiUrl = 'https://site.web.api.espn.com/apis/site/v2/sports/hockey/nhl/teams/{teamid}/statistics?region=us&lang=en&contentorigin=espn';

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
      gamesplayed: 'gamesplayed',
      gamesbehind: 'gamesbehind',
      points: 'points',
      pointsfor: 'pointsfor',
      pointsagainst: 'pointsagainst',
      pointdifferential: 'pointdifferential',
      pointsdiff: 'pointsdiff',
      differential: 'differential',
      home: 'home',
      road: 'road',
      vsdiv: 'vsdiv',
      total: 'total',
      lasttengames: 'lasttengames',
      streak: 'streak',
      // Overtime/Shootout stats
      otlosses: 'otlosses',
      overtimelosses: 'overtimelosses',
      overtimewins: 'overtimewins',
      shootoutlosses: 'shootoutlosses',
      shootoutwins: 'shootoutwins',
      // Regulation stats
      reglosses: 'reglosses',
      regwins: 'regwins',
      rotlosses: 'rotlosses',
      rotwins: 'rotwins',
      // Playoff info
      playoffseed: 'playoffseed'
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

    // Step 3: Fetch detailed team statistics for each team
    for (const team of teams) {
      try {
        const statsUrl = teamStatsApiUrl.replace('{teamid}', team.id);
        console.log(`🏒 Fetching stats for ${team.displayName} from: ${statsUrl}`);
        
        const statsResponse = await axios.get(statsUrl);
        const statsData = statsResponse.data;

        // Extract comprehensive team statistics
        const teamStats = extractTeamStats(statsData);
        
        if (Object.keys(teamStats).length > 0) {
          teamStats.statsUpdatedAt = new Date();

          const result = await collection.updateOne(
            { teamId: team.id },
            { $set: teamStats },
            { upsert: false }
          );

          if (result.matchedCount > 0) {
            console.log(`✅ Updated stats for team: ${team.displayName}`);
          } else {
            console.log(`❌ No team found with ID: ${team.id}`);
          }
        } else {
          console.log(`⚠️ No stats extracted for team: ${team.displayName}`);
        }
      } catch (error) {
        console.error(`❌ Error fetching stats for team ${team.displayName}:`, error.message);
      }
    }

    console.log('✅ All NHL team data processed successfully');
  } catch (error) {
    console.error('❌ Error processing NHL data:', error.message);
  }
}

// Helper function to extract team statistics from API response
function extractTeamStats(statsData) {
  const stats = {};
  
  // Check if the data has the expected structure
  if (!statsData || !statsData.results || !statsData.results.stats || !statsData.results.stats.categories) {
    console.log('❌ Invalid stats data structure - missing results.stats.categories');
    return stats;
  }
  
  const categories = statsData.results.stats.categories;

  // Helper function to find stat value
  const findStatValue = (categoryName, statName, defaultValue = 0) => {
    const category = categories.find(cat => cat.name === categoryName);
    if (!category) return defaultValue;
    const stat = category.stats.find(s => s.name === statName);
    return stat ? (stat.value !== undefined ? stat.value : defaultValue) : defaultValue;
  };

  // 🏒 GENERAL STATS
  stats.games = findStatValue('general', 'games');
  stats.wins = findStatValue('general', 'wins');
  stats.losses = findStatValue('general', 'losses');
  stats.timeOnIce = findStatValue('general', 'timeOnIce');
  stats.timeOnIcePerGame = findStatValue('general', 'timeOnIcePerGame');
  stats.plusMinus = findStatValue('general', 'plusMinus');
  stats.production = findStatValue('general', 'production');
  stats.shifts = findStatValue('general', 'shifts');

  // 🏒 OFFENSIVE STATS
  stats.goals = findStatValue('offensive', 'goals');
  stats.assists = findStatValue('offensive', 'assists');
  stats.points = findStatValue('offensive', 'points');
  stats.faceoffsWon = findStatValue('offensive', 'faceoffsWon');
  stats.faceoffsLost = findStatValue('offensive', 'faceoffsLost');
  stats.faceoffPercent = findStatValue('offensive', 'faceoffPercent');
  stats.gameWinningGoals = findStatValue('offensive', 'gameWinningGoals');
  stats.powerPlayGoals = findStatValue('offensive', 'powerPlayGoals');
  stats.powerPlayAssists = findStatValue('offensive', 'powerPlayAssists');
  stats.shortHandedGoals = findStatValue('offensive', 'shortHandedGoals');
  stats.shortHandedAssists = findStatValue('offensive', 'shortHandedAssists');
  stats.shotsTotal = findStatValue('offensive', 'shotsTotal');
  stats.shootingPct = findStatValue('offensive', 'shootingPct');
  stats.shootoutAttempts = findStatValue('offensive', 'shootoutAttempts');
  stats.shootoutGoals = findStatValue('offensive', 'shootoutGoals');
  stats.shootoutShotPct = findStatValue('offensive', 'shootoutShotPct');

  // 🏒 DEFENSIVE STATS
  stats.avgGoalsAgainst = findStatValue('defensive', 'avgGoalsAgainst');
  stats.goalsAgainst = findStatValue('defensive', 'goalsAgainst');
  stats.saves = findStatValue('defensive', 'saves');
  stats.savePct = findStatValue('defensive', 'savePct');
  stats.shotsAgainst = findStatValue('defensive', 'shotsAgainst');
  stats.overtimeLosses = findStatValue('defensive', 'overtimeLosses');
  stats.shootoutSaves = findStatValue('defensive', 'shootoutSaves');
  stats.shootoutShotsAgainst = findStatValue('defensive', 'shootoutShotsAgainst');
  stats.shootoutSavePct = findStatValue('defensive', 'shootoutSavePct');

  // 🏒 PENALTIES
  stats.penaltyMinutes = findStatValue('penalties', 'penaltyMinutes');

  console.log(`📊 Extracted ${Object.keys(stats).length} stats from API response`);
  return stats;
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