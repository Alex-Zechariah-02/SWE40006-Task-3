import { NextResponse } from "next/server";

import { auth } from "../../../../auth";
import { prisma } from "@/lib/prisma";
import { companyCreateSchema } from "@/lib/validation/company";
import { createCompany } from "@/lib/db/companies";

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

  const parsed = companyCreateSchema.safeParse(json);
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
    const result = await createCompany(user.id, {
      name: parsed.data.name,
      website: parsed.data.website || undefined,
      location: parsed.data.location,
      industry: parsed.data.industry,
      techStackNotes: parsed.data.techStackNotes,
      applicationProcessNotes: parsed.data.applicationProcessNotes,
      interviewNotes: parsed.data.interviewNotes,
      compensationNotes: parsed.data.compensationNotes,
      generalNotes: parsed.data.generalNotes,
    });

    return NextResponse.json(
      { company: { id: result.id }, created: result.created },
      { status: result.created ? 201 : 200 }
    );
  } catch {
    return NextResponse.json(
      { error: { message: "Failed to create company." } },
      { status: 500 }
    );
  }
}
