export const RAWG_API_KEY = process.env.RAWG_API_KEY;
export const RAWG_API_URL = 'https://api.rawg.io/api';

export const RAWG_ENDPOINTS = {
  games: '/games',
  genres: '/genres',
  platforms: '/platforms',
  stores: '/stores',
} as const;

export const RAWG_DEFAULT_PARAMS = {
  key: RAWG_API_KEY,
  page_size: 20,
  ordering: '-rating',
} as const; 