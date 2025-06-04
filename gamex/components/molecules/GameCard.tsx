import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Game } from "@/lib/services/rawg";
import { GameImage } from "./GameImage";
import { FaPlaystation, FaXbox, FaWindows, FaApple, FaLinux } from "react-icons/fa";
import { SiNintendoswitch } from "react-icons/si";
import { genreTranslations } from "@/config/genres";

interface GameCardProps {
  game: Game;
}

const getPlatformIcon = (platformName: string) => {
  const name = platformName.toLowerCase();
  if (name.includes("playstation")) return <FaPlaystation className="text-blue-500" />;
  if (name.includes("xbox")) return <FaXbox className="text-green-500" />;
  if (name.includes("pc") || name.includes("windows")) return <FaWindows className="text-blue-400" />;
  if (name.includes("mac")) return <FaApple className="text-gray-800" />;
  if (name.includes("linux")) return <FaLinux className="text-orange-500" />;
  if (name.includes("nintendo") || name.includes("switch")) return <SiNintendoswitch className="text-red-500" />;
  return null;
};

export function GameCard({ game }: GameCardProps) {
  const isUpcoming = !game.released || new Date(game.released) > new Date();
  const isEarlyAccess = game.tags?.some(tag => tag.name.toLowerCase() === 'early access');
  const isStarCitizen = game.name.toLowerCase() === 'star citizen';
  const releaseDate = game.released ? new Date(game.released).toLocaleDateString('fr-FR') : null;
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full pt-0 relative">
      {isUpcoming && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded shadow-lg">
            {isStarCitizen ? 'Un jour...' : (isEarlyAccess ? 'Early Access' : (releaseDate ? `Sortie : ${releaseDate}` : 'Prochainement'))}
          </div>
        </div>
      )}
      <GameImage
        src={game.background_image}
        alt={game.name}
        className="h-48"
      />
      <CardHeader className="not-[]:">
        <CardTitle className="text-primary">{game.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {game.genres.slice(0, 3).map((genre) => (
              <Badge key={genre.id} variant="secondary">
                {genreTranslations[genre.name] || genre.name}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {game.platforms.slice(0, 5).map((platform) => {
              const icon = getPlatformIcon(platform.platform.name);
              return icon ? (
                <div key={platform.platform.id} className="text-xl" title={platform.platform.name}>
                  {icon}
                </div>
              ) : null;
            })}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 mt-auto">
        <Button className="w-full bg-primary hover:bg-primary/90">
          <Link href={`/games/${game.id}`}>
            Voir les détails
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
} 