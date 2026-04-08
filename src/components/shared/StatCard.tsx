import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  className?: string;
  href?: string;
  onClick?: () => void;
  interactive?: boolean;
  icon?: LucideIcon;
}

export function StatCard({
  label,
  value,
  delta,
  className,
  href,
  onClick,
  interactive = false,
  icon: Icon,
}: StatCardProps) {
  const content = (
    <Card
      className={cn(
        "gap-2",
        interactive &&
          "cursor-pointer transition-colors hover:bg-muted/50",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="pt-1">
        <div className="flex items-center gap-2">
          {Icon && (
            <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
          )}
          <span className="type-mono-label text-muted-foreground">{label}</span>
        </div>
        <p className="type-display-lg font-semibold tabular-nums">{value}</p>
        {delta && (
          <span className="type-small text-muted-foreground">{delta}</span>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
