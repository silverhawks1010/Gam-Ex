import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaginationControlsProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}

const pageSizeOptions = [16, 24, 32, 48];

export function PaginationControls({
  pageSize,
  onPageSizeChange,
}: PaginationControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Jeux par page:</span>
      <Select
        value={pageSize.toString()}
        onValueChange={(value) => onPageSizeChange(Number(value))}
      >
        <SelectTrigger className="w-[100px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {pageSizeOptions.map((size) => (
            <SelectItem key={size} value={size.toString()}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 