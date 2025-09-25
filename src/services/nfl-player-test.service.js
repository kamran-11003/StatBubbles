const axios = require('axios');
async function testSingleAthlete(athleteId = '4038941') {
  try {
    const endpoints = [
      `https://site.web.api.espn.com/apis/common/v3/sports/football/nfl/athletes/${athleteId}/stats?season=2025&seasontype=2`,
      `https://site.web.api.espn.com/apis/common/v3/sports/football/nfl/athletes/${athleteId}/overview?season=2025&seasontype=2`,
      `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/2025/types/2/athletes/${athleteId}/statistics/0`
    ];

    // Fetch ALL available endpoints and merge
    const payloads = [];
    const workingEndpoints = [];
    for (const endpoint of endpoints) {
      try {
        const res = await axios.get(endpoint);
        payloads.push(res.data);
        workingEndpoints.push(endpoint);
        console.log(`✅ Endpoint OK: ${endpoint}`);
      } catch (e) {
        console.log(`❌ Endpoint failed: ${endpoint} - ${e.message}`);
      }
    }

    if (payloads.length === 0) {
      console.log('❌ No working endpoint. Aborting.');
      return;
    }

    const extractedStats = {};
    const statSources = {}; // name -> Set of category tags

    // v3 categories: support names+statistics and stats[] shapes
    for (const statsData of payloads) {
      if (statsData.categories && Array.isArray(statsData.categories)) {
        statsData.categories.forEach(category => {
        if (category.names && category.statistics && category.statistics.length > 0 && Array.isArray(category.names)) {
          const playerStat = category.statistics[0];
          const is2025 = playerStat.season?.year ? playerStat.season.year === 2025 : true;
          if (is2025) {
            category.names.forEach((name, index) => {
              const raw = playerStat.stats?.[index];
              if (raw !== undefined) {
                const str = typeof raw === 'string' ? raw : `${raw}`;
                extractedStats[name] = str.includes('-') ? str : (parseFloat(str) || 0);
                  const tag = `v3:${category.name || category.displayName || category.abbreviation || 'unknown'}`;
                  statSources[name] = statSources[name] || new Set();
                  statSources[name].add(tag);
              }
            });
          }
        }
        if (Array.isArray(category.stats)) {
          category.stats.forEach(stat => {
            if (!stat || !stat.name) return;
            const raw = stat.value ?? stat.displayValue;
            const num = typeof raw === 'string' ? (parseFloat(raw.replace(/,/g, '')) || 0) : (Number(raw) || 0);
            extractedStats[stat.name] = num;
              const tag = `v3stats:${category.name || category.displayName || category.abbreviation || 'unknown'}`;
              statSources[stat.name] = statSources[stat.name] || new Set();
              statSources[stat.name].add(tag);
          });
        }
        });
      }
    }

    // v2 splits.categories
    for (const statsData of payloads) {
      if (statsData.splits && statsData.splits.categories && Array.isArray(statsData.splits.categories)) {
        statsData.splits.categories.forEach(category => {
          if (Array.isArray(category.stats)) {
            category.stats.forEach(stat => {
              if (!stat || !stat.name) return;
              const raw = stat.value ?? stat.displayValue;
              const num = typeof raw === 'string' ? (parseFloat(raw.replace(/,/g, '')) || 0) : (Number(raw) || 0);
              extractedStats[stat.name] = num;
              const tag = `v2:${category.name || category.displayName || category.abbreviation || 'unknown'}`;
              statSources[stat.name] = statSources[stat.name] || new Set();
              statSources[stat.name].add(tag);
            });
          }
        });
      }
    }

    // Parse combined kicking fields if present (e.g., 6-8)
    const fgCombo = String(extractedStats['fieldGoalsMade-fieldGoalAttempts'] || '');
    if (fgCombo.includes('-')) {
      const [made, att] = fgCombo.split('-').map(Number);
      extractedStats.fieldGoalsMade = made || 0;
      extractedStats.fieldGoalAttempts = att || 0;
    }

    const playerDoc = {
      // Passing
      gamesPlayed: extractedStats.gamesPlayed || 0,
      passCompletions: extractedStats.completions || 0,
      passAttempts: extractedStats.passingAttempts || extractedStats.passAttempts || 0,
      completionPercentage: extractedStats.completionPct || 0,
      passYards: extractedStats.passingYards || 0,
      yardsPerPassAttempt: extractedStats.yardsPerPassAttempt || 0,
      passTouchdowns: extractedStats.passingTouchdowns || 0,
      interceptions: extractedStats.interceptions || 0,
      longestPass: extractedStats.longPassing || extractedStats.longPass || 0,
      sacksTaken: extractedStats.sacks || 0,
      passerRating: extractedStats.QBRating || 0,
      qbr: extractedStats.adjQBR || extractedStats.ESPNQBRating || 0,

      // Rushing
      rushingAttempts: extractedStats.rushingAttempts || 0,
      rushingYards: extractedStats.rushingYards || 0,
      yardsPerRushAttempt: extractedStats.yardsPerRushAttempt || 0,
      rushTouchdowns: extractedStats.rushingTouchdowns || 0,
      longestRush: extractedStats.longRushing || 0,
      rushingFirstDowns: extractedStats.rushingFirstDowns || 0,
      rushingFumbles: extractedStats.rushingFumbles || 0,
      rushingFumblesLost: extractedStats.rushingFumblesLost || 0,

      // Receiving
      receptions: extractedStats.receptions || 0,
      receivingTargets: extractedStats.receivingTargets || 0,
      catchPercentage: extractedStats.catchPct || 0,
      receivingYards: extractedStats.receivingYards || 0,
      yardsPerReception: extractedStats.yardsPerReception || 0,
      receivingYardsPerGame: extractedStats.receivingYardsPerGame || 0,
      receivingTouchdowns: extractedStats.receivingTouchdowns || 0,
      longestReception: extractedStats.longReception || extractedStats.longReceiving || 0,
      receivingFirstDowns: extractedStats.receivingFirstDowns || 0,
      receivingFumbles: extractedStats.receivingFumbles || 0,
      receivingFumblesLost: extractedStats.receivingFumblesLost || 0,

      // Defense
      totalTackles: (extractedStats.soloTackles || 0) + (extractedStats.assistTackles || 0) || extractedStats.totalTackles || 0,
      soloTackles: extractedStats.soloTackles || 0,
      assistedTackles: extractedStats.assistTackles || 0,
      sacks: extractedStats.sacks || 0,
      forcedFumbles: extractedStats.fumblesForced || 0,
      fumbleRecoveries: extractedStats.fumblesRecovered || 0,
      fumbleRecoveryYards: extractedStats.fumblesRecoveredYards || 0,
      defensiveInterceptions: extractedStats.interceptions || 0,
      interceptionYards: extractedStats.interceptionYards || 0,
      avgInterceptionYards: extractedStats.avgInterceptionYards || 0,
      interceptionTouchdowns: extractedStats.interceptionTouchdowns || 0,
      longestInterception: extractedStats.longInterception || 0,
      passesDefended: extractedStats.passesDefended || 0,
      stuffs: extractedStats.stuffs || 0,
      stuffYards: extractedStats.stuffYards || 0,
      kicksBlocked: extractedStats.kicksBlocked || 0,
      safeties: extractedStats.safeties || 0,

      // Kicking
      fieldGoalsMade: extractedStats.fieldGoalsMade || 0,
      fieldGoalAttempts: extractedStats.fieldGoalAttempts || 0,
      fieldGoalPercentage: extractedStats.fieldGoalPct || 0,
      longFieldGoalMade: extractedStats.longFieldGoalMade || 0,
      extraPointsMade: extractedStats.extraPointsMade || 0,
      extraPointAttempts: extractedStats.extraPointAttempts || 0,
      extraPointPercentage: extractedStats.extraPointPct || 0,
      totalKickingPoints: extractedStats.totalKickingPoints || 0,

      // Punting
      punts: extractedStats.punts || 0,
      puntYards: extractedStats.puntYards || 0,
      grossAvgPuntYards: extractedStats.grossAvgPuntYards || extractedStats.AVG || 0,
      netAvgPuntYards: extractedStats.netAvgPuntYards || extractedStats.NET || 0,
      puntsInside20: extractedStats.puntsInside20 || extractedStats.IN20 || 0,
      puntTouchbacks: extractedStats.touchbacks || 0,
      longestPunt: extractedStats.longPunt || extractedStats.longestPunt || 0,
      blockedPunts: extractedStats.puntsBlocked || extractedStats.blockedPunts || 0,

      // Returns
      kickReturnAttempts: extractedStats.kickReturns || extractedStats.kickReturnAttempts || 0,
      kickReturnYards: extractedStats.kickReturnYards || 0,
      kickReturnAverage: extractedStats.avgKickReturnYards || 0,
      kickReturnTouchdowns: extractedStats.kickReturnTouchdowns || 0,
      longestKickReturn: extractedStats.longKickReturn || 0,
      kickReturnFairCatches: extractedStats.kickReturnFairCatches || 0,
      puntReturnAttempts: extractedStats.puntReturns || extractedStats.puntReturnAttempts || 0,
      puntReturnYards: extractedStats.puntReturnYards || 0,
      puntReturnAverage: extractedStats.avgPuntReturnYards || 0,
      puntReturnTouchdowns: extractedStats.puntReturnTouchdowns || 0,
      longestPuntReturn: extractedStats.longPuntReturn || 0,
      puntReturnFairCatches: extractedStats.puntReturnFairCatches || 0,
    };

    // Derived percentages
    if (playerDoc.receivingTargets > 0) playerDoc.catchPercentage = (playerDoc.receptions / playerDoc.receivingTargets) * 100;
    if (playerDoc.extraPointAttempts > 0) playerDoc.extraPointPercentage = (playerDoc.extraPointsMade / playerDoc.extraPointAttempts) * 100;
    if (playerDoc.fieldGoalAttempts > 0) playerDoc.fieldGoalPercentage = (playerDoc.fieldGoalsMade / playerDoc.fieldGoalAttempts) * 100;

    console.log('📦 Extracted Stats Keys:', Object.keys(extractedStats).length);
    console.log('🧪 Sample extracted:', {
      passingYards: extractedStats.passingYards,
      rushingYards: extractedStats.rushingYards,
      receptions: extractedStats.receptions,
      fieldGoalsMade: extractedStats.fieldGoalsMade,
      punts: extractedStats.punts
    });
    console.log('🗺️ Mapped playerDoc preview:', {
      passYards: playerDoc.passYards,
      rushingYards: playerDoc.rushingYards,
      receptions: playerDoc.receptions,
      totalTackles: playerDoc.totalTackles,
      fieldGoalsMade: playerDoc.fieldGoalsMade,
      punts: playerDoc.punts
    });

    return { workingEndpoints, extractedStats, statSources: Object.fromEntries(Object.entries(statSources).map(([k,v]) => [k, Array.from(v)])), playerDoc };
  } catch (err) {
    console.error('❌ testSingleAthlete error:', err.message);
    return null;
  }
}

module.exports = { testSingleAthlete };


// Allow running directly via: node src/services/nfl-player-test.service.js [athleteId]
if (require.main === module) {
  const athleteId = process.argv[2] || '4040983';
  (async () => {
    const res = await testSingleAthlete(athleteId);
    if (!res) {
      process.exit(1);
    }
    console.log('\n===== Working Endpoints =====');
    console.log(Array.isArray(res.workingEndpoints) ? res.workingEndpoints.join('\n') : res.workingEndpoints);
    console.log('\n===== Extracted Keys Count =====');
    console.log(Object.keys(res.extractedStats).length);
    console.log('\n===== Extracted Stat Names (non-zero first) =====');
    const allNames = Object.keys(res.extractedStats);
    const sorted = allNames.sort((a,b) => {
      const av = Number(res.extractedStats[a]) || 0;
      const bv = Number(res.extractedStats[b]) || 0;
      if ((bv !== 0) - (av !== 0)) return (bv !== 0) ? 1 : -1; // non-zero first
      if (bv !== av) return bv - av; // descending value
      return a.localeCompare(b);
    });
    sorted.forEach(name => {
      const val = res.extractedStats[name];
      const sources = (res.statSources && res.statSources[name]) ? res.statSources[name].join(',') : '';
      console.log(`${name}: ${val}${sources ? `  [${sources}]` : ''}`);
    });
    console.log('\n===== PlayerDoc Preview =====');
    console.log(JSON.stringify(res.playerDoc, null, 2));
  })();
}
