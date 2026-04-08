import { NextResponse } from "next/server";

import { auth } from "../../../../../../auth";
import { prisma } from "@/lib/prisma";
import { offerDetailCreateSchema, offerDetailUpdateSchema } from "@/lib/validation/application";
import { createOfferDetail, deleteOfferDetail, updateOfferDetail } from "@/lib/db/applications";

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
  const parsed = offerDetailCreateSchema.safeParse({
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
    const offerDetail = await createOfferDetail(applicationId, user.id, {
      offeredDate: parsed.data.offeredDate || undefined,
      compensationNote: parsed.data.compensationNote,
      responseDeadline: parsed.data.responseDeadline || undefined,
      decisionStatus: parsed.data.decisionStatus,
      notes: parsed.data.notes,
    });
    return NextResponse.json({ offerDetail }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create offer detail.";
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

  const parsed = offerDetailUpdateSchema.safeParse(json);
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
    const updated = await updateOfferDetail(applicationId, user.id, {
      offeredDate: parsed.data.offeredDate === "" ? null : parsed.data.offeredDate,
      compensationNote: parsed.data.compensationNote,
      responseDeadline: parsed.data.responseDeadline === "" ? null : parsed.data.responseDeadline,
      decisionStatus: parsed.data.decisionStatus,
      notes: parsed.data.notes,
    });
    return NextResponse.json({ offerDetail: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Offer detail not found or update failed.";
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
    await deleteOfferDetail(applicationId, user.id);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Offer detail not found or delete failed.";
    return NextResponse.json({ error: { message } }, { status: 404 });
  }
}
