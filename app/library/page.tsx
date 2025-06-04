import { Navbar } from "@/components/molecules/Navbar";
import { Footer } from "@/components/molecules/Footer";
import { GameCard } from "@/components/molecules/GameCard";
import { gameService } from "@/lib/services/gameService";
import { Suspense } from "react";
import { Genre, Platform, Game } from "@/types/game";
import { genreTranslations } from "@/config/genres";

interface LibraryProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    genres?: string;
    platforms?: string;
    status?: string;
    yearMin?: string;
    yearMax?: string;
    ratingMin?: string;
    modes?: string;
    themes?: string;
    ordering?: string;
  }>;
}

function GamesLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-4">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="flex flex-col space-y-3">
          <div className="h-[200px] w-full rounded-lg bg-muted animate-pulse" />
          <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
          <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
        </div>
      ))}
    </div>
  );
}

// SidebarFilters composant avancé
function SidebarFilters({ genres, platforms, params }: { genres: Genre[]; platforms: Platform[]; params: any }) {
  // Gestion robuste des genres sélectionnés
  let selectedGenres: string[] = [];
  if (Array.isArray(params.genres)) {
    selectedGenres = params.genres;
  } else if (typeof params.genres === "string") {
    selectedGenres = params.genres.split(",");
  }
  // Gestion robuste des plateformes sélectionnées
  let selectedPlatforms: string[] = [];
  if (Array.isArray(params.platforms)) {
    selectedPlatforms = params.platforms;
  } else if (typeof params.platforms === "string") {
    selectedPlatforms = params.platforms.split(",");
  }
  return (
    <aside className="w-full md:w-64 bg-muted/50 rounded-xl p-4 mb-6 md:mb-0 md:mr-8">
      <form method="get" className="flex flex-col gap-4">
        <input
          type="text"
          name="search"
          placeholder="Rechercher par nom..."
          defaultValue={params.search || ''}
          className="border rounded-md px-3 py-2 w-full"
        />
        <div>
          <div className="font-semibold mb-2">Genres</div>
          <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
            {genres.map((genre) => (
              <label key={genre.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="genres"
                  value={genre.id}
                  defaultChecked={selectedGenres.includes(genre.id.toString())}
                />
                {genreTranslations[genre.name] || genre.name}
              </label>
            ))}
          </div>
        </div>
        <div>
          <div className="font-semibold mb-2">Plateformes</div>
          <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
            {platforms.map((platform) => (
              <label key={platform.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="platforms"
                  value={platform.id}
                  defaultChecked={selectedPlatforms.includes(platform.id.toString())}
                />
                {platform.name}
              </label>
            ))}
          </div>
        </div>
        <div>
          <div className="font-semibold mb-2">Statut</div>
          <select name="status" defaultValue={params.status || ''} className="border rounded-md px-2 py-1 w-full">
            <option value="">Tous</option>
            <option value="0">Sorti</option>
            <option value="1">À venir</option>
            <option value="2">Alpha</option>
            <option value="3">Beta</option>
            <option value="4">Early Access</option>
          </select>
        </div>
        <div>
          <div className="font-semibold mb-2">Année de sortie</div>
          <div className="flex gap-2">
            <input type="number" name="yearMin" placeholder="Min" className="border rounded-md px-2 py-1 w-1/2" defaultValue={params.yearMin || ''} />
            <input type="number" name="yearMax" placeholder="Max" className="border rounded-md px-2 py-1 w-1/2" defaultValue={params.yearMax || ''} />
          </div>
        </div>
        <div>
          <div className="font-semibold mb-2">Note minimale</div>
          <input type="number" name="ratingMin" min={0} max={100} step={1} className="border rounded-md px-2 py-1 w-full" defaultValue={params.ratingMin || ''} />
        </div>
        <div>
          <div className="font-semibold mb-2">Tri</div>
          <select name="ordering" defaultValue={params.ordering || '-hypes'} className="border rounded-md px-2 py-1 w-full">
            <option value="-hypes">Populaires</option>
            <option value="-first_release_date">Date de sortie</option>
            <option value="-rating">Mieux notés</option>
            <option value="name">Nom (A-Z)</option>
            <option value="-name">Nom (Z-A)</option>
          </select>
        </div>
        <button type="submit" className="bg-primary text-white rounded px-4 py-2 mt-2">Appliquer</button>
      </form>
    </aside>
  );
}

async function GamesContent({ params, page }: { params: any; page: number }) {
  // Prépare les filtres pour l'API IGDB
  const search = params.search || '';
  const ordering = params.ordering || '-hypes';
  const status = params.status ? Number(params.status) : undefined;
  let genreIds: number[] = [];
  if (Array.isArray(params.genres)) {
    genreIds = params.genres.map(Number);
  } else if (typeof params.genres === 'string') {
    genreIds = params.genres.split(',').map(Number);
  }
  let platformIds: number[] = [];
  if (Array.isArray(params.platforms)) {
    platformIds = params.platforms.map(Number);
  } else if (typeof params.platforms === 'string') {
    platformIds = params.platforms.split(',').map(Number);
  }
  const yearMin = params.yearMin ? Number(params.yearMin) : undefined;
  const yearMax = params.yearMax ? Number(params.yearMax) : undefined;
  const ratingMin = params.ratingMin ? Number(params.ratingMin) : undefined;

  // Pour la démo, on ne gère que search, ordering, status, genre (un seul genre)
  const response = await gameService.searchGames(
    search,
    page,
    ordering,
    status,
    genreIds,
    platformIds,
    yearMin,
    yearMax,
    ratingMin
  );
  const games = response.results;
  const totalPages = Math.ceil(response.count / 20);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-4">
        {games.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground">Aucun jeu trouvé.</div>
        ) : (
          games.map((game: Game) => <GameCard key={game.id} game={game} />)
        )}
      </div>
      <div className="flex items-center gap-2 justify-center">
        <button disabled={page === 1} className="border rounded px-3 py-1" form="filtersForm" name="page" value={page - 1}>Précédent</button>
        <span>Page {page} / {totalPages || 1}</span>
        <button disabled={page === totalPages || totalPages === 0} className="border rounded px-3 py-1" form="filtersForm" name="page" value={page + 1}>Suivant</button>
      </div>
    </>
  );
}

export default async function Library({ searchParams }: LibraryProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const genres = await gameService.getGenres();
  const platforms = await gameService.getPlatforms();

  return (
    <div className="flex flex-col min-h-screen w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Navbar />
      <main className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full px-4 py-8">
        <SidebarFilters genres={genres} platforms={platforms} params={params} />
        <section className="flex-1">
          <Suspense fallback={<GamesLoading />}>
            <GamesContent params={params} page={page} />
          </Suspense>
        </section>
      </main>
      <Footer />
    </div>
  );
}
 
