import "server-only";

import { NextResponse } from "next/server";

export function jsonError(
  message: string,
  status: number,
  extra?: Record<string, unknown>
) {
  return NextResponse.json({ error: { message }, ...(extra ?? {}) }, { status });
}

