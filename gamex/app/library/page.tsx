import { Navbar } from "@/components/molecules/Navbar";
import { Footer } from "@/components/molecules/Footer";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/molecules/GameCard";
import { rawgService } from "@/lib/services/rawg";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { genreTranslations } from "@/config/genres";

interface LibraryProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

const sortOptions = [
  { value: '-added,-rating', label: 'Plus récents' },
  { value: '-rating,-added', label: 'Mieux notés' },
  { value: '-released', label: 'Date de sortie' },
  { value: 'name', label: 'Nom (A-Z)' },
  { value: '-name', label: 'Nom (Z-A)' },
];

export default async function Library({ searchParams }: LibraryProps) {
  // Lecture des paramètres d'URL
  const page = Number(searchParams?.page) || 1;
  const search = typeof searchParams?.search === "string" ? searchParams.search : "";
  const showUpcoming = searchParams?.upcoming === "true";
  const ordering = typeof searchParams?.ordering === "string" ? searchParams.ordering : "-added,-rating";
  const genreId = typeof searchParams?.genre === "string" && searchParams.genre !== "all" ? Number(searchParams.genre) : undefined;

  // Récupération des genres
  const genres = await rawgService.getGenres();

  let response;
  if (search) {
    response = await rawgService.searchGames(search, page, ordering);
  } else if (showUpcoming) {
    response = await rawgService.getFuturGames(0, page, 27, ordering);
  } else if (genreId) {
    response = await rawgService.getGamesByGenre(genreId, page);
  } else {
    response = await rawgService.getPopularGames(page, ordering);
  }
  const games = response.results;
  const totalPages = Math.ceil(response.count / 20);

  // Génère l'URL avec les bons paramètres
  const makeUrl = (params: Record<string, any>) => {
    const url = new URLSearchParams({
      ...(search ? { search } : {}),
      ...(showUpcoming ? { upcoming: "true" } : {}),
      ...(ordering !== "-added,-rating" ? { ordering } : {}),
      ...(genreId ? { genre: genreId.toString() } : { genre: "all" }),
      ...params,
    });
    return `?${url.toString()}`;
  };

  return (
    <div className="flex flex-col min-h-screen w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <form className="flex flex-col md:flex-row md:items-end gap-4 mb-6" action="" method="get">
          <input
            type="text"
            name="search"
            placeholder="Rechercher un jeu..."
            defaultValue={search}
            className="border rounded-md px-3 py-2 w-full md:w-1/3"
          />
          <Select name="genre" defaultValue={genreId ? genreId.toString() : "all"}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les genres</SelectItem>
              {genres.results.map((genre) => (
                <SelectItem key={genre.id} value={genre.id.toString()}>
                  {genreTranslations[genre.name] || genre.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select name="ordering" defaultValue={ordering}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="submit"
            variant="default"
          >
            Rechercher
          </Button>
          <Button
            type="submit"
            name="upcoming"
            value={showUpcoming ? "" : "true"}
            variant={showUpcoming ? "secondary" : "default"}
          >
            {showUpcoming ? "Voir les jeux sortis" : "Voir les jeux à venir"}
          </Button>
        </form>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-4">
          {games.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground">Aucun jeu trouvé.</div>
          ) : (
            games.map(game => <GameCard key={game.id} game={game} />)
          )}
        </div>
        <div className="flex items-center gap-2 justify-center">
          <Button variant="outline" asChild disabled={page === 1}>
            <a href={makeUrl({ page: page - 1 })}>Précédent</a>
          </Button>
          <span>Page {page} / {totalPages || 1}</span>
          <Button variant="outline" asChild disabled={page === totalPages || totalPages === 0}>
            <a href={makeUrl({ page: page + 1 })}>Suivant</a>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
 
