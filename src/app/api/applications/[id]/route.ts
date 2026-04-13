import { NextResponse } from "next/server";

import { requireUserOrResponse } from "@/lib/api/auth";
import { readJsonOrResponse } from "@/lib/api/json";
import { validateOrResponse } from "@/lib/api/validation";
import { applicationUpdateSchema } from "@/lib/validation/application";
import { guardApplicationStageChange } from "@/lib/db/applications.stageGuards";
import {
  updateApplication,
  archiveApplication,
  unarchiveApplication,
  deleteApplication,
} from "@/lib/db/applications";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  const authed = await requireUserOrResponse();
  if (!authed.ok) return authed.response;

  const { id } = await context.params;

  const body = await readJsonOrResponse(req);
  if (!body.ok) return body.response;
  const json = body.json;
  const actionBody = json as Record<string, unknown>;

  if (actionBody.action === "archive") {
    try {
      await archiveApplication(id, authed.user.id);
      return NextResponse.json({ archived: true });
    } catch {
      return NextResponse.json(
        { error: { message: "Application not found." } },
        { status: 404 }
      );
    }
  }

  if (actionBody.action === "unarchive") {
    try {
      await unarchiveApplication(id, authed.user.id);
      return NextResponse.json({ archived: false });
    } catch {
      return NextResponse.json(
        { error: { message: "Application not found." } },
        { status: 404 }
      );
    }
  }

  const parsed = validateOrResponse(applicationUpdateSchema, json, {
    message: "Validation failed.",
    includeFieldErrors: true,
  });
  if (!parsed.ok) return parsed.response;

  if (parsed.data.currentStage) {
    const guard = await guardApplicationStageChange({
      applicationId: id,
      userId: authed.user.id,
      nextStage: parsed.data.currentStage,
    });

    if (!guard.ok) {
      return NextResponse.json(
        {
          error: { message: guard.message },
        },
        { status: guard.status }
      );
    }
  }

  try {
    const updated = await updateApplication(id, authed.user.id, {
      currentStage: parsed.data.currentStage,
      priority: parsed.data.priority,
      appliedDate: parsed.data.appliedDate === "" ? null : parsed.data.appliedDate,
      statusNotes: parsed.data.statusNotes,
      tags: parsed.data.tags,
    });
    return NextResponse.json({ application: updated });
  } catch {
    return NextResponse.json(
      { error: { message: "Application not found or update failed." } },
      { status: 404 }
    );
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  const authed = await requireUserOrResponse();
  if (!authed.ok) return authed.response;

  const { id } = await context.params;

  try {
    await deleteApplication(id, authed.user.id);
    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json(
      { error: { message: "Application not found." } },
      { status: 404 }
    );
  }
}
