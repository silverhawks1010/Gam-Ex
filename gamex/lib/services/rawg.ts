import { RAWG_API_URL, RAWG_ENDPOINTS, RAWG_DEFAULT_PARAMS } from '@/config/rawg';

export interface Game {
  id: number;
  name: string;
  background_image: string;
  rating: number;
  rating_top: number;
  ratings_count: number;
  released: string;
  platforms: {
    platform: {
      id: number;
      name: string;
    };
  }[];
  genres: {
    id: number;
    name: string;
  }[];
  short_screenshots: {
    id: number;
    image: string;
  }[];
  tags: {
    id: number;
    name: string;
  }[];
  description_raw: string;
  additions: {
    id: number;
    name: string;
    background_image: string;
  }[];
  series: {
    id: number;
    name: string;
    background_image: string;
  }[];
  stores: {
    id: number;
    store: {
      id: number;
      name: string;
      domain: string;
    };
    url: string;
  }[];
}

export interface GamesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Game[];
}

export interface Genre {
  id: number;
  name: string;
  games_count: number;
  image_background: string;
}

export interface GenresResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Genre[];
}

interface TranslatedGame extends Game {
  description_fr?: string;
}

class RAWGService {
  private readonly LIBRETRANSLATE_URL = 'http://localhost:5000';
  private translationCache: Map<string, string> = new Map();

  private async fetch<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
    const queryParams = new URLSearchParams();
    
    // Ajout des paramètres par défaut
    Object.entries(RAWG_DEFAULT_PARAMS).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    // Ajout des paramètres spécifiques
    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, value.toString());
    });

    const response = await fetch(`${RAWG_API_URL}${endpoint}?${queryParams}`, {
      next: { revalidate: 3600 }, // Revalider toutes les heures
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`RAWG API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getRecentPopularGames(): Promise<GamesResponse> {
    const currentDate = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(currentDate.getMonth() - 3);

    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    return this.fetch<GamesResponse>(RAWG_ENDPOINTS.games, {
      page_size: 5,
      ordering: '-released,-added,-rating',
      dates: `${formatDate(threeMonthsAgo)},${formatDate(currentDate)}`,
      parent_platforms: '1,2,3,4,5,6,7,8',
      exclude_additions: 1,
      exclude_parents: 1,
    });
  }

  async getFuturGames(months = 0, page = 1, pageSize = 27, ordering = '-released, added, rating'): Promise<GamesResponse> {
    const currentDate = new Date();
    let endDate: Date | null = null;
    if (months > 0) {
      endDate = new Date();
      endDate.setMonth(currentDate.getMonth() + months);
    } else {
      endDate = new Date();
      endDate.setMonth(currentDate.getMonth() + 999);
    }

    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    const params: Record<string, string | number> = {
      page,
      page_size: pageSize,
      ordering,
      parent_platforms: '1,2,3,4,5,6,7,8',
      exclude_additions: 1,
      exclude_parents: 1,
      dates: `${formatDate(currentDate)},${formatDate(endDate)}`,
    };
    return this.fetch<GamesResponse>(RAWG_ENDPOINTS.games, params);
  }

  async getPopularGames(page = 1, ordering = '-added,-rating'): Promise<GamesResponse> {
    return this.fetch<GamesResponse>(RAWG_ENDPOINTS.games, { 
      page,
      page_size: 27,
      ordering,
      exclude_additions: 1,
      exclude_parents: 1,
      parent_platforms: '1,2,3,4,5,6,7,8',
     });
  }

  private async translateText(text: string): Promise<string> {
    // Vérifier le cache d'abord
    const cachedTranslation = this.translationCache.get(text);
    if (cachedTranslation) {
      return cachedTranslation;
    }

    try {
      const response = await fetch(`${this.LIBRETRANSLATE_URL}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: 'en',
          target: 'fr',
          format: 'text'
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur de traduction: ${response.statusText}`);
      }

      const data = await response.json();
      const translatedText = data.translatedText;

      // Mettre en cache la traduction
      this.translationCache.set(text, translatedText);

      return translatedText;
    } catch (error) {
      console.error('Erreur de traduction:', error);
      return text; // Retourne le texte original en cas d'erreur
    }
  }

  async getGameDetails(id: number): Promise<TranslatedGame> {
    const game = await this.fetch<Game>(`${RAWG_ENDPOINTS.games}/${id}`);
    
    if (game.description_raw) {
      const translatedDescription = await this.translateText(game.description_raw);
      return {
        ...game,
        description_fr: translatedDescription
      };
    }
    
    return game;
  }

  async getGenres(): Promise<GenresResponse> {
    return this.fetch<GenresResponse>(RAWG_ENDPOINTS.genres);
  }

  async searchGames(query: string, page = 1, ordering = '-added,-rating'): Promise<GamesResponse> {
    return this.fetch<GamesResponse>(RAWG_ENDPOINTS.games, { 
      search: query, 
      page,
      page_size: 27,
      ordering,
      exclude_additions: 1,
      exclude_parents: 1,
      parent_platforms: '1,2,3,4,5,6,7,8',
    });
  }

  async getGamesByGenre(genreId: number, page = 1, ordering = '-added,-rating'): Promise<GamesResponse> {
    return this.fetch<GamesResponse>(RAWG_ENDPOINTS.games, {
      genres: genreId,
      page,
      page_size: 27,
      ordering,
      exclude_additions: 1,
      exclude_parents: 1,
      parent_platforms: '1,2,3,4,5,6,7,8',
    });
  }

  async getDLCs(id: number): Promise<GamesResponse> {
    console.log(`${RAWG_ENDPOINTS.games}/${id}/additions`); 
    return this.fetch<GamesResponse>(`${RAWG_ENDPOINTS.games}/${id}/additions`);
  }

  async getFranchiseGames(gameId: number): Promise<GamesResponse> {
    return this.fetch<GamesResponse>(`${RAWG_ENDPOINTS.games}/${gameId}/game-series`, {
      parent: gameId,
      page_size: 20,
      ordering: '-released'
    });
  }

  async getDevelopers(id: number): Promise<GamesResponse> {
    return this.fetch<GamesResponse>(`${RAWG_ENDPOINTS.games}/${id}/developers`);
  }
  
  
}

export const rawgService = new RAWGService(); 