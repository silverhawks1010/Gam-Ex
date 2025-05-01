"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GameCard } from "./game-card";
import { SearchBar } from "./search-bar";
import { PaginationControls } from "./pagination-controls";
import { Filters } from "./filters";
import type { RAWGResponse } from "@/lib/rawg";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface GamesListProps {
  initialGames: RAWGResponse;
  pageSize: number;
}

export function GamesList({ initialGames, pageSize }: GamesListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const totalPages = Math.ceil(initialGames.count / pageSize);
  const [isLoading, setIsLoading] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);

  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("search", query);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`/games?${params.toString()}`);
  };

  const handlePlatformChange = (platform: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (platform) {
      params.set("platform", platform);
    } else {
      params.delete("platform");
    }
    params.set("page", "1");
    router.push(`/games?${params.toString()}`);
  };

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("ordering", sort);
    params.set("page", "1");
    router.push(`/games?${params.toString()}`);
  };

  const handleYearChange = (year: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (year) {
      params.set("year", year);
      params.delete("upcoming");
      setShowComingSoon(false);
    } else {
      params.delete("year");
    }
    params.set("page", "1");
    router.push(`/games?${params.toString()}`);
  };

  const handleComingSoonToggle = (checked: boolean) => {
    setShowComingSoon(checked);
    const params = new URLSearchParams(searchParams.toString());
    if (checked) {
      params.set("upcoming", "true");
      params.delete("year"); // Supprimer le filtre par année si on active les jeux à venir
    } else {
      params.delete("upcoming");
    }
    params.set("page", "1");
    router.push(`/games?${params.toString()}`);
  };

  const handlePageSizeChange = (size: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("pageSize", size.toString());
    params.set("page", "1");
    router.push(`/games?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || isLoading) return;
    setIsLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/games?${params.toString()}`);
  };

  // Réinitialiser l'état de chargement quand les données changent
  useEffect(() => {
    setIsLoading(false);
  }, [initialGames]);

  // Synchroniser l'état du toggle avec l'URL au chargement
  useEffect(() => {
    setShowComingSoon(searchParams.get("upcoming") === "true");
  }, [searchParams]);

  if (initialGames.results.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <div className="w-full max-w-sm">
            <SearchBar onSearch={handleSearch} />
          </div>
          <Filters
            onPlatformChange={handlePlatformChange}
            onSortChange={handleSortChange}
            onYearChange={handleYearChange}
            selectedPlatform={searchParams.get("platform") || ""}
            selectedSort={searchParams.get("ordering") || ""}
            selectedYear={searchParams.get("year") || ""}
          />
          <div className="flex items-center gap-8">
            <div className="flex items-center space-x-2">
              <Switch
                id="coming-soon"
                checked={showComingSoon}
                onCheckedChange={handleComingSoonToggle}
                disabled={!!searchParams.get("year")}
              />
              <Label htmlFor="coming-soon">Afficher les jeux à venir</Label>
            </div>
            <PaginationControls 
              pageSize={pageSize} 
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        </div>

        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucun jeu trouvé</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="w-full max-w-sm">
          <SearchBar onSearch={handleSearch} />
        </div>
        <Filters
          onPlatformChange={handlePlatformChange}
          onSortChange={handleSortChange}
          onYearChange={handleYearChange}
          selectedPlatform={searchParams.get("platform") || ""}
          selectedSort={searchParams.get("ordering") || ""}
          selectedYear={searchParams.get("year") || ""}
        />
        <div className="flex items-center gap-8">
          <div className="flex items-center space-x-2">
            <Switch
              id="coming-soon"
              checked={showComingSoon}
              onCheckedChange={handleComingSoonToggle}
              disabled={!!searchParams.get("year")}
            />
            <Label htmlFor="coming-soon">Afficher les jeux à venir</Label>
          </div>
          <PaginationControls 
            pageSize={pageSize} 
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {initialGames.results.map((game) => (
          <GameCard
            key={game.id}
            id={game.id}
            name={game.name}
            coverUrl={game.background_image}
            rating={game.metacritic}
            releaseDate={game.released}
            genres={game.genres}
            platforms={game.platforms}
          />
        ))}
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="text-sm text-muted-foreground">
          Page {currentPage} sur {totalPages} ({initialGames.count} jeux)
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || isLoading}
          >
            Suivant
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
} 