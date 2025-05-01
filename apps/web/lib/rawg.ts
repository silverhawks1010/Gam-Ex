interface RAWGGame {
  id: number;
  name: string;
  background_image: string;
  released: string;
  metacritic: number | null;
  added: number;
  genres: Array<{ id: number; name: string }>;
  platforms: Array<{ platform: { id: number; name: string } }>;
  publishers: Array<{ id: number; name: string }>;
}

export interface RAWGResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RAWGGame[];
}

export async function getRecentGames(): Promise<RAWGGame[]> {
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const formattedToday = today.toISOString().split('T')[0];
    const formattedThirtyDaysAgo = thirtyDaysAgo.toISOString().split('T')[0];

    const url = `https://api.rawg.io/api/games?key=${process.env.RAWG_API_KEY}&dates=${formattedThirtyDaysAgo},${formattedToday}&ordering=-added &page_size=4&metacritic=0,100`;
    console.log('URL de l\'API:', url);

    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur API:', response.status, errorText);
      throw new Error(`Échec de la récupération des jeux récents: ${response.status} ${errorText}`);
    }

    const data: RAWGResponse = await response.json();
    console.log('Nombre de jeux trouvés:', data.count);
    console.log('Jeux:', data.results);
    
    return data.results;
  } catch (error) {
    console.error('Erreur dans getRecentGames:', error);
    throw error;
  }
}

interface GetGamesOptions {
  page: number;
  pageSize: number;
  search?: string;
  upcoming?: boolean;
  platform?: string;
  year?: string;
  ordering?: string;
}

export async function getPopularGames({ 
  page = 1, 
  pageSize = 16, 
  search = "", 
  upcoming = false,
  platform = "",
  year = "",
  ordering = "-added"
}: GetGamesOptions): Promise<RAWGResponse> {
  try {
    const today = new Date();
    const nextYear = new Date(today);
    nextYear.setFullYear(today.getFullYear() + 1);

    // Configuration de base pour l'API
    const searchParams = new URLSearchParams({
      key: process.env.RAWG_API_KEY!,
      page: page.toString(),
      page_size: pageSize.toString(),
      exclude_additions: "false", // Inclure les DLC
      exclude_parents: "false", // Inclure les jeux parents
    });

    // Ajout des plateformes si spécifié
    if (platform) {
      searchParams.append("platforms", platform);
    } else {
      searchParams.append("platforms", "4,187,1,18,186,7"); // PC, PS4, PS5, Xbox One, Xbox Series, Switch
    }

    if (search) {
      // Si on a une recherche, on utilise les paramètres de recherche
      searchParams.append("search", search);
      searchParams.append("search_precise", "true");
      // Ne pas appliquer le filtre metacritic pour les recherches
      // car cela pourrait exclure des jeux récents
    } else if (!upcoming) {
      // Ajouter metacritic uniquement si on ne cherche pas des jeux à venir
      // et qu'on ne fait pas une recherche spécifique
      // searchParams.append("metacritic", "1,100");
    }

    if (year) {
      const currentYear = new Date().getFullYear();
      const selectedYear = parseInt(year);
      
      if (selectedYear >= currentYear) {
        // Pour l'année en cours et les années futures
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;
        searchParams.append("dates", `${startDate},${endDate}`);
        // Supprimer le filtre metacritic pour les années futures
        searchParams.delete("metacritic");
      } else {
        // Pour les années passées
        console.log("Année passée:", year);
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;
        searchParams.append("dates", `${startDate},${endDate}`);
      }
    }

    if (upcoming) {
      // Jeux à venir : d'aujourd'hui à dans un an
      searchParams.append("dates", `${today.toISOString().split('T')[0]},${nextYear.toISOString().split('T')[0]}`);
      // Supprimer le filtre metacritic pour les jeux à venir
      searchParams.delete("metacritic");
    }

    // Ajout du tri
    searchParams.append("ordering", ordering);

    const url = `https://api.rawg.io/api/games?${searchParams.toString()}`;
    console.log('URL de l\'API:', url);
    
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache pendant 1 heure
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur API:', response.status, errorText);
      throw new Error(`Échec de la récupération des jeux populaires: ${response.status} ${errorText}`);
    }

    const data: RAWGResponse = await response.json();
    console.log('Données reçues:', {
      count: data.count,
      resultsLength: data.results.length,
      page,
      pageSize,
      hasResults: data.results && data.results.length > 0,
      firstGame: data.results[0]?.name,
      upcoming,
      year,
      url
    });

    // Ne garder que les jeux avec une image
    const filteredResults = data.results
      .filter(game => game.background_image);

    return {
      ...data,
      results: filteredResults,
      count: Math.min(data.count, 500), // RAWG limite à 500 résultats maximum
    };
  } catch (error) {
    console.error('Erreur dans getPopularGames:', error);
    throw error;
  }
}

export interface RAWGGameDetails extends RAWGGame {
  description_raw: string;
  website: string;
  developers: Array<{ id: number; name: string }>;
  publishers: Array<{ id: number; name: string }>;
  esrb_rating: { id: number; name: string } | null;
  ratings: Array<{ id: number; title: string; count: number; percent: number }>;
  ratings_count: number;
  screenshots: Array<{ id: number; image: string }>;
  achievements_count: number;
  parent_platforms: Array<{ platform: { id: number; name: string } }>;
  stores: Array<{ store: { id: number; name: string; domain: string } }>;
  playtime: number;
  reddit_url: string;
  reddit_name: string;
  reddit_description: string;
  reddit_count: number;
  twitch_count: number;
  youtube_count: number;
  reviews_count: number;
  suggestions_count: number;
  alternative_names: string[];
  metacritic_url: string;
  parents_count: number;
  additions_count: number;
  game_series_count: number;
  updated: string;
}

export async function getGameDetails(id: number): Promise<RAWGGameDetails> {
  try {
    const url = `https://api.rawg.io/api/games/${id}?key=${process.env.RAWG_API_KEY}`;
    console.log('URL de l\'API pour les détails:', url);

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache pendant 1 heure
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur API:', response.status, errorText);
      throw new Error(`Échec de la récupération des détails du jeu: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur dans getGameDetails:', error);
    throw error;
  }
}

export async function getGameScreenshots(id: number): Promise<{ results: Array<{ id: number; image: string }> }> {
  try {
    const url = `https://api.rawg.io/api/games/${id}/screenshots?key=${process.env.RAWG_API_KEY}`;
    const response = await fetch(url, {
      next: { revalidate: 3600 },
    });
    
    if (!response.ok) {
      throw new Error(`Échec de la récupération des captures d'écran`);
    }

    return response.json();
  } catch (error) {
    console.error('Erreur dans getGameScreenshots:', error);
    throw error;
  }
}

export async function getGameDLC(id: number): Promise<RAWGResponse> {
  try {
    const url = `https://api.rawg.io/api/games/${id}/additions?key=${process.env.RAWG_API_KEY}`;
    const response = await fetch(url, {
      next: { revalidate: 3600 },
    });
    
    if (!response.ok) {
      throw new Error(`Échec de la récupération des DLC`);
    }

    return response.json();
  } catch (error) {
    console.error('Erreur dans getGameDLC:', error);
    throw error;
  }
}

export async function getGameSeries(id: number): Promise<RAWGResponse> {
  try {
    const url = `https://api.rawg.io/api/games/${id}/game-series?key=${process.env.RAWG_API_KEY}`;
    const response = await fetch(url, {
      next: { revalidate: 3600 },
    });
    
    if (!response.ok) {
      throw new Error(`Échec de la récupération de la série de jeux`);
    }

    return response.json();
  } catch (error) {
    console.error('Erreur dans getGameSeries:', error);
    throw error;
  }
} 