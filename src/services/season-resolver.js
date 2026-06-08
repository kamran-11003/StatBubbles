const axios = require('axios');
const fs = require('fs');
const path = require('path');

/**
 * Season Resolver — Centralized Dynamic Season Detection
 * 
 * Queries ESPN APIs to determine the current season for each sport,
 * caches results in memory, and detects season transitions to trigger
 * automatic database cleanup.
 */

// Path to persist season state across restarts
const SEASON_STATE_FILE = path.join(__dirname, '../../season-state.json');

// In-memory cache: { nba: 2025, wnba: 2026, nfl: 2025, nhl: 2026, mlb: 2026 }
const seasonCache = {};

// Sport configurations for ESPN API
const SPORT_CONFIG = {
  nba: {
    sport: 'basketball',
    league: 'nba',
    collections: ['nbaplayers', 'nbateams'],
    // NBA season starts in October. ESPN uses the start year (e.g. 2025 = 2025-26 season).
    // The season ID in the statisticslog is the start year.
    getApproxStartMonth: () => 9, // October (0-indexed)
  },
  wnba: {
    sport: 'basketball',
    league: 'wnba',
    collections: ['wnbaplayers', 'wnbateams'],
    // WNBA season starts in May. Season ID = calendar year.
    getApproxStartMonth: () => 4, // May (0-indexed)
  },
  nfl: {
    sport: 'football',
    league: 'nfl',
    collections: ['nflplayers', 'nflteams'],
    // NFL season starts in September. Season ID = calendar year.
    getApproxStartMonth: () => 8, // September (0-indexed)
  },
  nhl: {
    sport: 'hockey',
    league: 'nhl',
    collections: ['nhlplayers', 'nhlteams'],
    // NHL season starts in October. ESPN uses the end year (e.g. 2026 = 2025-26 season).
    getApproxStartMonth: () => 9, // October (0-indexed)
  },
  mlb: {
    sport: 'baseball',
    league: 'mlb',
    collections: ['mlbplayers', 'mlbteams'],
    // MLB season starts in late March. Season ID = calendar year.
    getApproxStartMonth: () => 2, // March (0-indexed)
  }
};

/**
 * Load persisted season state from disk.
 * Returns an object like { nba: 2025, wnba: 2025, ... } or empty object.
 */
function loadSeasonState() {
  try {
    if (fs.existsSync(SEASON_STATE_FILE)) {
      const data = fs.readFileSync(SEASON_STATE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.log(`⚠️ [SeasonResolver] Could not read season state file: ${err.message}`);
  }
  return {};
}

/**
 * Save season state to disk.
 */
function saveSeasonState(state) {
  try {
    fs.writeFileSync(SEASON_STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
    console.log(`💾 [SeasonResolver] Season state saved to ${SEASON_STATE_FILE}`);
  } catch (err) {
    console.error(`❌ [SeasonResolver] Could not save season state: ${err.message}`);
  }
}

/**
 * Resolve the current season for a given sport by querying the ESPN seasons API.
 * 
 * Strategy: fetch the list of available seasons, find the most recent one whose
 * approximate start date is in the past.
 * 
 * @param {string} sportKey - One of: nba, wnba, nfl, nhl, mlb
 * @returns {Promise<number>} The current season ID (year number)
 */
async function resolveCurrentSeason(sportKey) {
  const config = SPORT_CONFIG[sportKey];
  if (!config) {
    throw new Error(`Unknown sport key: ${sportKey}`);
  }

  const seasonsUrl = `https://sports.core.api.espn.com/v2/sports/${config.sport}/leagues/${config.league}/seasons`;
  
  try {
    const response = await axios.get(seasonsUrl);
    const items = response.data.items || [];
    const now = new Date();

    const startedSeasons = items
      .map(item => {
        const seasonIdMatch = item.$ref.match(/\/seasons\/(\d+)/);
        if (!seasonIdMatch) return null;
        const seasonId = parseInt(seasonIdMatch[1]);
        
        // Approximate start date: use the sport's start month in the season year
        const startMonth = config.getApproxStartMonth();
        
        let approxStartDate;
        if (sportKey === 'nhl') {
          // NHL uses end year as season ID, so 2026 means the season started Oct 2025
          approxStartDate = new Date(seasonId - 1, startMonth, 1);
        } else if (sportKey === 'nba') {
          // NBA uses start year as season ID, so 2025 means the season started Oct 2025
          approxStartDate = new Date(seasonId, startMonth, 1);
        } else {
          // WNBA, NFL, MLB: season ID = calendar year, season starts in that year
          approxStartDate = new Date(seasonId, startMonth, 1);
        }
        
        return (approxStartDate <= now && seasonId >= 2020) ? seasonId : null;
      })
      .filter(Boolean)
      .sort((a, b) => b - a); // Most recent first

    if (startedSeasons.length > 0) {
      console.log(`✅ [SeasonResolver] ${sportKey.toUpperCase()} current season: ${startedSeasons[0]}`);
      return startedSeasons[0];
    }

    // Fallback: use current year
    const fallback = now.getFullYear();
    console.log(`⚠️ [SeasonResolver] No started seasons found for ${sportKey.toUpperCase()}. Defaulting to ${fallback}.`);
    return fallback;
  } catch (error) {
    const fallback = new Date().getFullYear();
    console.log(`⚠️ [SeasonResolver] Error fetching ${sportKey.toUpperCase()} seasons: ${error.message}. Defaulting to ${fallback}.`);
    return fallback;
  }
}

/**
 * Get the current season for a sport. Uses in-memory cache; if not cached,
 * resolves from ESPN API and caches the result.
 * 
 * @param {string} sportKey - One of: nba, wnba, nfl, nhl, mlb
 * @returns {Promise<number>} The current season ID
 */
async function getCurrentSeason(sportKey) {
  if (seasonCache[sportKey]) {
    return seasonCache[sportKey];
  }
  
  const seasonId = await resolveCurrentSeason(sportKey);
  seasonCache[sportKey] = seasonId;
  return seasonId;
}

/**
 * Clear the in-memory season cache. Called before midnight refresh
 * to force re-resolution of all seasons.
 */
function clearSeasonCache() {
  for (const key of Object.keys(seasonCache)) {
    delete seasonCache[key];
  }
  console.log('🔄 [SeasonResolver] Season cache cleared');
}

/**
 * Check all sports for season changes. If a sport's season has changed
 * (compared to the persisted state), drop its collections from the database
 * so they get re-populated with fresh data.
 * 
 * @param {object} db - Mongoose raw db connection (mongoose.connection.db)
 * @returns {Promise<string[]>} List of sport keys that had season changes
 */
async function checkForSeasonChanges(db) {
  console.log('🔍 [SeasonResolver] Checking for season changes...');
  
  const previousState = loadSeasonState();
  const currentState = {};
  const changedSports = [];

  for (const sportKey of Object.keys(SPORT_CONFIG)) {
    try {
      const currentSeason = await resolveCurrentSeason(sportKey);
      currentState[sportKey] = currentSeason;
      seasonCache[sportKey] = currentSeason; // Populate cache

      const previousSeason = previousState[sportKey];

      if (previousSeason && previousSeason !== currentSeason) {
        console.log(`🔄 [SeasonResolver] ${sportKey.toUpperCase()} season changed: ${previousSeason} → ${currentSeason}`);
        changedSports.push(sportKey);

        // Drop collections for this sport
        const config = SPORT_CONFIG[sportKey];
        for (const collectionName of config.collections) {
          try {
            const collections = await db.listCollections({ name: collectionName }).toArray();
            if (collections.length > 0) {
              await db.collection(collectionName).drop();
              console.log(`  🗑️ Dropped collection: ${collectionName}`);
            } else {
              console.log(`  ℹ️ Collection ${collectionName} does not exist, skipping.`);
            }
          } catch (dropErr) {
            console.error(`  ❌ Error dropping collection ${collectionName}: ${dropErr.message}`);
          }
        }
      } else if (!previousSeason) {
        console.log(`ℹ️ [SeasonResolver] ${sportKey.toUpperCase()} season ${currentSeason} (first run, no previous state)`);
      } else {
        console.log(`✅ [SeasonResolver] ${sportKey.toUpperCase()} season unchanged: ${currentSeason}`);
      }
    } catch (err) {
      console.error(`❌ [SeasonResolver] Error checking ${sportKey.toUpperCase()} season: ${err.message}`);
      // Keep previous state for this sport if we can't resolve
      if (previousState[sportKey]) {
        currentState[sportKey] = previousState[sportKey];
        seasonCache[sportKey] = previousState[sportKey];
      }
    }
  }

  // Save updated state
  saveSeasonState(currentState);

  if (changedSports.length > 0) {
    console.log(`🔄 [SeasonResolver] Season changes detected for: ${changedSports.map(s => s.toUpperCase()).join(', ')}`);
    console.log(`🔄 [SeasonResolver] Stale collections have been dropped. They will be re-populated during data refresh.`);
  } else {
    console.log('✅ [SeasonResolver] No season changes detected.');
  }

  return changedSports;
}

module.exports = {
  getCurrentSeason,
  clearSeasonCache,
  checkForSeasonChanges,
  SPORT_CONFIG
};
