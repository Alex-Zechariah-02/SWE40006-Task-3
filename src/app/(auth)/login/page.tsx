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

function safeNextPath(value: unknown): string {
  if (typeof value !== "string") return "/app";
  if (!value.startsWith("/")) return "/app";
  if (value.startsWith("//")) return "/app";
  if (value.includes("://")) return "/app";
  return value;
}

function authErrorMessage(value: unknown): string | null {
  if (value !== "CredentialsSignin") return null;
  return "Invalid email or password.";
}

export default function Page({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const nextPath = safeNextPath(searchParams?.next);
  const errorMessage = authErrorMessage(searchParams?.error);

  async function authenticate(formData: FormData) {
    "use server";
    await signIn("credentials", formData);
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
        {errorMessage && (
          <div
            role="status"
            className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {errorMessage}
          </div>
        )}

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
