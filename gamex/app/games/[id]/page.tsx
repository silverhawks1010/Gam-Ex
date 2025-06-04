import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/molecules/Navbar";
import { Footer } from "@/components/molecules/Footer";
import { rawgService, Game } from "@/lib/services/rawg";
import Link from "next/link";

async function getGame(id: string) {
  try {
    const [game, dlcs, franchiseGames] = await Promise.all([
      rawgService.getGameDetails(parseInt(id)),
      rawgService.getDLCs(parseInt(id)),
      rawgService.getFranchiseGames(parseInt(id))
    ]);
    return { game, dlcs, franchiseGames };
  } catch (error) {
    console.error('Erreur lors du chargement du jeu:', error);
    return null;
  }
}

interface PageProps {
  params: {
    id: string;
  };
}

export default async function GamePage({ params }: PageProps) {
  const data = await getGame(params.id);
  console.log(data);

  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <h1 className="text-2xl font-bold text-destructive">Jeu non trouvé</h1>
        </div>
        <Footer />
      </div>
    );
  }

  const { game, dlcs, franchiseGames } = data;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Bannière */}
      <div className="relative h-[60vh] w-full">
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
        <Image
          src={game.background_image}
          alt={game.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute bottom-0 left-0 p-8 text-foreground z-20">
          <h1 className="text-5xl font-bold mb-2">{game.name}</h1>
          <div className="flex gap-2 mt-4">
            {game.genres?.map((genre) => (
              <Badge key={genre.id} variant="secondary">{genre.name}</Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne de gauche - Informations du jeu */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Date de sortie */}
                <div>
                  <h3 className="font-semibold mb-1">Date de sortie</h3>
                  <p className="text-muted-foreground">{game.released}</p>
                </div>

                {/* Developers */}
                <div>
                  <h3 className="font-semibold mb-1">Développeurs</h3>
                  <div className="flex flex-wrap gap-2">
                    {game.developers?.map((developer) => (
                      <Badge key={developer.id} variant="outline">{developer.name}</Badge>
                    ))}
                  </div>
                </div>

                {/* Publishers */}
                <div>
                  <h3 className="font-semibold mb-1">Éditeurs</h3>
                  <div className="flex flex-wrap gap-2">
                    {game.publishers?.map((publisher) => (
                      <Badge key={publisher.id} variant="outline">{publisher.name}</Badge>
                    ))}
                  </div>
                </div>

                {/* Plateformes */}
                <div>
                  <h3 className="font-semibold mb-1">Plateformes</h3>
                  <div className="flex flex-wrap gap-2">
                    {game.platforms?.map(({ platform }) => (
                      <Badge key={platform.id} variant="outline">{platform.name}</Badge>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <h3 className="font-semibold mb-1">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {game.tags?.map((tag) => (
                      <Badge key={tag.id} variant="secondary">{tag.name}</Badge>
                    ))}
                  </div>
                </div>

                {/* Note */}
                <div>
                  <h3 className="font-semibold mb-1">Note</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{game.rating} / {game.rating_top}</Badge>
                    <span className="text-muted-foreground text-sm">
                      ({game.ratings_count} votes)
                    </span>
                  </div>
                </div>

                {/* Stores */}
                {game.stores && game.stores.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-1">Où acheter</h3>
                    <div className="space-y-2">
                      {game.stores.map((store) => {
                        // Construction de l'URL pour Steam
                        const storeUrl = store.store.domain === 'store.steampowered.com' 
                          ? `https://store.steampowered.com/app/${store.id}`
                          : store.url;

                        return (
                          <Link
                            key={store.id}
                            href={storeUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 ${
                              storeUrl 
                                ? 'text-primary hover:underline cursor-pointer' 
                                : 'text-muted-foreground cursor-not-allowed pointer-events-none'
                            }`}
                          >
                            <span>{store.store.name}</span>
                            {storeUrl && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="ml-1"
                              >
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                <polyline points="15 3 21 3 21 9" />
                                <line x1="10" y1="14" x2="21" y2="3" />
                              </svg>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Colonne de droite - Description et captures d'écran */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line">
                  {game.description_raw}
                </p>
              </CardContent>
            </Card>

            {/* Captures d'écran */}
            {game.short_screenshots && game.short_screenshots.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Captures d'écran</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {game.short_screenshots.map((screenshot) => (
                      <div key={screenshot.id} className="relative aspect-video">
                        <Image
                          src={screenshot.image}
                          alt={`${game.name} screenshot`}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Sections DLC et Franchise en carrousels */}
        <div className="mt-8 space-y-8">
          {/* DLCs */}
          {dlcs.results && dlcs.results.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">DLCs</h2>
              <div className="relative">
                <div className="overflow-x-auto pb-4">
                  <div className="flex gap-4" style={{ width: 'max-content' }}>
                    {dlcs.results.map((dlc) => (
                      <Link href={`/games/${dlc.id}`} key={dlc.id} className="w-64">
                        <Card className="hover:bg-accent transition-colors">
                          <div className="relative h-48">
                            <Image
                              src={dlc.background_image}
                              alt={dlc.name}
                              fill
                              className="object-cover rounded-t-lg"
                            />
                          </div>
                          <CardHeader>
                            <CardTitle className="line-clamp-2">{dlc.name}</CardTitle>
                          </CardHeader>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Jeux de la même franchise */}
          {franchiseGames.results && franchiseGames.results.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Jeux de la même franchise</h2>
              <div className="relative">
                <div className="overflow-x-auto pb-4">
                  <div className="flex gap-4" style={{ width: 'max-content' }}>
                    {franchiseGames.results.map((seriesGame) => (
                      <Link href={`/games/${seriesGame.id}`} key={seriesGame.id} className="w-64">
                        <Card className="hover:bg-accent transition-colors">
                          <div className="relative h-48">
                            <Image
                              src={seriesGame.background_image}
                              alt={seriesGame.name}
                              fill
                              className="object-cover rounded-t-lg"
                            />
                          </div>
                          <CardHeader>
                            <CardTitle className="line-clamp-2">{seriesGame.name}</CardTitle>
                          </CardHeader>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
} 