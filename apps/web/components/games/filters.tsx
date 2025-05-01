"use client";

import { Badge } from "@/components/ui/badge";

const platforms = [
  { value: "4", label: "PC" },
  { value: "187", label: "PlayStation 5" },
  { value: "1", label: "Xbox Series X/S" },
  { value: "7", label: "Nintendo Switch" },
  { value: "18", label: "PlayStation 4" },
  { value: "186", label: "Xbox One" },
];

const sortOptions = [
  { value: "-metacritic", label: "Meilleures notes" },
  { value: "-added", label: "Plus populaires" },
  { value: "-released", label: "Plus récents" },
  { value: "released", label: "Plus anciens" },
  { value: "name", label: "Alphabétique (A-Z)" },
  { value: "-name", label: "Alphabétique (Z-A)" },
];

const yearOptions = Array.from({ length: 35 }, (_, i) => {
  const year = new Date().getFullYear() - i;
  return { value: year.toString(), label: year.toString() };
});

interface FiltersProps {
  onPlatformChange: (platform: string) => void;
  onSortChange: (sort: string) => void;
  onYearChange: (year: string) => void;
  selectedPlatform?: string;
  selectedSort?: string;
  selectedYear?: string;
}

export function Filters({
  onPlatformChange,
  onSortChange,
  onYearChange,
  selectedPlatform,
  selectedSort,
  selectedYear,
}: FiltersProps) {
  return (
    <div className="flex flex-wrap gap-4">
      {/* Filtre par Plateforme */}
      <div className="flex flex-col gap-2">
        <label htmlFor="platform-select" className="text-sm font-medium">
          Plateforme
        </label>
        <select
          id="platform-select"
          value={selectedPlatform}
          onChange={(e) => onPlatformChange(e.target.value)}
          className="w-[200px] rounded-md border bg-background px-3 py-2 text-sm ring-offset-background"
        >
          <option value="">Toutes les plateformes</option>
          {platforms.map((platform) => (
            <option key={platform.value} value={platform.value}>
              {platform.label}
            </option>
          ))}
        </select>
      </div>

      {/* Filtre par Tri */}
      <div className="flex flex-col gap-2">
        <label htmlFor="sort-select" className="text-sm font-medium">
          Trier par
        </label>
        <select
          id="sort-select"
          value={selectedSort}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-[200px] rounded-md border bg-background px-3 py-2 text-sm ring-offset-background"
        >
          <option value="-added">Trier par...</option>
          {sortOptions.map((sort) => (
            <option key={sort.value} value={sort.value}>
              {sort.label}
            </option>
          ))}
        </select>
      </div>

      {/* Filtre par Année */}
      <div className="flex flex-col gap-2">
        <label htmlFor="year-select" className="text-sm font-medium">
          Année
        </label>
        <select
          id="year-select"
          value={selectedYear}
          onChange={(e) => onYearChange(e.target.value)}
          className="w-[200px] rounded-md border bg-background px-3 py-2 text-sm ring-offset-background"
          style={{ maxHeight: '300px' }}
        >
          <option value="">Toutes les années</option>
          {yearOptions.map((year) => (
            <option key={year.value} value={year.value}>
              {year.label}
            </option>
          ))}
        </select>
      </div>

      {/* Affichage des filtres actifs */}
      <div className="flex flex-wrap gap-2 items-end">
        {selectedPlatform && (
          <Badge variant="secondary" className="gap-1">
            {platforms.find((p) => p.value === selectedPlatform)?.label}
            <button
              onClick={() => onPlatformChange("")}
              className="ml-1 hover:text-destructive"
            >
              ×
            </button>
          </Badge>
        )}
        {selectedYear && (
          <Badge variant="secondary" className="gap-1">
            {selectedYear}
            <button
              onClick={() => onYearChange("")}
              className="ml-1 hover:text-destructive"
            >
              ×
            </button>
          </Badge>
        )}
      </div>
    </div>
  );
} 