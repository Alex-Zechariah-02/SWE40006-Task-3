"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function ScrollHeader({
  className,
  children,
  ...props
}: React.ComponentProps<"header">) {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-scrolled={scrolled}
      className={cn(
        "transition-shadow duration-150 data-[scrolled=true]:shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </header>
  );
}
