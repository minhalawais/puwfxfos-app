import { z } from 'zod';

const cnicSchema = z
  .string()
  .transform((value) => value.replace(/\D/g, ''))
  .refine((value) => /^\d{13}$/.test(value), 'unionCore.elections.validation.cnic');

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'unionCore.elections.validation.date');
const timeSchema = z.string().min(4, 'unionCore.elections.validation.time');

export const electionScheduleFormSchema = z
  .object({
    reference_no: z.string().min(4, 'unionCore.elections.validation.reference'),
    title: z.string().min(4, 'unionCore.elections.validation.title'),
    election_type: z.enum(['office_bearer', 'by_election', 'runoff']),
    announcement_date: dateSchema,
    nomination_start_date: dateSchema,
    nomination_end_date: dateSchema,
    objection_end_date: dateSchema,
    final_list_date: dateSchema,
    polling_date: dateSchema,
    polling_time: timeSchema,
    presiding_officer_name: z.string().min(3, 'unionCore.elections.validation.presidingOfficer'),
    presiding_officer_cnic: cnicSchema,
    eligible_voter_count: z.coerce.number().min(1, 'unionCore.elections.validation.eligibleCount'),
    certified_voter_roll_note: z.string().min(6, 'unionCore.elections.validation.rollNote'),
    notes: z.string().min(4, 'unionCore.elections.validation.notes'),
  })
  .superRefine((value, ctx) => {
    const announce = new Date(value.announcement_date).getTime();
    const nominationStart = new Date(value.nomination_start_date).getTime();
    const nominationEnd = new Date(value.nomination_end_date).getTime();
    const objectionEnd = new Date(value.objection_end_date).getTime();
    const finalList = new Date(value.final_list_date).getTime();
    const polling = new Date(value.polling_date).getTime();

    if (nominationStart < announce) {
      ctx.addIssue({
        code: 'custom',
        path: ['nomination_start_date'],
        message: 'unionCore.elections.validation.scheduleOrder',
      });
    }

    if (!(announce <= nominationStart && nominationStart <= nominationEnd && nominationEnd <= objectionEnd && objectionEnd <= finalList && finalList <= polling)) {
      ctx.addIssue({
        code: 'custom',
        path: ['polling_date'],
        message: 'unionCore.elections.validation.scheduleOrder',
      });
    }
  });

export const electionNominationFormSchema = z.object({
  contested_position: z.string().min(3, 'unionCore.elections.validation.position'),
  candidate_name: z.string().min(3, 'unionCore.elections.validation.candidateName'),
  candidate_cnic: cnicSchema,
  membership_number: z.string().min(3, 'unionCore.elections.validation.membershipNumber'),
  union_join_date: dateSchema,
  address: z.string().min(6, 'unionCore.elections.validation.address'),
  proposer_name: z.string().min(3, 'unionCore.elections.validation.proposer'),
  proposer_cnic: cnicSchema,
  seconder_name: z.string().min(3, 'unionCore.elections.validation.seconder'),
  seconder_cnic: cnicSchema,
  scrutiny_note: z.string().min(4, 'unionCore.elections.validation.notes'),
  photo_attached: z.boolean(),
});

export type ElectionScheduleFormValues = z.infer<typeof electionScheduleFormSchema>;
export type ElectionNominationFormValues = z.infer<typeof electionNominationFormSchema>;
