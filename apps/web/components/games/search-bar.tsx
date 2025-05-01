"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCallback, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [value, setValue] = useState("");
  
  const debouncedSearch = useDebounce((value: string) => {
    onSearch(value);
  }, 300);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    debouncedSearch(newValue);
  }, [debouncedSearch]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={handleChange}
        className="pl-9"
        placeholder="Rechercher un jeu..."
      />
    </div>
  );
} 