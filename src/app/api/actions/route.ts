import { NextResponse } from "next/server";

import { auth } from "../../../../auth";
import { prisma } from "@/lib/prisma";
import { actionItemCreateSchema } from "@/lib/validation/action";
import { createActionItem } from "@/lib/db/actions";

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

  const parsed = actionItemCreateSchema.safeParse(json);
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
    const actionItem = await createActionItem(user.id, {
      title: parsed.data.title,
      description: parsed.data.description,
      dueAt: parsed.data.dueAt || undefined,
      priority: parsed.data.priority,
      status: parsed.data.status,
      companyId: parsed.data.companyId,
      opportunityId: parsed.data.opportunityId,
      applicationId: parsed.data.applicationId,
      interviewId: parsed.data.interviewId,
    });
    return NextResponse.json({ actionItem }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create action item.";
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
