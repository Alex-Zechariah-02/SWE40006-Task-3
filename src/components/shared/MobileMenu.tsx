"use client";

import * as React from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileMenu({ children, className }: MobileMenuProps) {
  const [open, setOpen] = React.useState(false);

  // Close on route change (clicks on links inside the menu)
  const handleContentClick = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      if (target.closest("a") || target.closest("button[type='submit']")) {
        setOpen(false);
      }
    },
    []
  );

  // Close on Escape
  React.useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center justify-center size-10 rounded-md text-muted-foreground transition-colors",
          "hover:bg-accent hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className
        )}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 top-16 z-50 border-b border-border bg-background/95 shadow-lg backdrop-blur-sm"
          onClick={handleContentClick}
        >
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {children}
          </nav>
        </div>
      )}
    </>
  );
}
