import Link from "next/link";
import { NavLink } from "@/components/shared/NavLink";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { MobileMenu } from "@/components/shared/MobileMenu";
import { ScrollHeader } from "@/components/shared/ScrollHeader";
import { UserMenu } from "@/components/shared/UserMenu";
import { cn } from "@/lib/utils";

interface TopNavProps {
  variant?: "public" | "app";
  userLabel?: string;
  userEmail?: string | null;
  className?: string;
}

export function TopNav({
  variant = "public",
  userLabel,
  userEmail,
  className,
}: TopNavProps) {
  const brandHref = variant === "app" ? "/app" : "/";

  async function signOutAction() {
    "use server";
    const { signOut } = await import("../../../auth");
    await signOut({ redirectTo: "/login" });
  }

  const signOutButton = (
    <form action={signOutAction}>
      <button
        type="submit"
        className="rounded-md px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:py-2"
      >
        Sign out
      </button>
    </form>
  );

  return (
    <ScrollHeader
      className={cn(
        "sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm",
        className
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:gap-6 sm:px-6">
        <Link
          href={brandHref}
          className="type-h3 font-display font-normal tracking-tight"
        >
          CareerDeck
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {variant === "public" && (
            <>
              <div className="flex-1" />
              <NavLink href="/search">Search</NavLink>
              <NavLink href="/login">Sign in</NavLink>
            </>
          )}

          {variant === "app" && (
            <>
              {/* Primary group */}
              <NavLink href="/app" exact>Dashboard</NavLink>
              <NavLink href="/app/applications">Applications</NavLink>
              <NavLink href="/app/opportunities">Opportunities</NavLink>

              {/* Separator */}
              <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />

              {/* Secondary group */}
              <NavLink href="/app/companies">Companies</NavLink>
              <NavLink href="/app/contacts">Contacts</NavLink>
              <NavLink href="/app/actions">Actions</NavLink>

              {/* Spacer pushes utility group right */}
              <div className="flex-1" />

              {/* Utility group */}
              <NavLink href="/search">Search</NavLink>

              {userLabel ? (
                <UserMenu
                  label={userLabel}
                  email={userEmail}
                  signOutAction={signOutAction}
                />
              ) : (
                signOutButton
              )}
            </>
          )}

          <ThemeToggle />
        </nav>

        {/* ── Mobile nav ── */}
        <div className="flex flex-1 items-center justify-end gap-1 md:hidden">
          <ThemeToggle />

          {variant === "public" && (
            <MobileMenu>
              <NavLink href="/search">Search</NavLink>
              <NavLink href="/login">Sign in</NavLink>
            </MobileMenu>
          )}

          {variant === "app" && (
            <MobileMenu>
              <NavLink href="/search">Search</NavLink>
              <NavLink href="/app" exact>Dashboard</NavLink>
              <NavLink href="/app/applications">Applications</NavLink>
              <NavLink href="/app/opportunities">Opportunities</NavLink>
              <NavLink href="/app/companies">Companies</NavLink>
              <NavLink href="/app/contacts">Contacts</NavLink>
              <NavLink href="/app/actions">Actions</NavLink>
              {signOutButton}
            </MobileMenu>
          )}
        </div>
      </div>
    </ScrollHeader>
  );
}
