import Link from "next/link";
import { FileX } from "lucide-react";

export default function CompanyNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <FileX className="size-12 text-muted-foreground" />
      <div className="space-y-1">
        <h1 className="type-h3 font-display">Company not found</h1>
        <p className="type-body text-muted-foreground">
          This company doesn&apos;t exist or has been removed.
        </p>
      </div>
      <Link
        href="/app/companies"
        className="type-small text-primary hover:underline"
      >
        ← Back to companies
      </Link>
    </div>
  );
}
