const { google } = require('googleapis');
const VLeagueTeam = require('../models/vleague-team.model');

// Google Sheets configuration
const SPREADSHEET_ID = process.env.VLEAGUE_SPREADSHEET_ID || 'YOUR_SPREADSHEET_ID';
const TEAM_SHEET_NAME = 'Teams'; // Name of the sheet with team data
const TEAM_RANGE = 'A:AC'; // Columns A to AC (includes all extra fields)

// Initialize Google Sheets API
async function getGoogleSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_SHEETS_KEY_FILE || './google-credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  
  const authClient = await auth.getClient();
  return google.sheets({ version: 'v4', auth: authClient });
}

// Function to parse percentage strings
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

class VLeagueTeamsService {
  // Helper method to fetch and parse teams from Google Sheets
  async fetchTeamsFromGoogleSheets() {
    try {
      const sheets = await getGoogleSheetsClient();
      
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${TEAM_SHEET_NAME}!${TEAM_RANGE}`,
      });
      
      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        console.log('No data found in team sheet.');
        return [];
      }
      
      // First row should be headers
      const headers = rows[0];
      const dataRows = rows.slice(1);
      
      // Process each team row
      const teams = [];
      for (const row of dataRows) {
        if (!row[0]) continue; // Skip if Team name is missing
        
        const teamData = {
          Team: row[0],
          W: parseNumber(row[1]),
          L: parseNumber(row[2]),
          'WIN%': parsePercentage(row[3]),
          PTS: parseNumber(row[4]),
          FGM: parseNumber(row[5]),
          FGA: parseNumber(row[6]),
          'FG%': parsePercentage(row[7]),
          '3PM': parseNumber(row[8]),
          '3PA': parseNumber(row[9]),
          '3P%': parsePercentage(row[10]),
          FTM: parseNumber(row[11]),
          FTA: parseNumber(row[12]),
          'FT%': parsePercentage(row[13]),
          OREB: parseNumber(row[14]),
          DREB: parseNumber(row[15]),
          REB: parseNumber(row[16]),
          AST: parseNumber(row[17]),
          TOV: parseNumber(row[18]),
          STL: parseNumber(row[19]),
          BLK: parseNumber(row[20]),
          PF: parseNumber(row[21]),
          PFD: parseNumber(row[22]),
          // Extra fields (columns 23-28)
          shortName: row[23] || '',
          abbreviation: row[24] || '',
          displayName: row[25] || row[0],
          color: row[26] || '',
          alternateColor: row[27] || '',
          logo: row[28] || ''
        };
        
        teams.push(teamData);
      }
      
      return teams;
    } catch (error) {
      console.error('Error fetching V League teams from Google Sheets:', error);
      throw error;
    }
  }
  
  // Get all teams (directly from Google Sheets)
  async getAllTeams() {
    try {
      // Fetch directly from Google Sheets
      const teams = await this.fetchTeamsFromGoogleSheets();
      
      // Sort by WIN%
      const sortedTeams = teams.sort((a, b) => {
        const aWinPct = a['WIN%'] || 0;
        const bWinPct = b['WIN%'] || 0;
        return bWinPct - aWinPct; // Descending order
      });
      
      // Map V League fields to match other leagues' structure
      return sortedTeams.map(team => ({
        ...team,
        name: team.displayName || team.Team,
        nickname: team.shortName || '',
        location: '',
        logos: team.logo ? [{ href: team.logo, alt: team.Team }] : [],
        teamId: team.Team
      }));
    } catch (error) {
      console.error('Error fetching V League teams:', error);
      throw error;
    }
  }
  
  // Get team by stat (directly from Google Sheets)
  async getTeamsByStat(statType, limit = 50) {
    try {
      // Fetch directly from Google Sheets
      const teams = await this.fetchTeamsFromGoogleSheets();
      
      // Sort by the specified stat
      const sortedTeams = teams.sort((a, b) => {
        const aValue = a[statType] || 0;
        const bValue = b[statType] || 0;
        return bValue - aValue; // Descending order
      });
      
      // Limit the results
      const limitedTeams = sortedTeams.slice(0, limit);
      
      // Map V League fields to match other leagues' structure
      return limitedTeams.map(team => ({
        ...team,
        name: team.displayName || team.Team,
        nickname: team.shortName || '',
        location: '',
        logos: team.logo ? [{ href: team.logo, alt: team.Team }] : [],
        teamId: team.Team
      }));
    } catch (error) {
      console.error('Error fetching V League teams by stat:', error);
      throw error;
    }
  }
}

module.exports = new VLeagueTeamsService();

