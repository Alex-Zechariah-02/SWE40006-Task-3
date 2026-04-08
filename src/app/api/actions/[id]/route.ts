import { NextResponse } from "next/server";

import { auth } from "../../../../../auth";
import { prisma } from "@/lib/prisma";
import { actionItemUpdateSchema } from "@/lib/validation/action";
import { updateActionItem, deleteActionItem } from "@/lib/db/actions";

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

  const parsed = actionItemUpdateSchema.safeParse(json);
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
    const updated = await updateActionItem(id, user.id, {
      title: parsed.data.title,
      description: parsed.data.description,
      dueAt: parsed.data.dueAt === "" ? null : parsed.data.dueAt,
      priority: parsed.data.priority,
      status: parsed.data.status,
    });
    return NextResponse.json({ actionItem: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Action item not found or update failed.";
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
    await deleteActionItem(id, user.id);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Action item not found.";
    return NextResponse.json({ error: { message } }, { status: 404 });
  }
}
