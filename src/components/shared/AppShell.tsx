import { cn } from "@/lib/utils";

interface AppShellProps {
  nav?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function AppShell({ nav, children, className }: AppShellProps) {
  return (
    <div className={cn("flex min-h-screen flex-col bg-background", className)}>
      {nav}
      <main className="flex-1">{children}</main>
    </div>
  );
}
