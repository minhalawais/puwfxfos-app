import { z } from 'zod';

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'unionCore.cba.validation.date');

export const cbaRecordFormSchema = z.object({
  title: z.string().min(3, 'unionCore.cba.validation.title'),
  employer: z.string().min(2, 'unionCore.cba.validation.employer'),
  establishment_name: z.string().min(2, 'unionCore.cba.validation.establishment'),
  certificate_number: z.string().min(2, 'unionCore.cba.validation.certificateNumber'),
  legal_form: z.string().min(2, 'unionCore.cba.validation.legalForm'),
  rule_reference: z.string().min(2, 'unionCore.cba.validation.ruleReference'),
  section_reference: z.string().min(2, 'unionCore.cba.validation.sectionReference'),
  issuing_authority: z.string().min(2, 'unionCore.cba.validation.issuer'),
  region: z.string().min(2, 'unionCore.cba.validation.region'),
  issue_date: dateSchema,
  effective_date: dateSchema,
  expiry_date: dateSchema,
  status: z.enum(['active', 'renewal_pending', 'expired', 'revoked']),
  covered_workers: z.number().min(0, 'unionCore.cba.validation.counts'),
  membership_at_cert: z.number().min(0, 'unionCore.cba.validation.counts'),
  total_workforce: z.number().min(0, 'unionCore.cba.validation.counts'),
  membership_percentage: z.number().min(0, 'unionCore.cba.validation.percentage').max(100, 'unionCore.cba.validation.percentage'),
  determination_type: z.enum(['single_union', 'referendum']),
  determination_basis: z.string().min(10, 'unionCore.cba.validation.basis'),
  secret_ballot_date: z.union([z.literal(''), dateSchema]).optional(),
  certificate_reference: z.string().min(2, 'unionCore.cba.validation.reference'),
  notes: z.string().optional(),
}).superRefine((value, ctx) => {
  if (new Date(value.expiry_date).getTime() <= new Date(value.effective_date).getTime()) {
    ctx.addIssue({
      code: 'custom',
      path: ['expiry_date'],
      message: 'unionCore.cba.validation.expiryOrder',
    });
  }
});

export const codDemandFormSchema = z.object({
  id: z.string(),
  category: z.enum(['wages', 'allowances', 'benefits', 'working_conditions', 'leave', 'health_safety', 'job_security', 'other']),
  title: z.string().min(3, 'unionCore.cba.validation.demandTitle'),
  current_value: z.string().optional(),
  demanded_value: z.string().optional(),
  justification: z.string().min(8, 'unionCore.cba.validation.justification'),
});

export const codWorkflowFormSchema = z.object({
  cba_id: z.string().min(1, 'unionCore.cba.validation.linkedCba'),
  reference_number: z.string().min(2, 'unionCore.cba.validation.reference'),
  current_stage: z.enum(['draft', 'submitted', 'response_pending', 'negotiation', 'conciliation', 'arbitration', 'strike_notice', 'settlement', 'closed']),
  demands: z.array(codDemandFormSchema).min(1, 'unionCore.cba.validation.demandCount'),
  submission_date: z.union([z.literal(''), dateSchema]).optional(),
  management_response_date: z.union([z.literal(''), dateSchema]).optional(),
  management_response: z.enum(['accepted', 'partial', 'counter_offer', 'rejected']).nullable(),
  management_notes: z.string().optional(),
  conciliation_officer: z.string().optional(),
  conciliation_start_date: z.union([z.literal(''), dateSchema]).optional(),
  conciliation_end_date: z.union([z.literal(''), dateSchema]).optional(),
  conciliation_outcome: z.string().optional(),
  arbitrator_name: z.string().optional(),
  arbitration_award: z.string().optional(),
  strike_notice_date: z.union([z.literal(''), dateSchema]).optional(),
  strike_notice_expiry: z.union([z.literal(''), dateSchema]).optional(),
  settlement_date: z.union([z.literal(''), dateSchema]).optional(),
  mos_reference: z.string().optional(),
  settlement_notes: z.string().optional(),
  next_deadline: z.union([z.literal(''), dateSchema]).optional(),
}).superRefine((value, ctx) => {
  if (value.current_stage === 'settlement' && !value.settlement_date) {
    ctx.addIssue({
      code: 'custom',
      path: ['settlement_date'],
      message: 'unionCore.cba.validation.settlementDate',
    });
  }

  if (value.current_stage === 'settlement' && !value.mos_reference?.trim()) {
    ctx.addIssue({
      code: 'custom',
      path: ['mos_reference'],
      message: 'unionCore.cba.validation.mosReference',
    });
  }

  if (value.current_stage === 'strike_notice' && !value.strike_notice_date) {
    ctx.addIssue({
      code: 'custom',
      path: ['strike_notice_date'],
      message: 'unionCore.cba.validation.strikeDate',
    });
  }

  if (value.current_stage === 'strike_notice' && !value.strike_notice_expiry) {
    ctx.addIssue({
      code: 'custom',
      path: ['strike_notice_expiry'],
      message: 'unionCore.cba.validation.strikeExpiry',
    });
  }
});

export const negotiationRoundFormSchema = z.object({
  meeting_date: dateSchema,
  attendees: z.string().min(4, 'unionCore.cba.validation.attendees'),
  outcomes: z.string().min(4, 'unionCore.cba.validation.outcomes'),
  next_steps: z.string().min(4, 'unionCore.cba.validation.nextSteps'),
});

export type CBARecordFormValues = z.infer<typeof cbaRecordFormSchema>;
export type CoDDemandFormValues = z.infer<typeof codDemandFormSchema>;
export type CoDWorkflowFormValues = z.infer<typeof codWorkflowFormSchema>;
export type NegotiationRoundFormValues = z.infer<typeof negotiationRoundFormSchema>;
