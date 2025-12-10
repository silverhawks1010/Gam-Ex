import Image from "next/image";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface GameSummary {
  id: number;
  name: string;
  cover?: { url: string };
}

function normalizeIGDBUrl(url?: string) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("//")) return "https:" + url;
  return url;
}

function omitDragAndAnimationProps<T extends object>(props: T): Partial<T> {
  const result: Partial<T> = {};
  for (const key in props) {
    if (!key.startsWith('onDrag') && !key.startsWith('onAnimation')) {
      result[key] = props[key];
    }
  }
  return result;
}

interface GameCardProps {
  game: GameSummary;
  onRemove?: () => void;
  dragProps?: React.HTMLAttributes<HTMLDivElement>;
  isDragging?: boolean;
  showName?: boolean;
}

export function GameCard({ game, onRemove, dragProps, isDragging, showName }: GameCardProps) {
  const safeProps = dragProps ? omitDragAndAnimationProps(dragProps) : {};
  return (
    <div className={`relative ${isDragging ? "z-50" : "z-10"}`} {...safeProps}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-20 bg-muted rounded overflow-visible flex flex-col items-center cursor-pointer">
            <div className="w-full flex items-center justify-center" style={{height: 96}}>
              {game.cover && game.cover.url ? (
                <Image 
                  src={normalizeIGDBUrl(game.cover.url.replace("t_thumb", "t_cover_big"))}
                  alt={game.name} 
                  width={80} 
                  height={96} 
                  className="object-cover w-full h-full" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <span className="text-xs text-muted-foreground">?</span>
                </div>
              )}
            </div>
            {showName && (
              <div className="text-xs font-bold text-center mt-1 truncate max-w-[80px]">{game.name}</div>
            )}
            {onRemove && (
              <button
                onClick={e => { e.stopPropagation(); e.preventDefault(); onRemove(); }}
                onPointerDown={e => e.stopPropagation()}
                className="absolute top-1 left-1 text-red-500 bg-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-80 hover:opacity-100"
                tabIndex={0}
                aria-label="Supprimer"
              >
                ×
              </button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>{game.name}</TooltipContent>
      </Tooltip>
    </div>
  );
} 