import { z } from "zod";

export const contactCreateSchema = z.object({
  companyId: z.string().min(1, "Company is required"),
  name: z.string().trim().min(1, "Name is required").max(100),
  title: z.string().trim().max(200).optional(),
  email: z
    .string()
    .trim()
    .email("Must be a valid email")
    .max(320)
    .optional()
    .or(z.literal("")),
  phone: z.string().trim().max(40).optional(),
  linkedinUrl: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .max(2000)
    .optional()
    .or(z.literal("")),
  notes: z.string().trim().max(5000).optional(),
});

export type ContactCreateInput = z.infer<typeof contactCreateSchema>;

export const contactUpdateSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  title: z.string().trim().max(200).optional().nullable(),
  email: z
    .string()
    .trim()
    .email()
    .max(320)
    .optional()
    .nullable()
    .or(z.literal("")),
  phone: z.string().trim().max(40).optional().nullable(),
  linkedinUrl: z
    .string()
    .trim()
    .url()
    .max(2000)
    .optional()
    .nullable()
    .or(z.literal("")),
  notes: z.string().trim().max(5000).optional().nullable(),
});

export type ContactUpdateInput = z.infer<typeof contactUpdateSchema>;
