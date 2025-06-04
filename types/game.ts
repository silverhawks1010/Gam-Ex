export interface Platform {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  year_end: number | null;
  year_start: number | null;
  games_count: number;
  image_background: string | null;
  abbreviation?: string;
  alternative_name?: string;
  platform_logo?: IGDBImage | { id: number; url: string };
}

export interface Genre {
  id: number;
  name: string;
  slug: string;
  games_count: number;
  image_background: string | null;
  url?: string;
}

export interface Screenshot {
  id: number;
  image: string;
}

export interface ReleaseDate {
  id: number;
  date: number;
  platform?: { id: number; name: string; slug?: string; abbreviation?: string };
  region?: number;
  human?: string;
  category?: number;
  checksum?: string;
}

export interface Website {
  id: number;
  url: string;
  type: number;
  trusted?: boolean;
  checksum?: string;
}

export interface Company {
  id: number;
  name: string;
  description?: string;
  slug?: string;
  logo?: IGDBImage | { id: number; url: string };
  start_date?: number;
  developed?: GameSummary[];
  published?: GameSummary[];
}

export interface AgeRating {
  id: number;
  category: number;
  rating: number;
}

export interface PlayerPerspective {
  id: number;
  name: string;
  slug?: string;
  url?: string;
}

export interface GameMode {
  id: number;
  name: string;
  slug?: string;
  url?: string;
}

export interface Theme {
  id: number;
  name: string;
  slug?: string;
  url?: string;
}

export interface Collection {
  id: number;
  name: string;
  slug?: string;
  url?: string;
  games?: number[];
}

export interface Game {
  id: number;
  name: string;
  slug: string;
  summary?: string;
  storyline?: string;
  status?: number;
  first_release_date?: number;
  created_at?: number;
  updated_at?: number;
  url?: string;
  release_dates?: ReleaseDate[];
  genres?: Genre[];
  platforms?: { platform: Platform; requirements?: any }[];
  cover?: IGDBImage | { id: number; url: string };
  artworks?: IGDBImage[];
  screenshots?: IGDBImage[];
  background_image?: string | null;
  rating?: number;
  rating_top?: number;
  ratings_count?: number;
  aggregated_rating?: number;
  aggregated_rating_count?: number;
  hypes?: number;
  follows?: number;
  involved_companies?: {
    id: number;
    company: Company;
    developer: boolean;
    publisher: boolean;
    porting?: boolean;
    supporting?: boolean;
  }[];
  developers?: Company[];
  publishers?: Company[];
  game_engines?: IGDBGameEngine[];
  tags?: string[];
  keywords?: number[];
  stores?: { id: number; url: string; store: { id: number; name: string; domain: string } }[];
  website?: string | null;
  websites?: Website[];
  metacritic?: number | null;
  metacritic_url?: string | null;
  dlcs?: GameSummary[];
  expansions?: GameSummary[];
  bundles?: GameSummary[];
  additions?: GameSummary[];
  similar_games?: GameSummary[];
  parent_game?: GameSummary;
  version_parent?: GameSummary;
  franchises?: IGDBFranchiseInfo[];
  collection?: Collection;
  age_ratings?: IGDBAgeRatingDetails[];
  player_perspectives?: PlayerPerspective[];
  game_modes?: GameMode[];
  themes?: Theme[];
  category?: number;
  language_supports?: {
    id: number;
    language?: { id: number; name: string; native_name?: string; locale?: string };
    language_support_type?: { id: number; name: string };
  }[];
  alternative_names?: { id: number; name: string; comment?: string }[];
  game_localizations?: IGDBGameLocalization[];
  videos?: Video[];
  version_title?: string;
  external_games?: number[];
}

export interface SearchResponse {
  count: number;
  next: number | null;
  previous: number | null;
  results: Game[];
}

export interface IGDBImage {
  id: number;
  alpha_channel?: boolean;
  animated?: boolean;
  image_id: string;
  url: string;
  height: number;
  width: number;
  checksum?: string;
}

export interface IGDBAgeRatingDetails extends AgeRating {
  synopsis?: string;
  content_description_ids?: number[];
  checksum?: string;
}

export interface IGDBGameEngine {
  id: number;
  name: string;
  description?: string;
  logo?: IGDBImage | { id: number; url: string };
  url?: string;
  companies?: Company[];
}

export interface IGDBGameLocalization {
  id: number;
  name: string;
  cover?: IGDBImage | { id: number; url: string };
  region?: number;
  created_at?: number;
  updated_at?: number;
  checksum?: string;
}

export interface Video {
  id: number;
  name?: string;
  video_id: string;
  checksum?: string;
}

export interface GameSummary {
  id: number;
  name: string;
  slug?: string;
  cover?: IGDBImage | { id: number; url: string };
  category?: number;
  first_release_date?: number;
  summary?: string;
}

export interface IGDBFranchiseInfo {
  id: number;
  name: string;
  slug?: string;
  url?: string;
  games?: number[];
} 