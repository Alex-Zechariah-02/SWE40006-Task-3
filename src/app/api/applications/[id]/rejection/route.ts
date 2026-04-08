import { NextResponse } from "next/server";

import { auth } from "../../../../../../auth";
import { prisma } from "@/lib/prisma";
import { rejectionDetailCreateSchema, rejectionDetailUpdateSchema } from "@/lib/validation/application";
import { createRejectionDetail, deleteRejectionDetail, updateRejectionDetail } from "@/lib/db/applications";

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
  const parsed = rejectionDetailCreateSchema.safeParse({
    applicationId,
    ...body,
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
    const rejectionDetail = await createRejectionDetail(applicationId, user.id, {
      rejectionDate: parsed.data.rejectionDate || undefined,
      rejectedAtStage: parsed.data.rejectedAtStage,
      notes: parsed.data.notes,
    });
    return NextResponse.json({ rejectionDetail }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create rejection detail.";
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}

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

  const parsed = rejectionDetailUpdateSchema.safeParse(json);
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
    const updated = await updateRejectionDetail(applicationId, user.id, {
      rejectionDate: parsed.data.rejectionDate === "" ? null : parsed.data.rejectionDate,
      rejectedAtStage: parsed.data.rejectedAtStage,
      notes: parsed.data.notes,
    });
    return NextResponse.json({ rejectionDetail: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Rejection detail not found or update failed.";
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

  const { id: applicationId } = await context.params;

  try {
    await deleteRejectionDetail(applicationId, user.id);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Rejection detail not found or delete failed.";
    return NextResponse.json({ error: { message } }, { status: 404 });
  }
}
