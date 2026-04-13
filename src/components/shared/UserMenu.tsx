"use client";

import { ChevronDown, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserMenuProps {
  label: string;
  email?: string | null;
  signOutAction: () => Promise<void>;
}

export function UserMenu({ label, email, signOutAction }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="Account menu" className="inline-flex max-w-[14rem] items-center gap-2 rounded-md border border-border bg-background px-3 py-3 sm:py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <span className="truncate">{label}</span>
        <ChevronDown className="size-3.5 shrink-0 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-56">
        <div className="border-b border-border px-3 py-2">
          <p className="truncate text-sm font-medium">{label}</p>
          {email && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {email}
            </p>
          )}
        </div>
        <div className="p-1">
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none select-none hover:bg-accent focus:bg-accent"
            >
              <LogOut className="size-4 opacity-60" />
              Sign out
            </button>
          </form>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
