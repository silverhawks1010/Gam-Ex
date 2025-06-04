import { Game, Genre, Platform, SearchResponse } from "@/types/game";
import { igdbService } from "./igdb";

class GameService {
  async searchGames(
    query: string,
    page: number = 1,
    ordering?: string,
    game_status?: number | string,
    genreIds?: number[],
    platformIds?: number[],
    yearMin?: number,
    yearMax?: number,
    ratingMin?: number
  ): Promise<SearchResponse> {
    return igdbService.searchGames(query, page, ordering, game_status, genreIds, platformIds, yearMin, yearMax, ratingMin);
  }

  async getGameDetails(id: number): Promise<Game> {
    return igdbService.getGameDetails(id);
  }

  async getDLCs(gameId: number): Promise<SearchResponse> {
    return igdbService.getDLCs(gameId);
  }

  async getFranchiseGames(gameId: number): Promise<SearchResponse> {
    return igdbService.getFranchiseGames(gameId);
  }

  async getGenres(): Promise<Genre[]> {
    return igdbService.getGenres();
  }

  async getPlatforms(): Promise<Platform[]> {
    return igdbService.getPlatforms();
  }

  async getUpcomingGames(): Promise<Game[]> {
    return igdbService.getUpcomingGames();
  }

  async getRecentGames(): Promise<Game[]> {
    return igdbService.getRecentGames();
  }
}

export const gameService = new GameService(); 