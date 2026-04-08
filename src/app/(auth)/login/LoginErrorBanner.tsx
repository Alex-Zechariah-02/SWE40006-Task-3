"use client";

import { useSearchParams } from "next/navigation";

export function LoginErrorBanner() {
  const searchParams = useSearchParams();
  const errors = searchParams.getAll("error");
  const hasCredentialError = errors.some((value) =>
    value.includes("CredentialsSignin")
  );

  if (!hasCredentialError) return null;

  return (
    <div
      role="status"
      className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
    >
      Invalid email or password.
    </div>
  );
}

