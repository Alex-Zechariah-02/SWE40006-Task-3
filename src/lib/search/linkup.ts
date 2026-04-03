import "server-only";

import { z } from "zod";

const linkupSearchRequestSchema = z.object({
  q: z.string().min(1),
  depth: z.enum(["fast", "standard", "deep"]),
  outputType: z.enum(["searchResults", "sourcedAnswer", "structured"]),
  structuredOutputSchema: z.string().optional(),
  includeSources: z.boolean().optional(),
  maxResults: z.number().int().positive().max(50).optional(),
});

export type LinkupSearchRequest = z.infer<typeof linkupSearchRequestSchema>;

const linkupStructuredResponseSchema = z.object({
  results: z
    .array(
      z.object({
        title: z.string().optional(),
        companyName: z.string().optional(),
        location: z.string().optional(),
        remoteMode: z.string().optional(),
        opportunityType: z.string().optional(),
        sourceUrl: z.string().optional(),
        snippet: z.string().optional(),
        postedDate: z.string().optional(),
        confidence: z.number().optional(),
      })
    )
    .default([]),
});

export type LinkupStructuredResponse = z.infer<
  typeof linkupStructuredResponseSchema
>;

export class LinkupError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "LinkupError";
    this.status = status;
  }
}

function getLinkupApiKey(): string {
  const key = process.env.LINKUP_API_KEY;
  if (!key) {
    throw new LinkupError("LINKUP_API_KEY is not configured.", 500);
  }
  return key;
}

function buildStructuredSchemaString(): string {
  // Linkup `outputType: structured` requires `structuredOutputSchema` as a JSON Schema string
  // whose root is an object.
  const schema = {
    type: "object",
    additionalProperties: false,
    properties: {
      results: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: true,
          properties: {
            title: { type: "string" },
            companyName: { type: "string" },
            location: { type: "string" },
            remoteMode: { type: "string" },
            opportunityType: { type: "string" },
            sourceUrl: { type: "string" },
            snippet: { type: "string" },
            postedDate: { type: "string" },
            confidence: { type: "number" },
          },
          required: ["title", "companyName", "sourceUrl"],
        },
      },
    },
    required: ["results"],
  } as const;

  return JSON.stringify(schema);
}

export async function linkupStructuredSearch(params: {
  q: string;
  maxResults: number;
}): Promise<LinkupStructuredResponse> {
  const apiKey = getLinkupApiKey();

  const requestBody: LinkupSearchRequest = {
    q: params.q,
    depth: "standard",
    outputType: "structured",
    structuredOutputSchema: buildStructuredSchemaString(),
    includeSources: false,
    maxResults: params.maxResults,
  };

  const parsedRequest = linkupSearchRequestSchema.safeParse(requestBody);
  if (!parsedRequest.success) {
    throw new LinkupError("Invalid Linkup request configuration.", 500);
  }

  let response: Response;
  try {
    response = await fetch("https://api.linkup.so/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsedRequest.data),
      cache: "no-store",
    });
  } catch {
    throw new LinkupError("Linkup request failed.", 502);
  }

  if (!response.ok) {
    const status = response.status;
    throw new LinkupError("Linkup request failed.", status);
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw new LinkupError("Linkup returned invalid JSON.", 502);
  }

  // When `includeSources` is false, the response is the schema-shaped JSON directly.
  const parsed = linkupStructuredResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new LinkupError("Linkup returned an unexpected response shape.", 502);
  }

  return parsed.data;
}

