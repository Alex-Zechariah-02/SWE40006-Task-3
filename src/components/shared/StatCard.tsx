import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  className?: string;
}

export function StatCard({ label, value, delta, className }: StatCardProps) {
  return (
    <Card className={cn("gap-2", className)}>
      <CardContent className="pt-1">
        <span className="type-mono-label text-muted-foreground">{label}</span>
        <p className="type-display-lg font-semibold tabular-nums">{value}</p>
        {delta && (
          <span className="type-small text-muted-foreground">{delta}</span>
        )}
      </CardContent>
    </Card>
  );
}
