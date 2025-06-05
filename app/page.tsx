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
import { BsController, BsDiscord, BsTwitter, BsPeople } from 'react-icons/bs';

// Composant pour la section des genres
async function GenreSection() {
  const genres = await gameService.getGenres();
  const mainGenres = genres
    .filter((genre: Genre) => Object.keys(genreIcons).includes(genre.name))
    .slice(0, 6);

  return (
    <section className="">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-primary flex items-center gap-2">
          <BsController className="w-7 h-7 text-primary" />
          Explorez par Catégorie
        </h2>
        <Link href="/library">
          <Button variant="outline" className="text-primary border-primary/40">
            Voir toutes les catégories
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
        {mainGenres.map((genre: Genre) => (
          <Link href={`/library?genre=${genre.id}`} key={genre.id}>
            <Card className="hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 bg-gradient-to-br from-muted/80 to-background/80 rounded-2xl">
              <CardHeader className="text-center flex flex-col items-center">
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">{genreIcons[genre.name]}</div>
                <CardTitle className="text-lg font-semibold text-primary group-hover:text-primary/90">{genreTranslations[genre.name]}</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground text-xs">
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
    <section className="py-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-primary flex items-center gap-2">
          <BsPeople className="w-7 h-7 text-primary" />
          Jeux Récents
        </h2>
        <Link href="/library?sort=recent">
          <Button variant="outline" className="text-primary border-primary/40">
            Voir tous les jeux
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <Navbar />
      <div className="w-full max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8">
        
        
        {/* Section Hero/Banner */}
        <section className="py-20 md:py-28 relative">
          <div className="absolute inset-0 -z-10">
            <Image
              src="/images/banner.png"
              alt="Gaming Banner"
              fill
              className="object-cover object-center opacity-80"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/40 to-transparent" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-8 text-center md:text-left">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-primary drop-shadow-lg">
                Découvrez l'Univers du Gaming
              </h1>
              <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto md:mx-0">
                Votre destination pour explorer, partager et discuter de vos jeux préférés. Rejoignez une communauté passionnée de gamers.
              </p>
              <div className="flex justify-center md:justify-start gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90 px-8 py-6 text-lg font-semibold flex items-center gap-2 shadow-lg">
                  <BsController className="w-6 h-6" />
                  <Link href="/library">Explorer les jeux</Link>
                </Button>
                <Button size="lg" variant="outline" className="px-8 py-6 text-lg font-semibold border-primary/40">
                  <Link href="#community">Rejoindre la communauté</Link>
                </Button>
              </div>
            </div>
            <div className="relative h-[340px] sm:h-[420px] rounded-3xl overflow-hidden shadow-2xl border-4 border-primary/20">
              <Image
                src="/images/banner.png"
                alt="Gaming Banner"
                fill
                className="object-cover object-center"
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
        <section id="community" className="py-20 md:py-28 bg-muted/60 rounded-3xl mt-16 shadow-inner">
          <div className="text-center max-w-3xl mx-auto px-4">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-primary flex items-center justify-center gap-2">
              <BsDiscord className="w-7 h-7 text-indigo-500" />
              Rejoignez Notre Communauté
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Partagez vos expériences, découvrez de nouveaux jeux et connectez-vous avec d'autres passionnés de gaming.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90 px-8 py-6 text-lg font-semibold flex items-center gap-2">
                <BsDiscord className="w-5 h-5" />
                Rejoindre le Discord
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg font-semibold flex items-center gap-2 border-primary/40">
                <BsTwitter className="w-5 h-5 text-sky-500" />
                Suivre sur Twitter
              </Button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
