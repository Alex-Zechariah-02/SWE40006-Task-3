import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<string, string> = {
  Internship: "Internship",
  GraduateProgram: "Graduate Program",
  FullTime: "Full-time",
  PartTime: "Part-time",
  Contract: "Contract",
};

interface TypeBadgeProps {
  type: string;
  className?: string;
}

export function TypeBadge({ type, className }: TypeBadgeProps) {
  const label = TYPE_LABELS[type] ?? type;

  return (
    <Badge variant="outline" className={cn(className)}>
      {label}
    </Badge>
  );
}
