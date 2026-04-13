import { NextResponse } from "next/server";

import { requireUserOrResponse } from "@/lib/api/auth";
import { jsonError } from "@/lib/api/errors";
import { readJsonOrResponse } from "@/lib/api/json";
import { validateOrResponse } from "@/lib/api/validation";
import { interviewUpdateSchema } from "@/lib/validation/interview";
import { updateInterview, deleteInterview } from "@/lib/db/interviews";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  const authed = await requireUserOrResponse();
  if (!authed.ok) return authed.response;

  const { id } = await context.params;

  const body = await readJsonOrResponse(req);
  if (!body.ok) return body.response;
  const json = body.json;

  const parsed = validateOrResponse(interviewUpdateSchema, json, {
    message: "Validation failed.",
    includeFieldErrors: true,
  });
  if (!parsed.ok) return parsed.response;

  try {
    const updated = await updateInterview(id, authed.user.id, {
      interviewType: parsed.data.interviewType,
      scheduledAt: parsed.data.scheduledAt,
      locationOrLink: parsed.data.locationOrLink === "" ? null : parsed.data.locationOrLink,
      status: parsed.data.status,
      notes: parsed.data.notes,
    });
    return NextResponse.json({ interview: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Interview not found or update failed.";
    return jsonError(message, 404);
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  const authed = await requireUserOrResponse();
  if (!authed.ok) return authed.response;

  const { id } = await context.params;

  try {
    await deleteInterview(id, authed.user.id);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Interview not found.";
    return jsonError(message, 404);
  }
}
