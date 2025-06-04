import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { GameImage } from "./GameImage";
import { FaPlaystation, FaXbox, FaWindows, FaApple, FaLinux, FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import { SiNintendoswitch } from "react-icons/si";
import { genreTranslations } from "@/config/genres";
import { Game, Genre, Platform } from "@/types/game";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CircleSlash } from 'lucide-react';

interface GameCardProps {
  game: Game;
  contentType?: string;
}

const platformIcons: { [key: string]: React.ReactElement } = {
  playstation: <FaPlaystation className="text-blue-500" />,
  xbox: <FaXbox className="text-green-500" />,
  pc: <FaWindows className="text-blue-400" />,
  windows: <FaWindows className="text-blue-400" />,
  mac: <FaApple className="text-gray-500" />,
  linux: <FaLinux className="text-orange-400" />,
  nintendo: <SiNintendoswitch className="text-red-600" />,
  switch: <SiNintendoswitch className="text-red-600" />,
  ios: <FaApple className="text-gray-300" />,
  android: <CircleSlash className="text-green-400" />
};

const getPlatformIcon = (platformName?: string): React.ReactElement | null => {
  if (!platformName) return null;
  const lowerPlatformName = platformName.toLowerCase();
  for (const key in platformIcons) {
    if (lowerPlatformName.includes(key)) {
      return platformIcons[key];
    }
  }
  return null;
};

interface GameStatusInfo {
  text: string;
  className: string;
}

const getGameStatusInfo = (game: Game, contentType?: string): GameStatusInfo | null => {
  if (contentType) {
    if (contentType.toLowerCase().includes('dlc')) return { text: 'DLC', className: 'bg-sky-500 text-white' };
    if (contentType.toLowerCase().includes('expansion')) return { text: 'Expansion', className: 'bg-teal-500 text-white' };
    if (contentType.toLowerCase().includes('bundle')) return { text: 'Bundle', className: 'bg-indigo-500 text-white' };
    if (contentType.toLowerCase().includes('mod')) return { text: 'Mod', className: 'bg-slate-500 text-white' };
    if (contentType.toLowerCase().includes('saison')) return { text: 'Saison', className: 'bg-amber-500 text-black' };
    if (contentType.toLowerCase().includes('épisode')) return { text: 'Épisode', className: 'bg-lime-500 text-black' };
    return { text: contentType, className: 'bg-gray-500 text-white' };
  }

  const now = Date.now();
  const releaseDateTimestamp = game.first_release_date ? game.first_release_date * 1000 : 
                               (game.release_dates && game.release_dates.length > 0 && game.release_dates[0].date ? game.release_dates[0].date * 1000 : null);

  if (game.status === 6 || game.status === 8) return { text: "Annulé", className: "bg-gray-500 text-white" };
  if (game.status === 5) return { text: "Fermé", className: "bg-gray-500 text-white" };
  if (game.slug === "star-citizen") return { text: "Eternal Early", className: "bg-purple-500 text-white" };
  if (game.status === 4) return { text: "Early Access", className: "bg-yellow-500 text-black" };
  if (game.status === 2) return { text: "Alpha", className: "bg-orange-500 text-white" };
  if (game.status === 3) return { text: "Beta", className: "bg-purple-500 text-white" };

  if (releaseDateTimestamp && releaseDateTimestamp > now) {
    return { text: `Annoncé`, className: "bg-blue-500 text-white" };
  }
  if (game.status === 0 || game.status === 1) {
    if (releaseDateTimestamp) {
      return { text: `Sortie`, className: "bg-green-600 text-white" };
    }
    return { text: "Sortie", className: "bg-green-600 text-white" };
  }
  if (game.status === 7) return { text: "Rumeur", className: "bg-teal-500 text-white"}; 

  if (releaseDateTimestamp && releaseDateTimestamp > now) {
    return { text: `Prochainement`, className: "bg-blue-500 text-white" };
  }
  if (releaseDateTimestamp) {
    return { text: `Sorti`, className: "bg-green-600 text-white" };
  }

  return { text: "Statut inconnu", className: "bg-gray-400 text-black" };
};

const renderStars = (rating?: number, maxRating: number = 100) => {
  if (typeof rating !== 'number' || rating < 0) return null;
  const normalizedRating = (rating / maxRating) * 5;
  const fullStars = Math.floor(normalizedRating);
  const halfStar = normalizedRating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => <FaStar key={`full-${i}`} className="text-yellow-400" />)}
      {halfStar === 1 && <FaStarHalfAlt key="half" className="text-yellow-400" />}
      {[...Array(emptyStars)].map((_, i) => <FaRegStar key={`empty-${i}`} className="text-yellow-400" />)}
      <span className="ml-1 text-xs text-muted-foreground">({(rating).toFixed(0)}%)</span>
    </div>
  );
};

export function GameCard({ game, contentType }: GameCardProps) {
  const statusInfo = getGameStatusInfo(game, contentType);
  const displayableSummary = game.summary && game.summary.length > 150 ? `${game.summary.substring(0, 147)}...` : game.summary;

  return (
    <TooltipProvider delayDuration={200}>
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full group relative border-border hover:border-primary/60 pt-0">
        {statusInfo && (
          <div className={`absolute top-2 right-2 z-10 text-xs font-semibold px-2.5 py-1 rounded-full shadow-lg ${statusInfo.className}`}>
            {statusInfo.text}
          </div>
        )}
        <div className="w-full">
          <AspectRatio ratio={16 / 9}>
            <GameImage
              src={( game.cover?.url || game.background_image || game.screenshots?.[0]?.url) ?? null}
              alt={`Image de ${game.name}`}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            />
          </AspectRatio>
        </div>

        <CardHeader className="p-4">
          <CardTitle className="text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
            {game.name}
          </CardTitle>
          {!contentType && game.first_release_date && (
             <p className="text-xs text-muted-foreground">
               Sortie: {new Date(game.first_release_date * 1000).toLocaleDateString()}
             </p>
          )}
          {contentType && game.first_release_date && (
             <p className="text-xs text-muted-foreground">
               Disponible: {new Date(game.first_release_date * 1000).toLocaleDateString()}
             </p>
          )}
        </CardHeader>

        <CardContent className="p-4 flex-grow flex flex-col gap-3 text-sm">
          {game.aggregated_rating ? (
            renderStars(game.aggregated_rating, 100)
          ) : game.rating ? (
            renderStars(game.rating, 100) 
          ) : null}
          

          {game.genres && game.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {game.genres.slice(0, 3).map((genre: Genre) => (
                <Badge key={genre.id} variant="secondary" className="text-xs">
                  {genreTranslations[genre.name] || genre.name}
                </Badge>
              ))}
            </div>
          )}

          {game.platforms && game.platforms.length > 0 && (
            <div className="flex flex-wrap gap-2.5 items-center mt-2">
              {game.platforms.slice(0, 5).map((p: { platform: Platform; requirements?: any }) => {
                const icon = getPlatformIcon(p.platform.name);
                return icon ? (
                  <Tooltip key={p.platform.id}>
                    <TooltipTrigger asChild>
                      <span className="text-lg text-muted-foreground hover:text-foreground transition-colors">{icon}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{p.platform.name}</p>
                    </TooltipContent>
                  </Tooltip>
                ) : null;
              })}
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 mt-auto">
          <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href={`/games/${game.id || game.slug}`}>
              Voir les détails
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
} 