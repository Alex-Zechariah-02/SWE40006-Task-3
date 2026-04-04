import { NextResponse } from "next/server";

import { auth } from "../../../../auth";
import { prisma } from "@/lib/prisma";
import { contactCreateSchema } from "@/lib/validation/contact";
import { createContact } from "@/lib/db/contacts";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json(
      { error: { message: "You must be signed in." } },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json(
      { error: { message: "Account not found." } },
      { status: 401 }
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { error: { message: "Invalid request body." } },
      { status: 400 }
    );
  }

  const parsed = contactCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          message: "Validation failed.",
          fields: parsed.error.flatten().fieldErrors,
        },
      },
      { status: 400 }
    );
  }

  try {
    const contact = await createContact(user.id, {
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
