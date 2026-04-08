import { z } from "zod";

const actionItemStatuses = ["Open", "InProgress", "Completed", "Cancelled"] as const;
const priorities = ["Low", "Medium", "High"] as const;

export const actionItemCreateSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(5000).optional(),
  dueAt: z.string().trim().optional().or(z.literal("")),
  priority: z.enum(priorities, { message: "Priority is required" }),
  status: z.enum(actionItemStatuses, { message: "Status is required" }),
  companyId: z.string().optional(),
  opportunityId: z.string().optional(),
  applicationId: z.string().optional(),
  interviewId: z.string().optional(),
});

export type ActionItemCreateInput = z.infer<typeof actionItemCreateSchema>;

export const actionItemUpdateSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(5000).optional().nullable(),
  dueAt: z.string().trim().optional().nullable().or(z.literal("")),
  priority: z.enum(priorities).optional(),
  status: z.enum(actionItemStatuses).optional(),
});

export type ActionItemUpdateInput = z.infer<typeof actionItemUpdateSchema>;
