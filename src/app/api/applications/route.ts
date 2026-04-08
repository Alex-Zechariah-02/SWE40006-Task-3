import { NextResponse } from "next/server";

import { auth } from "../../../../auth";
import { prisma } from "@/lib/prisma";
import { applicationConvertSchema } from "@/lib/validation/application";
import {
  ApplicationAlreadyExistsError,
  convertOpportunityToApplication,
} from "@/lib/db/applications";

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

  const parsed = applicationConvertSchema.safeParse(json);
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
    const result = await convertOpportunityToApplication(user.id, {
      opportunityId: parsed.data.opportunityId,
      priority: parsed.data.priority,
      appliedDate: parsed.data.appliedDate || undefined,
      statusNotes: parsed.data.statusNotes,
      tags: parsed.data.tags,
    });

    return NextResponse.json(
      { application: { id: result.id }, created: result.created },
      { status: result.created ? 201 : 200 }
    );
  } catch (error) {
    if (error instanceof ApplicationAlreadyExistsError) {
      return NextResponse.json(
        {
          error: { message: "This opportunity has already been converted." },
          existingApplicationId: error.existingApplicationId,
        },
        { status: 409 }
      );
    }

    const message =
      error instanceof Error ? error.message : "Failed to create application.";
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
