import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface GameCardProps {
  id: number;
  name: string;
  coverUrl: string;
  rating: number | null;
  releaseDate: string;
  genres: Array<{ id: number; name: string }>;
  platforms: Array<{ platform: { id: number; name: string } }>;
}

export function GameCard({
  id,
  name,
  coverUrl,
  rating,
  releaseDate,
  genres,
  platforms,
}: GameCardProps) {
  const isComingSoon = new Date(releaseDate) > new Date();
  const isStarCitizen = name.toLowerCase().includes("star citizen");

  return (
    <Link href={`/games/${id}`} className="group">
      <article className="space-y-2 overflow-hidden rounded-lg border bg-card transition-colors hover:bg-accent">
        <div className="aspect-[16/9] relative overflow-hidden">
          <Image
            src={coverUrl}
            alt={name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={false}
          />
          {rating && (
            <Badge variant={rating > 75 ? "default" : "secondary"} className="absolute right-2 top-2">
              {rating}
            </Badge>
          )}
          {(isComingSoon || isStarCitizen) && (
            <Badge variant="destructive" className="absolute left-2 top-2">
              {isStarCitizen ? "Eternal Alpha" : "Coming Soon"}
            </Badge>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-semibold line-clamp-1">{name}</h3>
          <div className="mt-1 flex flex-wrap gap-1">
            {genres.slice(0, 2).map((genre) => (
              <Badge key={genre.id} variant="outline" className="text-xs">
                {genre.name}
              </Badge>
            ))}
          </div>
        </div>
      </article>
    </Link>
  );
} 