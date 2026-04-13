import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <p className="type-mono-label text-muted-foreground">404</p>
      <h1 className="type-display-lg font-display mt-2">Page not found</h1>
      <p className="mt-2 max-w-sm type-body text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-6 flex gap-3">
        <Button nativeButton={false} render={<Link href="/" />}>
          Home
        </Button>
        <Button variant="outline" nativeButton={false} render={<Link href="/search" />}>
          Search opportunities
        </Button>
      </div>
    </div>
  );
}
