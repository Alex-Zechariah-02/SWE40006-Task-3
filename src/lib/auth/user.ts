import "server-only";

import type { Session } from "next-auth";

import { prisma } from "@/lib/prisma";

/**
 * Resolve the database user id for an authenticated session.
 *
 * Note: we intentionally keep the same semantics as the existing pages:
 * - pages already ensured "some identity" via getSessionOrRedirect()
 * - if the session lacks an email (or the user row was deleted), callers decide
 *   whether to render null vs notFound()
 */
export async function getUserIdFromSessionOrNull(
  session: Session
): Promise<string | null> {
  const email = session.user?.email ?? "";
  if (!email) return null;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  return user?.id ?? null;
}

