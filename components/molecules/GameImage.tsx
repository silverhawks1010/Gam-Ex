import Image from "next/image";
import { cn } from "@/lib/utils";

interface GameImageProps {
  src: string | null;
  alt: string;
  className?: string;
}

export function GameImage({ src, alt, className }: GameImageProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image
        src={src || '/images/game-placeholder.jpg'}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={false}
      />
    </div>
  );
} 