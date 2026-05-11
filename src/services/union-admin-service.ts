import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  legalCases,
  officeBearers,
  unionAnnualReturnDraft,
  unionAdminDashboardSummary,
  unionCBAEvidence,
  unionCBARecords,
  unionComplianceDocuments,
  unionComplianceObligations,
  unionCoDWorkflows,
  unionElectionOperation,
  unionElectionRegistry,
  unionFinanceSummary,
  unionGrievanceQueue,
  unionMembers,
  unionMemberDetails,
  unionMemberImportJobs,
  unionOfficeBearerRecords,
} from '@/data/mobile-mock-data';
import type {
  CBAEvidenceItem,
  CBAStatus,
  CoDStage,
  LegalEscalationDraft,
  MemberImportPreview,
  MemberLifecycleEvent,
  MemberVerificationState,
  NegotiationRound,
  RemittanceReceiptAction,
  UnionElectionCandidateRecord,
  UnionElectionDetail,
  UnionElectionStatus,
  UnionElectionWorkspaceSummary,
  OfficeBearerHistoryEvent,
  OfficeBearerStatus,
  UnionCBARecord,
  UnionCBARecordDetail,
  UnionCBAWorkspaceSummary,
  UnionCoDWorkflow,
  UnionMemberDetail,
  UnionMemberRecord,
  UnionOfficeBearerRecord,
  UnionOfficeBearerWorkspaceSummary,
  WelfareCaseStatus,
} from '@/types/domain';

function delay<T>(data: T, ms = 150): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function maskCnic(cnic: string): string {
  const digits = cnic.replace(/\D/g, '');
  if (digits.length !== 13) return cnic;
  return `${digits.slice(0, 5)}-*****${digits.slice(10, 12)}-${digits.slice(12)}`;
}

function computeFormCStatus(detail: UnionMemberDetail): UnionMemberRecord['form_c_status'] {
  if (!detail.documents.signature_attached) return 'missing_signature';
  if (
    !detail.permanent_address ||
    !detail.job_title ||
    !detail.joined_union_on ||
    !detail.documents.thumb_attached
  ) {
    return 'draft';
  }

  return 'complete';
}

function computeReadiness(detail: UnionMemberDetail) {
  const checks = [
    !!detail.name,
    !!detail.cnic,
    !!detail.father_name,
    !!detail.job_title,
    !!detail.joined_union_on,
    !!detail.monthly_subscription,
    detail.verification.nadra_status === 'verified',
    detail.verification.eobi_status === 'verified' || !!detail.eobi_number,
    detail.documents.signature_attached,
    detail.documents.thumb_attached,
    detail.dues_status !== 'overdue',
  ];

  const readinessScore = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  const annualReturnReady =
    readinessScore >= 72 && computeFormCStatus(detail) === 'complete' && detail.membership_status === 'active';
  const electionReady =
    annualReturnReady &&
    detail.verification.election_roll_status === 'ready' &&
    detail.membership_status === 'active' &&
    !detail.deceased_record;
  const dataRisk: UnionMemberRecord['data_risk'] =
    detail.dues_status === 'overdue' || detail.verification.nadra_status !== 'verified'
      ? 'urgent'
      : !annualReturnReady || computeFormCStatus(detail) !== 'complete'
        ? 'medium'
        : 'low';

  return { readinessScore, annualReturnReady, electionReady, dataRisk };
}

function buildVerification(detail: UnionMemberDetail): MemberVerificationState {
  const formStatus = computeFormCStatus(detail);
  const { annualReturnReady, electionReady } = computeReadiness(detail);

  return {
    ...detail.verification,
    cnic_unique: true,
    annual_return_status: annualReturnReady ? 'ready' : 'blocked',
    election_roll_status: electionReady ? 'ready' : 'blocked',
    verification_note:
      detail.verification.verification_note ??
      (formStatus === 'complete'
        ? 'Registry checks align with current compliance requirements.'
        : 'Some Form C or verification items still need completion.'),
  };
}

function normalizeDetail(detail: UnionMemberDetail): UnionMemberDetail {
  const derivedVerification = buildVerification(detail);
  const { readinessScore, annualReturnReady, electionReady, dataRisk } = computeReadiness({
    ...detail,
    verification: derivedVerification,
  });

  return {
    ...detail,
    masked_cnic: maskCnic(detail.cnic),
    form_c_status: computeFormCStatus(detail),
    annual_return_ready: annualReturnReady,
    election_ready: detail.membership_status === 'deceased' ? false : electionReady,
    readiness_score: readinessScore,
    data_risk: detail.membership_status === 'deceased' ? 'medium' : dataRisk,
    nadra_verified: derivedVerification.nadra_status === 'verified',
    eobi_verified: derivedVerification.eobi_status === 'verified',
    digital_id_generated: !!detail.digital_id_qr_data || detail.digital_id_generated,
    verification: derivedVerification,
  };
}

function toRecord(detail: UnionMemberDetail): UnionMemberRecord {
  const normalized = normalizeDetail(detail);
  return {
    id: normalized.id,
    cnic: normalized.cnic,
    name: normalized.name,
    phone: normalized.phone,
    father_name: normalized.father_name,
    job_title: normalized.job_title,
    department: normalized.department,
    company_name: normalized.company_name,
    join_date: normalized.join_date,
    employment_type: normalized.employment_type,
    union_name: normalized.union_name,
    membership_status: normalized.membership_status,
    eobi_number: normalized.eobi_number,
    eobi_verified: normalized.eobi_verified,
    social_security_status: normalized.social_security_status,
    member_id: normalized.member_id,
    masked_cnic: normalized.masked_cnic,
    form_c_status: normalized.form_c_status,
    dues_status: normalized.dues_status,
    election_ready: normalized.election_ready,
    annual_return_ready: normalized.annual_return_ready,
    readiness_score: normalized.readiness_score,
    data_risk: normalized.data_risk,
    nadra_verified: normalized.nadra_verified,
    digital_id_generated: normalized.digital_id_generated,
    district: normalized.district,
    province: normalized.province,
    monthly_subscription: normalized.monthly_subscription,
    joined_union_on: normalized.joined_union_on,
  };
}

function createLifecycleTitle(eventType: MemberLifecycleEvent['event_type']) {
  switch (eventType) {
    case 'promoted':
      return ['unionCore.members.lifecycle.promotedTitle', 'unionCore.members.lifecycle.promotedBody'] as const;
    case 'transferred':
      return ['unionCore.members.lifecycle.transferredTitle', 'unionCore.members.lifecycle.transferredBody'] as const;
    case 'salary_change':
      return ['unionCore.members.lifecycle.salaryTitle', 'unionCore.members.lifecycle.salaryBody'] as const;
    case 'converted':
      return ['unionCore.members.lifecycle.convertedTitle', 'unionCore.members.lifecycle.convertedBody'] as const;
    case 'reinstated':
      return ['unionCore.members.lifecycle.reinstatedTitle', 'unionCore.members.lifecycle.reinstatedBody'] as const;
    case 'terminated':
      return ['unionCore.members.lifecycle.terminatedTitle', 'unionCore.members.lifecycle.terminatedBody'] as const;
    case 'retired':
      return ['unionCore.members.lifecycle.retiredTitle', 'unionCore.members.lifecycle.retiredBody'] as const;
    case 'deceased':
      return ['unionCore.members.lifecycle.deceasedTitle', 'unionCore.members.lifecycle.deceasedBody'] as const;
    default:
      return ['unionCore.members.lifecycle.joinedTitle', 'unionCore.members.lifecycle.joinedBody'] as const;
  }
}

let memberDetailsState: UnionMemberDetail[] = unionMemberDetails.map((detail) => normalizeDetail(clone(detail)));
let memberImportJobsState = clone(unionMemberImportJobs);
let latestImportPreview: MemberImportPreview | null = null;
let officeBearerState: UnionOfficeBearerRecord[] = clone(unionOfficeBearerRecords);
let cbaRecordState: UnionCBARecord[] = clone(unionCBARecords);
let codWorkflowState: UnionCoDWorkflow[] = clone(unionCoDWorkflows);
let cbaEvidenceState: CBAEvidenceItem[] = clone(unionCBAEvidence);
let electionRegistryState: UnionElectionDetail[] = clone(unionElectionRegistry);
let grievanceQueueState = clone(unionGrievanceQueue);
let legalCasesState = clone(legalCases);

export const officeBearerPositionOptions = [
  'President',
  'Chairman',
  'General Secretary',
  'Chief Organizer',
  'Vice President I (Senior)',
  'Vice President II',
  'Vice President III (Women)',
  'Vice President IV',
  'Vice Chairman I (Women)',
  'Vice Chairman II',
  'Vice Chairman III',
  'Vice Chairman IV',
  'Deputy General Secretary I',
  'Deputy General Secretary II',
  'Deputy General Secretary III',
  'Deputy General Secretary IV',
  'Secretary Education',
  'Secretary Organizing',
  'Secretary Information',
  'Secretary Youth',
  'Finance Secretary',
  'Secretary Legal Affairs',
  'Secretary Women',
] as const;

function calculateDaysToExpiry(termExpiryDate: string) {
  const diff = new Date(termExpiryDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function isWomenRepresentationRole(position: string, gender: UnionOfficeBearerRecord['gender']) {
  return position.includes('(Women)') || position === 'Secretary Women' || gender === 'female';
}

function calculateOutsiderPercentage(rows: UnionOfficeBearerRecord[]) {
  const active = rows.filter((item) => item.status === 'active' || item.status === 'reinstated');
  if (!active.length) return 0;
  return Math.round((active.filter((item) => item.outsider).length / active.length) * 100);
}

function computeVacancies(rows: UnionOfficeBearerRecord[]) {
  const occupied = new Set(
    rows
      .filter((item) => item.status === 'active' || item.status === 'reinstated')
      .map((item) => item.position),
  );
  return officeBearerPositionOptions.filter((position) => !occupied.has(position));
}

function normalizeOfficeBearerRecord(record: UnionOfficeBearerRecord): UnionOfficeBearerRecord {
  const positionKey = record.position === 'President'
    ? 'unionCore.designations.president'
    : record.position === 'General Secretary'
      ? 'unionCore.designations.generalSecretary'
      : record.position === 'Finance Secretary'
        ? 'unionCore.designations.financeSecretary'
        : record.position === 'Secretary Legal Affairs'
          ? 'unionCore.designations.legalSecretary'
          : record.position === 'Secretary Women'
            ? 'unionCore.designations.secretaryWomen'
            : 'unionCore.designations.officeBearer';

  return {
    ...record,
    masked_cnic: maskCnic(record.cnic),
    designation_key: positionKey,
    evidence_status: record.days_to_expiry <= 180 ? 'due_soon' : record.evidence_status,
    women_representation_role: isWomenRepresentationRole(record.position, record.gender),
    days_to_expiry: calculateDaysToExpiry(record.term_expiry_date),
  };
}

function getOfficeBearerWorkspaceSummary(): UnionOfficeBearerWorkspaceSummary {
  const data = officeBearerState.map((item) => normalizeOfficeBearerRecord(item));
  return {
    data,
    outsider_percentage: calculateOutsiderPercentage(data),
    women_count: data.filter((item) => item.status === 'active' || item.status === 'reinstated').filter((item) => item.gender === 'female').length,
    expiring_soon_count: data.filter((item) => (item.status === 'active' || item.status === 'reinstated') && item.days_to_expiry <= 180).length,
    vacancies: computeVacancies(data),
  };
}

function calculateDaysUntil(value: string) {
  const diff = new Date(value).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getCbaEvidenceForRecord(recordId: string) {
  return cbaEvidenceState.filter((item) => item.cba_id === recordId);
}

function getReadinessScore(evidence: CBAEvidenceItem[]) {
  if (!evidence.length) return 0;
  const achieved = evidence.filter((item) => item.status === 'available').length;
  return Math.round((achieved / evidence.length) * 100);
}

function normalizeCbaRecord(record: UnionCBARecord): UnionCBARecord {
  const days = calculateDaysUntil(record.expiry_date);
  const nextStatus: CBAStatus =
    record.status === 'revoked'
      ? 'revoked'
      : days < 0
        ? 'expired'
        : record.status;

  return {
    ...record,
    status: nextStatus,
  };
}

function toCbaDetail(record: UnionCBARecord): UnionCBARecordDetail {
  const evidence = getCbaEvidenceForRecord(record.id);
  return {
    ...normalizeCbaRecord(record),
    evidence,
    linked_cod_ids: codWorkflowState.filter((item) => item.cba_id === record.id).map((item) => item.id),
    readiness_score: getReadinessScore(evidence),
    missing_evidence_count: evidence.filter((item) => item.status === 'missing' || item.status === 'pending').length,
  };
}

function getCbaCurrentRecord(details: UnionCBARecordDetail[]) {
  return (
    details.find((item) => item.status === 'active') ??
    details.find((item) => item.status === 'renewal_pending') ??
    details[0] ??
    null
  );
}

function getUnionCBAWorkspaceSummary(): UnionCBAWorkspaceSummary {
  const details = cbaRecordState.map((item) => toCbaDetail(item));
  const current = getCbaCurrentRecord(details);
  const renewal = details.find((item) => item.status === 'renewal_pending' && item.id !== current?.id) ?? null;
  const workflows = clone(codWorkflowState).sort((a, b) => {
    const order: CoDStage[] = ['conciliation', 'negotiation', 'response_pending', 'submitted', 'draft', 'arbitration', 'strike_notice', 'settlement', 'closed'];
    return order.indexOf(a.current_stage) - order.indexOf(b.current_stage);
  });

  return {
    current_record: current,
    renewal_record: renewal,
    historical_records: details.filter((item) => item.id !== current?.id && item.id !== renewal?.id),
    workflows,
    active_workflow: workflows.find((item) => item.current_stage !== 'closed' && item.current_stage !== 'settlement') ?? workflows[0] ?? null,
    evidence: clone(cbaEvidenceState),
    stats: {
      active_count: details.filter((item) => item.status === 'active').length,
      renewal_pending_count: details.filter((item) => item.status === 'renewal_pending').length,
      expired_or_revoked_count: details.filter((item) => item.status === 'expired' || item.status === 'revoked').length,
      expiring_90_count: details.filter((item) => {
        const days = calculateDaysUntil(item.expiry_date);
        return days >= 0 && days <= 90;
      }).length,
      total_covered_workers: details.reduce((sum, item) => sum + item.covered_workers, 0),
    },
  };
}

function invalidateOfficeBearerQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['union-admin', 'office-bearers'] });
}

function invalidateMemberQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['union-admin', 'members'] });
  queryClient.invalidateQueries({ queryKey: ['union-admin', 'member-detail'] });
  queryClient.invalidateQueries({ queryKey: ['union-admin', 'member-import-jobs'] });
}

function invalidateCbaQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['union-admin', 'cba-workspace'] });
  queryClient.invalidateQueries({ queryKey: ['union-admin', 'cba-record'] });
  queryClient.invalidateQueries({ queryKey: ['union-admin', 'cod-workflow'] });
}

function electionPriority(status: UnionElectionStatus) {
  switch (status) {
    case 'polling':
      return 0;
    case 'nomination_open':
      return 1;
    case 'objection_period':
      return 2;
    case 'candidates_final':
      return 3;
    case 'results_announced':
      return 4;
    case 'announced':
      return 5;
    case 'nomination_closed':
      return 6;
    case 'completed':
      return 7;
    default:
      return 8;
  }
}

function maskDigitsCnic(cnic: string) {
  return maskCnic(cnic);
}

function getUnionElectionWorkspaceSummary(): UnionElectionWorkspaceSummary {
  const data = clone(electionRegistryState).sort((left, right) => {
    const byPriority = electionPriority(left.status) - electionPriority(right.status);
    if (byPriority !== 0) return byPriority;
    return right.polling_date.localeCompare(left.polling_date);
  });
  const current =
    data.find((item) => item.status === 'polling') ??
    data.find((item) => item.status === 'nomination_open') ??
    data[0] ??
    null;
  const disputes = data.flatMap((item) => item.disputes);

  return {
    current_election: current,
    data,
    nominations_under_review_count: data
      .flatMap((item) => item.candidates)
      .filter((item) => item.status === 'submitted' || item.status === 'under_objection').length,
    pending_result_count: data.filter(
      (item) =>
        (item.status === 'polling' || item.status === 'results_announced') &&
        (!item.result_summary?.published || !item.result_summary?.office_bearer_sync_ready),
    ).length,
    polling_soon_count: data.filter((item) => {
      const days = calculateDaysUntil(item.polling_date);
      return days >= 0 && days <= 14;
    }).length,
    nomination_open_count: data.filter((item) => item.status === 'nomination_open').length,
    pending_office_bearer_sync_count: data.filter(
      (item) => item.result_summary?.published && !item.result_summary.office_bearer_sync_ready,
    ).length,
    disputes,
  };
}

function invalidateElectionQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['union-admin', 'elections-workspace'] });
  queryClient.invalidateQueries({ queryKey: ['union-admin', 'election-detail'] });
}

export function useUnionAdminDashboard() {
  return useQuery({
    queryKey: ['union-admin', 'dashboard'],
    queryFn: () => delay(unionAdminDashboardSummary),
  });
}

export function useUnionMembers() {
  return useQuery({
    queryKey: ['union-admin', 'members'],
    queryFn: () => delay(memberDetailsState.map((detail) => toRecord(detail))),
  });
}

export function useUnionMemberDetail(memberId: string | null) {
  return useQuery({
    queryKey: ['union-admin', 'member-detail', memberId],
    enabled: !!memberId,
    queryFn: async () => {
      const detail = memberDetailsState.find((item) => item.id === memberId);
      if (!detail) {
        throw new Error(`Member ${memberId} not found`);
      }

      return delay(clone(normalizeDetail(detail)));
    },
  });
}

export function useUnionMemberImportJobs() {
  return useQuery({
    queryKey: ['union-admin', 'member-import-jobs'],
    queryFn: () => delay(clone(memberImportJobsState)),
  });
}

export function useUpsertUnionMemberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (detail: UnionMemberDetail) => {
      const normalized = normalizeDetail(clone(detail));
      const index = memberDetailsState.findIndex((item) => item.id === normalized.id);
      if (index === -1) {
        memberDetailsState = [normalized, ...memberDetailsState];
      } else {
        memberDetailsState = memberDetailsState.map((item) => (item.id === normalized.id ? normalized : item));
      }

      return delay(normalized, 250);
    },
    onSuccess: () => invalidateMemberQueries(queryClient),
  });
}

export function useUpdateMemberVerificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      memberId,
      verification,
    }: {
      memberId: string;
      verification: Partial<MemberVerificationState>;
    }) => {
      memberDetailsState = memberDetailsState.map((detail) =>
        detail.id === memberId
          ? normalizeDetail({
              ...detail,
              verification: {
                ...detail.verification,
                ...verification,
              },
            })
          : detail,
      );

      return delay(memberDetailsState.find((item) => item.id === memberId)!, 220);
    },
    onSuccess: () => invalidateMemberQueries(queryClient),
  });
}

export function useAddMemberLifecycleEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      memberId,
      event,
    }: {
      memberId: string;
      event: Omit<MemberLifecycleEvent, 'id' | 'member_id' | 'title_key' | 'description_key'> & {
        beneficiary_name?: string;
        beneficiary_cnic?: string;
        beneficiary_relation?: string;
        beneficiary_phone?: string;
        death_grant_status?: 'pending' | 'approved' | 'paid' | 'rejected';
        death_grant_amount?: number;
      };
    }) => {
      memberDetailsState = memberDetailsState.map((detail) => {
        if (detail.id !== memberId) return detail;

        const [titleKey, descriptionKey] = createLifecycleTitle(event.event_type);
        const lifecycleEvent: MemberLifecycleEvent = {
          id: `${memberId}-${event.event_type}-${Date.now()}`,
          member_id: memberId,
          event_type: event.event_type,
          event_date: event.event_date,
          title_key: titleKey,
          description_key: descriptionKey,
          establishment_name: event.establishment_name,
          department: event.department,
          designation: event.designation,
          salary: event.salary,
          notes: event.notes,
        };

        const nextMembershipStatus =
          event.event_type === 'terminated'
            ? 'terminated'
            : event.event_type === 'retired'
              ? 'retired'
              : event.event_type === 'deceased'
                ? 'deceased'
                : event.event_type === 'transferred'
                  ? 'transferred'
                  : event.event_type === 'reinstated'
                    ? 'active'
                    : detail.membership_status;

        return normalizeDetail({
          ...detail,
          membership_status: nextMembershipStatus,
          status_reason: event.notes ?? detail.status_reason,
          lifecycle_events: [lifecycleEvent, ...detail.lifecycle_events],
          deceased_record:
            event.event_type === 'deceased'
              ? {
                  date_of_death: event.event_date,
                  beneficiary_name: event.beneficiary_name ?? '',
                  beneficiary_cnic: event.beneficiary_cnic ?? '',
                  beneficiary_relation: event.beneficiary_relation ?? '',
                  beneficiary_phone: event.beneficiary_phone ?? '',
                  death_grant_status: event.death_grant_status ?? 'pending',
                  death_grant_amount: event.death_grant_amount,
                }
              : detail.deceased_record,
        });
      });

      return delay(memberDetailsState.find((item) => item.id === memberId)!, 220);
    },
    onSuccess: () => invalidateMemberQueries(queryClient),
  });
}

export function usePreviewMemberImportMutation() {
  return useMutation({
    mutationFn: async ({ fileName }: { fileName: string }) => {
      const preview: MemberImportPreview = {
        id: `preview-${Date.now()}`,
        file_name: fileName,
        picked_at: new Date().toISOString(),
        total_rows: 6,
        ready_rows: 3,
        duplicate_rows: 1,
        error_rows: 2,
        rows: [
          { row_number: 2, worker_name: 'Nadeem Abbas', cnic: '35202-1177771-3', status: 'ready', issue_count: 0 },
          { row_number: 3, worker_name: 'Muhammad Akram', cnic: '35201-1234567-1', status: 'duplicate', issue_count: 1 },
          { row_number: 4, worker_name: 'Rukhsana Bibi', cnic: '35202-2233445-7', status: 'ready', issue_count: 0 },
          { row_number: 5, worker_name: 'Sajid', cnic: '3520', status: 'error', issue_count: 2 },
          { row_number: 6, worker_name: 'Parveen Akhtar', cnic: '35202-7711882-4', status: 'ready', issue_count: 0 },
          { row_number: 7, worker_name: 'Bilal Khan', cnic: '35201-5553331-9', status: 'error', issue_count: 1 },
        ],
        issues: [
          { row_number: 3, field: 'cnic', severity: 'warning', message_key: 'unionCore.members.import.issues.duplicate' },
          { row_number: 5, field: 'cnic', severity: 'error', message_key: 'unionCore.members.import.issues.invalidCnic' },
          { row_number: 5, field: 'designation', severity: 'error', message_key: 'unionCore.members.import.issues.missingDesignation' },
          { row_number: 7, field: 'form_c', severity: 'error', message_key: 'unionCore.members.import.issues.existingPending' },
        ],
      };

      latestImportPreview = preview;
      return delay(preview, 320);
    },
  });
}

export function useCommitMemberImportMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (previewId: string) => {
      if (!latestImportPreview || latestImportPreview.id !== previewId) {
        throw new Error('Import preview is not available');
      }

      const newMembers: UnionMemberDetail[] = latestImportPreview.rows
        .filter((row) => row.status === 'ready')
        .map((row, index) =>
          normalizeDetail({
            id: `imported-${Date.now()}-${index}`,
            cnic: row.cnic,
            name: row.worker_name,
            phone: '+92 300 0000000',
            father_name: 'To be confirmed',
            job_title: index === 0 ? 'Sanitation Worker' : 'Field Worker',
            department: 'Imported roster',
            company_name: 'Lahore Waste Management Company',
            join_date: '2026-05-01',
            employment_type: 'contract',
            union_name: 'Green Clean Labour Union LWMC',
            membership_status: 'pending',
            eobi_number: '',
            eobi_verified: false,
            social_security_status: 'pending',
            member_id: `PUWF-IMP-${Date.now().toString().slice(-5)}${index}`,
            masked_cnic: maskCnic(row.cnic),
            form_c_status: 'draft',
            dues_status: 'pending',
            election_ready: false,
            annual_return_ready: false,
            readiness_score: 42,
            data_risk: 'medium',
            nadra_verified: false,
            digital_id_generated: false,
            district: 'Lahore',
            province: 'Punjab',
            monthly_subscription: 200,
            joined_union_on: '2026-05-09',
            full_name_urdu: '',
            date_of_birth: '',
            gender: 'male',
            email: '',
            permanent_address: '',
            current_address: '',
            establishment_name: 'Imported roster',
            employer_name: 'Lahore Waste Management Company',
            trade: '',
            employment_date: '2026-05-01',
            monthly_salary: 32000,
            social_security_number: '',
            wwf_eligible: true,
            pf_status: 'pending',
            gratuity_status: 'pending',
            education_level: '',
            status_reason: 'Imported from roster preview and awaiting full Form C completion.',
            digital_id_qr_data: '',
            verification: {
              nadra_status: 'pending',
              eobi_status: 'pending',
              cnic_unique: true,
              election_roll_status: 'blocked',
              annual_return_status: 'blocked',
              verification_note: 'Imported record awaiting verification.',
            },
            documents: {
              photo_attached: false,
              signature_attached: false,
              thumb_attached: false,
              cnic_copy_attached: false,
              subscription_consent_attached: false,
              supporting_notes: 'Imported from bulk roster and awaiting field validation.',
            },
            benefit_records: [],
            lifecycle_events: [],
          }),
        );

      memberDetailsState = [...newMembers, ...memberDetailsState];
      const job = {
        id: `import-job-${Date.now()}`,
        file_name: latestImportPreview.file_name,
        imported_at: new Date().toISOString(),
        total_rows: latestImportPreview.total_rows,
        imported_rows: latestImportPreview.ready_rows,
        duplicate_rows: latestImportPreview.duplicate_rows,
        error_rows: latestImportPreview.error_rows,
        status: 'completed' as const,
      };
      memberImportJobsState = [job, ...memberImportJobsState];

      return delay(job, 280);
    },
    onSuccess: () => invalidateMemberQueries(queryClient),
  });
}

export function useOfficeBearers() {
  return useQuery({
    queryKey: ['union-admin', 'office-bearers'],
    queryFn: () => delay(getOfficeBearerWorkspaceSummary()),
  });
}

export function useUpsertOfficeBearerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (record: UnionOfficeBearerRecord) => {
      const normalized = normalizeOfficeBearerRecord(clone(record));
      const existing = officeBearerState.find((item) => item.id === normalized.id);
      const activeRows = officeBearerState.filter(
        (item) => item.id !== normalized.id && (item.status === 'active' || item.status === 'reinstated'),
      );
      const ratioRows =
        normalized.status === 'active' || normalized.status === 'reinstated'
          ? [...activeRows, normalized]
          : activeRows;
      const outsiderPercentage = calculateOutsiderPercentage(ratioRows);

      if (outsiderPercentage > 25) {
        throw new Error('OUTSIDER_LIMIT_EXCEEDED');
      }

      if (existing) {
        officeBearerState = officeBearerState.map((item) => (item.id === normalized.id ? normalized : item));
      } else {
        officeBearerState = [normalized, ...officeBearerState];
      }

      return delay(normalized, 220);
    },
    onSuccess: () => invalidateOfficeBearerQueries(queryClient),
  });
}

export function useUpdateOfficeBearerStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bearerId,
      status,
      note,
      actor,
      eventType,
    }: {
      bearerId: string;
      status: OfficeBearerStatus;
      note: string;
      actor: string;
      eventType: OfficeBearerHistoryEvent['event_type'];
    }) => {
      officeBearerState = officeBearerState.map((item) => {
        if (item.id !== bearerId) return item;

        const next: UnionOfficeBearerRecord = normalizeOfficeBearerRecord({
          ...item,
          status,
          history: [
            {
              id: `obh-${Date.now()}`,
              bearer_id: bearerId,
              date: new Date().toISOString().slice(0, 10),
              event_type: eventType,
              note,
              actor,
            },
            ...item.history,
          ],
        });

        return next;
      });

      const summary = getOfficeBearerWorkspaceSummary();
      if (summary.outsider_percentage > 25) {
        throw new Error('OUTSIDER_LIMIT_EXCEEDED');
      }

      return delay(summary.data.find((item) => item.id === bearerId)!, 200);
    },
    onSuccess: () => invalidateOfficeBearerQueries(queryClient),
  });
}

export function useUnionComplianceCore() {
  return useQuery({
    queryKey: ['union-admin', 'documents-compliance'],
    queryFn: () => delay({ documents: unionComplianceDocuments, obligations: unionComplianceObligations }),
  });
}

export function useLegacyUnionMembers() {
  return useQuery({ queryKey: ['union-admin', 'legacy-members'], queryFn: () => delay(unionMembers) });
}

export function useLegacyOfficeBearers() {
  return useQuery({ queryKey: ['union-admin', 'legacy-office-bearers'], queryFn: () => delay(officeBearers) });
}

export function useUnionFinance() {
  return useQuery({ queryKey: ['union-admin', 'finance'], queryFn: () => delay(unionFinanceSummary) });
}

export function useUnionAnnualReturn() {
  return useQuery({ queryKey: ['union-admin', 'annual-return'], queryFn: () => delay(unionAnnualReturnDraft) });
}

export function useMarkRemittanceReceivedMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RemittanceReceiptAction) =>
      delay({ receiptRef: `REM-RECV-${payload.remittanceId}-${payload.received_date}`, ...payload }, 250),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['union-admin', 'finance'] }).catch(() => undefined);
    },
  });
}

export function useApproveWelfareCaseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { caseId: string; amount_approved: number; payment_ref?: string }) =>
      delay({ approvalRef: `WF-APPR-${payload.caseId}`, ...payload }, 250),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['union-admin', 'finance'] }).catch(() => undefined);
    },
  });
}

export function useRejectWelfareCaseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { caseId: string; reason: string }) =>
      delay({ rejectionRef: `WF-REJ-${payload.caseId}`, ...payload }, 200),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['union-admin', 'finance'] }).catch(() => undefined);
    },
  });
}

export function useSubmitAnnualReturnMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { annualReturnId: string }) =>
      delay({ submissionRef: `AR-SUBMIT-${payload.annualReturnId}-${new Date().getFullYear()}`, mockOnly: true }, 400),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['union-admin', 'annual-return'] }).catch(() => undefined);
    },
  });
}

// Internal helper: welfare case status toggle (used by approve/reject above in real implementation)
export function useUpdateWelfareCaseStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { caseId: string; status: WelfareCaseStatus }) =>
      delay({ caseId: payload.caseId, status: payload.status }, 150),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['union-admin', 'finance'] }).catch(() => undefined);
    },
  });
}

export function useUnionElectionOperation() {
  return useQuery({ queryKey: ['union-admin', 'election-operation'], queryFn: () => delay(unionElectionOperation) });
}

export function useUnionElectionWorkspace() {
  return useQuery({
    queryKey: ['union-admin', 'elections-workspace'],
    queryFn: () => delay(getUnionElectionWorkspaceSummary()),
  });
}

export function useUnionElectionDetail(electionId: string | null) {
  return useQuery({
    queryKey: ['union-admin', 'election-detail', electionId],
    enabled: !!electionId,
    queryFn: async () => {
      const record = electionRegistryState.find((item) => item.id === electionId);
      if (!record) throw new Error(`Election ${electionId} not found`);
      return delay(clone(record));
    },
  });
}

export function useUpsertUnionElectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (record: UnionElectionDetail) => {
      const normalized: UnionElectionDetail = {
        ...clone(record),
        presiding_officer_masked_cnic: maskDigitsCnic(record.presiding_officer_cnic),
      };
      const index = electionRegistryState.findIndex((item) => item.id === normalized.id);
      if (index === -1) {
        electionRegistryState = [normalized, ...electionRegistryState];
      } else {
        electionRegistryState = electionRegistryState.map((item) => (item.id === normalized.id ? normalized : item));
      }
      return delay(normalized, 220);
    },
    onSuccess: () => invalidateElectionQueries(queryClient),
  });
}

export function useReviewElectionCandidateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      electionId,
      candidateId,
      status,
      objectionReason,
      scrutinyNote,
    }: {
      electionId: string;
      candidateId: string;
      status: UnionElectionCandidateRecord['status'];
      objectionReason?: string;
      scrutinyNote?: string;
    }) => {
      electionRegistryState = electionRegistryState.map((election) =>
        election.id !== electionId
          ? election
          : {
              ...election,
              candidates: election.candidates.map((candidate) =>
                candidate.id !== candidateId
                  ? candidate
                  : {
                      ...candidate,
                      status,
                      objection_reason: objectionReason ?? candidate.objection_reason,
                      scrutiny_note: scrutinyNote ?? candidate.scrutiny_note,
                    },
              ),
            },
      );
      const updated = electionRegistryState.find((item) => item.id === electionId);
      return delay(updated?.candidates.find((item) => item.id === candidateId)!, 200);
    },
    onSuccess: () => invalidateElectionQueries(queryClient),
  });
}

export function useSubmitUnionElectionNominationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (candidate: UnionElectionCandidateRecord) => {
      const normalized = {
        ...clone(candidate),
        masked_cnic: maskDigitsCnic(candidate.candidate_cnic),
      };
      electionRegistryState = electionRegistryState.map((election) =>
        election.id !== candidate.election_id
          ? election
          : {
              ...election,
              candidates: [normalized, ...election.candidates],
            },
      );
      return delay(normalized, 220);
    },
    onSuccess: () => invalidateElectionQueries(queryClient),
  });
}

export function usePublishElectionResultsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      electionId,
      votesCast,
      resultDate,
    }: {
      electionId: string;
      votesCast: number;
      resultDate: string;
    }) => {
      electionRegistryState = electionRegistryState.map((election) => {
        if (election.id !== electionId) return election;
        const turnout = election.eligible_voter_count
          ? Math.round((votesCast / election.eligible_voter_count) * 100)
          : 0;
        return {
          ...election,
          status: 'results_announced',
          result_summary: {
            election_id: election.id,
            votes_cast: votesCast,
            turnout_percent: turnout,
            result_date: resultDate,
            published: true,
            winners_confirmed: true,
            office_bearer_sync_ready: false,
            winners:
              election.result_summary?.winners?.length
                ? election.result_summary.winners
                : election.candidates
                    .filter((item) => item.status === 'approved')
                    .slice(0, 1)
                    .map((candidate) => ({
                      position: candidate.contested_position,
                      candidate_name: candidate.candidate_name,
                      candidate_cnic: candidate.candidate_cnic,
                      vote_count: votesCast,
                    })),
          },
        };
      });
      const updated = electionRegistryState.find((item) => item.id === electionId);
      return delay(updated!, 220);
    },
    onSuccess: () => invalidateElectionQueries(queryClient),
  });
}

export function useMarkElectionOfficeBearerSyncReadyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ electionId }: { electionId: string }) => {
      electionRegistryState = electionRegistryState.map((election) =>
        election.id !== electionId
          ? election
          : {
              ...election,
              status: election.result_summary?.published ? 'completed' : election.status,
              result_summary: election.result_summary
                ? {
                    ...election.result_summary,
                    office_bearer_sync_ready: true,
                  }
                : election.result_summary,
            },
      );
      return delay(electionRegistryState.find((item) => item.id === electionId)!, 200);
    },
    onSuccess: () => invalidateElectionQueries(queryClient),
  });
}

export function useUnionCBAWorkspace() {
  return useQuery({
    queryKey: ['union-admin', 'cba-workspace'],
    queryFn: () => delay(getUnionCBAWorkspaceSummary()),
  });
}

export function useUnionCBARecord(cbaId: string | null) {
  return useQuery({
    queryKey: ['union-admin', 'cba-record', cbaId],
    enabled: !!cbaId,
    queryFn: async () => {
      const record = cbaRecordState.find((item) => item.id === cbaId);
      if (!record) throw new Error(`CBA record ${cbaId} not found`);
      return delay(toCbaDetail(record));
    },
  });
}

export function useUnionCoDWorkflow(codId: string | null) {
  return useQuery({
    queryKey: ['union-admin', 'cod-workflow', codId],
    enabled: !!codId,
    queryFn: async () => {
      const workflow = codWorkflowState.find((item) => item.id === codId);
      if (!workflow) throw new Error(`CoD workflow ${codId} not found`);
      return delay(clone(workflow));
    },
  });
}

export function useUpsertUnionCBARecordMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (record: UnionCBARecord) => {
      const normalized = normalizeCbaRecord(clone(record));
      const existingIndex = cbaRecordState.findIndex((item) => item.id === normalized.id);
      if (existingIndex === -1) {
        cbaRecordState = [normalized, ...cbaRecordState];
      } else {
        cbaRecordState = cbaRecordState.map((item) => (item.id === normalized.id ? normalized : item));
      }

      return delay(toCbaDetail(normalized), 220);
    },
    onSuccess: () => invalidateCbaQueries(queryClient),
  });
}

export function useUpdateUnionCBAStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      cbaId,
      status,
      note,
      actor,
    }: {
      cbaId: string;
      status: CBAStatus;
      note: string;
      actor: string;
    }) => {
      cbaRecordState = cbaRecordState.map((item) => {
        if (item.id !== cbaId) return item;
        return normalizeCbaRecord({
          ...item,
          status,
          history: [
            {
              id: `cba-h-${Date.now()}`,
              cba_id: cbaId,
              date: new Date().toISOString().slice(0, 10),
              event_type:
                status === 'renewal_pending'
                  ? 'renewal_flagged'
                  : status === 'expired'
                    ? 'expired'
                    : status === 'revoked'
                      ? 'revoked'
                      : 'document_added',
              note,
              actor,
            },
            ...item.history,
          ],
        });
      });

      const updated = cbaRecordState.find((item) => item.id === cbaId);
      if (!updated) throw new Error(`CBA record ${cbaId} not found`);
      return delay(toCbaDetail(updated), 220);
    },
    onSuccess: () => invalidateCbaQueries(queryClient),
  });
}

export function useUpsertUnionCoDWorkflowMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workflow: UnionCoDWorkflow) => {
      const existingIndex = codWorkflowState.findIndex((item) => item.id === workflow.id);
      if (existingIndex === -1) {
        codWorkflowState = [clone(workflow), ...codWorkflowState];
      } else {
        codWorkflowState = codWorkflowState.map((item) => (item.id === workflow.id ? clone(workflow) : item));
      }

      return delay(clone(workflow), 220);
    },
    onSuccess: () => invalidateCbaQueries(queryClient),
  });
}

export function useAdvanceUnionCoDStageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      codId,
      stage,
      deadline,
      note,
    }: {
      codId: string;
      stage: CoDStage;
      deadline?: string;
      note?: string;
    }) => {
      codWorkflowState = codWorkflowState.map((item) =>
        item.id === codId
          ? {
              ...item,
              current_stage: stage,
              next_deadline: deadline,
              management_notes: note ?? item.management_notes,
            }
          : item,
      );

      const workflow = codWorkflowState.find((item) => item.id === codId);
      if (!workflow) throw new Error(`CoD workflow ${codId} not found`);
      return delay(clone(workflow), 200);
    },
    onSuccess: () => invalidateCbaQueries(queryClient),
  });
}

export function useAddNegotiationRoundMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (round: NegotiationRound) => {
      codWorkflowState = codWorkflowState.map((item) =>
        item.id === round.cod_id
          ? {
              ...item,
              negotiation_rounds: [clone(round), ...item.negotiation_rounds].sort((a, b) => b.round_number - a.round_number),
            }
          : item,
      );

      const workflow = codWorkflowState.find((item) => item.id === round.cod_id);
      if (!workflow) throw new Error(`CoD workflow ${round.cod_id} not found`);
      return delay(clone(workflow), 220);
    },
    onSuccess: () => invalidateCbaQueries(queryClient),
  });
}

function grievancePriority(priority: string) {
  if (priority === 'critical') return 0;
  if (priority === 'urgent') return 1;
  return 2;
}

function slaUrgency(deadline: string) {
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return 0; // overdue — most urgent
  return days;
}

function sortGrievances(list: typeof grievanceQueueState) {
  return [...list].sort((a, b) => {
    const byPriority = grievancePriority(a.priority) - grievancePriority(b.priority);
    if (byPriority !== 0) return byPriority;
    return slaUrgency(a.sla_deadline) - slaUrgency(b.sla_deadline);
  });
}

function invalidateLegalQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['union-admin', 'legal-operation'] });
}

export function useUnionLegalOperation() {
  return useQuery({
    queryKey: ['union-admin', 'legal-operation'],
    queryFn: () => delay({ grievances: sortGrievances(grievanceQueueState), legalCases: clone(legalCasesState) }),
  });
}

export function useUpdateGrievanceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ grievanceId, status }: { grievanceId: string; status: string }) => {
      grievanceQueueState = grievanceQueueState.map((g) =>
        g.id === grievanceId ? { ...g, status: status as import('@/types/domain').GrievanceStatus } : g,
      );
      const updated = grievanceQueueState.find((g) => g.id === grievanceId);
      if (!updated) throw new Error(`Grievance ${grievanceId} not found`);
      return delay({ updateRef: `GRS-UPD-${grievanceId}`, status, updated: clone(updated) }, 200);
    },
    onSuccess: () => invalidateLegalQueries(queryClient),
  });
}

export function useEscalateGrievanceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (draft: LegalEscalationDraft) => {
      const grievance = grievanceQueueState.find((g) => g.id === draft.grievance_id);
      if (!grievance) throw new Error(`Grievance ${draft.grievance_id} not found`);

      const newCase: import('@/types/domain').LegalCase = {
        id: `lc-${Date.now()}`,
        case_no: `LC-${new Date().getFullYear()}-${String(legalCasesState.length + 1).padStart(4, '0')}`,
        linked_grievance_ref: grievance.reference_no,
        worker_name: grievance.worker_name,
        masked_cnic: grievance.masked_cnic,
        parties: draft.parties,
        forum: draft.forum_name,
        forum_type: draft.forum_type,
        status: 'filed',
        next_hearing: '',
        hearings: [],
        assigned_advocate: draft.assigned_advocate,
      };
      legalCasesState = [...legalCasesState, newCase];

      grievanceQueueState = grievanceQueueState.map((g) =>
        g.id === draft.grievance_id
          ? { ...g, status: 'escalated' as import('@/types/domain').GrievanceStatus, legal_case_id: newCase.id, escalation_note: draft.escalation_note }
          : g,
      );
      return delay({ caseRef: newCase.case_no, case: clone(newCase) }, 250);
    },
    onSuccess: () => invalidateLegalQueries(queryClient),
  });
}

export function useRecordOutcomeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ caseId, outcomeType, ref, note }: { caseId: string; outcomeType: 'court_order' | 'mos' | 'settlement'; ref: string; note?: string }) => {
      legalCasesState = legalCasesState.map((c) =>
        c.id === caseId
          ? {
              ...c,
              status: 'order_issued' as import('@/types/domain').LegalCaseStatus,
              court_order_ref: outcomeType === 'court_order' ? ref : c.court_order_ref,
              mos_ref: outcomeType === 'mos' || outcomeType === 'settlement' ? ref : c.mos_ref,
              outcome_note: note,
            }
          : c,
      );
      const updated = legalCasesState.find((c) => c.id === caseId);
      if (!updated) throw new Error(`Legal case ${caseId} not found`);
      return delay({ outcomeRef: ref, updated: clone(updated) }, 200);
    },
    onSuccess: () => invalidateLegalQueries(queryClient),
  });
}

export function useLogHearingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ caseId, hearingDate, hearingTime = '10:00', forum, agendaKey, outcomeKey }: { caseId: string; hearingDate: string; hearingTime?: string; forum?: string; agendaKey?: string; outcomeKey?: string }) => {
      legalCasesState = legalCasesState.map((c) => {
        if (c.id !== caseId) return c;
        const newHearing: import('@/types/domain').LegalHearing = {
          id: `hr-${Date.now()}`,
          hearing_date: hearingDate,
          hearing_time: hearingTime,
          forum: forum ?? c.forum,
          agenda_key: agendaKey ?? 'unionOps.legal.hearings.agendaGeneral',
          outcome_key: outcomeKey,
        };
        return { ...c, next_hearing: hearingDate, hearings: [newHearing, ...c.hearings] };
      });
      const updated = legalCasesState.find((c) => c.id === caseId);
      if (!updated) throw new Error(`Legal case ${caseId} not found`);
      return delay({ hearingRef: `HR-${caseId}-${hearingDate}`, updated: clone(updated) }, 200);
    },
    onSuccess: () => invalidateLegalQueries(queryClient),
  });
}

export function useRecordUnionDuesMutation() {
  return useMutation({ mutationFn: (payload: { memberId: string; period: string; amount: number }) => delay({ receiptNo: `MOCK-DUES-${payload.period}`, mockOnly: true }) });
}

export function useApproveAnnualReturnMutation() {
  return useMutation({ mutationFn: (payload: { role: 'gs' | 'fs'; annualReturnId: string }) => delay({ approvalRef: `MOCK-AR-${payload.role.toUpperCase()}-${payload.annualReturnId}`, mockOnly: true }) });
}

export function useSubmitNominationMutation() {
  return useMutation({ mutationFn: (payload: { electionId: string; candidateName: string }) => delay({ nominationRef: `MOCK-NOM-${payload.electionId}`, candidateName: payload.candidateName, mockOnly: true }) });
}

