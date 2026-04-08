import { z } from "zod";

const interviewTypes = [
  "RecruiterScreen",
  "HRScreen",
  "AssessmentReview",
  "TechnicalInterview",
  "FinalInterview",
  "OfferDiscussion",
] as const;

export const interviewCreateSchema = z.object({
  applicationId: z.string().min(1, "Application is required"),
  interviewType: z.enum(interviewTypes, { message: "Interview type is required" }),
  scheduledAt: z.string().min(1, "Scheduled time is required"),
  locationOrLink: z.string().trim().max(500).optional(),
  status: z.string().trim().min(1, "Status is required").max(100),
  notes: z.string().trim().max(5000).optional(),
});

export type InterviewCreateInput = z.infer<typeof interviewCreateSchema>;

export const interviewUpdateSchema = z.object({
  interviewType: z.enum(interviewTypes).optional(),
  scheduledAt: z.string().optional(),
  locationOrLink: z.string().trim().max(500).optional().nullable(),
  status: z.string().trim().min(1).max(100).optional(),
  notes: z.string().trim().max(5000).optional().nullable(),
});

export type InterviewUpdateInput = z.infer<typeof interviewUpdateSchema>;
