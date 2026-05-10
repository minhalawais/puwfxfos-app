import type { Href } from 'expo-router';
import type { WorkerOnboardingDraft } from '../types';

export function getWorkerOnboardingNextRoute(draft: WorkerOnboardingDraft): Href {
  if (draft.grievance_urgency === 'urgent') {
    return '/(worker)/grievances' as Href;
  }

  if (draft.worker_status !== 'factory_worker' || draft.union_membership_status !== 'active_member') {
    return '/(worker)/rights' as Href;
  }

  return '/(worker)/dashboard' as Href;
}
