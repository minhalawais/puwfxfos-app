import { z } from 'zod';
import type { WorkerOnboardingField } from '../types';

const requiredText = z.string().trim().min(2, 'onboarding.validation.required');

export const workerOnboardingSchema = z.object({
  worker_status: z.enum(['factory_worker', 'other_worker', 'not_sure']),
  union_membership_status: z.enum(['active_member', 'not_member', 'not_sure']),
  full_name: requiredText,
  father_name: requiredText,
  cnic: z
    .string()
    .transform((value) => value.replace(/\D/g, ''))
    .refine((value) => /^\d{13}$/.test(value), 'onboarding.validation.cnic'),
  mobile_number: z
    .string()
    .trim()
    .refine((value) => /^(?:\+92|92|0)?3\d{9}$/.test(value.replace(/[\s-]/g, '')), 'onboarding.validation.mobile'),
  employer_name: requiredText,
  establishment_name: requiredText,
  designation: requiredText,
  department: requiredText,
  city: requiredText,
  district: requiredText,
  province: requiredText,
  grievance_urgency: z.enum(['urgent', 'not_urgent', 'not_sure']),
  preferred_language: z.enum(['ur', 'en']),
});

export const workerOnboardingStepSchemas: Partial<Record<WorkerOnboardingField, z.ZodType<unknown>>> = {
  worker_status: workerOnboardingSchema.shape.worker_status,
  union_membership_status: workerOnboardingSchema.shape.union_membership_status,
  full_name: workerOnboardingSchema.shape.full_name,
  father_name: workerOnboardingSchema.shape.father_name,
  cnic: workerOnboardingSchema.shape.cnic,
  mobile_number: workerOnboardingSchema.shape.mobile_number,
  employer_name: workerOnboardingSchema.shape.employer_name,
  establishment_name: workerOnboardingSchema.shape.establishment_name,
  designation: workerOnboardingSchema.shape.designation,
  department: workerOnboardingSchema.shape.department,
  city: workerOnboardingSchema.shape.city,
  district: workerOnboardingSchema.shape.district,
  province: workerOnboardingSchema.shape.province,
  grievance_urgency: workerOnboardingSchema.shape.grievance_urgency,
  preferred_language: workerOnboardingSchema.shape.preferred_language,
};
