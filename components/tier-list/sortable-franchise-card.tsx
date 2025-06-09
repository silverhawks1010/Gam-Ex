import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FranchiseCard } from "./franchise-card";

interface FranchiseSummary {
  id: number;
  name: string;
  cover?: string | null;
}

interface SortableFranchiseCardProps {
  franchise: FranchiseSummary;
  id: string;
  onRemove?: () => void;
  showName?: boolean;
}

export function SortableFranchiseCard({ franchise, id, onRemove, showName }: SortableFranchiseCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, data: { franchise } });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <FranchiseCard franchise={franchise} onRemove={onRemove} isDragging={isDragging} showName={showName} />
    </div>
  );
} 