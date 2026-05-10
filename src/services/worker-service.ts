import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { demoWorker, rightsTopics, workerDues, workerElections, workerGrievances, workerNotifications, workerUnionProfile } from '@/data/mobile-mock-data';
import type { GrievanceCase, GrievanceDraft, WorkerDashboardSummary } from '@/types/domain';

function delay<T>(data: T, ms = 150): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export function useWorkerDashboard() {
  return useQuery({
    queryKey: ['worker', 'dashboard'],
    queryFn: () => delay<WorkerDashboardSummary>({
      worker_identity: {
        name: demoWorker.name,
        masked_cnic: '35201-*****-1',
        designation: demoWorker.job_title,
        department: demoWorker.department,
        employer: demoWorker.company_name,
        union_name: demoWorker.union_name,
        worker_id: demoWorker.id,
        join_date: demoWorker.join_date,
        membership_status: demoWorker.membership_status,
      },
      digital_id: { available: true, downloadable: false, worker_id: demoWorker.id, qr_payload: `PUWF:${demoWorker.id}:MASKED`, offline_available: true, issued_on: '2026-04-01' },
      benefits: {
        eobi_number: demoWorker.eobi_number,
        eobi_verified: demoWorker.eobi_verified,
        social_security_status: demoWorker.social_security_status,
      },
      dues_summary: { current_status: 'pending', outstanding_months: 1, latest_receipt_no: 'RC-2026-041', latest_paid_month: 'April 2026', employer_deduction_status: 'deducted' },
      grievance_summary: { active_count: 1, latest_status: 'investigating', latest_reference: 'GRS-2026-0018', sla_label_key: 'workerPortal.dashboard.slaTwoDays' },
      voting_summary: { active_election_title: 'workerPortal.voting.electionTitle', eligible: true, already_voted: false, status: 'open' },
      notifications_summary: { unread_count: 2, latest_title_key: 'workerPortal.notifications.cbaTitle' },
      union_summary: {
        registration_no: 'RTU-LHR-2020-52',
        cba_status: 'active',
        president_name: 'Rashid Ahmed',
        gen_sec_name: 'Zafar Iqbal',
        contact_phone: '+92 300 0000000',
      },
    }),
  });
}

export function useWorkerDues() {
  return useQuery({ queryKey: ['worker', 'dues'], queryFn: () => delay(workerDues) });
}

export function useWorkerGrievances() {
  return useQuery({ queryKey: ['worker', 'grievances'], queryFn: () => delay(workerGrievances) });
}

export function useWorkerElections() {
  return useQuery({ queryKey: ['worker', 'elections'], queryFn: () => delay(workerElections) });
}

export function useWorkerUnion() {
  return useQuery({ queryKey: ['worker', 'union'], queryFn: () => delay(workerUnionProfile) });
}

export function useWorkerRights() {
  return useQuery({ queryKey: ['worker', 'rights'], queryFn: () => delay(rightsTopics) });
}

export function useWorkerNotifications() {
  return useQuery({ queryKey: ['worker', 'notifications'], queryFn: () => delay(workerNotifications) });
}

export function useSubmitWorkerGrievance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: GrievanceDraft) => delay<GrievanceCase>({
      id: 'gr-new-demo',
      reference_no: 'GRS-DEMO-0001',
      category: draft.category,
      description: draft.description,
      status: 'submitted',
      priority: draft.priority,
      employer_name: draft.employer_name,
      establishment_name: draft.establishment_name,
      sla_deadline: '2026-05-15',
      assigned_handler: 'Mock Union Desk',
      timeline: [
        { id: 'tl-new', status: 'submitted', title_key: 'workerPortal.grievance.timeline.submittedTitle', description_key: 'workerPortal.grievance.timeline.submittedBody', date: '2026-05-08' },
      ],
    }, 350),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worker', 'grievances'] }).catch(() => undefined);
    },
  });
}

export function useConfirmWorkerVote() {
  return useMutation({
    mutationFn: ({ candidateId }: { electionId: string; candidateId: string; otp: string }) => delay({ confirmationNo: `VOTE-DEMO-${candidateId.toUpperCase()}`, mockOnly: true }, 350),
  });
}

export function useMarkWorkerNotificationRead() {
  return useMutation({
    mutationFn: ({ notificationId }: { notificationId: string }) => delay({ notificationId, read: true }, 150),
  });
}
