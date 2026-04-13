import { NextResponse } from "next/server";

import { requireUserOrResponse } from "@/lib/api/auth";
import { jsonError } from "@/lib/api/errors";
import { readJsonOrResponse } from "@/lib/api/json";
import { validateOrResponse } from "@/lib/api/validation";
import { contactLinkSchema } from "@/lib/validation/application";
import {
  linkContactToApplication,
  unlinkContactFromApplication,
} from "@/lib/db/applications";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: Request, context: RouteContext) {
  const authed = await requireUserOrResponse();
  if (!authed.ok) return authed.response;

  const { id: applicationId } = await context.params;

  const body = await readJsonOrResponse(req);
  if (!body.ok) return body.response;
  const json = body.json;
  const record = json as Record<string, unknown>;

  const parsed = validateOrResponse(contactLinkSchema, {
    applicationId,
    contactId: record.contactId,
  }, {
    message: "Validation failed.",
    includeFieldErrors: true,
  });
  if (!parsed.ok) return parsed.response;

  try {
    await linkContactToApplication(
      parsed.data.applicationId,
      parsed.data.contactId,
      authed.user.id
    );
    return NextResponse.json({ linked: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to link contact.";
    return jsonError(message, 500);
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  const authed = await requireUserOrResponse();
  if (!authed.ok) return authed.response;

  const { id: applicationId } = await context.params;
  const { searchParams } = new URL(req.url);
  const contactId = searchParams.get("contactId");

  if (!contactId) {
    return NextResponse.json(
      { error: { message: "contactId is required." } },
      { status: 400 }
    );
  }

  try {
    await unlinkContactFromApplication(applicationId, contactId, authed.user.id);
    return NextResponse.json({ linked: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to unlink contact.";
    return jsonError(message, 500);
  }
}
