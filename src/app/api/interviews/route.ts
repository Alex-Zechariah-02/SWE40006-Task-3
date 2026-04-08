import { NextResponse } from "next/server";

import { auth } from "../../../../auth";
import { prisma } from "@/lib/prisma";
import { interviewCreateSchema } from "@/lib/validation/interview";
import { createInterview } from "@/lib/db/interviews";

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

  const parsed = interviewCreateSchema.safeParse(json);
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
    const interview = await createInterview(user.id, {
      applicationId: parsed.data.applicationId,
      interviewType: parsed.data.interviewType,
      scheduledAt: parsed.data.scheduledAt,
      locationOrLink: parsed.data.locationOrLink,
      status: parsed.data.status,
      notes: parsed.data.notes,
    });
    return NextResponse.json({ interview }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create interview.";
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
