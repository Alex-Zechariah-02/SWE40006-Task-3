import Link from "next/link";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { cn } from "@/lib/utils";

interface TopNavProps {
  variant?: "public" | "app";
  userLabel?: string;
  className?: string;
}

export function TopNav({
  variant = "public",
  userLabel,
  className,
}: TopNavProps) {
  const brandHref = variant === "app" ? "/app" : "/";

  async function signOutAction() {
    "use server";
    const { signOut } = await import("../../../auth");
    await signOut({ redirectTo: "/login" });
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm",
        className
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          href={brandHref}
          className="type-h3 font-display font-normal tracking-tight"
        >
          CareerDeck
        </Link>

        <nav className="flex items-center gap-1">
          {variant === "public" && (
            <>
              <Link
                href="/search"
                className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                Search
              </Link>
              <Link
                href="/login"
                className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                Sign in
              </Link>
            </>
          )}

          {variant === "app" && (
            <>
              <Link
                href="/search"
                className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                Search
              </Link>
              <Link
                href="/app"
                className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                Dashboard
              </Link>
              <Link
                href="/app/applications"
                className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                Applications
              </Link>
              <Link
                href="/app/opportunities"
                className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                Opportunities
              </Link>
              <Link
                href="/app/companies"
                className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                Companies
              </Link>
              <Link
                href="/app/contacts"
                className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                Contacts
              </Link>
              <Link
                href="/app/actions"
                className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                Actions
              </Link>

              {userLabel && (
                <div className="ml-2 hidden max-w-[14rem] items-center rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground sm:flex">
                  <span className="truncate">{userLabel}</span>
                </div>
              )}

              <form action={signOutAction}>
                <button
                  type="submit"
                  className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  Sign out
                </button>
              </form>
            </>
          )}

          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
