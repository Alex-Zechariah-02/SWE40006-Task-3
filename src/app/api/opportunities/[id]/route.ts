import { NextResponse } from "next/server";

import { requireUserOrResponse } from "@/lib/api/auth";
import { readJsonOrResponse } from "@/lib/api/json";
import { validateOrResponse } from "@/lib/api/validation";
import { opportunityUpdateSchema } from "@/lib/validation/opportunity";
import {
  updateOpportunity,
  archiveOpportunity,
  unarchiveOpportunity,
  deleteOpportunity,
} from "@/lib/db/opportunities";

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

  // Handle archive/unarchive action
  if (actionBody.action === "archive") {
    try {
      await archiveOpportunity(id, authed.user.id);
      return NextResponse.json({ archived: true });
    } catch {
      return NextResponse.json(
        { error: { message: "Opportunity not found." } },
        { status: 404 }
      );
    }
  }

  if (actionBody.action === "unarchive") {
    try {
      await unarchiveOpportunity(id, authed.user.id);
      return NextResponse.json({ archived: false });
    } catch {
      return NextResponse.json(
        { error: { message: "Opportunity not found." } },
        { status: 404 }
      );
    }
  }

  const parsed = validateOrResponse(opportunityUpdateSchema, json, {
    message: "Validation failed.",
    includeFieldErrors: true,
  });
  if (!parsed.ok) return parsed.response;

  try {
    const updated = await updateOpportunity(id, authed.user.id, {
      title: parsed.data.title,
      opportunityType: parsed.data.opportunityType,
      remoteMode: parsed.data.remoteMode,
      stage: parsed.data.stage,
      location: parsed.data.location,
      sourceUrl: parsed.data.sourceUrl === "" ? null : parsed.data.sourceUrl,
      deadline: parsed.data.deadline === "" ? null : parsed.data.deadline,
      snippet: parsed.data.snippet,
      description: parsed.data.description,
      notes: parsed.data.notes,
      tags: parsed.data.tags,
    });
    return NextResponse.json({ opportunity: updated });
  } catch {
    return NextResponse.json(
      { error: { message: "Opportunity not found or update failed." } },
      { status: 404 }
    );
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  const authed = await requireUserOrResponse();
  if (!authed.ok) return authed.response;

  const { id } = await context.params;

  try {
    await deleteOpportunity(id, authed.user.id);
    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json(
      { error: { message: "Opportunity not found." } },
      { status: 404 }
    );
  }
}
