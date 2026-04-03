import Link from "next/link";
import { Search } from "lucide-react";

const BENEFITS = [
  {
    label: "DISCOVER",
    description:
      "Search internships, graduate programs, and early-career roles from across the web.",
  },
  {
    label: "TRACK",
    description:
      "Manage applications, interviews, and action items in one structured workspace.",
  },
  {
    label: "PROGRESS",
    description:
      "Turn opportunities into offers. Stay organized from first contact to offer stage.",
  },
];

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6">
      {/* Hero */}
      <section className="py-20">
        <h1 className="type-display-xl font-display tracking-tight text-balance max-w-2xl">
          Your career pipeline, organized.
        </h1>
        <p className="mt-4 max-w-xl type-body text-muted-foreground text-pretty">
          Track opportunities, manage applications, and stay on top of your job
          search with a structured workspace built for early-career professionals.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/search"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Search className="h-4 w-4" aria-hidden />
            Search opportunities
          </Link>
          <Link
            href="/login"
            className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* Benefit summary */}
      <section className="border-t border-border py-12">
        <div className="flex flex-col gap-8 max-w-lg">
          {BENEFITS.map(({ label, description }) => (
            <div key={label}>
              <div className="type-mono-label text-primary mb-1.5">{label}</div>
              <p className="type-body text-muted-foreground text-pretty">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="flex items-center justify-between gap-4">
          <p className="type-small text-muted-foreground">
            © {new Date().getFullYear()} CareerDeck
          </p>
          <Link
            href="/login"
            className="type-small text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign in
          </Link>
        </div>
      </footer>
    </div>
  );
}
