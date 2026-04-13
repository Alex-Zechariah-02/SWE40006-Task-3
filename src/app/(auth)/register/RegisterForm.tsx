"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterForm({ next }: { next: string | null }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setErrors({});
    setGeneralError(null);

    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get("name") as string,
      email: form.get("email") as string,
      password: form.get("password") as string,
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        if (data?.error?.fields) {
          setErrors(data.error.fields);
        }
        setGeneralError(
          data?.error?.message || "Registration failed. Please try again."
        );
        setPending(false);
        return;
      }

      router.push(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
    } catch {
      setGeneralError("Something went wrong. Please try again.");
      setPending(false);
    }
  }

  return (
    <div className="animate-enter space-y-6">
      <div className="text-center space-y-1">
        <h1 className="type-display-lg font-bold">CareerDeck</h1>
        <p className="type-emphasis text-muted-foreground">
          Track your career pipeline
        </p>
      </div>

      <Card className="p-6">
        <CardHeader>
          <CardTitle className="type-h2 font-display">
            Create account
          </CardTitle>
          <CardDescription className="type-body">
            Sign up to start tracking your opportunities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {generalError && (
            <div
              className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-destructive type-small"
              role="alert"
            >
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="type-small font-medium">
                Name
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder="Your name"
                className="h-10"
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && (
                <p id="name-error" className="type-small text-destructive">
                  {errors.name[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="type-small font-medium">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                className="h-10"
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p id="email-error" className="type-small text-destructive">
                  {errors.email[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="type-small font-medium">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                placeholder="At least 8 characters"
                className="h-10"
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              {errors.password && (
                <p id="password-error" className="type-small text-destructive">
                  {errors.password[0]}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full h-10" disabled={pending}>
              {pending ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className="mt-4 text-center type-small text-muted-foreground">
            Already have an account?{" "}
            <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="text-primary underline underline-offset-4 hover:text-primary/80">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
