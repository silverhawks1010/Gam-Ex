import { Suspense } from "react";
import { getPopularGames } from "@/lib/rawg";
import { Navbar } from "@/components/navbar";
import { GamesList } from "@/components/games/games-list";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface SearchParams {
  page?: string;
  pageSize?: string;
  search?: string;
  upcoming?: string;
  platform?: string;
  year?: string;
  ordering?: string;
}

export default async function GamesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // Utilisation de Promise.resolve pour s'assurer que les paramètres sont bien attendus
  const params = await Promise.resolve(searchParams);
  
  const page = Number(params.page) || 1;
  const pageSize = Number(params.pageSize) || 16;
  const search = params.search || "";
  const upcoming = params.upcoming === "true";
  const platform = params.platform || "";
  const year = params.year || "";
  const ordering = params.ordering || "-added";

  try {
    const initialGames = await getPopularGames({ 
      page, 
      pageSize, 
      search, 
      upcoming,
      platform,
      year,
      ordering
    });

    return (
      <section className="min-h-screen bg-background">
        <Navbar />
        <div className="p-15 container py-8">
          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold">
              {search 
                ? `Recherche: ${search}`
                : upcoming
                  ? "Jeux à Venir"
                  : "Jeux les Plus Populaires"
              }
            </h1>
            <p className="text-muted-foreground">
              {search 
                ? `Résultats de recherche pour "${search}"`
                : upcoming
                  ? "Découvrez les jeux qui sortiront prochainement"
                  : "Découvrez les jeux les plus populaires"
              }
            </p>
          </div>

          <Suspense fallback={<div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: pageSize }).map((_, i) => (
              <div key={i} className="h-[300px] animate-pulse rounded-lg bg-muted" />
            ))}
          </div>}>
            <GamesList 
              initialGames={initialGames}
              pageSize={pageSize}
            />
          </Suspense>
        </div>
      </section>
    );
  } catch (error) {
    return (
      <section className="min-h-screen bg-background">
        <Navbar />
        <div className="p-15 container py-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>
              Une erreur est survenue lors de la récupération des jeux. Veuillez réessayer plus tard.
            </AlertDescription>
          </Alert>
        </div>
      </section>
    );
  }
} 