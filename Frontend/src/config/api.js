// API Configuration
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || '';

export const apiConfig = {
  baseURL: API_BASE_URL,
  endpoints: {
    // Stats endpoints
    stats: (league, stat) => `/api/stats/${encodeURIComponent(league)}/${encodeURIComponent(stat)}`,
    statsSearch: (league, query) => `/api/stats/${league}/search?name=${encodeURIComponent(query)}`,
    teamStats: (league, teamId, stat, limit) => {
      let url = `/api/stats/${encodeURIComponent(league)}/team/${encodeURIComponent(teamId)}/${encodeURIComponent(stat)}`;
      if (limit) url += `?limit=${limit}`;
      return url;
    },
    
    // Teams endpoints
    teams: (league) => `/api/teams/${league.toLowerCase()}`,
    teamsSearch: (league, query) => `/api/teams/${league.toLowerCase()}/search?name=${encodeURIComponent(query)}`,
    
    // Live scores
    liveScores: '/api/live-scores'
  }
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

export default apiConfig;
