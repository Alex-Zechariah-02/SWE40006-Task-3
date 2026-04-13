import { NextResponse } from "next/server";

import { requireUserOrResponse } from "@/lib/api/auth";
import { jsonError } from "@/lib/api/errors";
import { readJsonOrResponse } from "@/lib/api/json";
import { validateOrResponse } from "@/lib/api/validation";
import { rejectionDetailCreateSchema, rejectionDetailUpdateSchema } from "@/lib/validation/application";
import { createRejectionDetail, deleteRejectionDetail, updateRejectionDetail } from "@/lib/db/applications";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: Request, context: RouteContext) {
  const authed = await requireUserOrResponse();
  if (!authed.ok) return authed.response;

  const { id: applicationId } = await context.params;

  const body = await readJsonOrResponse(req);
  if (!body.ok) return body.response;
  const json = body.json;

  const parsed = validateOrResponse(rejectionDetailCreateSchema, {
    applicationId,
    ...(json as Record<string, unknown>),
  }, {
    message: "Validation failed.",
    includeFieldErrors: true,
  });
  if (!parsed.ok) return parsed.response;

  try {
    const rejectionDetail = await createRejectionDetail(applicationId, authed.user.id, {
      rejectionDate: parsed.data.rejectionDate || undefined,
      rejectedAtStage: parsed.data.rejectedAtStage,
      notes: parsed.data.notes,
    });
    return NextResponse.json({ rejectionDetail }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create rejection detail.";
    return jsonError(message, 500);
  }
}

export async function PATCH(req: Request, context: RouteContext) {
  const authed = await requireUserOrResponse();
  if (!authed.ok) return authed.response;

  const { id: applicationId } = await context.params;

  const body = await readJsonOrResponse(req);
  if (!body.ok) return body.response;
  const json = body.json;

  const parsed = validateOrResponse(rejectionDetailUpdateSchema, json, {
    message: "Validation failed.",
    includeFieldErrors: true,
  });
  if (!parsed.ok) return parsed.response;

  try {
    const updated = await updateRejectionDetail(applicationId, authed.user.id, {
      rejectionDate: parsed.data.rejectionDate === "" ? null : parsed.data.rejectionDate,
      rejectedAtStage: parsed.data.rejectedAtStage,
      notes: parsed.data.notes,
    });
    return NextResponse.json({ rejectionDetail: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Rejection detail not found or update failed.";
    return jsonError(message, 404);
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  const authed = await requireUserOrResponse();
  if (!authed.ok) return authed.response;

  const { id: applicationId } = await context.params;

  try {
    await deleteRejectionDetail(applicationId, authed.user.id);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Rejection detail not found or delete failed.";
    return jsonError(message, 404);
  }
}
