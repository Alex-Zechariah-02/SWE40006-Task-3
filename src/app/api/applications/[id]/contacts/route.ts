import { NextResponse } from "next/server";

import { auth } from "../../../../../../auth";
import { prisma } from "@/lib/prisma";
import { contactLinkSchema } from "@/lib/validation/application";
import {
  linkContactToApplication,
  unlinkContactFromApplication,
} from "@/lib/db/applications";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: Request, context: RouteContext) {
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

  const { id: applicationId } = await context.params;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { error: { message: "Invalid request body." } },
      { status: 400 }
    );
  }

  const body = json as Record<string, unknown>;
  const parsed = contactLinkSchema.safeParse({
    applicationId,
    contactId: body.contactId,
  });

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
    await linkContactToApplication(
      parsed.data.applicationId,
      parsed.data.contactId,
      user.id
    );
    return NextResponse.json({ linked: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to link contact.";
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: RouteContext) {
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
    await unlinkContactFromApplication(applicationId, contactId, user.id);
    return NextResponse.json({ linked: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to unlink contact.";
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
