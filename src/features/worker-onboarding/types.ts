import type { AppLocale } from '@/stores/locale-store';

export type WorkerStatus = 'factory_worker' | 'other_worker' | 'not_sure';
export type UnionMembershipStatus = 'active_member' | 'not_member' | 'not_sure';
export type GrievanceUrgency = 'urgent' | 'not_urgent' | 'not_sure';

export type WorkerOnboardingAnswerValue =
  | WorkerStatus
  | UnionMembershipStatus
  | GrievanceUrgency
  | AppLocale
  | string
  | undefined;

export interface WorkerOnboardingDraft {
  worker_status?: WorkerStatus;
  union_membership_status?: UnionMembershipStatus;
  full_name?: string;
  father_name?: string;
  cnic?: string;
  mobile_number?: string;
  employer_name?: string;
  establishment_name?: string;
  designation?: string;
  department?: string;
  city?: string;
  district?: string;
  province?: string;
  grievance_urgency?: GrievanceUrgency;
  preferred_language?: AppLocale;
}

export type WorkerOnboardingField = keyof WorkerOnboardingDraft;
export type WorkerOnboardingQuestionKind = 'select' | 'text';

export interface WorkerOnboardingOption {
  value: Exclude<WorkerOnboardingAnswerValue, undefined>;
  labelKey: string;
  descriptionKey: string;
}

export interface WorkerOnboardingQuestion {
  id: string;
  field: WorkerOnboardingField;
  kind: WorkerOnboardingQuestionKind;
  titleKey: string;
  descriptionKey: string;
  sourceKey: string;
  placeholderKey?: string;
  keyboardType?: 'default' | 'number-pad' | 'phone-pad';
  options?: WorkerOnboardingOption[];
}
