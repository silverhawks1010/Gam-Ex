import Image from "next/image";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface FranchiseSummary {
  id: number;
  name: string;
  cover?: string | null;
}

interface FranchiseCardProps {
  franchise: FranchiseSummary;
  onRemove?: () => void;
  dragProps?: React.HTMLAttributes<HTMLDivElement>;
  isDragging?: boolean;
  showName?: boolean;
}

export function FranchiseCard({ franchise, onRemove, dragProps, isDragging, showName }: FranchiseCardProps) {
  return (
    <div className={`relative ${isDragging ? "z-50" : "z-10"}`} {...dragProps}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative flex flex-col items-center cursor-pointer">
            {franchise.cover ? (
              <Image
                src={franchise.cover}
                alt={franchise.name}
                width={80}
                height={96}
                className="object-cover w-full h-full rounded"
              />
            ) : (
              <div className="w-20 h-24 flex items-center justify-center bg-muted rounded">
                <span className="text-xs text-muted-foreground">?</span>
              </div>
            )}
            {showName && (
              <div className="text-xs font-bold text-center mt-1 truncate max-w-[80px]">{franchise.name}</div>
            )}
            {onRemove && (
              <button
                onClick={e => { e.stopPropagation(); e.preventDefault(); onRemove(); }}
                className="absolute top-1 left-1 text-red-500 bg-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-80 hover:opacity-100"
                tabIndex={0}
                aria-label="Supprimer"
              >
                ×
              </button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>{franchise.name}</TooltipContent>
      </Tooltip>
    </div>
  );
} 