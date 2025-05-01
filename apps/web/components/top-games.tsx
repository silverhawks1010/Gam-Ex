import { Card, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import Image from "next/image"
import { getRecentGames } from "@/lib/rawg"

export async function TopGames() {
  const games = await getRecentGames();

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', { 
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(dateString));
  };

  return (
    <section className="py-20 bg-muted/50">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter mb-4">
            Dernières Sorties
          </h2>
          <p className="text-muted-foreground mx-auto max-w-[700px]">
            Les meilleurs jeux sortis ces 30 derniers jours
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {games.map((game) => (
            <Card key={game.id} className="p-0 overflow-hidden group border-0">
              <div className="relative aspect-[16/9]">
                {game.background_image ? (
                  <Image
                    src={game.background_image}
                    alt={game.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground">No image</span>
                  </div>
                )}
                {game.metacritic && (
                  <div className="absolute bottom-2 right-2 bg-background/80 px-2 py-1 rounded-md backdrop-blur-sm">
                    <span className={`text-sm font-medium ${
                      game.metacritic >= 85 ? 'text-green-500' :
                      game.metacritic >= 70 ? 'text-yellow-500' :
                      'text-red-500'
                    }`}>
                      {game.metacritic}
                    </span>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2 line-clamp-1">{game.name}</h3>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap gap-2">
                    {game.genres.slice(0, 2).map((genre) => (
                      <Badge key={genre.id} variant="secondary" className="truncate">
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {formatDate(game.released)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {game.platforms.slice(0, 1).map(p => p.platform.name).join(', ')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
} 