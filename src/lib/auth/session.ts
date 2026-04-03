import "server-only";

import type { Session } from "next-auth";
import { redirect } from "next/navigation";

import { auth } from "../../../auth";

export async function getSessionOrRedirect(
  nextPath: string = "/app"
): Promise<Session> {
  const session = await auth();

  const hasIdentity = Boolean(session?.user?.email || session?.user?.name);

  if (!hasIdentity) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  return session as Session;
}
