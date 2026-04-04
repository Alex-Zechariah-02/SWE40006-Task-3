import { NextResponse } from "next/server";

import { auth } from "../../../../../auth";
import { prisma } from "@/lib/prisma";
import { opportunityUpdateSchema } from "@/lib/validation/opportunity";
import {
  updateOpportunity,
  archiveOpportunity,
  unarchiveOpportunity,
} from "@/lib/db/opportunities";

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

  // Handle archive/unarchive action
  if (body.action === "archive") {
    try {
      await archiveOpportunity(id, user.id);
      return NextResponse.json({ archived: true });
    } catch {
      return NextResponse.json(
        { error: { message: "Opportunity not found." } },
        { status: 404 }
      );
    }
  }

  if (body.action === "unarchive") {
    try {
      await unarchiveOpportunity(id, user.id);
      return NextResponse.json({ archived: false });
    } catch {
      return NextResponse.json(
        { error: { message: "Opportunity not found." } },
        { status: 404 }
      );
    }
  }

  const parsed = opportunityUpdateSchema.safeParse(json);
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
    const updated = await updateOpportunity(id, user.id, {
      title: parsed.data.title,
      opportunityType: parsed.data.opportunityType,
      remoteMode: parsed.data.remoteMode,
      stage: parsed.data.stage,
      location: parsed.data.location,
      sourceUrl: parsed.data.sourceUrl === "" ? null : parsed.data.sourceUrl,
      deadline: parsed.data.deadline === "" ? null : parsed.data.deadline,
      snippet: parsed.data.snippet,
      description: parsed.data.description,
      notes: parsed.data.notes,
      tags: parsed.data.tags,
    });
    return NextResponse.json({ opportunity: updated });
  } catch {
    return NextResponse.json(
      { error: { message: "Opportunity not found or update failed." } },
      { status: 404 }
    );
  }
}
