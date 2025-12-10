import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GameCard } from "./game-card";

interface GameSummary {
  id: number;
  name: string;
  cover?: { url: string };
}

interface SortableGameCardProps {
  game: GameSummary;
  id: string;
  onRemove?: () => void;
  showName?: boolean;
}

export function SortableGameCard({ game, id, onRemove, showName }: SortableGameCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, data: { game } });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <GameCard game={game} onRemove={onRemove} isDragging={isDragging} showName={showName} />
    </div>
  );
} 