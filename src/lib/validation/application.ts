import { z } from "zod";

const applicationStages = [
  "Applied",
  "Assessment",
  "Interview",
  "Offer",
  "Rejected",
  "Withdrawn",
] as const;

const priorities = ["Low", "Medium", "High"] as const;

export const applicationConvertSchema = z.object({
  opportunityId: z.string().min(1, "Opportunity is required"),
  priority: z.enum(priorities, { message: "Priority is required" }),
  appliedDate: z.string().trim().optional().or(z.literal("")),
  statusNotes: z.string().trim().max(5000).optional(),
  tags: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
});

export type ApplicationConvertInput = z.infer<
  typeof applicationConvertSchema
>;

export const applicationUpdateSchema = z.object({
  currentStage: z.enum(applicationStages).optional(),
  priority: z.enum(priorities).optional(),
  appliedDate: z.string().trim().optional().nullable().or(z.literal("")),
  statusNotes: z.string().trim().max(5000).optional().nullable(),
  tags: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
});

export type ApplicationUpdateInput = z.infer<typeof applicationUpdateSchema>;

export const offerDetailCreateSchema = z.object({
  applicationId: z.string().min(1, "Application is required"),
  offeredDate: z.string().trim().optional().or(z.literal("")),
  compensationNote: z.string().trim().max(5000).optional(),
  responseDeadline: z.string().trim().optional().or(z.literal("")),
  decisionStatus: z.string().trim().min(1, "Decision status is required").max(100),
  notes: z.string().trim().max(5000).optional(),
});

export type OfferDetailCreateInput = z.infer<typeof offerDetailCreateSchema>;

export const offerDetailUpdateSchema = z.object({
  offeredDate: z.string().trim().optional().nullable().or(z.literal("")),
  compensationNote: z.string().trim().max(5000).optional().nullable(),
  responseDeadline: z.string().trim().optional().nullable().or(z.literal("")),
  decisionStatus: z.string().trim().min(1).max(100).optional(),
  notes: z.string().trim().max(5000).optional().nullable(),
});

export type OfferDetailUpdateInput = z.infer<typeof offerDetailUpdateSchema>;

export const rejectionDetailCreateSchema = z.object({
  applicationId: z.string().min(1, "Application is required"),
  rejectionDate: z.string().trim().optional().or(z.literal("")),
  rejectedAtStage: z.string().trim().min(1, "Rejected at stage is required").max(100),
  notes: z.string().trim().max(5000).optional(),
});

export type RejectionDetailCreateInput = z.infer<
  typeof rejectionDetailCreateSchema
>;

export const rejectionDetailUpdateSchema = z.object({
  rejectionDate: z.string().trim().optional().nullable().or(z.literal("")),
  rejectedAtStage: z.string().trim().min(1).max(100).optional(),
  notes: z.string().trim().max(5000).optional().nullable(),
});

export type RejectionDetailUpdateInput = z.infer<
  typeof rejectionDetailUpdateSchema
>;

export const contactLinkSchema = z.object({
  applicationId: z.string().min(1, "Application is required"),
  contactId: z.string().min(1, "Contact is required"),
});

export type ContactLinkInput = z.infer<typeof contactLinkSchema>;
