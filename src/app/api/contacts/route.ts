import { NextResponse } from "next/server";

import { requireUserOrResponse } from "@/lib/api/auth";
import { readJsonOrResponse } from "@/lib/api/json";
import { validateOrResponse } from "@/lib/api/validation";
import { contactCreateSchema } from "@/lib/validation/contact";
import { createContact } from "@/lib/db/contacts";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const authed = await requireUserOrResponse();
  if (!authed.ok) return authed.response;

  const body = await readJsonOrResponse(req);
  if (!body.ok) return body.response;

  const parsed = validateOrResponse(contactCreateSchema, body.json, {
    message: "Validation failed.",
    includeFieldErrors: true,
  });
  if (!parsed.ok) return parsed.response;

  try {
    const contact = await createContact(authed.user.id, {
      companyId: parsed.data.companyId,
      name: parsed.data.name,
      title: parsed.data.title,
      email: parsed.data.email || undefined,
      phone: parsed.data.phone,
      linkedinUrl: parsed.data.linkedinUrl || undefined,
      notes: parsed.data.notes,
    });

    return NextResponse.json({ contact: { id: contact.id } }, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to create contact.";
    return NextResponse.json(
      { error: { message } },
      { status: message.includes("not found") ? 404 : 500 }
    );
  }
}
