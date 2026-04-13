import { NextResponse } from "next/server";

import { requireUserOrResponse } from "@/lib/api/auth";
import { jsonError } from "@/lib/api/errors";
import { readJsonOrResponse } from "@/lib/api/json";
import { validateOrResponse } from "@/lib/api/validation";
import { actionItemCreateSchema } from "@/lib/validation/action";
import { createActionItem } from "@/lib/db/actions";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const authed = await requireUserOrResponse();
  if (!authed.ok) return authed.response;

  const body = await readJsonOrResponse(req);
  if (!body.ok) return body.response;

  const parsed = validateOrResponse(actionItemCreateSchema, body.json, {
    message: "Validation failed.",
    includeFieldErrors: true,
  });
  if (!parsed.ok) return parsed.response;

  try {
    const actionItem = await createActionItem(authed.user.id, {
      title: parsed.data.title,
      description: parsed.data.description,
      dueAt: parsed.data.dueAt || undefined,
      priority: parsed.data.priority,
      status: parsed.data.status,
      companyId: parsed.data.companyId,
      opportunityId: parsed.data.opportunityId,
      applicationId: parsed.data.applicationId,
      interviewId: parsed.data.interviewId,
    });
    return NextResponse.json({ actionItem }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create action item.";
    return jsonError(message, 500);
  }
}
