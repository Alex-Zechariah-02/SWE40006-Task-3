import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface TagLaneProps extends HTMLAttributes<HTMLDivElement> {
  align?: "start" | "end";
  density?: "compact" | "regular";
}

export function TagLane({
  align = "start",
  density = "regular",
  className,
  ...props
}: TagLaneProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-wrap items-center",
        density === "compact" ? "gap-1.5" : "gap-2",
        align === "end" ? "justify-end" : "justify-start",
        className
      )}
      {...props}
    />
  );
}