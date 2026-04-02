import Link from "next/link";
import { Search } from "lucide-react";

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-20">
      <h1 className="type-display-xl font-display tracking-tight">
        Your career pipeline, organized.
      </h1>
      <p className="mt-4 max-w-xl type-body text-muted-foreground">
        Track opportunities, manage applications, and stay on top of your job
        search with a structured workspace built for early-career professionals.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/search"
          className="inline-flex h-8 items-center justify-center gap-2 rounded-lg border border-transparent bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Search className="h-4 w-4" />
          Search opportunities
        </Link>
        <Link
          href="/login"
          className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
