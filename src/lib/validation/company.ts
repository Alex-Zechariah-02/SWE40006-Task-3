import { z } from "zod";

export const companyCreateSchema = z.object({
  name: z.string().trim().min(1, "Company name is required").max(200),
  website: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .max(2000)
    .optional()
    .or(z.literal("")),
  location: z.string().trim().max(200).optional(),
  industry: z.string().trim().max(200).optional(),
  techStackNotes: z.string().trim().max(5000).optional(),
  applicationProcessNotes: z.string().trim().max(5000).optional(),
  interviewNotes: z.string().trim().max(5000).optional(),
  compensationNotes: z.string().trim().max(5000).optional(),
  generalNotes: z.string().trim().max(5000).optional(),
});

export type CompanyCreateInput = z.infer<typeof companyCreateSchema>;

export const companyUpdateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  website: z
    .string()
    .trim()
    .url()
    .max(2000)
    .optional()
    .nullable()
    .or(z.literal("")),
  location: z.string().trim().max(200).optional().nullable(),
  industry: z.string().trim().max(200).optional().nullable(),
  techStackNotes: z.string().trim().max(5000).optional().nullable(),
  applicationProcessNotes: z.string().trim().max(5000).optional().nullable(),
  interviewNotes: z.string().trim().max(5000).optional().nullable(),
  compensationNotes: z.string().trim().max(5000).optional().nullable(),
  generalNotes: z.string().trim().max(5000).optional().nullable(),
});

export type CompanyUpdateInput = z.infer<typeof companyUpdateSchema>;
