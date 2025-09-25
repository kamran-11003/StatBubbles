const axios = require('axios');
const NFLTeam = require('../models/nfl-team.model');

const teamsApiUrl = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams';
const teamStatsApiUrl = 'https://site.web.api.espn.com/apis/site/v2/sports/football/nfl/teams/{teamid}/statistics?region=us&lang=en&contentorigin=espn';

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

    // Step 2: Fetch detailed team statistics for each team
    for (const team of teams) {
      try {
        const statsUrl = teamStatsApiUrl.replace('{teamid}', team.id);
        console.log(`Fetching stats for ${team.displayName} from: ${statsUrl}`);
        
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

    console.log('✅ All NFL data processed successfully');
  } catch (error) {
    console.error('❌ Error:', error.message);
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
    return stat ? (stat.value || defaultValue) : defaultValue;
  };

  // Helper function to find stat value from opponent data
  const findOpponentStatValue = (categoryName, statName, defaultValue = 0) => {
    if (!statsData.results || !statsData.results.opponent) return defaultValue;
    const category = statsData.results.opponent.find(cat => cat.name === categoryName);
    if (!category) return defaultValue;
    const stat = category.stats.find(s => s.name === statName);
    return stat ? (stat.value || defaultValue) : defaultValue;
  };

  // 🏈 SCORING
  stats.totalPointsPerGame = findStatValue('passing', 'totalPointsPerGame') || 
                            findStatValue('rushing', 'totalPointsPerGame') || 
                            findStatValue('scoring', 'totalPointsPerGame');
  stats.totalPoints = findStatValue('passing', 'totalPoints') || 
                     findStatValue('rushing', 'totalPoints') || 
                     findStatValue('scoring', 'totalPoints');
  stats.totalTouchdowns = findStatValue('passing', 'totalTouchdowns') || 
                         findStatValue('rushing', 'totalTouchdowns') || 
                         findStatValue('scoring', 'totalTouchdowns');

  // 🏈 1ST DOWNS
  stats.totalFirstDowns = findStatValue('miscellaneous', 'firstDowns');
  stats.rushingFirstDowns = findStatValue('miscellaneous', 'firstDownsRushing');
  stats.passingFirstDowns = findStatValue('miscellaneous', 'firstDownsPassing');
  stats.firstDownsByPenalty = findStatValue('miscellaneous', 'firstDownsPenalty');

  // 🏈 DOWN EFFICIENCY
  stats.thirdDownConversions = findStatValue('miscellaneous', 'thirdDownConvs');
  stats.thirdDownAttempts = findStatValue('miscellaneous', 'thirdDownAttempts');
  stats.thirdDownConversionPct = findStatValue('miscellaneous', 'thirdDownConvPct') / 100;
  stats.fourthDownConversions = findStatValue('miscellaneous', 'fourthDownConvs');
  stats.fourthDownAttempts = findStatValue('miscellaneous', 'fourthDownAttempts');
  stats.fourthDownConversionPct = findStatValue('miscellaneous', 'fourthDownConvPct') / 100;

  // 🏈 PASSING
  stats.completions = findStatValue('passing', 'completions');
  stats.passAttempts = findStatValue('passing', 'passingAttempts');
  stats.completionPct = findStatValue('passing', 'completionPct');
  stats.netPassingYards = findStatValue('passing', 'netPassingYards');
  stats.yardsPerPassAttempt = findStatValue('passing', 'yardsPerPassAttempt');
  stats.netPassingYardsPerGame = findStatValue('passing', 'netPassingYardsPerGame');
  stats.passingTouchdowns = findStatValue('passing', 'passingTouchdowns');
  stats.interceptions = findStatValue('passing', 'interceptions');
  stats.sacks = findStatValue('passing', 'sacks');
  stats.sackYardsLost = findStatValue('passing', 'sackYardsLost');

  // 🏈 RUSHING
  stats.rushingAttempts = findStatValue('rushing', 'rushingAttempts');
  stats.rushingYards = findStatValue('rushing', 'rushingYards');
  stats.yardsPerRushAttempt = findStatValue('rushing', 'yardsPerRushAttempt');
  stats.rushingYardsPerGame = findStatValue('rushing', 'rushingYardsPerGame');
  stats.rushingTouchdowns = findStatValue('rushing', 'rushingTouchdowns');

  // 🏈 OFFENSE TOTALS
  stats.totalOffensivePlays = findStatValue('rushing', 'totalOffensivePlays');
  stats.totalYards = findStatValue('rushing', 'totalYards');
  stats.yardsPerGame = findStatValue('rushing', 'yardsPerGame');
  // Derive yards per play when possible
  if (stats.totalOffensivePlays && stats.totalYards) {
    stats.yardsPerPlay = stats.totalOffensivePlays > 0 ? stats.totalYards / stats.totalOffensivePlays : 0;
  }

  // 🏈 RETURNS
  stats.kickReturns = findStatValue('returning', 'kickReturns');
  stats.kickReturnYards = findStatValue('returning', 'kickReturnYards');
  stats.avgKickoffReturnYards = findStatValue('returning', 'yardsPerKickReturn');
  stats.puntReturns = findStatValue('returning', 'puntReturns');
  stats.puntReturnYards = findStatValue('returning', 'puntReturnYards');
  stats.avgPuntReturnYards = findStatValue('returning', 'yardsPerPuntReturn');
  stats.defensiveInterceptions = findStatValue('defensiveInterceptions', 'interceptions');
  stats.interceptionYards = findStatValue('defensiveInterceptions', 'interceptionYards');
  stats.avgInterceptionYards = findStatValue('defensive', 'avgInterceptionYards');

  // 🏈 KICKING
  stats.fieldGoalsMade = findStatValue('kicking', 'fieldGoalsMade');
  stats.fieldGoalAttempts = findStatValue('kicking', 'fieldGoalAttempts');
  stats.fieldGoalPct = findStatValue('kicking', 'fieldGoalPct');
  stats.longFieldGoalMade = findStatValue('kicking', 'longFieldGoalMade');
  stats.extraPointsMade = findStatValue('kicking', 'extraPointsMade');
  stats.extraPointAttempts = findStatValue('kicking', 'extraPointAttempts');
  stats.extraPointPct = findStatValue('kicking', 'extraPointPct');
  stats.totalKickingPoints = findStatValue('kicking', 'totalKickingPoints');

  // 🏈 PUNTING
  stats.punts = findStatValue('punting', 'punts');
  stats.puntYards = findStatValue('punting', 'puntYards');
  stats.grossAvgPuntYards = findStatValue('punting', 'grossAvgPuntYards');
  stats.netAvgPuntYards = findStatValue('punting', 'netAvgPuntYards');
  stats.puntsInside20 = findStatValue('punting', 'puntsInside20');
  stats.puntsBlocked = findStatValue('punting', 'puntsBlocked');

  // 🏈 TOUCHBACKS
  stats.touchbacks = findStatValue('punting', 'touchbacks');
  stats.touchbackPct = findStatValue('kicking', 'touchbackPct');

  // 🏈 PENALTIES
  stats.totalPenalties = findStatValue('miscellaneous', 'totalPenalties');
  stats.totalPenaltyYards = findStatValue('miscellaneous', 'totalPenaltyYards');
  if (stats.gamesPlayed && stats.totalPenalties) {
    stats.penaltiesPerGame = stats.gamesPlayed > 0 ? stats.totalPenalties / stats.gamesPlayed : 0;
  }

  // 🏈 TIME OF POSSESSION
  stats.possessionTimeSeconds = findStatValue('miscellaneous', 'possessionTimeSeconds');

  // 🏈 MISCELLANEOUS
  stats.fumbles = findStatValue('general', 'fumbles');
  stats.fumblesLost = findStatValue('general', 'fumblesLost');
  stats.fumblesForced = findStatValue('general', 'fumblesForced');
  stats.fumblesRecovered = findStatValue('general', 'fumblesRecovered');
  stats.turnoverDifferential = findStatValue('miscellaneous', 'turnOverDifferential');
  stats.totalGiveaways = findStatValue('miscellaneous', 'totalGiveaways');
  stats.totalTakeaways = findStatValue('miscellaneous', 'totalTakeaways');
  stats.kicksBlocked = findStatValue('defensive', 'kicksBlocked');

  // 🏈 RED ZONE
  stats.redzoneEfficiencyPct = findStatValue('miscellaneous', 'redzoneEfficiencyPct');
  stats.redzoneTouchdownPct = findStatValue('miscellaneous', 'redzoneTouchdownPct');
  stats.redzoneFieldGoalPct = findStatValue('miscellaneous', 'redzoneFieldGoalPct');
  stats.redzoneScoringPct = findStatValue('miscellaneous', 'redzoneScoringPct');

  // 🏈 GAMES PLAYED
  stats.gamesPlayed = findStatValue('general', 'gamesPlayed') || 
                     findStatValue('passing', 'teamGamesPlayed') || 
                     findStatValue('rushing', 'teamGamesPlayed') || 
                     findStatValue('kicking', 'teamGamesPlayed') || 
                     findStatValue('punting', 'teamGamesPlayed');

  // 🏈 OPPONENT STATS (Defense against - What opponents did against this team)
  
  // Opponent Scoring
  stats.opponentPointsPerGame = findOpponentStatValue('passing', 'totalPointsPerGame');
  stats.opponentTotalPoints = findOpponentStatValue('passing', 'totalPoints');
  stats.opponentTotalTouchdowns = findOpponentStatValue('passing', 'totalTouchdowns');
  
  // Opponent 1st Downs
  stats.opponentTotalFirstDowns = findOpponentStatValue('miscellaneous', 'firstDowns');
  stats.opponentRushingFirstDowns = findOpponentStatValue('miscellaneous', 'firstDownsRushing');
  stats.opponentPassingFirstDowns = findOpponentStatValue('miscellaneous', 'firstDownsPassing');
  stats.opponentFirstDownsByPenalty = findOpponentStatValue('miscellaneous', 'firstDownsPenalty');
  
  // Opponent Down Efficiency
  stats.opponentThirdDownConversions = findOpponentStatValue('miscellaneous', 'thirdDownConvs');
  stats.opponentThirdDownAttempts = findOpponentStatValue('miscellaneous', 'thirdDownAttempts');
  stats.opponentThirdDownConversionPct = findOpponentStatValue('miscellaneous', 'thirdDownConvPct') / 100;
  stats.opponentFourthDownConversions = findOpponentStatValue('miscellaneous', 'fourthDownConvs');
  stats.opponentFourthDownAttempts = findOpponentStatValue('miscellaneous', 'fourthDownAttempts');
  stats.opponentFourthDownConversionPct = findOpponentStatValue('miscellaneous', 'fourthDownConvPct') / 100;
  
  // Opponent Passing
  stats.opponentCompletions = findOpponentStatValue('passing', 'completions');
  stats.opponentPassAttempts = findOpponentStatValue('passing', 'passingAttempts');
  stats.opponentCompletionPct = findOpponentStatValue('passing', 'completionPct');
  stats.opponentNetPassingYards = findOpponentStatValue('passing', 'netPassingYards');
  stats.opponentYardsPerPassAttempt = findOpponentStatValue('passing', 'yardsPerPassAttempt');
  stats.opponentNetPassingYardsPerGame = findOpponentStatValue('passing', 'netPassingYardsPerGame');
  stats.opponentPassingTouchdowns = findOpponentStatValue('passing', 'passingTouchdowns');
  stats.opponentInterceptions = findOpponentStatValue('passing', 'interceptions');
  stats.opponentSacks = findOpponentStatValue('passing', 'sacks');
  stats.opponentSackYardsLost = findOpponentStatValue('passing', 'sackYardsLost');
  
  // Opponent Rushing
  stats.opponentRushingAttempts = findOpponentStatValue('rushing', 'rushingAttempts');
  stats.opponentRushingYards = findOpponentStatValue('rushing', 'rushingYards');
  stats.opponentYardsPerRushAttempt = findOpponentStatValue('rushing', 'yardsPerRushAttempt');
  stats.opponentRushingYardsPerGame = findOpponentStatValue('rushing', 'rushingYardsPerGame');
  stats.opponentRushingTouchdowns = findOpponentStatValue('rushing', 'rushingTouchdowns');
  
  // Opponent Offense Totals
  stats.opponentTotalOffensivePlays = findOpponentStatValue('rushing', 'totalOffensivePlays');
  stats.opponentTotalYards = findOpponentStatValue('rushing', 'totalYards');
  stats.opponentYardsPerGame = findOpponentStatValue('rushing', 'yardsPerGame');
  
  // Opponent Returns
  stats.opponentKickReturns = findOpponentStatValue('returning', 'kickReturns');
  stats.opponentKickReturnYards = findOpponentStatValue('returning', 'kickReturnYards');
  stats.opponentAvgKickoffReturnYards = findOpponentStatValue('returning', 'yardsPerKickReturn');
  stats.opponentPuntReturns = findOpponentStatValue('returning', 'puntReturns');
  stats.opponentPuntReturnYards = findOpponentStatValue('returning', 'puntReturnYards');
  stats.opponentAvgPuntReturnYards = findOpponentStatValue('returning', 'yardsPerPuntReturn');
  stats.opponentDefensiveInterceptions = findOpponentStatValue('defensiveInterceptions', 'interceptions');
  stats.opponentInterceptionYards = findOpponentStatValue('defensiveInterceptions', 'interceptionYards');
  stats.opponentAvgInterceptionYards = findOpponentStatValue('defensive', 'avgInterceptionYards');
  
  // Opponent Kicking
  stats.opponentFieldGoalsMade = findOpponentStatValue('kicking', 'fieldGoalsMade');
  stats.opponentFieldGoalAttempts = findOpponentStatValue('kicking', 'fieldGoalAttempts');
  stats.opponentFieldGoalPct = findOpponentStatValue('kicking', 'fieldGoalPct');
  stats.opponentLongFieldGoalMade = findOpponentStatValue('kicking', 'longFieldGoalMade');
  stats.opponentExtraPointsMade = findOpponentStatValue('kicking', 'extraPointsMade');
  stats.opponentExtraPointAttempts = findOpponentStatValue('kicking', 'extraPointAttempts');
  stats.opponentExtraPointPct = findOpponentStatValue('kicking', 'extraPointPct');
  stats.opponentTotalKickingPoints = findOpponentStatValue('kicking', 'totalKickingPoints');
  
  // Opponent Punting
  stats.opponentPunts = findOpponentStatValue('punting', 'punts');
  stats.opponentPuntYards = findOpponentStatValue('punting', 'puntYards');
  stats.opponentGrossAvgPuntYards = findOpponentStatValue('punting', 'grossAvgPuntYards');
  stats.opponentNetAvgPuntYards = findOpponentStatValue('punting', 'netAvgPuntYards');
  stats.opponentPuntsInside20 = findOpponentStatValue('punting', 'puntsInside20');
  stats.opponentPuntsBlocked = findOpponentStatValue('punting', 'puntsBlocked');
  
  // Opponent Touchbacks
  stats.opponentTouchbacks = findOpponentStatValue('punting', 'touchbacks');
  stats.opponentTouchbackPct = findOpponentStatValue('kicking', 'touchbackPct');
  
  // Opponent Penalties
  stats.opponentTotalPenalties = findOpponentStatValue('miscellaneous', 'totalPenalties');
  stats.opponentTotalPenaltyYards = findOpponentStatValue('miscellaneous', 'totalPenaltyYards');
  
  // Opponent Time of Possession
  stats.opponentPossessionTimeSeconds = findOpponentStatValue('miscellaneous', 'possessionTimeSeconds');
  
  // Opponent Miscellaneous
  stats.opponentFumbles = findOpponentStatValue('general', 'fumbles');
  stats.opponentFumblesLost = findOpponentStatValue('general', 'fumblesLost');
  stats.opponentFumblesForced = findOpponentStatValue('general', 'fumblesForced');
  stats.opponentFumblesRecovered = findOpponentStatValue('general', 'fumblesRecovered');
  stats.opponentTurnoverDifferential = findOpponentStatValue('miscellaneous', 'turnOverDifferential');
  
  // Opponent Red Zone
  stats.opponentRedzoneEfficiencyPct = findOpponentStatValue('miscellaneous', 'redzoneEfficiencyPct');
  stats.opponentRedzoneTouchdownPct = findOpponentStatValue('miscellaneous', 'redzoneTouchdownPct');
  stats.opponentRedzoneFieldGoalPct = findOpponentStatValue('miscellaneous', 'redzoneFieldGoalPct');
  stats.opponentRedzoneScoringPct = findOpponentStatValue('miscellaneous', 'redzoneScoringPct');

  // Convenience defensive aliases for frontend
  stats.pointsAllowed = stats.opponentTotalPoints;
  stats.totalYardsAllowed = stats.opponentTotalYards;
  stats.passingYardsAllowed = stats.opponentNetPassingYards;
  stats.rushingYardsAllowed = stats.opponentRushingYards;
  stats.redZoneAllowedPct = stats.opponentRedzoneScoringPct;
  stats.thirdDownAllowedPct = stats.opponentThirdDownConversionPct;
  stats.fourthDownAllowedPct = stats.opponentFourthDownConversionPct;

  // Additional convenience offense aliases
  stats.pointsPerGame = stats.totalPointsPerGame;
  stats.timeOfPossession = stats.possessionTimeSeconds; // seconds; frontend can format
  stats.firstDowns = stats.totalFirstDowns;
  stats.turnovers = stats.totalGiveaways; // giveaways as TO
  stats.puntAverage = stats.grossAvgPuntYards;
  stats.netPuntAverage = stats.netAvgPuntYards;
  stats.kickReturnAverage = stats.avgKickoffReturnYards;
  stats.puntReturnAverage = stats.avgPuntReturnYards;
  stats.specialTeamsTDs = (stats.returnTouchdowns || 0); // if present
  stats.blockedKicks = stats.kicksBlocked;

  console.log(`📊 Extracted ${Object.keys(stats).length} stats from API response`);
  return stats;
}

async function getAllTeams() {
  try {
    const teams = await NFLTeam.find();
    console.log(`Found ${teams.length} NFL teams`);
    if (teams.length > 0) {
      console.log('Sample team data:', {
        displayName: teams[0].displayName,
        availableStats: Object.keys(teams[0]).filter(key => 
          // Offense stats
          ['totalPlays', 'totalYards', 'yardsPerPlay', 'pointsPerGame', 'firstDowns', 
           'thirdDownConversionPct', 'fourthDownConversionPct', 'redZoneEfficiencyPct', 
           'turnovers', 'timeOfPossession',
           // Defense stats
           'pointsAllowed', 'totalYardsAllowed', 'passingYardsAllowed', 'rushingYardsAllowed',
           'takeaways', 'redZoneAllowedPct', 'thirdDownAllowedPct', 'fourthDownAllowedPct',
           // Special teams stats
           'fieldGoalsMade', 'fieldGoalsAttempted', 'extraPointsMade', 'extraPointsAttempted',
           'puntAverage', 'netPuntAverage', 'puntsInside20', 'kickReturnAverage', 
           'puntReturnAverage', 'specialTeamsTDs', 'blockedKicks',
           // Penalties
           'totalPenalties', 'penaltyYards'].includes(key)
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