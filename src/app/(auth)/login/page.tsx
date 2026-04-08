import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signIn } from "../../../../auth";
import { redirect } from "next/navigation";
import { LoginErrorBanner } from "./LoginErrorBanner";

export const dynamic = "force-dynamic";

function safeNextPath(value: unknown): string {
  if (typeof value !== "string") return "/app";
  // Next.js `searchParams` is usually decoded, but tolerate percent-encoded values
  // (for example `%2Fapp%2Fopportunities`) to avoid silently discarding safe paths.
  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    // ignore malformed encoding and fall back to the raw string
  }

  if (!decoded.startsWith("/")) return "/app";
  if (decoded.startsWith("//")) return "/app";
  if (decoded.includes("://")) return "/app";
  return decoded;
}

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const nextRaw = resolvedSearchParams.next;
  const nextValue = Array.isArray(nextRaw) ? nextRaw[0] : nextRaw;
  const nextPath = safeNextPath(nextValue);

  async function authenticate(formData: FormData) {
    "use server";
    try {
      await signIn("credentials", formData);
    } catch (err) {
      const type =
        typeof err === "object" && err !== null && "type" in err
          ? String((err as { type?: unknown }).type)
          : null;

      if (type === "CredentialsSignin") {
        redirect(
          `/login?next=${encodeURIComponent(nextPath)}&error=CredentialsSignin`
        );
      }

      throw err;
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="type-h2">Sign in</CardTitle>
        <CardDescription>
          Enter your credentials to access your workspace.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginErrorBanner />

        <form action={authenticate} className="space-y-4">
          <input type="hidden" name="redirectTo" value={nextPath} />

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Sign in
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
