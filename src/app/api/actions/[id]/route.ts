import { NextResponse } from "next/server";

import { requireUserOrResponse } from "@/lib/api/auth";
import { jsonError } from "@/lib/api/errors";
import { readJsonOrResponse } from "@/lib/api/json";
import { validateOrResponse } from "@/lib/api/validation";
import { actionItemUpdateSchema } from "@/lib/validation/action";
import { updateActionItem, deleteActionItem } from "@/lib/db/actions";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  const authed = await requireUserOrResponse();
  if (!authed.ok) return authed.response;

  const { id } = await context.params;

  const body = await readJsonOrResponse(req);
  if (!body.ok) return body.response;
  const json = body.json;

  const parsed = validateOrResponse(actionItemUpdateSchema, json, {
    message: "Validation failed.",
    includeFieldErrors: true,
  });
  if (!parsed.ok) return parsed.response;

  try {
    const updated = await updateActionItem(id, authed.user.id, {
      title: parsed.data.title,
      description: parsed.data.description,
      dueAt: parsed.data.dueAt === "" ? null : parsed.data.dueAt,
      priority: parsed.data.priority,
      status: parsed.data.status,
    });
    return NextResponse.json({ actionItem: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Action item not found or update failed.";
    return jsonError(message, 404);
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  const authed = await requireUserOrResponse();
  if (!authed.ok) return authed.response;

  const { id } = await context.params;

  try {
    await deleteActionItem(id, authed.user.id);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Action item not found.";
    return jsonError(message, 404);
  }
}
