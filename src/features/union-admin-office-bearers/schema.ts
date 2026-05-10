import { z } from 'zod';
import { officeBearerPositionOptions } from '@/services/union-admin-service';

const cnicSchema = z
  .string()
  .transform((value) => value.replace(/\D/g, ''))
  .refine((value) => /^\d{13}$/.test(value), 'unionCore.office.validation.cnic');

const phoneSchema = z
  .string()
  .trim()
  .refine((value) => /^(\+92|0)?3\d{2}\d{7}$/.test(value.replace(/[\s-]/g, '')), 'unionCore.office.validation.phone');

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'unionCore.office.validation.date');

export const officeBearerFormSchema = z.object({
  name: z.string().min(3, 'unionCore.office.validation.name'),
  cnic: cnicSchema,
  position: z.enum(officeBearerPositionOptions),
  contact_number: phoneSchema,
  email: z.union([z.literal(''), z.string().email('unionCore.office.validation.email')]),
  region: z.string().min(2, 'unionCore.office.validation.region'),
  appointment_date: dateSchema,
  term_start_date: dateSchema,
  term_expiry_date: dateSchema,
  gender: z.enum(['male', 'female', 'other']),
  outsider: z.boolean(),
  notes: z.string().min(4, 'unionCore.office.validation.notes'),
  status: z.enum(['active', 'resigned', 'replaced', 'reinstated']),
}).superRefine((value, ctx) => {
  if (new Date(value.term_expiry_date).getTime() < new Date(value.term_start_date).getTime()) {
    ctx.addIssue({
      code: 'custom',
      path: ['term_expiry_date'],
      message: 'unionCore.office.validation.termOrder',
    });
  }
});

export type OfficeBearerFormValues = z.infer<typeof officeBearerFormSchema>;
