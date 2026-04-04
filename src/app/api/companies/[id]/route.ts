import { NextResponse } from "next/server";

import { auth } from "../../../../../auth";
import { prisma } from "@/lib/prisma";
import { companyUpdateSchema } from "@/lib/validation/company";
import {
  updateCompany,
  archiveCompany,
  unarchiveCompany,
} from "@/lib/db/companies";

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
      await archiveCompany(id, user.id);
      return NextResponse.json({ archived: true });
    } catch {
      return NextResponse.json(
        { error: { message: "Company not found." } },
        { status: 404 }
      );
    }
  }

  if (body.action === "unarchive") {
    try {
      await unarchiveCompany(id, user.id);
      return NextResponse.json({ archived: false });
    } catch {
      return NextResponse.json(
        { error: { message: "Company not found." } },
        { status: 404 }
      );
    }
  }

  const parsed = companyUpdateSchema.safeParse(json);
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
    const updated = await updateCompany(id, user.id, {
      name: parsed.data.name,
      website: parsed.data.website === "" ? null : parsed.data.website,
      location: parsed.data.location,
      industry: parsed.data.industry,
      techStackNotes: parsed.data.techStackNotes,
      applicationProcessNotes: parsed.data.applicationProcessNotes,
      interviewNotes: parsed.data.interviewNotes,
      compensationNotes: parsed.data.compensationNotes,
      generalNotes: parsed.data.generalNotes,
    });
    return NextResponse.json({ company: updated });
  } catch {
    return NextResponse.json(
      { error: { message: "Company not found or update failed." } },
      { status: 404 }
    );
  }
}
