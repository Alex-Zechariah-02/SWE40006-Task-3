import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api/errors";
import { readJsonOrResponse } from "@/lib/api/json";
import { validateOrResponse } from "@/lib/api/validation";
import { registerSchema } from "@/lib/validation/auth";
import { createUser } from "@/lib/db/users";
import { createTokenBucketLimiter } from "@/lib/security/rateLimit";
 
export const runtime = "nodejs";

const registerLimiter = createTokenBucketLimiter("auth_register", {
  capacity: 3,
  refillMs: 10 * 60 * 1000,
  maxEntries: 2000,
  evictOlderThanMs: 60 * 60 * 1000,
});

function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  const xRealIp = req.headers.get("x-real-ip");
  if (xRealIp) return xRealIp.trim();
  return "unknown";
}

export async function POST(req: Request) {
  if (!registerLimiter.allow(clientIp(req))) {
    return jsonError(
      "Too many registration attempts. Please wait a moment and try again.",
      429
    );
  }

  const body = await readJsonOrResponse(req);
  if (!body.ok) return body.response;

  const parsed = validateOrResponse(registerSchema, body.json, {
    message: "Validation failed.",
    includeFieldErrors: true,
  });
  if (!parsed.ok) return parsed.response;

  try {
    const user = await createUser({
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
    });

    return NextResponse.json({ user: { id: user.id } }, { status: 201 });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        {
          error: {
            message: "An account with this email already exists.",
            fields: { email: ["An account with this email already exists."] },
          },
        },
        { status: 409 }
      );
    }

    return jsonError("Registration failed. Please try again.", 500);
  }
}
