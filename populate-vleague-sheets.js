const { google } = require('googleapis');
require('dotenv').config();

// Google Sheets configuration
const SPREADSHEET_ID = process.env.VLEAGUE_SPREADSHEET_ID;
const CREDENTIALS_PATH = process.env.GOOGLE_SHEETS_KEY_FILE || './google-credentials.json';

// Sample team data with colors and ESPN logos
const teams = [
  {
    name: 'Phoenix Fire',
    shortName: 'PHX',
    color: '#FF6B35',
    alternateColor: '#004E89',
    logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/atl.png'
  },
  {
    name: 'Ocean Warriors',
    shortName: 'OCN',
    color: '#006BA6',
    alternateColor: '#0496FF',
    logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/atl.png'
  },
  {
    name: 'Thunder Kings',
    shortName: 'THK',
    color: '#8338EC',
    alternateColor: '#FFD60A',
    logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/atl.png'
  },
  {
    name: 'Golden Eagles',
    shortName: 'GLD',
    color: '#FFB627',
    alternateColor: '#000000',
    logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/atl.png'
  },
  {
    name: 'Silver Sharks',
    shortName: 'SLV',
    color: '#C0C0C0',
    alternateColor: '#003566',
    logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/atl.png'
  },
  {
    name: 'Crimson Dragons',
    shortName: 'CRM',
    color: '#D62828',
    alternateColor: '#F77F00',
    logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/atl.png'
  }
];

// Generate sample players for each team
function generatePlayers() {
  const firstNames = ['James', 'Michael', 'David', 'Chris', 'John', 'Robert', 'Daniel', 'Kevin', 'Brian', 'Marcus', 'Anthony', 'Joseph', 'Ryan', 'Jason', 'Matthew'];
  const lastNames = ['Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas', 'Taylor'];
  const positions = ['PG', 'SG', 'SF', 'PF', 'C'];
  
  const players = [];
  
  teams.forEach((team, teamIndex) => {
    // Generate exactly 10 players per team
    const numPlayers = 10;
    
    for (let i = 0; i < numPlayers; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const position = positions[i % positions.length];
      const jerseyNumber = (i + 1) * 2 + Math.floor(Math.random() * 10);
      
      // Generate realistic stats
      const gamesPlayed = 20 + Math.floor(Math.random() * 5);
      const minutesPerGame = 15 + Math.random() * 20;
      
      // Scoring stats
      const fgAttempts = 8 + Math.random() * 12;
      const fgMakes = fgAttempts * (0.35 + Math.random() * 0.20);
      const fgPct = (fgMakes / fgAttempts) * 100;
      
      const threeAttempts = 2 + Math.random() * 8;
      const threeMakes = threeAttempts * (0.25 + Math.random() * 0.20);
      const threePct = (threeMakes / threeAttempts) * 100;
      
      const ftAttempts = 2 + Math.random() * 6;
      const ftMakes = ftAttempts * (0.65 + Math.random() * 0.25);
      const ftPct = (ftMakes / ftAttempts) * 100;
      
      const points = (fgMakes * 2) + threeMakes + ftMakes;
      
      // Rebounding stats
      const oreb = 0.5 + Math.random() * 3;
      const dreb = 2 + Math.random() * 6;
      const reb = oreb + dreb;
      
      // Other stats
      const ast = 1 + Math.random() * 7;
      const stl = 0.3 + Math.random() * 2;
      const blk = 0.2 + Math.random() * 2;
      const tov = 1 + Math.random() * 3;
      
      players.push({
        team: team.name,
        teamShortName: team.shortName,
        teamColor: team.color,
        teamLogo: team.logo,
        playerName: `${firstName} ${lastName}`,
        shortName: `${firstName.charAt(0)}. ${lastName}`,
        displayName: `${firstName} ${lastName}`,
        firstName: firstName,
        lastName: lastName,
        jerseyNumber: jerseyNumber.toString(),
        position: position,
        headshot: 'https://a.espncdn.com/i/headshots/mlb/players/full/40926.png',
        // Stats
        PTS: Math.round(points * 10) / 10,
        FGM: Math.round(fgMakes * 10) / 10,
        FGA: Math.round(fgAttempts * 10) / 10,
        'FG%': Math.round(fgPct * 10) / 10,
        '3PM': Math.round(threeMakes * 10) / 10,
        '3PA': Math.round(threeAttempts * 10) / 10,
        '3P%': Math.round(threePct * 10) / 10,
        FTM: Math.round(ftMakes * 10) / 10,
        FTA: Math.round(ftAttempts * 10) / 10,
        'FT%': Math.round(ftPct * 10) / 10,
        OREB: Math.round(oreb * 10) / 10,
        DREB: Math.round(dreb * 10) / 10,
        REB: Math.round(reb * 10) / 10,
        AST: Math.round(ast * 10) / 10,
        STL: Math.round(stl * 10) / 10,
        BLK: Math.round(blk * 10) / 10,
        TOV: Math.round(tov * 10) / 10
      });
    }
  });
  
  return players;
}

// Generate team stats based on players
function generateTeamStats(players) {
  return teams.map(team => {
    const teamPlayers = players.filter(p => p.team === team.name);
    
    // Calculate team totals
    const totalGames = 25;
    const wins = 8 + Math.floor(Math.random() * 17);
    const losses = totalGames - wins;
    const winPct = (wins / totalGames) * 100;
    
    // Average team stats per game
    const avgPTS = teamPlayers.reduce((sum, p) => sum + p.PTS, 0);
    const avgFGM = teamPlayers.reduce((sum, p) => sum + p.FGM, 0);
    const avgFGA = teamPlayers.reduce((sum, p) => sum + p.FGA, 0);
    const avgFGPct = (avgFGM / avgFGA) * 100;
    
    const avg3PM = teamPlayers.reduce((sum, p) => sum + p['3PM'], 0);
    const avg3PA = teamPlayers.reduce((sum, p) => sum + p['3PA'], 0);
    const avg3PPct = (avg3PM / avg3PA) * 100;
    
    const avgFTM = teamPlayers.reduce((sum, p) => sum + p.FTM, 0);
    const avgFTA = teamPlayers.reduce((sum, p) => sum + p.FTA, 0);
    const avgFTPct = (avgFTM / avgFTA) * 100;
    
    const avgOREB = teamPlayers.reduce((sum, p) => sum + p.OREB, 0);
    const avgDREB = teamPlayers.reduce((sum, p) => sum + p.DREB, 0);
    const avgREB = avgOREB + avgDREB;
    const avgAST = teamPlayers.reduce((sum, p) => sum + p.AST, 0);
    const avgTOV = teamPlayers.reduce((sum, p) => sum + p.TOV, 0);
    const avgSTL = teamPlayers.reduce((sum, p) => sum + p.STL, 0);
    const avgBLK = teamPlayers.reduce((sum, p) => sum + p.BLK, 0);
    const avgPF = 18 + Math.random() * 8;
    const avgPFD = 16 + Math.random() * 8;
    
    return {
      team: team.name,
      shortName: team.shortName,
      abbreviation: team.shortName,
      displayName: team.name,
      color: team.color,
      alternateColor: team.alternateColor,
      logo: team.logo,
      W: wins,
      L: losses,
      'WIN%': Math.round(winPct * 10) / 10,
      PTS: Math.round(avgPTS * 10) / 10,
      FGM: Math.round(avgFGM * 10) / 10,
      FGA: Math.round(avgFGA * 10) / 10,
      'FG%': Math.round(avgFGPct * 10) / 10,
      '3PM': Math.round(avg3PM * 10) / 10,
      '3PA': Math.round(avg3PA * 10) / 10,
      '3P%': Math.round(avg3PPct * 10) / 10,
      FTM: Math.round(avgFTM * 10) / 10,
      FTA: Math.round(avgFTA * 10) / 10,
      'FT%': Math.round(avgFTPct * 10) / 10,
      OREB: Math.round(avgOREB * 10) / 10,
      DREB: Math.round(avgDREB * 10) / 10,
      REB: Math.round(avgREB * 10) / 10,
      AST: Math.round(avgAST * 10) / 10,
      TOV: Math.round(avgTOV * 10) / 10,
      STL: Math.round(avgSTL * 10) / 10,
      BLK: Math.round(avgBLK * 10) / 10,
      PF: Math.round(avgPF * 10) / 10,
      PFD: Math.round(avgPFD * 10) / 10
    };
  });
}

// Initialize Google Sheets API
async function getGoogleSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const authClient = await auth.getClient();
  return google.sheets({ version: 'v4', auth: authClient });
}

// Main function to populate sheets
async function populateSheets() {
  try {
    console.log('🚀 Starting V League sheets population...\n');
    
    // Check environment variables
    if (!SPREADSHEET_ID) {
      throw new Error('VLEAGUE_SPREADSHEET_ID not found in .env file');
    }
    
    console.log('📋 Spreadsheet ID:', SPREADSHEET_ID);
    console.log('🔑 Credentials file:', CREDENTIALS_PATH);
    
    // Initialize Google Sheets client
    const sheets = await getGoogleSheetsClient();
    console.log('✅ Google Sheets API authenticated\n');
    
    // Generate data
    console.log('📊 Generating player data...');
    const players = generatePlayers();
    console.log(`✅ Generated ${players.length} players across ${teams.length} teams\n`);
    
    console.log('🏀 Generating team stats...');
    const teamStats = generateTeamStats(players);
    console.log(`✅ Generated stats for ${teamStats.length} teams\n`);
    
    // Populate Players sheet
    console.log('📝 Populating Players sheet...');
    
    // Headers for Players sheet (with extra fields)
    const playerHeaders = [
      'Team', 'Player Name', 'PTS', 'FGM', 'FGA', 'FG%', '3PM', '3PA', '3P%', 
      'FTM', 'FTA', 'FT%', 'OREB', 'DREB', 'REB', 'AST', 'STL', 'BLK', 'TOV',
      'Short Name', 'Display Name', 'First Name', 'Last Name', 'Jersey Number', 
      'Position', 'Headshot URL', 'Team Short Name', 'Team Color', 'Team Logo'
    ];
    
    const playerRows = players.map(p => [
      p.team, p.playerName, p.PTS, p.FGM, p.FGA, p['FG%'], p['3PM'], p['3PA'], p['3P%'],
      p.FTM, p.FTA, p['FT%'], p.OREB, p.DREB, p.REB, p.AST, p.STL, p.BLK, p.TOV,
      p.shortName, p.displayName, p.firstName, p.lastName, p.jerseyNumber,
      p.position, p.headshot, p.teamShortName, p.teamColor, p.teamLogo
    ]);
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Players!A1:AC1',
      valueInputOption: 'RAW',
      resource: {
        values: [playerHeaders]
      }
    });
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Players!A2:AC${playerRows.length + 1}`,
      valueInputOption: 'RAW',
      resource: {
        values: playerRows
      }
    });
    
    console.log(`✅ Players sheet populated with ${players.length} players\n`);
    
    // Populate Teams sheet
    console.log('📝 Populating Teams sheet...');
    
    // Headers for Teams sheet (with extra fields)
    const teamHeaders = [
      'Team', 'W', 'L', 'WIN%', 'PTS', 'FGM', 'FGA', 'FG%', '3PM', '3PA', '3P%',
      'FTM', 'FTA', 'FT%', 'OREB', 'DREB', 'REB', 'AST', 'TOV', 'STL', 'BLK', 'PF', 'PFD',
      'Short Name', 'Abbreviation', 'Display Name', 'Color', 'Alternate Color', 'Logo URL'
    ];
    
    const teamRows = teamStats.map(t => [
      t.team, t.W, t.L, t['WIN%'], t.PTS, t.FGM, t.FGA, t['FG%'], t['3PM'], t['3PA'], t['3P%'],
      t.FTM, t.FTA, t['FT%'], t.OREB, t.DREB, t.REB, t.AST, t.TOV, t.STL, t.BLK, t.PF, t.PFD,
      t.shortName, t.abbreviation, t.displayName, t.color, t.alternateColor, t.logo
    ]);
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Teams!A1:AC1',
      valueInputOption: 'RAW',
      resource: {
        values: [teamHeaders]
      }
    });
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Teams!A2:AC${teamRows.length + 1}`,
      valueInputOption: 'RAW',
      resource: {
        values: teamRows
      }
    });
    
    console.log(`✅ Teams sheet populated with ${teamStats.length} teams\n`);
    
    // Summary
    console.log('═══════════════════════════════════════');
    console.log('🎉 SUCCESS! Sheets populated with:');
    console.log('═══════════════════════════════════════');
    console.log(`📊 ${players.length} Players`);
    console.log(`🏀 ${teamStats.length} Teams`);
    console.log('');
    console.log('Teams Created:');
    teams.forEach(team => {
      const teamPlayers = players.filter(p => p.team === team.name);
      const teamStat = teamStats.find(t => t.team === team.name);
      console.log(`  • ${team.name} (${team.shortName}) - ${teamPlayers.length} players - ${teamStat.W}-${teamStat.L} record`);
    });
    console.log('');
    console.log('Next Steps:');
    console.log('1. Open your Google Sheet to verify the data');
    console.log('2. Run the sync command: POST http://localhost:3000/api/stats/V%20League/sync');
    console.log('3. Check your V League in the frontend!');
    console.log('═══════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Error populating sheets:', error.message);
    if (error.errors) {
      console.error('Details:', error.errors);
    }
    process.exit(1);
  }
}

// Run the script
populateSheets();


