const BASE_URL = 'http://localhost:5001/api';

export const API_ENDPOINTS = {
  // Auth endpoints
  register: `${BASE_URL}/auth/register`,
  login: `${BASE_URL}/auth/login`,
  adminLogin: `${BASE_URL}/auth/admin/login`,
  
  // Player endpoints
  players: `${BASE_URL}/players`,
  playerStats: (id) => `${BASE_URL}/players/${id}`,
  tournamentSummary: `${BASE_URL}/players/summary/tournament`,
  
  // User endpoints
  users: `${BASE_URL}/users`,
  userProfile: (id) => `${BASE_URL}/users/${id}`
};

export default API_ENDPOINTS;
