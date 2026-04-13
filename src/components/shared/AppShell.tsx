import { cn } from "@/lib/utils";
import { AppFooter } from "./AppFooter";

interface AppShellProps {
  nav?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function AppShell({ nav, children, className }: AppShellProps) {
  return (
    <div className={cn("flex min-h-screen flex-col bg-background", className)}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg"
      >
        Skip to main content
      </a>
      {nav}
      <main id="main-content" className="flex-1">{children}</main>
      <AppFooter />
    </div>
  );
}
