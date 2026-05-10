import { z } from 'zod';

export const cnicSchema = z
  .string()
  .transform((value) => value.replace(/\D/g, ''))
  .refine((value) => /^\d{13}$/.test(value), 'CNIC must contain 13 digits');

export const workerFormCSchema = z.object({
  full_name: z.string().min(2),
  father_name: z.string().min(2),
  cnic: cnicSchema,
  mobile_number: z.string().min(10),
  establishment_name: z.string().min(2),
  designation: z.string().min(2),
  employment_type: z.enum(['permanent', 'contract', 'daily_wage']),
  monthly_subscription: z.number().min(0),
});

export const annualReturnMobileSchema = z.object({
  fiscal_year: z.string().regex(/^\d{4}-\d{4}$/),
  member_count_start: z.number().min(0),
  member_count_end: z.number().min(0),
  subscription_income: z.number().min(0),
  total_income: z.number().min(0),
  total_expenditure: z.number().min(0),
  closing_balance: z.number().min(0),
});

export const workerGrievanceDraftSchema = z.object({
  category: z.enum(['wages', 'termination', 'safety', 'harassment', 'union_rights', 'eobi_social_security', 'other']),
  priority: z.enum(['normal', 'urgent']),
  employer_name: z.string().min(2, 'grievance.validation.employer'),
  establishment_name: z.string().min(2, 'grievance.validation.establishment'),
  description: z.string().min(12, 'grievance.validation.description'),
  voice_note_attached: z.boolean(),
  attachment_count: z.number().min(0),
});

export const workerVoteOtpSchema = z.object({
  otp: z.string().regex(/^\d{4,6}$/, 'workerPortal.voting.validation.otp'),
  election_id: z.string().min(1),
  candidate_id: z.string().min(1, 'workerPortal.voting.validation.candidate'),
});

export const employerRemittanceSchema = z.object({
  deduction_period: z.string().regex(/^\d{4}-\d{2}$/, 'unionOps.validation.period'),
  total_amount: z.number().min(1, 'unionOps.validation.amount'),
  worker_count: z.number().min(1, 'unionOps.validation.workerCount'),
  remittance_date: z.string().min(8, 'unionOps.validation.date'),
  bank_reference: z.string().min(2, 'unionOps.validation.reference'),
});

export const annualReturnFinanceSchema = annualReturnMobileSchema.refine(
  (value) => value.total_income === value.total_expenditure + value.closing_balance,
  { message: 'unionOps.validation.balanceEquation', path: ['closing_balance'] },
);

export const electionNominationSchema = z.object({
  candidate_name: z.string().min(2, 'unionOps.validation.candidate'),
  cnic: cnicSchema,
  position: z.string().min(2, 'unionOps.validation.position'),
  nominator_name: z.string().min(2, 'unionOps.validation.nominator'),
  seconder_name: z.string().min(2, 'unionOps.validation.seconder'),
});

export const codDemandItemSchema = z.object({
  category: z.enum(['wages', 'allowances', 'benefits', 'working_conditions']),
  title: z.string().min(3, 'unionOps.validation.demandTitle'),
  justification: z.string().min(10, 'unionOps.validation.justification'),
});

export const grievanceUpdateSchema = z.object({
  grievance_id: z.string().min(1),
  status: z.enum(['triage', 'investigating', 'resolved', 'escalated']),
  note: z.string().min(6, 'unionOps.validation.note'),
});

export const legalEscalationSchema = z.object({
  grievance_id: z.string().min(1),
  forum: z.string().min(2, 'unionOps.validation.forum'),
  parties: z.string().min(2, 'unionOps.validation.parties'),
});

export const hearingLogSchema = z.object({
  case_id: z.string().min(1),
  hearing_date: z.string().min(8, 'unionOps.validation.date'),
  hearing_time: z.string().min(4, 'unionOps.validation.time'),
  forum: z.string().min(2, 'unionOps.validation.forum'),
  agenda: z.string().min(4, 'unionOps.validation.agenda'),
});

export type WorkerFormCValues = z.infer<typeof workerFormCSchema>;
export type AnnualReturnMobileValues = z.infer<typeof annualReturnMobileSchema>;
export type WorkerGrievanceDraftValues = z.infer<typeof workerGrievanceDraftSchema>;
export type WorkerVoteOtpValues = z.infer<typeof workerVoteOtpSchema>;
export type EmployerRemittanceValues = z.infer<typeof employerRemittanceSchema>;
export type AnnualReturnFinanceValues = z.infer<typeof annualReturnFinanceSchema>;
export type ElectionNominationValues = z.infer<typeof electionNominationSchema>;
export type CodDemandItemValues = z.infer<typeof codDemandItemSchema>;
export type GrievanceUpdateValues = z.infer<typeof grievanceUpdateSchema>;
export type LegalEscalationValues = z.infer<typeof legalEscalationSchema>;
export type HearingLogValues = z.infer<typeof hearingLogSchema>;
