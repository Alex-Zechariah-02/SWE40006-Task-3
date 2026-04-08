import { NextResponse } from "next/server";

import { auth } from "../../../../../auth";
import { prisma } from "@/lib/prisma";
import { interviewUpdateSchema } from "@/lib/validation/interview";
import { updateInterview, deleteInterview } from "@/lib/db/interviews";

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

  const parsed = interviewUpdateSchema.safeParse(json);
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
    const updated = await updateInterview(id, user.id, {
      interviewType: parsed.data.interviewType,
      scheduledAt: parsed.data.scheduledAt,
      locationOrLink: parsed.data.locationOrLink === "" ? null : parsed.data.locationOrLink,
      status: parsed.data.status,
      notes: parsed.data.notes,
    });
    return NextResponse.json({ interview: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Interview not found or update failed.";
    return NextResponse.json({ error: { message } }, { status: 404 });
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
    await deleteInterview(id, user.id);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Interview not found.";
    return NextResponse.json({ error: { message } }, { status: 404 });
  }
}
