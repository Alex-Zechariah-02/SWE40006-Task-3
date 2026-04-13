import { NextResponse } from "next/server";

import { requireUserOrResponse } from "@/lib/api/auth";
import { jsonError } from "@/lib/api/errors";
import { readJsonOrResponse } from "@/lib/api/json";
import { validateOrResponse } from "@/lib/api/validation";
import { applicationConvertSchema } from "@/lib/validation/application";
import {
  ApplicationAlreadyExistsError,
  convertOpportunityToApplication,
} from "@/lib/db/applications";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const authed = await requireUserOrResponse();
  if (!authed.ok) return authed.response;

  const body = await readJsonOrResponse(req);
  if (!body.ok) return body.response;

  const parsed = validateOrResponse(applicationConvertSchema, body.json, {
    message: "Validation failed.",
    includeFieldErrors: true,
  });
  if (!parsed.ok) return parsed.response;

  try {
    const result = await convertOpportunityToApplication(authed.user.id, {
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
    return jsonError(message, 500);
  }
}
