"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
}

export function SearchInput({ value, onChange, isLoading }: SearchInputProps) {
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        placeholder="Search internships, graduate programs, or roles…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 pl-10 text-base"
        aria-label="Search opportunities"
        disabled={isLoading}
      />
    </div>
  );
}
