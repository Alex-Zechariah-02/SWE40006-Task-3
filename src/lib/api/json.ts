import "server-only";

import type { NextResponse } from "next/server";

import { jsonError } from "./errors";

export type JsonReadResult =
  | { ok: true; json: unknown }
  | { ok: false; response: NextResponse };

export async function readJsonOrResponse(req: Request): Promise<JsonReadResult> {
  // Basic CSRF mitigation: modern browsers send `sec-fetch-site`.
  // We only block when it is explicitly cross-site to avoid breaking non-browser clients.
  const fetchSite = req.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") {
    return { ok: false, response: jsonError("Cross-site requests are not allowed.", 403) };
  }

  try {
    const json = await req.json();
    return { ok: true, json };
  } catch {
    return { ok: false, response: jsonError("Invalid request body.", 400) };
  }
}
