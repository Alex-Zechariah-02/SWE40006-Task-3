import { NextResponse } from "next/server";

import { requireUserOrResponse } from "@/lib/api/auth";
import { jsonError } from "@/lib/api/errors";
import { readJsonOrResponse } from "@/lib/api/json";
import { validateOrResponse } from "@/lib/api/validation";
import { interviewCreateSchema } from "@/lib/validation/interview";
import { createInterview } from "@/lib/db/interviews";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const authed = await requireUserOrResponse();
  if (!authed.ok) return authed.response;

  const body = await readJsonOrResponse(req);
  if (!body.ok) return body.response;

  const parsed = validateOrResponse(interviewCreateSchema, body.json, {
    message: "Validation failed.",
    includeFieldErrors: true,
  });
  if (!parsed.ok) return parsed.response;

  try {
    const interview = await createInterview(authed.user.id, {
      applicationId: parsed.data.applicationId,
      interviewType: parsed.data.interviewType,
      scheduledAt: parsed.data.scheduledAt,
      locationOrLink: parsed.data.locationOrLink,
      status: parsed.data.status,
      notes: parsed.data.notes,
    });
    return NextResponse.json({ interview }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create interview.";
    return jsonError(message, 500);
  }
}
