import { z } from 'zod';

const cnicDigitsSchema = z
  .string()
  .transform((value) => value.replace(/\D/g, ''))
  .refine((value) => /^\d{13}$/.test(value), 'unionCore.members.validation.cnic');

const phoneSchema = z
  .string()
  .trim()
  .refine((value) => /^(\+92|0)?3\d{2}\d{7}$/.test(value.replace(/[\s-]/g, '')), 'unionCore.members.validation.phone');

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'unionCore.members.validation.date');

export const unionMemberIdentitySchema = z.object({
  name: z.string().min(3, 'unionCore.members.validation.name'),
  father_name: z.string().min(3, 'unionCore.members.validation.fatherName'),
  cnic: cnicDigitsSchema,
  date_of_birth: isoDateSchema,
  gender: z.enum(['male', 'female', 'other']),
  phone: phoneSchema,
  email: z.union([z.literal(''), z.string().email('unionCore.members.validation.email')]),
  permanent_address: z.string().min(10, 'unionCore.members.validation.address'),
  current_address: z.string().min(4, 'unionCore.members.validation.currentAddress'),
  district: z.string().min(2, 'unionCore.members.validation.district'),
  province: z.string().min(2, 'unionCore.members.validation.province'),
}).refine((value) => {
  const dob = new Date(value.date_of_birth);
  const age = new Date().getFullYear() - dob.getFullYear();
  return age >= 18;
}, {
  message: 'unionCore.members.validation.age',
  path: ['date_of_birth'],
});

export const unionMemberEmploymentSchema = z.object({
  establishment_name: z.string().min(3, 'unionCore.members.validation.establishment'),
  employer_name: z.string().min(3, 'unionCore.members.validation.employer'),
  department: z.string().min(2, 'unionCore.members.validation.department'),
  job_title: z.string().min(2, 'unionCore.members.validation.designation'),
  trade: z.string(),
  employment_date: isoDateSchema,
  employment_type: z.enum(['permanent', 'temporary', 'contract', 'daily_wage']),
  monthly_salary: z.number().min(0, 'unionCore.members.validation.salary'),
});

export const unionMemberMembershipSchema = z.object({
  joined_union_on: isoDateSchema,
  monthly_subscription: z.number().min(0, 'unionCore.members.validation.subscription'),
  membership_status: z.enum(['pending', 'active', 'suspended', 'resigned', 'transferred', 'terminated', 'retired', 'deceased']),
  status_reason: z.string().min(4, 'unionCore.members.validation.statusReason'),
  dues_status: z.enum(['paid', 'pending', 'overdue', 'waived']),
});

export const unionMemberBenefitsSchema = z.object({
  eobi_number: z.string(),
  social_security_number: z.string(),
  wwf_eligible: z.boolean(),
  pf_status: z.string(),
  gratuity_status: z.string(),
  digital_id_generated: z.boolean(),
  nadra_status: z.enum(['verified', 'pending', 'failed']),
  eobi_status: z.enum(['verified', 'pending', 'failed']),
});

export const unionMemberDocumentsSchema = z.object({
  photo_attached: z.boolean(),
  signature_attached: z.boolean(),
  thumb_attached: z.boolean(),
  cnic_copy_attached: z.boolean(),
  subscription_consent_attached: z.boolean(),
  supporting_notes: z.string(),
});

export const unionMemberLifecycleSchema = z.object({
  lifecycle_event_type: z.enum(['joined', 'promoted', 'transferred', 'salary_change', 'converted', 'reinstated', 'terminated', 'retired', 'deceased']),
  lifecycle_event_date: isoDateSchema,
  lifecycle_notes: z.string().min(4, 'unionCore.members.validation.lifecycleNotes'),
  beneficiary_name: z.string().optional(),
  beneficiary_cnic: z.string().optional(),
  beneficiary_relation: z.string().optional(),
  beneficiary_phone: z.string().optional(),
  death_grant_status: z.enum(['pending', 'approved', 'paid', 'rejected']).default('pending'),
  death_grant_amount: z.number().min(0).optional(),
}).superRefine((value, ctx) => {
  if (value.lifecycle_event_type === 'deceased') {
    if (!value.beneficiary_name) {
      ctx.addIssue({ code: 'custom', path: ['beneficiary_name'], message: 'unionCore.members.validation.beneficiaryName' });
    }
    if (!value.beneficiary_cnic || !/^\d{13}$/.test(value.beneficiary_cnic.replace(/\D/g, ''))) {
      ctx.addIssue({ code: 'custom', path: ['beneficiary_cnic'], message: 'unionCore.members.validation.beneficiaryCnic' });
    }
    if (!value.beneficiary_relation) {
      ctx.addIssue({ code: 'custom', path: ['beneficiary_relation'], message: 'unionCore.members.validation.beneficiaryRelation' });
    }
    if (!value.beneficiary_phone || !/^(\+92|0)?3\d{2}\d{7}$/.test(value.beneficiary_phone.replace(/[\s-]/g, ''))) {
      ctx.addIssue({ code: 'custom', path: ['beneficiary_phone'], message: 'unionCore.members.validation.beneficiaryPhone' });
    }
  }
});

export const unionMemberFormSchema = z.object({
  name: z.string().min(3, 'unionCore.members.validation.name'),
  father_name: z.string().min(3, 'unionCore.members.validation.fatherName'),
  cnic: cnicDigitsSchema,
  date_of_birth: isoDateSchema,
  gender: z.enum(['male', 'female', 'other']),
  phone: phoneSchema,
  email: z.union([z.literal(''), z.string().email('unionCore.members.validation.email')]),
  permanent_address: z.string().min(10, 'unionCore.members.validation.address'),
  current_address: z.string().min(4, 'unionCore.members.validation.currentAddress'),
  district: z.string().min(2, 'unionCore.members.validation.district'),
  province: z.string().min(2, 'unionCore.members.validation.province'),
  establishment_name: z.string().min(3, 'unionCore.members.validation.establishment'),
  employer_name: z.string().min(3, 'unionCore.members.validation.employer'),
  department: z.string().min(2, 'unionCore.members.validation.department'),
  job_title: z.string().min(2, 'unionCore.members.validation.designation'),
  trade: z.string(),
  employment_date: isoDateSchema,
  employment_type: z.enum(['permanent', 'temporary', 'contract', 'daily_wage']),
  monthly_salary: z.number().min(0, 'unionCore.members.validation.salary'),
  joined_union_on: isoDateSchema,
  monthly_subscription: z.number().min(0, 'unionCore.members.validation.subscription'),
  membership_status: z.enum(['pending', 'active', 'suspended', 'resigned', 'transferred', 'terminated', 'retired', 'deceased']),
  status_reason: z.string().min(4, 'unionCore.members.validation.statusReason'),
  dues_status: z.enum(['paid', 'pending', 'overdue', 'waived']),
  eobi_number: z.string(),
  social_security_number: z.string(),
  wwf_eligible: z.boolean(),
  pf_status: z.string(),
  gratuity_status: z.string(),
  digital_id_generated: z.boolean(),
  nadra_status: z.enum(['verified', 'pending', 'failed']),
  eobi_status: z.enum(['verified', 'pending', 'failed']),
  photo_attached: z.boolean(),
  signature_attached: z.boolean(),
  thumb_attached: z.boolean(),
  cnic_copy_attached: z.boolean(),
  subscription_consent_attached: z.boolean(),
  supporting_notes: z.string(),
  lifecycle_event_type: z.enum(['joined', 'promoted', 'transferred', 'salary_change', 'converted', 'reinstated', 'terminated', 'retired', 'deceased']),
  lifecycle_event_date: isoDateSchema,
  lifecycle_notes: z.string().min(4, 'unionCore.members.validation.lifecycleNotes'),
  beneficiary_name: z.string().optional(),
  beneficiary_cnic: z.string().optional(),
  beneficiary_relation: z.string().optional(),
  beneficiary_phone: z.string().optional(),
  death_grant_status: z.enum(['pending', 'approved', 'paid', 'rejected']).default('pending'),
  death_grant_amount: z.number().min(0).optional(),
}).superRefine((value, ctx) => {
  const dob = new Date(value.date_of_birth);
  const age = new Date().getFullYear() - dob.getFullYear();
  if (age < 18) {
    ctx.addIssue({ code: 'custom', path: ['date_of_birth'], message: 'unionCore.members.validation.age' });
  }

  if (value.lifecycle_event_type === 'deceased') {
    if (!value.beneficiary_name) {
      ctx.addIssue({ code: 'custom', path: ['beneficiary_name'], message: 'unionCore.members.validation.beneficiaryName' });
    }
    if (!value.beneficiary_cnic || !/^\d{13}$/.test(value.beneficiary_cnic.replace(/\D/g, ''))) {
      ctx.addIssue({ code: 'custom', path: ['beneficiary_cnic'], message: 'unionCore.members.validation.beneficiaryCnic' });
    }
    if (!value.beneficiary_relation) {
      ctx.addIssue({ code: 'custom', path: ['beneficiary_relation'], message: 'unionCore.members.validation.beneficiaryRelation' });
    }
    if (!value.beneficiary_phone || !/^(\+92|0)?3\d{2}\d{7}$/.test(value.beneficiary_phone.replace(/[\s-]/g, ''))) {
      ctx.addIssue({ code: 'custom', path: ['beneficiary_phone'], message: 'unionCore.members.validation.beneficiaryPhone' });
    }
  }
});

export type UnionMemberFormValues = z.infer<typeof unionMemberFormSchema>;
