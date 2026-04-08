import { NextResponse } from "next/server";

import { auth } from "../../../../../auth";
import { prisma } from "@/lib/prisma";
import { applicationUpdateSchema } from "@/lib/validation/application";
import {
  updateApplication,
  archiveApplication,
  unarchiveApplication,
} from "@/lib/db/applications";

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

  const body = json as Record<string, unknown>;

  if (body.action === "archive") {
    try {
      await archiveApplication(id, user.id);
      return NextResponse.json({ archived: true });
    } catch {
      return NextResponse.json(
        { error: { message: "Application not found." } },
        { status: 404 }
      );
    }
  }

  if (body.action === "unarchive") {
    try {
      await unarchiveApplication(id, user.id);
      return NextResponse.json({ archived: false });
    } catch {
      return NextResponse.json(
        { error: { message: "Application not found." } },
        { status: 404 }
      );
    }
  }

  const parsed = applicationUpdateSchema.safeParse(json);
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

  if (parsed.data.currentStage) {
    const current = await prisma.application.findFirst({
      where: { id, userId: user.id },
      select: {
        id: true,
        currentStage: true,
        offerDetail: { select: { id: true } },
        rejectionDetail: { select: { id: true } },
      },
    });

    if (!current) {
      return NextResponse.json(
        { error: { message: "Application not found." } },
        { status: 404 }
      );
    }

    if (current.offerDetail && parsed.data.currentStage !== "Offer") {
      return NextResponse.json(
        {
          error: {
            message:
              "Stage change blocked. Remove offer detail before changing away from Offer.",
          },
        },
        { status: 409 }
      );
    }

    if (current.rejectionDetail && parsed.data.currentStage !== "Rejected") {
      return NextResponse.json(
        {
          error: {
            message:
              "Stage change blocked. Remove rejection detail before changing away from Rejected.",
          },
        },
        { status: 409 }
      );
    }
  }

  try {
    const updated = await updateApplication(id, user.id, {
      currentStage: parsed.data.currentStage,
      priority: parsed.data.priority,
      appliedDate: parsed.data.appliedDate === "" ? null : parsed.data.appliedDate,
      statusNotes: parsed.data.statusNotes,
      tags: parsed.data.tags,
    });
    return NextResponse.json({ application: updated });
  } catch {
    return NextResponse.json(
      { error: { message: "Application not found or update failed." } },
      { status: 404 }
    );
  }
}
