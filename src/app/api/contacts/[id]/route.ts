import { NextResponse } from "next/server";

import { requireUserOrResponse } from "@/lib/api/auth";
import { readJsonOrResponse } from "@/lib/api/json";
import { validateOrResponse } from "@/lib/api/validation";
import { contactUpdateSchema } from "@/lib/validation/contact";
import { updateContact, deleteContact } from "@/lib/db/contacts";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  const authed = await requireUserOrResponse();
  if (!authed.ok) return authed.response;

  const { id } = await context.params;

  const body = await readJsonOrResponse(req);
  if (!body.ok) return body.response;
  const json = body.json;

  const parsed = validateOrResponse(contactUpdateSchema, json, {
    message: "Validation failed.",
    includeFieldErrors: true,
  });
  if (!parsed.ok) return parsed.response;

  try {
    const updated = await updateContact(id, authed.user.id, {
      name: parsed.data.name,
      title: parsed.data.title,
      email: parsed.data.email === "" ? null : parsed.data.email,
      phone: parsed.data.phone,
      linkedinUrl:
        parsed.data.linkedinUrl === "" ? null : parsed.data.linkedinUrl,
      notes: parsed.data.notes,
    });
    return NextResponse.json({ contact: updated });
  } catch {
    return NextResponse.json(
      { error: { message: "Contact not found or update failed." } },
      { status: 404 }
    );
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  const authed = await requireUserOrResponse();
  if (!authed.ok) return authed.response;

  const { id } = await context.params;

  try {
    await deleteContact(id, authed.user.id);
    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json(
      { error: { message: "Contact not found." } },
      { status: 404 }
    );
  }
}
