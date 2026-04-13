import "server-only";

import type { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { auth } from "../../../auth";
import { jsonError } from "./errors";

export type RequireUserResult =
  | { ok: true; user: { id: string; email: string; name: string } }
  | { ok: false; response: NextResponse };

type RequireUserOptions = {
  signedInMessage?: string;
  accountNotFoundMessage?: string;
};

export async function requireUserOrResponse(
  options: RequireUserOptions = {}
): Promise<RequireUserResult> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    return {
      ok: false,
      response: jsonError(options.signedInMessage ?? "You must be signed in.", 401),
    };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true },
  });

  if (!user) {
    return {
      ok: false,
      response: jsonError(options.accountNotFoundMessage ?? "Account not found.", 401),
    };
  }

  return { ok: true, user };
}

