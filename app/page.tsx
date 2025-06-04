import Image from "next/image";
import { Navbar } from "@/components/molecules/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { GameCard } from "@/components/molecules/GameCard";
import { gameService } from "@/lib/services/gameService";
import { Footer } from "@/components/molecules/Footer";
import { genreIcons, genreTranslations } from "@/config/genres";
import { Genre, Game } from "@/types/game";
import { Badge } from "@/components/ui/badge";

// Composant pour la section des genres
async function GenreSection() {
  const genres = await gameService.getGenres();
  const mainGenres = genres
    .filter((genre: Genre) => Object.keys(genreIcons).includes(genre.name))
    .slice(0, 6);

  return (
    <section className="py-12 md:py-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary">
          Explorez par Catégorie
        </h2>
        <Link href="/library">
          <Button variant="outline" className="text-primary">
            Voir toutes les catégories
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {mainGenres.map((genre: Genre) => (
          <Link href={`/library?genre=${genre.id}`} key={genre.id}>
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer">
              <CardHeader className="text-center">
                <div className="text-4xl mb-2">{genreIcons[genre.name]}</div>
                <CardTitle className="text-lg">{genreTranslations[genre.name]}</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground">
                {/* IGDB ne fournit pas directement le nombre de jeux par genre */}
                Jeux populaires
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}

// Composant pour la section des jeux à venir
async function UpcomingGamesSection() {
  const recentGames = await gameService.getRecentGames();

  return (
    <section className="py-12 md:py-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary">
          Jeux Récents
        </h2>
        <Link href="/library?sort=recent">
          <Button variant="outline" className="text-primary">
            Voir tous les jeux
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {recentGames.slice(0, 4).map((game: Game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </section>
  );
}

export default async function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Navbar />
        
        {/* Section Hero/Banner */}
        <section className="py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6 text-center md:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-primary">
                Découvrez l'Univers du Gaming
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto md:mx-0">
                Votre destination pour explorer, partager et discuter de vos jeux préférés. 
                Rejoignez une communauté passionnée de gamers.
              </p>
              <div className="flex justify-center md:justify-start">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  <Link href="/library">
                    Explorer les jeux
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative h-[300px] sm:h-[400px] rounded-xl overflow-hidden">
              <Image
                src="/images/banner.png"
                alt="Gaming Banner"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </section>

        {/* Section Genres */}
        <GenreSection />

        {/* Section Jeux à venir */}
        <UpcomingGamesSection />

        {/* Section Communauté */}
        <section className="py-12 md:py-16 bg-muted/50 rounded-2xl">
          <div className="text-center max-w-3xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-primary">
              Rejoignez Notre Communauté
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Partagez vos expériences, découvrez de nouveaux jeux et connectez-vous avec d'autres passionnés de gaming.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Créer un compte
              </Button>
              <Button size="lg" variant="outline">
                En savoir plus
              </Button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
