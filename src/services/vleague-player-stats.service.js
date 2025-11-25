const { google } = require('googleapis');
const VLeaguePlayer = require('../models/vleague-player.model');

// Google Sheets configuration
// You'll need to set up Google Sheets API credentials
const SPREADSHEET_ID = process.env.VLEAGUE_SPREADSHEET_ID || 'YOUR_SPREADSHEET_ID';
const PLAYER_SHEET_NAME = 'Players'; // Name of the sheet with player data
const PLAYER_RANGE = 'A:AC'; // Columns A to AC (includes all extra fields)

// Initialize Google Sheets API
async function getGoogleSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_SHEETS_KEY_FILE || './google-credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  
  const authClient = await auth.getClient();
  return google.sheets({ version: 'v4', auth: authClient });
}

// Function to parse percentage strings (e.g., "45.6%" to 45.6)
function parsePercentage(value) {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  const cleaned = value.toString().replace('%', '').trim();
  return parseFloat(cleaned) || 0;
}

// Function to parse numeric values
function parseNumber(value) {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  return parseFloat(value) || 0;
}

class VLeaguePlayerStatsService {
  // Helper method to fetch and parse players from Google Sheets
  async fetchPlayersFromGoogleSheets() {
    try {
      const sheets = await getGoogleSheetsClient();
      
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${PLAYER_SHEET_NAME}!${PLAYER_RANGE}`,
      });
      
      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        console.log('No data found in player sheet.');
        return [];
      }
      
      // First row should be headers
      const headers = rows[0];
      const dataRows = rows.slice(1);
      
      // Process each player row
      const players = [];
      for (const row of dataRows) {
        if (!row[0] || !row[1]) continue; // Skip if Team or PlayerName is missing
        
        const playerData = {
          Team: row[0],
          PlayerName: row[1],
          PTS: parseNumber(row[2]),
          FGM: parseNumber(row[3]),
          FGA: parseNumber(row[4]),
          'FG%': parsePercentage(row[5]),
          '3PM': parseNumber(row[6]),
          '3PA': parseNumber(row[7]),
          '3P%': parsePercentage(row[8]),
          FTM: parseNumber(row[9]),
          FTA: parseNumber(row[10]),
          'FT%': parsePercentage(row[11]),
          OREB: parseNumber(row[12]),
          DREB: parseNumber(row[13]),
          REB: parseNumber(row[14]),
          AST: parseNumber(row[15]),
          STL: parseNumber(row[16]),
          BLK: parseNumber(row[17]),
          TOV: parseNumber(row[18]),
          // Extra fields (columns 19-28)
          shortName: row[19] || '',
          displayName: row[20] || row[1],
          firstName: row[21] || '',
          lastName: row[22] || '',
          jerseyNumber: row[23] || '',
          position: row[24] || '',
          headshot: row[25] ? { href: row[25], alt: row[1] } : null,
          teamShortName: row[26] || '',
          teamColor: row[27] || '',
          teamLogo: row[28] || ''
        };
        
        players.push(playerData);
      }
      
      return players;
    } catch (error) {
      console.error('Error fetching V League players from Google Sheets:', error);
      throw error;
    }
  }
  
  // Get top players by stat (directly from Google Sheets)
  async getTopPlayers(statType, limit = 50) {
    try {
      // Fetch directly from Google Sheets
      const players = await this.fetchPlayersFromGoogleSheets();
      
      // Sort by the specified stat
      const sortedPlayers = players.sort((a, b) => {
        const aValue = a[statType] || 0;
        const bValue = b[statType] || 0;
        return bValue - aValue; // Descending order
      });
      
      // Limit the results
      const limitedPlayers = sortedPlayers.slice(0, limit);
      
      // Map V League fields to match other leagues' structure
      return limitedPlayers.map(player => ({
        ...player,
        fullName: player.displayName || player.PlayerName,
        teamDisplayName: player.Team,
        teamName: player.Team,
        teamAbbreviation: player.teamShortName || player.Team,
        teamId: player.Team
      }));
    } catch (error) {
      console.error('Error fetching V League top players:', error);
      throw error;
    }
  }
  
  // Search players by name (directly from Google Sheets)
  async searchPlayers(searchTerm) {
    try {
      // Fetch directly from Google Sheets
      const players = await this.fetchPlayersFromGoogleSheets();
      
      // Filter by search term
      const searchLower = searchTerm.toLowerCase();
      const filteredPlayers = players.filter(player => {
        const playerName = (player.PlayerName || '').toLowerCase();
        const displayName = (player.displayName || '').toLowerCase();
        return playerName.includes(searchLower) || displayName.includes(searchLower);
      }).slice(0, 20); // Limit to 20 results
      
      // Map V League fields to match other leagues' structure
      return filteredPlayers.map(player => ({
        ...player,
        fullName: player.displayName || player.PlayerName,
        teamDisplayName: player.Team,
        teamName: player.Team,
        teamAbbreviation: player.teamShortName || player.Team,
        teamId: player.Team
      }));
    } catch (error) {
      console.error('Error searching V League players:', error);
      throw error;
    }
  }
  
  // Get team players (directly from Google Sheets)
  async getTeamPlayers(teamName, statType, limit = 100) {
    try {
      // Fetch directly from Google Sheets
      const allPlayers = await this.fetchPlayersFromGoogleSheets();
      
      // Filter by team
      const teamPlayers = allPlayers.filter(player => player.Team === teamName);
      
      // Sort by the specified stat
      const sortedPlayers = teamPlayers.sort((a, b) => {
        const aValue = a[statType] || 0;
        const bValue = b[statType] || 0;
        return bValue - aValue; // Descending order
      });
      
      // Limit the results
      const limitedPlayers = sortedPlayers.slice(0, limit);
      
      // Map V League fields to match other leagues' structure
      return limitedPlayers.map(player => ({
        ...player,
        fullName: player.displayName || player.PlayerName,
        teamDisplayName: player.Team,
        teamName: player.Team,
        teamAbbreviation: player.teamShortName || player.Team,
        teamId: player.Team
      }));
    } catch (error) {
      console.error('Error fetching V League team players:', error);
      throw error;
    }
  }
}

module.exports = new VLeaguePlayerStatsService();

