import { NextResponse } from "next/server";
import { z } from "zod";

import { requireUserOrResponse } from "@/lib/api/auth";
import { jsonError } from "@/lib/api/errors";
import { readJsonOrResponse } from "@/lib/api/json";
import { validateOrResponse } from "@/lib/api/validation";
import {
  importOpportunityFromProvider,
  OpportunityImportFailedError,
} from "@/lib/db/opportunities.import";

export const runtime = "nodejs";

const payloadSchema = z.object({
  title: z.string().trim().min(1).max(200),
  companyName: z.string().trim().min(1).max(200),
  location: z.string().trim().min(1).max(200),
  remoteMode: z.string().trim().optional(),
  opportunityType: z.string().trim().optional(),
  sourceUrl: z.string().trim().url(),
  sourceProvider: z.string().trim().min(1).max(40),
  snippet: z.string().trim().max(2000).optional(),
  postedDate: z.string().trim().max(40).optional(),
  confidence: z.number().optional(),
  rawProviderPayload: z.unknown().optional(),
});

export async function POST(req: Request) {
  const authed = await requireUserOrResponse({
    signedInMessage: "You must be signed in to import an opportunity.",
  });
  if (!authed.ok) return authed.response;

  const body = await readJsonOrResponse(req);
  if (!body.ok) return body.response;

  const parsed = validateOrResponse(payloadSchema, body.json, {
    message: "The saved opportunity is invalid. Try saving it again.",
    includeFieldErrors: false,
  });
  if (!parsed.ok) return parsed.response;

  try {
    const result = await importOpportunityFromProvider(authed.user.id, parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    if (!(error instanceof OpportunityImportFailedError)) {
      throw error;
    }
    return jsonError("Import failed. Please try again.", 500);
  }
}
