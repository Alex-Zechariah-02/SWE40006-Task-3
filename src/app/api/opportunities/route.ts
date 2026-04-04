import { NextResponse } from "next/server";

import { auth } from "../../../../auth";
import { prisma } from "@/lib/prisma";
import { manualOpportunityCreateSchema } from "@/lib/validation/opportunity";
import { createManualOpportunity } from "@/lib/db/opportunities";

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

  const parsed = manualOpportunityCreateSchema.safeParse(json);
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
    const result = await createManualOpportunity(user.id, {
      title: parsed.data.title,
      companyName: parsed.data.companyName,
      opportunityType: parsed.data.opportunityType,
      remoteMode: parsed.data.remoteMode,
      location: parsed.data.location || undefined,
      sourceUrl: parsed.data.sourceUrl || undefined,
      deadline: parsed.data.deadline || undefined,
      snippet: parsed.data.snippet,
      description: parsed.data.description,
      notes: parsed.data.notes,
      tags: parsed.data.tags,
    });

    return NextResponse.json(
      { opportunity: { id: result.id }, created: result.created },
      { status: result.created ? 201 : 200 }
    );
  } catch {
    return NextResponse.json(
      { error: { message: "Failed to create opportunity." } },
      { status: 500 }
    );
  }
}
