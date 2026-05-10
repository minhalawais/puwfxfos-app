import type { WorkerOnboardingQuestion } from './types';

export const workerOnboardingQuestions: WorkerOnboardingQuestion[] = [
  {
    id: 'worker-status',
    field: 'worker_status',
    kind: 'select',
    titleKey: 'onboarding.questions.workerStatus.title',
    descriptionKey: 'onboarding.questions.workerStatus.description',
    sourceKey: 'onboarding.sources.prd',
    options: [
      { value: 'factory_worker', labelKey: 'onboarding.answers.factoryWorker', descriptionKey: 'onboarding.answerDescriptions.factoryWorker' },
      { value: 'other_worker', labelKey: 'onboarding.answers.otherWorker', descriptionKey: 'onboarding.answerDescriptions.otherWorker' },
      { value: 'not_sure', labelKey: 'common.notSure', descriptionKey: 'onboarding.answerDescriptions.notSureWorker' },
    ],
  },
  {
    id: 'union-membership',
    field: 'union_membership_status',
    kind: 'select',
    titleKey: 'onboarding.questions.unionMembership.title',
    descriptionKey: 'onboarding.questions.unionMembership.description',
    sourceKey: 'onboarding.sources.formC',
    options: [
      { value: 'active_member', labelKey: 'onboarding.answers.activeMember', descriptionKey: 'onboarding.answerDescriptions.activeMember' },
      { value: 'not_member', labelKey: 'onboarding.answers.notMember', descriptionKey: 'onboarding.answerDescriptions.notMember' },
      { value: 'not_sure', labelKey: 'common.notSure', descriptionKey: 'onboarding.answerDescriptions.notSureMember' },
    ],
  },
  {
    id: 'full-name',
    field: 'full_name',
    kind: 'text',
    titleKey: 'onboarding.questions.fullName.title',
    descriptionKey: 'onboarding.questions.fullName.description',
    sourceKey: 'onboarding.sources.formC',
    placeholderKey: 'onboarding.placeholders.fullName',
  },
  {
    id: 'cnic',
    field: 'cnic',
    kind: 'text',
    titleKey: 'onboarding.questions.cnic.title',
    descriptionKey: 'onboarding.questions.cnic.description',
    sourceKey: 'onboarding.sources.formC',
    placeholderKey: 'onboarding.placeholders.cnic',
    keyboardType: 'number-pad',
  },
  {
    id: 'grievance-urgency',
    field: 'grievance_urgency',
    kind: 'select',
    titleKey: 'onboarding.questions.urgency.title',
    descriptionKey: 'onboarding.questions.urgency.description',
    sourceKey: 'onboarding.sources.grievance',
    options: [
      { value: 'urgent', labelKey: 'onboarding.answers.urgent', descriptionKey: 'onboarding.answerDescriptions.urgent' },
      { value: 'not_urgent', labelKey: 'onboarding.answers.notUrgent', descriptionKey: 'onboarding.answerDescriptions.notUrgent' },
      { value: 'not_sure', labelKey: 'common.notSure', descriptionKey: 'onboarding.answerDescriptions.notSureUrgency' },
    ],
  },
];
