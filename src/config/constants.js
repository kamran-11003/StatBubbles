require('dotenv').config();

const API_KEYS = {
  NHL: process.env.NHL_API_KEY,
  NBA: process.env.NBA_API_KEY,
  MLB: process.env.MLB_API_KEY,
  NFL: process.env.NFL_API_KEY
};

const currentYear = new Date().getFullYear();

const BASE_URLS = {
  NHL: `https://api.sportsdata.io/v3/nhl/stats/json/PlayerSeasonStats/${currentYear}`,
  NBA: `https://api.sportsdata.io/v3/nba/stats/json/PlayerSeasonStats/${currentYear}`,
  MLB: `https://api.sportsdata.io/v3/mlb/stats/json/PlayerSeasonStats/${currentYear}`,
  NFL: `https://api.sportsdata.io/v3/nfl/stats/json/PlayerSeasonStats/${currentYear-1}REG`
};

const SCORES_URLS = {
  NHL: "https://api.sportsdata.io/v3/nhl/scores/json/ScoresBasic",
  NBA: "https://api.sportsdata.io/v3/nba/scores/json/ScoresBasic",
  MLB: "https://api.sportsdata.io/v3/mlb/scores/json/ScoresBasic",
  NFL: "https://api.sportsdata.io/v3/nfl/scores/json/ScoresByDate"
};

const TEAM_COLORS = {
  NHL: {
    "ANA": "#F47A38", "ARI": "#8C2633", "BOS": "#FFB81C", "BUF": "#002654",
    "CGY": "#C8102E", "CAR": "#CC0000", "CHI": "#CF0A2C", "COL": "#6F263D",
    "CBJ": "#002654", "DAL": "#006847", "DET": "#CE1126", "EDM": "#FF4C00",
    "FLA": "#C8102E", "LAK": "#000000", "MIN": "#024930", "MTL": "#AF1E2D",
    "NSH": "#FFB81C", "NJD": "#CE1126", "NYI": "#00539B", "NYR": "#0038A8",
    "OTT": "#C52032", "PHI": "#F74902", "PIT": "#FCB514", "SJS": "#006D75",
    "SEA": "#001628", "STL": "#002F87", "TBL": "#002868", "TOR": "#00205B",
    "VAN": "#00205B", "VGK": "#B4975A", "WSH": "#C8102E", "WPG": "#041E42"
  },
  NBA: {
    "ATL": "#E03A3E", "BOS": "#007A33", "BKN": "#000000", "CHA": "#1D1160",
    "CHI": "#CE1141", "CLE": "#860038", "DAL": "#00538C", "DEN": "#0E2240",
    "DET": "#C8102E", "GSW": "#1D428A", "HOU": "#CE1141", "IND": "#002D62",
    "LAC": "#C8102E", "LAL": "#552583", "MEM": "#5D76A9", "MIA": "#98002E",
    "MIL": "#00471B", "MIN": "#0C2340", "NOP": "#0C2340", "NYK": "#006BB6",
    "OKC": "#007AC1", "ORL": "#0077C0", "PHI": "#006BB6", "PHO": "#1D1160",
    "POR": "#E03A3E", "SAC": "#5A2D81", "SAS": "#C4CED4", "TOR": "#CE1141",
    "UTA": "#002B5C", "WAS": "#002B5C"
  },
  MLB: {
    "ARI": "#A71930", "ATL": "#13274F", "BAL": "#DF4601", "BOS": "#BD3039",
    "CHC": "#0E3386", "CWS": "#27251F", "CIN": "#C6011F", "CLE": "#00385D",
    "COL": "#333366", "DET": "#0C2340", "HOU": "#002D62", "KC": "#004687",
    "LAA": "#003263", "LAD": "#005A9C", "MIA": "#00A3E0", "MIL": "#FFC52F",
    "MIN": "#002B5C", "NYM": "#002D72", "NYY": "#003087", "OAK": "#003831",
    "PHI": "#E81828", "PIT": "#FDB827", "SD": "#2F241D", "SEA": "#0C2C56",
    "SF": "#FD5A1E", "STL": "#C41E3A", "TB": "#092C5C", "TEX": "#003278",
    "TOR": "#134A8E", "WSH": "#AB0003"
  },
  NFL: {
    "ARI": "#97233F", "ATL": "#A71930", "BAL": "#241773", "BUF": "#00338D",
    "CAR": "#0085CA", "CHI": "#0B162A", "CIN": "#FB4F14", "CLE": "#311D00",
    "DAL": "#041E42", "DEN": "#002244", "DET": "#0076B6", "GB": "#203731",
    "HOU": "#03202F", "IND": "#002C5F", "JAX": "#006778", "KC": "#E31837",
    "LV": "#000000", "LAC": "#002A5E", "LAR": "#003594", "MIA": "#008E97",
    "MIN": "#4F2683", "NE": "#002244", "NO": "#D3BC8D", "NYG": "#0B2265",
    "NYJ": "#125740", "PHI": "#004C54", "PIT": "#FFB612", "SEA": "#002244",
    "SF": "#AA0000", "TB": "#D50A0A", "TEN": "#4B92DB", "WAS": "#773141"
  }
};

module.exports = {
  API_KEYS,
  BASE_URLS,
  SCORES_URLS,
  TEAM_COLORS
};