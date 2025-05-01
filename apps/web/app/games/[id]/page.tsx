import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { getGameDetails, getGameScreenshots, getGameDLC, getGameSeries } from "@/lib/rawg";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Star, Calendar, Clock, Users, Award, Gift } from "lucide-react";

interface GamePageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
  const id = parseInt(params.id);
  try {
    const game = await getGameDetails(id);
    return {
      title: `${game.name} - Gam'Ex`,
      description: game.description_raw.slice(0, 160),
    };
  } catch (error) {
    return {
      title: "Jeu non trouvé - Gam'Ex",
      description: "Le jeu demandé n'a pas été trouvé.",
    };
  }
}

export default async function GamePage({ params }: GamePageProps) {
  const id = parseInt(params.id);

  try {
    const [game, screenshots, dlcs, series] = await Promise.all([
      getGameDetails(id),
      getGameScreenshots(id),
      getGameDLC(id),
      getGameSeries(id),
    ]);

    const formatDate = (dateString: string) => {
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(new Date(dateString));
    };

    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background">
          {/* Hero Section avec l'image de couverture */}
          <div className="relative h-[400px] w-full">
            <Image
              src={game.background_image}
              alt={game.name}
              fill
              className="object-cover brightness-50"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="container">
                <h1 className="text-4xl font-bold text-white mb-4">{game.name}</h1>
                <div className="flex flex-wrap gap-2">
                  {game.parent_platforms?.map(({ platform }) => (
                    <Badge key={platform.id} variant="secondary">
                      {platform.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="container p- py-8 p-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Colonne principale */}
              <div className="lg:col-span-2 space-y-8">
                <Tabs defaultValue="about">
                  <TabsList>
                    <TabsTrigger value="about">À propos</TabsTrigger>
                    <TabsTrigger value="screenshots">Captures d'écran</TabsTrigger>
                    {dlcs.results.length > 0 && (
                      <TabsTrigger value="dlc">DLC</TabsTrigger>
                    )}
                    {series.results.length > 0 && (
                      <TabsTrigger value="series">Série</TabsTrigger>
                    )}
                  </TabsList>

                  <TabsContent value="about" className="space-y-6">
                    <div className="prose dark:prose-invert max-w-none">
                      <p>{game.description_raw}</p>
                    </div>

                    {/* Développeurs et Éditeurs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold mb-2">Développeurs</h3>
                        <div className="flex flex-wrap gap-2">
                          {game.developers.map((dev) => (
                            <Badge key={dev.id} variant="outline">
                              {dev.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Éditeurs</h3>
                        <div className="flex flex-wrap gap-2">
                          {game.publishers.map((pub) => (
                            <Badge key={pub.id} variant="outline">
                              {pub.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Genres */}
                    <div>
                      <h3 className="font-semibold mb-2">Genres</h3>
                      <div className="flex flex-wrap gap-2">
                        {game.genres.map((genre) => (
                          <Badge key={genre.id}>{genre.name}</Badge>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="screenshots" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {screenshots.results.map((screenshot) => (
                        <div key={screenshot.id} className="relative aspect-video">
                          <Image
                            src={screenshot.image}
                            alt="Capture d'écran du jeu"
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {dlcs.results.length > 0 && (
                    <TabsContent value="dlc" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {dlcs.results.map((dlc) => (
                          <Card key={dlc.id}>
                            <CardContent className="p-4">
                              <div className="relative aspect-video mb-4">
                                <Image
                                  src={dlc.background_image}
                                  alt={dlc.name}
                                  fill
                                  className="object-cover rounded-lg"
                                />
                              </div>
                              <h3 className="font-semibold">{dlc.name}</h3>
                              {dlc.released && (
                                <p className="text-sm text-muted-foreground">
                                  Sortie le {formatDate(dlc.released)}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                  )}

                  {series.results.length > 0 && (
                    <TabsContent value="series" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {series.results.map((game) => (
                          <Card key={game.id}>
                            <CardContent className="p-4">
                              <div className="relative aspect-video mb-4">
                                <Image
                                  src={game.background_image}
                                  alt={game.name}
                                  fill
                                  className="object-cover rounded-lg"
                                />
                              </div>
                              <h3 className="font-semibold">{game.name}</h3>
                              {game.released && (
                                <p className="text-sm text-muted-foreground">
                                  Sortie le {formatDate(game.released)}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              </div>

              {/* Barre latérale */}
              <div className="space-y-6">
                {/* Informations clés */}
                <div className="space-y-4">
                  {game.website && (
                    <Button asChild variant="outline" className="w-full">
                      <a href={game.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Site officiel
                      </a>
                    </Button>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {game.metacritic && (
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <div>
                          <div className="text-sm font-medium">Metacritic</div>
                          <div className="text-2xl font-bold">{game.metacritic}</div>
                        </div>
                      </div>
                    )}

                    {game.released && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <div>
                          <div className="text-sm font-medium">Date de sortie</div>
                          <div className="text-sm">{formatDate(game.released)}</div>
                        </div>
                      </div>
                    )}

                    {game.playtime > 0 && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <div>
                          <div className="text-sm font-medium">Temps de jeu</div>
                          <div className="text-sm">{game.playtime} heures</div>
                        </div>
                      </div>
                    )}

                    {game.ratings_count > 0 && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <div>
                          <div className="text-sm font-medium">Évaluations</div>
                          <div className="text-sm">{game.ratings_count}</div>
                        </div>
                      </div>
                    )}

                    {game.achievements_count > 0 && (
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        <div>
                          <div className="text-sm font-medium">Succès</div>
                          <div className="text-sm">{game.achievements_count}</div>
                        </div>
                      </div>
                    )}

                    {game.additions_count > 0 && (
                      <div className="flex items-center gap-2">
                        <Gift className="h-4 w-4" />
                        <div>
                          <div className="text-sm font-medium">DLC</div>
                          <div className="text-sm">{game.additions_count}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Boutiques */}
                {game.stores && game.stores.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-4">Où acheter</h3>
                    <div className="space-y-2">
                      {game.stores.map(({ store }) => (
                        <Button
                          key={store.id}
                          variant="outline"
                          className="w-full justify-start"
                          asChild
                        >
                          <a
                            href={`https://${store.domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {store.name}
                          </a>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Évaluations */}
                {game.ratings && game.ratings.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-4">Évaluations</h3>
                    <div className="space-y-2">
                      {game.ratings.map((rating) => (
                        <div key={rating.id} className="flex items-center gap-2">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${rating.percent}%` }}
                            />
                          </div>
                          <span className="text-sm min-w-[100px]">
                            {rating.title} ({rating.percent}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </>
    );
  } catch (error) {
    notFound();
  }
} 