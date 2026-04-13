"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { SearchInput } from "@/components/public/SearchInput";
import { Button } from "@/components/ui/button";

export function LandingSearch() {
  const router = useRouter();
  const [query, setQuery] = React.useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length < 3) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchInput value={query} onChange={setQuery} />
        </div>
        <Button type="submit" className="h-12 sm:px-4">
          Search
        </Button>
      </div>
      <p className="type-small text-muted-foreground">
        Tip: Try “software engineering intern” or “graduate program”.
      </p>
    </form>
  );
}

