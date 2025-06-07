import { Game, Genre, Platform, Screenshot, SearchResponse, IGDBImage, GameSummary, Company, ReleaseDate, Website, IGDBAgeRatingDetails, PlayerPerspective, GameMode, Theme, Collection, IGDBGameEngine, IGDBGameLocalization, IGDBFranchiseInfo } from "@/types/game";

interface IGDBGame {
  id: number;
  name: string;
  slug: string;
  summary: string;
  description: string;
  rating: number;
  rating_count: number;
  aggregated_rating: number;
  aggregated_rating_count: number;
  release_dates: {
    id: number;
    date: number;
    platform: {
      id: number;
      name: string;
    };
  }[];
  genres: {
    id: number;
    name: string;
  }[];
  platforms: {
    id: number;
    name: string;
  }[];
  screenshots: {
    id: number;
    url: string;
  }[];
  cover: {
    id: number;
    url: string;
  };
  websites: {
    id: number;
    url: string;
    category: number;
  }[];
  similar_games: number[];
  dlcs: number[];
  expansions: number[];
  standalone_expansions: number[];
  franchise: {
    id: number;
    name: string;
  };
  developers: {
    id: number;
    name: string;
  }[];
  publishers: {
    id: number;
    name: string;
  }[];
  tags: {
    id: number;
    name: string;
  }[];
  stores: {
    id: number;
    url: string;
    store: {
      id: number;
      name: string;
      domain: string;
    };
  }[];
  age_ratings: any[];
  alternative_names: any[];
  category: number;
  game_localizations: any[];
  game_modes: any[];
  ratings: number[];
  involved_companies: any[];
  language_supports: any[];
  videos: any[];
  version_title: string;
  version_parent: number;
}

// Helper function to get full image URL and resize
const getFullImageUrl = (url?: string, size: 'cover_small' | 'screenshot_med' | 'cover_big' | 'logo_med' | 'screenshot_big' | 'screenshot_huge' | 'thumb' | 'micro' | '720p' | '1080p' = 'thumb'): string | undefined => {
  if (!url) return undefined;
  let newUrl = url;
  if (newUrl.startsWith('//')) {
    newUrl = 'https:' + newUrl;
  }
  // Replace t_thumb (or other t_size) with the new size
  newUrl = newUrl.replace(/\/t_\w+/, `/t_${size}`);
  return newUrl;
};

// Helper function to map API image data to IGDBImage or a simpler object
const mapToIGDBImage = (apiImage: any, defaultSize: 'cover_small' | 'screenshot_med' | 'cover_big' | 'logo_med' | 'screenshot_big' | 'screenshot_huge' | 'thumb' | 'micro' | '720p' | '1080p' = 'thumb'): IGDBImage | { id: number; url: string } | undefined => {
  if (!apiImage) return undefined;

  const url = getFullImageUrl(apiImage.url, defaultSize);
  if (!url) return undefined; // If URL can't be formed, return undefined

  return {
    id: apiImage.id,
    image_id: apiImage.image_id || apiImage.checksum, // Use image_id if available, fallback to checksum
    url: url,
    width: apiImage.width || 0,
    height: apiImage.height || 0,
    animated: apiImage.animated || false,
    alpha_channel: apiImage.alpha_channel || false,
    checksum: apiImage.checksum,
  };
};

// Helper to map minimal data to GameSummary, useful for related games
const mapToGameSummary = (apiGame: any): GameSummary | undefined => {
  if (!apiGame || typeof apiGame !== 'object') return undefined;
  return {
    id: apiGame.id,
    name: apiGame.name || 'N/A',
    slug: apiGame.slug,
    cover: apiGame.cover ? mapToIGDBImage(apiGame.cover, 'cover_big') : undefined,
    category: apiGame.category,
    first_release_date: apiGame.first_release_date,
    summary: apiGame.summary,
  };
};

class IGDBService {
  private readonly baseUrl = "https://api.igdb.com/v4";
  private readonly clientId = process.env.IGDB_CLIENT_ID;
  private readonly clientSecret = process.env.IGDB_CLIENT_SECRET;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  private async getAccessToken() {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const response = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: "client_credentials",
      }),
    });

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000);
    return this.accessToken;
  }

  private async fetchIGDB(endpoint: string, query: string) {
    const token = await this.getAccessToken();
    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      method: "POST",
      headers: {
        "Client-ID": this.clientId!,
        "Authorization": `Bearer ${token}`,
        "Content-Type": "text/plain", // Changed to text/plain as per IGDB recommendation for query body
      },
      body: query,
    });

    if (!response.ok) {
      const errorBody = await response.text(); // Try to get more error details
      console.error("IGDB API Error:", response.status, response.statusText, errorBody);
      throw new Error(`IGDB API error: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    return response.json();
  }

  private mapIGDBGameToGame(igdbGame: any): Game {
    const gameData = typeof igdbGame === 'object' && igdbGame !== null ? igdbGame : {};

    const mainCover = gameData.cover ? mapToIGDBImage(gameData.cover, 'cover_big') : undefined;
    
    // Logique améliorée pour background_image
    let backgroundImage = undefined;
    if (gameData.screenshots && gameData.screenshots.length > 0) {
        // Préférer un screenshot en haute résolution si disponible
        backgroundImage = getFullImageUrl(gameData.screenshots[0].url, 'screenshot_huge'); 
    } else if (mainCover?.url) {
        // Sinon, utiliser la jaquette (mainCover.url est déjà en cover_big, on peut la vouloir plus grande)
        // Si mainCover.url vient de mapToIGDBImage, elle est déjà formatée avec https:
        backgroundImage = mainCover.url.replace(/\/t_\w+/, '/t_screenshot_huge/');
    }

    const developers = gameData.involved_companies?.filter((ic: any) => ic.developer && ic.company).map((ic: any) => ({
      id: ic.company.id,
      name: ic.company.name,
      slug: ic.company.slug,
      logo: ic.company.logo ? mapToIGDBImage(ic.company.logo, 'logo_med') : undefined,
      description: ic.company.description,
      start_date: ic.company.start_date,
    })) || [];

    const publishers = gameData.involved_companies?.filter((ic: any) => ic.publisher && ic.company).map((ic: any) => ({
      id: ic.company.id,
      name: ic.company.name,
      slug: ic.company.slug,
      logo: ic.company.logo ? mapToIGDBImage(ic.company.logo, 'logo_med') : undefined,
      description: ic.company.description,
      start_date: ic.company.start_date,
    })) || [];
    
    return {
      id: gameData.id,
      name: gameData.name || 'Unknown Game',
      slug: gameData.slug || `game-${gameData.id}`,
      summary: gameData.summary || undefined,
      storyline: gameData.storyline || undefined,
      status: gameData.status ?? gameData.game_status,
      first_release_date: gameData.first_release_date || undefined,
      created_at: gameData.created_at || undefined,
      updated_at: gameData.updated_at || undefined,
      url: gameData.url || undefined,

      release_dates: gameData.release_dates?.map((rd: any) => ({
        id: rd.id,
        date: rd.date,
        platform: rd.platform ? { 
          id: rd.platform.id, 
          name: rd.platform.name, 
          slug: rd.platform.slug,
          abbreviation: rd.platform.abbreviation,
          image: null,
          year_end: null,
          year_start: null,
          games_count: 0,
          image_background: null,
        } : undefined,
        region: rd.region,
        human: rd.human,
        category: rd.category,
        checksum: rd.checksum,
      })) || [],

      genres: gameData.genres?.map((g: any) => ({ 
        id: g.id, 
        name: g.name, 
        slug: g.slug,
        games_count: g.games_count || 0,
        image_background: g.image_background || null,
        url: g.url,
      })) || [],
      
      platforms: gameData.platforms?.map((p_container: any) => {
          const p = p_container.platform || p_container;
          return {
            platform: {
                id: p.id,
                name: p.name,
                slug: p.slug,
                abbreviation: p.abbreviation,
                alternative_name: p.alternative_name,
                platform_logo: p.platform_logo ? mapToIGDBImage(p.platform_logo, 'logo_med') : undefined,
                image: null, 
                year_end: p.year_end || null,
                year_start: p.year_start || null,
                games_count: p.games_count || 0,
                image_background: p.image_background || null,
            },
            requirements: p_container.requirements || undefined,
          };
      }) || [],
      
      cover: mainCover,
      artworks: gameData.artworks?.map((art: any) => mapToIGDBImage(art, 'screenshot_huge'))?.filter((img: IGDBImage | { id: number; url: string } | undefined) => img !== undefined) as IGDBImage[] || [],
      screenshots: gameData.screenshots?.map((ss: any) => mapToIGDBImage(ss, 'screenshot_big'))?.filter((img: IGDBImage | { id: number; url: string } | undefined) => img !== undefined) as IGDBImage[] || [],
      background_image: backgroundImage,
      
      rating: gameData.rating || undefined,
      rating_top: gameData.rating_top || 100,
      ratings_count: gameData.total_rating_count ?? gameData.rating_count ?? 0,
      aggregated_rating: gameData.aggregated_rating || undefined,
      aggregated_rating_count: gameData.aggregated_rating_count || 0,
      hypes: gameData.hypes || undefined,
      follows: gameData.follows || undefined,
      
      involved_companies: gameData.involved_companies?.map((ic: any) => ({
        id: ic.id,
        company: {
          id: ic.company?.id,
          name: ic.company?.name || 'N/A',
          slug: ic.company?.slug,
          logo: ic.company?.logo ? mapToIGDBImage(ic.company.logo, 'logo_med') : undefined,
          description: ic.company?.description,
          start_date: ic.company?.start_date,
        },
        developer: ic.developer || false,
        publisher: ic.publisher || false,
        porting: ic.porting || false,
        supporting: ic.supporting || false,
      })) || [],

      developers: developers,
      publishers: publishers,
      
      game_engines: gameData.game_engines?.map((ge: any) => ({
        id: ge.id,
        name: ge.name,
        description: ge.description,
        logo: ge.logo ? mapToIGDBImage(ge.logo, 'logo_med') : undefined,
        url: ge.url,
        companies: ge.companies?.map((c:any) => ({
            id: c.id,
            name: c.name,
        })) || []
      })) || [],

      tags: gameData.tags?.map((t: any) => (typeof t === 'number' || typeof t === 'string' ? String(t) : t.name)).filter(Boolean) || [],
      keywords: gameData.keywords?.map((k: any) => (typeof k === 'object' ? k.id : k)) || [],

      stores: gameData.stores?.map((s: any) => ({
        id: s.id,
        url: s.url,
        store: { 
            id: s.store?.id, 
            name: s.store?.name, 
            domain: s.store?.domain 
        },
      })) || [],

      website: gameData.websites?.find((w: any) => w.category === 1)?.url || gameData.url || undefined,
      websites: gameData.websites?.map((w: any) => ({
        id: w.id,
        url: w.url,
        category: w.category,
        trusted: w.trusted,
        checksum: w.checksum,
      })) || [],

      metacritic: gameData.metacritic || null,
      metacritic_url: gameData.metacritic_url || null,

      dlcs: gameData.dlcs?.map(mapToGameSummary).filter(Boolean) as GameSummary[] || [],
      expansions: gameData.expansions?.map(mapToGameSummary).filter(Boolean) as GameSummary[] || [],
      bundles: gameData.bundles?.map(mapToGameSummary).filter(Boolean) as GameSummary[] || [],
      additions: gameData.additions?.map(mapToGameSummary).filter(Boolean) as GameSummary[] || [],
      similar_games: gameData.similar_games?.map(mapToGameSummary).filter(Boolean) as GameSummary[] || [],
      
      parent_game: gameData.parent_game ? mapToGameSummary(gameData.parent_game) : undefined,
      version_parent: gameData.version_parent ? mapToGameSummary(gameData.version_parent) : undefined,
      version_title: gameData.version_title || undefined,

      franchises: gameData.franchises?.map((f: any) => ({
        id: f.id,
        name: f.name,
        slug: f.slug,
        url: f.url,
        games: f.games || [],
      })) || [],
      collection: gameData.collection ? {
        id: gameData.collection.id,
        name: gameData.collection.name,
        slug: gameData.collection.slug,
        url: gameData.collection.url,
        games: gameData.collection.games || [],
      } : undefined,
      
      age_ratings: gameData.age_ratings?.map((ar: any) => ({
        id: ar.id,
        category: ar.category,
        rating: ar.rating,
        synopsis: ar.synopsis,
        content_description_ids: ar.content_descriptions?.map((cd: any) => (typeof cd === 'object' ? cd.id : cd)) || [],
        checksum: ar.checksum,
      })) || [],
      
      player_perspectives: gameData.player_perspectives?.map((pp: any) => ({ id: pp.id, name: pp.name, slug: pp.slug, url: pp.url })) || [],
      game_modes: gameData.game_modes?.map((gm: any) => ({ id: gm.id, name: gm.name, slug: gm.slug, url: gm.url })) || [],
      themes: gameData.themes?.map((t: any) => ({ id: t.id, name: t.name, slug: t.slug, url: t.url })) || [],
      
      category: gameData.category,
      
      language_supports: gameData.language_supports?.map((ls: any) => ({
        id: ls.id,
        language: ls.language ? { 
            id: ls.language.id, 
            name: ls.language.name,
            native_name: ls.language.native_name,
            locale: ls.language.locale,
        } : undefined,
        language_support_type: ls.language_support_type ? {
            id: ls.language_support_type.id,
            name: ls.language_support_type.name,
        } : undefined,
      })) || [],
      
      alternative_names: gameData.alternative_names?.map((an: any) => ({ 
        id: an.id, 
        name: an.name, 
        comment: an.comment 
      })) || [],
      
      game_localizations: gameData.game_localizations?.map((gl: any) => ({
        id: gl.id,
        name: gl.name,
        cover: gl.cover ? mapToIGDBImage(gl.cover, 'cover_small') : undefined,
        region: gl.region,
        created_at: gl.created_at,
        updated_at: gl.updated_at,
        checksum: gl.checksum,
      })) || [],
      
      videos: gameData.videos?.map((v: any) => ({ 
        id: v.id, 
        name: v.name, 
        video_id: v.video_id,
        checksum: v.checksum,
      })) || [],

      external_games: gameData.external_games?.map((eg: any) => (typeof eg === 'object' ? eg.id : eg)) || [],
    };
  }

  async searchGames(
    query: string,
    page: number = 1,
    ordering?: string,
    game_status?: number | string,
    genreIds?: number[],
    platformIds?: number[],
    yearMin?: number,
    yearMax?: number,
    ratingMin?: number,
    upcoming?: boolean
  ): Promise<SearchResponse> {
    const limit = 20;
    const offset = (page - 1) * limit;
    let whereClauses = [
      'version_parent = null'
    ];
    if (query) {
      whereClauses.push(`name ~ *\"${query}\"*`);
    }

    
    if (upcoming) {
      const now = Math.floor(Date.now() / 1000);
      whereClauses.push(`release_dates[0].date > ${now}`);
      whereClauses.push('(game_status = 7 | game_status = null)');
    } else if (typeof game_status !== 'undefined') {
      if (game_status === '!3') {
        whereClauses.push('game_status != 3');
      } else {
        whereClauses.push(`game_status = ${game_status}`);
      }
    }
    if (genreIds && genreIds.length > 0) {
      whereClauses.push(`genres = [${genreIds.join(',')}]`);
    }
    if (platformIds && platformIds.length > 0) {
      whereClauses.push(`platforms = [${platformIds.join(',')}]`);
    }
    if (yearMin) {
      whereClauses.push(`first_release_date >= ${Date.UTC(yearMin, 0, 1) / 1000}`);
    }
    if (yearMax) {
      whereClauses.push(`first_release_date <= ${Date.UTC(yearMax, 11, 31, 23, 59, 59) / 1000}`);
    }
    if (ratingMin) {
      whereClauses.push(`rating >= ${ratingMin}`);
    }
    const where = whereClauses.length ? `where ${whereClauses.join(' & ')};` : '';
    let sort = '';
    if (ordering) {
      if (ordering.startsWith('-')) {
        sort = `sort ${ordering.slice(1)} desc;`;
      } else {
        sort = `sort ${ordering} asc;`;
      }
    }
    const searchQuery = `
      fields id, name, slug, summary, storyline, game_status, first_release_date, release_dates.date, release_dates.platform.name, genres.name, platforms.name, cover.url, rating, rating_count, aggregated_rating, aggregated_rating_count, hypes, follows, screenshots.url, websites.url, websites.category, game_modes.name, themes.name;
      ${where}
      ${sort}
      limit ${limit};
      offset ${offset};
      count;
    `;
    const results = await this.fetchIGDB("games", searchQuery);
    // Count query
    const countQuery = `
      ${where}
      count;
    `;
    const countResult = await this.fetchIGDB("games/count", countQuery);
    const totalCount = countResult.count ?? 0;
    return {
      count: totalCount,
      next: offset + limit < totalCount ? page + 1 : null,
      previous: page > 1 ? page - 1 : null,
      results: results.map(this.mapIGDBGameToGame),
    };
  }

  async getGameCover(id: number): Promise<string> {
    const query = `fields cover.url; where id = ${id}; limit 1;`;
    const results = await this.fetchIGDB("games", query);
    return results[0].cover.url;
  }

  async getGameDetails(id: number): Promise<Game> {
    const fields = [
      "*", "age_ratings.*", "alternative_names.*", "artworks.*", "bundles.*", "expansions.*", "franchises.*", "game_engines.*", "game_localizations.*", "language_supports.*", "game_modes.*", "genres.*", "involved_companies.*", "platforms.*", "player_perspectives.*", "release_dates.*", "screenshots.*", "similar_games.*", "themes.*", "videos.*", "websites.*", "involved_companies.company.*", "language_supports.language.*", "language_supports.language_support_type.*", "expansions.cover.url", "dlcs.cover.url", "dlcs.name", "dlcs.slug", "dlcs.rating", "dlcs.rating_count", "dlcs.genres.name", "dlcs.platforms.name", "dlcs.release_dates.date", "expansions.cover.url", "expansions.name", "expansions.slug", "expansions.rating", "expansions.rating_count", "expansions.genres.name", "expansions.platforms.name", "similar_games.name", "similar_games.slug", "similar_games.rating", "similar_games.rating_count", "similar_games.genres.name", "similar_games.platforms.name", "similar_games.cover.url", "cover.url"
      , "involved_companies.company.developed.*", "bundles.cover.url"
    ];
    const query = `fields ${fields.join(',')}; where id = ${id}; limit 1;`; // Added limit 1 for safety

    const results = await this.fetchIGDB("games", query);
    if (!results.length) {
      throw new Error('Game not found');
    }
    return this.mapIGDBGameToGame(results[0]);
  }

  async getDLCs(gameId: number): Promise<SearchResponse> {
    const query = `
      fields name,slug,cover.url,rating,rating_count,genres.name,platforms.name,release_dates.date;
      where id = (${gameId}) & dlcs != null;
      limit 20;
    `;

    const results = await this.fetchIGDB("games", query);
    const countQuery = `
      where id = (${gameId}) & dlcs != null;
      count;
    `;
    const countResult = await this.fetchIGDB("games/count", countQuery);

    return {
      count: countResult,
      next: null,
      previous: null,
      results: results.map(this.mapIGDBGameToGame),
    };
  }

  async getFranchiseGames(gameId: number): Promise<SearchResponse> {
    const query = `
      fields name,slug,cover.url,rating,rating_count,genres.name,platforms.name,release_dates.date;
      where franchise = (${gameId});
      limit 20;
    `;

    const results = await this.fetchIGDB("games", query);
    const countQuery = `
      where franchise = (${gameId});
      count;
    `;
    const countResult = await this.fetchIGDB("games/count", countQuery);

    return {
      count: countResult,
      next: null,
      previous: null,
      results: results.map(this.mapIGDBGameToGame),
    };
  }

  async getGenres(): Promise<Genre[]> {
    const query = `
      fields name,slug;
      limit 50;
    `;

    const results = await this.fetchIGDB("genres", query);
    return results.map((genre: any) => ({
      id: genre.id,
      name: genre.name,
      slug: genre.slug,
      games_count: 0,
      image_background: null,
    }));
  }

  async getPlatforms(): Promise<Platform[]> {
    const query = `
      fields name,slug;
      limit 50;
    `;

    const results = await this.fetchIGDB("platforms", query);
    return results.map((platform: any) => ({
      id: platform.id,
      name: platform.name,
      slug: platform.slug,
      year_end: null,
      year_start: null,
      games_count: 0,
      image_background: null,
    }));
  }

  async getUpcomingGames(): Promise<Game[]> {
    const now = Math.floor(Date.now() / 1000);
    const query = `
      fields name, slug, cover.url, first_release_date, hypes;
      where version_parent = null
        & status = 3
        & first_release_date > ${Math.floor(Date.now() / 1000)};
      sort hypes desc;
      limit 5;
    `;
  
  

    const results = await this.fetchIGDB("games", query);
    return results.map(this.mapIGDBGameToGame);
  }
  
  async getRecentGames(): Promise<Game[]> {
    const now = Math.floor(Date.now() / 1000);
    const threeMonthsAgo = now - (90 * 24 * 60 * 60);
    const query = `
      fields name, slug, status, cover.url, first_release_date, genres.name, platforms.name, hypes;
      where version_parent = null
        & first_release_date != null
        & first_release_date >= ${threeMonthsAgo}
        & first_release_date <= ${now};
      sort hypes desc;
      limit 20;
    `;

    const results = await this.fetchIGDB("games", query);
    return results.map(this.mapIGDBGameToGame);
  }
}

export const igdbService = new IGDBService(); 