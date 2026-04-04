import { z } from "zod";

const opportunityTypes = [
  "Internship",
  "GraduateProgram",
  "FullTime",
  "PartTime",
  "Contract",
] as const;

const remoteModes = ["OnSite", "Hybrid", "Remote"] as const;

const opportunityStages = ["Saved", "Shortlisted"] as const;

export const manualOpportunityCreateSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  companyName: z.string().trim().min(1, "Company is required").max(200),
  opportunityType: z.enum(opportunityTypes, {
    message: "Opportunity type is required",
  }),
  remoteMode: z.enum(remoteModes, {
    message: "Remote mode is required",
  }),
  location: z.string().trim().max(200).optional(),
  sourceUrl: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .max(2000)
    .optional()
    .or(z.literal("")),
  deadline: z.string().trim().optional().or(z.literal("")),
  snippet: z.string().trim().max(2000).optional(),
  description: z.string().trim().max(10000).optional(),
  notes: z.string().trim().max(5000).optional(),
  tags: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
});

export type ManualOpportunityCreateInput = z.infer<
  typeof manualOpportunityCreateSchema
>;

export const opportunityUpdateSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  opportunityType: z.enum(opportunityTypes).optional(),
  remoteMode: z.enum(remoteModes).optional(),
  stage: z.enum(opportunityStages).optional(),
  location: z.string().trim().max(200).optional().nullable(),
  sourceUrl: z
    .string()
    .trim()
    .url()
    .max(2000)
    .optional()
    .nullable()
    .or(z.literal("")),
  deadline: z.string().trim().optional().nullable().or(z.literal("")),
  snippet: z.string().trim().max(2000).optional().nullable(),
  description: z.string().trim().max(10000).optional().nullable(),
  notes: z.string().trim().max(5000).optional().nullable(),
  tags: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
});

export type OpportunityUpdateInput = z.infer<typeof opportunityUpdateSchema>;
