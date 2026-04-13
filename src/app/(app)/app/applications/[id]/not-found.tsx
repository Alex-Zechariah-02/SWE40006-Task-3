import Link from "next/link";
import { FileX } from "lucide-react";

export default function ApplicationNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <FileX className="size-12 text-muted-foreground" />
      <div className="space-y-1">
        <h1 className="type-h3 font-display">Application not found</h1>
        <p className="type-body text-muted-foreground">
          This application doesn&apos;t exist or has been removed.
        </p>
      </div>
      <Link
        href="/app/applications"
        className="type-small text-primary hover:underline"
      >
        ← Back to applications
      </Link>
    </div>
  );
}
