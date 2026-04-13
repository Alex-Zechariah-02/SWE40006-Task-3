"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { FilterBar } from "@/components/shared/FilterBar";
import { cn } from "@/lib/utils";

export function ContactListFiltersRow({
  companyFilter,
  onCompanyFilterChange,
  companies,
}: {
  companyFilter: string;
  onCompanyFilterChange: (value: string) => void;
  companies: Array<{ id: string; name: string }>;
}) {
  const activeFilters: Array<{ key: string; label: string }> = [];
  if (companyFilter !== "all") {
    const name = companies.find((c) => c.id === companyFilter)?.name;
    activeFilters.push({
      key: "company",
      label: `Company: ${name ?? companyFilter}`,
    });
  }

  return (
    <FilterBar
      activeFilters={activeFilters}
      onRemoveFilter={() => onCompanyFilterChange("all")}
      onClearAll={() => onCompanyFilterChange("all")}
    >
      <Select
        value={companyFilter}
        onValueChange={(v) => onCompanyFilterChange(v ?? "all")}
      >
        <SelectTrigger className="w-auto" aria-label="Filter by company">
          <span
            data-slot="select-value"
            className={cn(companyFilter !== "all" && "text-primary")}
          >
            {companyFilter === "all"
              ? "Company"
              : `Company: ${companies.find((c) => c.id === companyFilter)?.name ?? companyFilter}`}
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All companies</SelectItem>
          {companies.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FilterBar>
  );
}
