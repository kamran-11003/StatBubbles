const NbaTeamsService = require('../services/nba-teams.service');
const WnbaTeamsService = require('../services/wnba-teams.service');
const MlbTeamsService = require('../services/mlb-teams.service');
const NflTeamsService = require('../services/nfl-teams.service');
const NhlTeamsService = require('../services/nhl-teams.service');
const VLeagueTeamsService = require('../services/vleague-teams.service');

class TeamsController {
  async getAllTeams(req, res) {
    const { league } = req.params;
    try {
      let teams;
      if (league === 'nba') {
        teams = await NbaTeamsService.getAllTeams();
      } else if (league === 'wnba') {
        teams = await WnbaTeamsService.getAllTeams();
      } else if (league === 'mlb') {
        teams = await MlbTeamsService.getAllTeams();
      } else if (league === 'nfl') {
        teams = await NflTeamsService.getAllTeams();
      } else if (league === 'nhl') {
        teams = await NhlTeamsService.getAllTeams();
      } else if (league === 'vleague' || league === 'v league' || league === 'V League') {
        teams = await VLeagueTeamsService.getAllTeams();
      } else {
        return res.status(400).json({ error: 'Invalid league. Use nba, wnba, mlb, nfl, nhl, or vleague.' });
      }
      res.json(teams);
    } catch (error) {
      res.status(500).json({ error: `Error fetching ${league} teams` });
    }
  }

  async searchTeams(req, res) {
    const { league } = req.params;
    const { name } = req.query;
    
    if (!name) {
      return res.status(400).json({ error: 'Name parameter is required' });
    }

    try {
      let teams;
      if (league === 'nba') {
        teams = await NbaTeamsService.searchTeams(name);
      } else if (league === 'wnba') {
        teams = await WnbaTeamsService.searchTeams(name);
      } else if (league === 'mlb') {
        teams = await MlbTeamsService.searchTeams(name);
      } else if (league === 'nfl') {
        teams = await NflTeamsService.searchTeams(name);
      } else if (league === 'nhl') {
        teams = await NhlTeamsService.searchTeams(name);
      } else if (league === 'vleague' || league === 'v league' || league === 'V League') {
        teams = await VLeagueTeamsService.getAllTeams();
        // Filter by name
        teams = teams.filter(team => 
          team.Team && team.Team.toLowerCase().includes(name.toLowerCase())
        );
      } else {
        return res.status(400).json({ error: 'Invalid league. Use nba, wnba, mlb, nfl, nhl, or vleague.' });
      }
      res.json(teams);
    } catch (error) {
      res.status(500).json({ error: `Error searching ${league} teams` });
    }
  }
}

module.exports = new TeamsController(); 