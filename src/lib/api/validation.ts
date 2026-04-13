import "server-only";

import { NextResponse } from "next/server";
import type { ZodTypeAny, infer as zInfer } from "zod";

import { jsonError } from "./errors";

export type ValidateResult<TSchema extends ZodTypeAny> =
  | { ok: true; data: zInfer<TSchema> }
  | { ok: false; response: NextResponse };

type ValidateOptions = {
  status?: number;
  message: string;
  includeFieldErrors?: boolean;
};

export function validateOrResponse<TSchema extends ZodTypeAny>(
  schema: TSchema,
  value: unknown,
  options: ValidateOptions
): ValidateResult<TSchema> {
  const parsed = schema.safeParse(value);
  if (parsed.success) {
    return { ok: true, data: parsed.data };
  }

  if (!options.includeFieldErrors) {
    return { ok: false, response: jsonError(options.message, options.status ?? 400) };
  }

  return {
    ok: false,
    response: NextResponse.json(
      {
        error: {
          message: options.message,
          fields: parsed.error.flatten().fieldErrors,
        },
      },
      { status: options.status ?? 400 }
    ),
  };
}
