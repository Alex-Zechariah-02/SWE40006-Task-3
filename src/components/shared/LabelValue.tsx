import { cn } from "@/lib/utils";

interface LabelValueProps {
  label: string;
  value: string;
  className?: string;
}

export function LabelValue({ label, value, className }: LabelValueProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="type-mono-label text-muted-foreground">{label}</span>
      <span className="type-mono-label text-muted-foreground/60">{"//"}</span>
      <span className="type-small">{value}</span>
    </span>
  );
}
