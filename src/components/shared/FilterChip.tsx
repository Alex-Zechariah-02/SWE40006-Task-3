import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterChipProps {
  label: string;
  onRemove: () => void;
  className?: string;
}

export function FilterChip({ label, onRemove, className }: FilterChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm bg-secondary px-2 py-1 type-badge text-secondary-foreground transition-colors duration-150",
        className
      )}
    >
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="ml-1 rounded-sm p-1 hover:bg-muted-foreground/20 transition-colors duration-100"
        aria-label={`Remove ${label} filter`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
