import { NextResponse } from "next/server";

import { auth } from "../../../../../auth";
import { prisma } from "@/lib/prisma";
import { contactUpdateSchema } from "@/lib/validation/contact";
import { updateContact, deleteContact } from "@/lib/db/contacts";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
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

  const { id } = await context.params;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { error: { message: "Invalid request body." } },
      { status: 400 }
    );
  }

  const parsed = contactUpdateSchema.safeParse(json);
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
    const updated = await updateContact(id, user.id, {
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

  const { id } = await context.params;

  try {
    await deleteContact(id, user.id);
    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json(
      { error: { message: "Contact not found." } },
      { status: 404 }
    );
  }
}
