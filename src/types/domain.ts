export type MembershipStatus =
  | 'active'
  | 'pending'
  | 'suspended'
  | 'resigned'
  | 'transferred'
  | 'terminated'
  | 'retired'
  | 'deceased';
export type DuesStatus = 'paid' | 'pending' | 'overdue' | 'waived';
export type GrievanceStatus = 'new' | 'submitted' | 'triage' | 'investigating' | 'review_requested' | 'resolved' | 'escalated';
export type GrievanceCategory = 'wages' | 'termination' | 'safety' | 'harassment' | 'union_rights' | 'eobi_social_security' | 'other';
export type ElectionStatus = 'upcoming' | 'nomination' | 'open' | 'closed' | 'results';
export type NotificationCategory = 'grievance' | 'dues' | 'election' | 'rights' | 'union';
export type UnionComplianceStatus = 'current' | 'due_soon' | 'overdue' | 'missing' | 'draft';
export type UnionDocumentCategory = 'registration' | 'member_record' | 'office_bearer' | 'annual_return' | 'cba' | 'election' | 'governance' | 'compliance';
export type RemittanceStatus = 'received' | 'pending' | 'late' | 'missing';
export type AnnualReturnStatus = 'draft' | 'gs_review' | 'fs_review' | 'ready' | 'submitted' | 'returned';
export type WelfareCaseStatus = 'pending' | 'approved' | 'paid' | 'rejected';
export type WelfareClaimType = 'hardship' | 'medical' | 'death_grant' | 'education' | 'other';
export type FinanceLedgerCategory = 'dues_income' | 'grants' | 'misc_income' | 'admin_expense' | 'legal_expense' | 'welfare_paid' | 'misc_expense';
export type DuesDisputeReason = 'not_deducted' | 'wrong_amount' | 'already_paid' | 'other';
export type CBAStatus = 'active' | 'renewal_pending' | 'expired' | 'revoked';
export type CoDStage =
  | 'draft'
  | 'submitted'
  | 'response_pending'
  | 'negotiation'
  | 'conciliation'
  | 'arbitration'
  | 'strike_notice'
  | 'settlement'
  | 'closed';
export type LegalCaseStatus = 'filed' | 'hearing_scheduled' | 'adjourned' | 'order_issued' | 'closed';
export type OfficeBearerStatus = 'active' | 'resigned' | 'replaced' | 'reinstated';
export type OfficeBearerHistoryEventType = 'appointed' | 'resigned' | 'replaced' | 'reinstated' | 'court_order';

export interface Worker {
  id: string;
  cnic: string;
  name: string;
  phone: string;
  father_name: string;
  job_title: string;
  department: string;
  company_name: string;
  join_date: string;
  employment_type: 'permanent' | 'temporary' | 'contract' | 'daily_wage';
  union_name: string;
  membership_status: MembershipStatus;
  eobi_number?: string;
  eobi_verified: boolean;
  social_security_status: 'verified' | 'pending' | 'missing';
}

export interface UnionOfficeBearer {
  id: string;
  name: string;
  cnic: string;
  position: string;
  contact_number: string;
  email?: string;
  region?: string;
  appointment_date?: string;
  gender?: 'male' | 'female' | 'other';
  notes?: string;
  term_expiry_date: string;
  outsider: boolean;
  status: OfficeBearerStatus;
}

export interface OfficeBearerHistoryEvent {
  id: string;
  bearer_id: string;
  date: string;
  event_type: OfficeBearerHistoryEventType;
  note: string;
  actor: string;
}

export interface UnionAdminDashboardSummary {
  union_id: string;
  union_name: string;
  registration_no: string;
  affiliation_status: 'affiliated' | 'pending' | 'unknown';
  compliance_score: number;
  members: {
    total: number;
    active: number;
    pending_form_c: number;
    election_ready: number;
  };
  dues: {
    health_percent: number;
    overdue_members: number;
    latest_remittance_status: 'received' | 'pending' | 'missing';
  };
  cases: {
    active_grievances: number;
    urgent_grievances: number;
  };
  governance: {
    annual_return_due: string;
    cba_expiry: string;
    next_election: string;
    office_bearer_outsider_percent: number;
  };
  risks: Array<{
    id: string;
    title_key: string;
    detail_key: string;
    tone: 'warning' | 'error' | 'info';
    route: string;
  }>;
}

export interface UnionMemberRecord extends Worker {
  member_id: string;
  masked_cnic: string;
  form_c_status: 'complete' | 'draft' | 'missing_signature';
  dues_status: DuesStatus;
  election_ready: boolean;
  annual_return_ready: boolean;
  readiness_score: number;
  data_risk: 'low' | 'medium' | 'urgent';
  nadra_verified: boolean;
  digital_id_generated: boolean;
  district: string;
  province: string;
  monthly_subscription: number;
  joined_union_on: string;
}

export type MemberLifecycleEventType =
  | 'joined'
  | 'promoted'
  | 'transferred'
  | 'salary_change'
  | 'converted'
  | 'reinstated'
  | 'terminated'
  | 'retired'
  | 'deceased';

export interface MemberLifecycleEvent {
  id: string;
  member_id: string;
  event_type: MemberLifecycleEventType;
  event_date: string;
  title_key: string;
  description_key: string;
  establishment_name?: string;
  department?: string;
  designation?: string;
  salary?: number;
  notes?: string;
}

export interface MemberBenefitRecord {
  id: string;
  member_id: string;
  benefit_type: 'eobi' | 'social_security' | 'wwf' | 'provident_fund' | 'gratuity';
  registration_no?: string;
  provider?: string;
  enrollment_date?: string;
  contribution_months?: number;
  last_verified?: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface MemberVerificationState {
  nadra_status: 'verified' | 'pending' | 'failed';
  eobi_status: 'verified' | 'pending' | 'failed';
  cnic_unique: boolean;
  election_roll_status: 'ready' | 'blocked';
  annual_return_status: 'ready' | 'blocked';
  verification_note?: string;
}

export interface MemberDocumentChecklist {
  photo_attached: boolean;
  signature_attached: boolean;
  thumb_attached: boolean;
  cnic_copy_attached: boolean;
  subscription_consent_attached: boolean;
  supporting_notes?: string;
}

export interface MemberDeceasedRecord {
  date_of_death: string;
  beneficiary_name: string;
  beneficiary_cnic: string;
  beneficiary_relation: string;
  beneficiary_phone: string;
  death_grant_status: 'pending' | 'approved' | 'paid' | 'rejected';
  death_grant_amount?: number;
}

export interface UnionMemberDetail extends UnionMemberRecord {
  full_name_urdu?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  email?: string;
  permanent_address?: string;
  current_address?: string;
  establishment_name?: string;
  employer_name?: string;
  trade?: string;
  employment_date?: string;
  monthly_salary?: number;
  eobi_number?: string;
  social_security_number?: string;
  wwf_eligible: boolean;
  pf_status?: string;
  gratuity_status?: string;
  education_level?: string;
  status_reason?: string;
  digital_id_qr_data?: string;
  verification: MemberVerificationState;
  documents: MemberDocumentChecklist;
  benefit_records: MemberBenefitRecord[];
  lifecycle_events: MemberLifecycleEvent[];
  deceased_record?: MemberDeceasedRecord;
}

export interface MemberImportIssue {
  row_number: number;
  field: string;
  severity: 'error' | 'warning';
  message_key: string;
}

export interface MemberImportPreviewRow {
  row_number: number;
  worker_name: string;
  cnic: string;
  status: 'ready' | 'duplicate' | 'error';
  issue_count: number;
}

export interface MemberImportPreview {
  id: string;
  file_name: string;
  picked_at: string;
  total_rows: number;
  ready_rows: number;
  duplicate_rows: number;
  error_rows: number;
  rows: MemberImportPreviewRow[];
  issues: MemberImportIssue[];
}

export interface MemberImportJob {
  id: string;
  file_name: string;
  imported_at: string;
  total_rows: number;
  imported_rows: number;
  duplicate_rows: number;
  error_rows: number;
  status: 'preview' | 'completed' | 'failed';
}

export interface UnionOfficeBearerRecord extends UnionOfficeBearer {
  masked_cnic: string;
  designation_key: string;
  appointment_date: string;
  term_start_date: string;
  gender: 'male' | 'female' | 'other';
  evidence_status: UnionComplianceStatus;
  women_representation_role: boolean;
  days_to_expiry: number;
  history: OfficeBearerHistoryEvent[];
}

export interface UnionOfficeBearerWorkspaceSummary {
  data: UnionOfficeBearerRecord[];
  outsider_percentage: number;
  women_count: number;
  expiring_soon_count: number;
  vacancies: string[];
}

export interface UnionComplianceDocument {
  id: string;
  title_key: string;
  category: UnionDocumentCategory;
  source_key: string;
  owner_role_key: string;
  status: UnionComplianceStatus;
  due_date?: string;
  expiry_date?: string;
  evidence_count: number;
}

export interface UnionComplianceObligation {
  id: string;
  title_key: string;
  source_key: string;
  status: UnionComplianceStatus;
  due_date: string;
  route: string;
}

export interface EmployerRemittance {
  id: string;
  deduction_period: string;
  total_amount: number;
  worker_count: number;
  remittance_date?: string;
  bank_reference?: string;
  status: RemittanceStatus;
  late_days: number;
}

export interface WelfareClaimCase {
  id: string;
  member_id: string;
  member_name: string;
  masked_cnic: string;
  claim_type: WelfareClaimType;
  amount_requested: number;
  amount_approved?: number;
  reason: string;
  submitted_on: string;
  decision_date?: string;
  payment_ref?: string;
  status: WelfareCaseStatus;
}

export interface FinanceLedgerLineItem {
  id: string;
  category: FinanceLedgerCategory;
  description: string;
  amount: number;
  period?: string;
  reference?: string;
}

export interface RemittanceReceiptAction {
  remittanceId: string;
  bank_reference: string;
  received_date: string;
  amount_confirmed: number;
}

export interface DuesDisputeDraft {
  dues_id: string;
  period: string;
  reason: DuesDisputeReason;
  description: string;
}

export interface UnionFinanceSummary {
  fiscal_year: string;
  collected_amount: number;
  outstanding_amount: number;
  overdue_members: number;
  welfare_claims_pending: number;
  welfare_fund_balance: number;
  welfare_cases: WelfareClaimCase[];
  remittance_alert_days: number;
  latest_receipt_no: string;
  annual_return_prefill_percent: number;
  dues_ledger: Array<{
    id: string;
    member_name: string;
    masked_cnic: string;
    member_id: string;
    period: string;
    amount: number;
    status: DuesStatus;
    receipt_no?: string;
  }>;
  remittances: EmployerRemittance[];
}

export interface AnnualReturnStep {
  id: string;
  title_key: string;
  source_key: string;
  status: UnionComplianceStatus;
  completion_percent: number;
}

export interface AnnualReturnDraft {
  id: string;
  fiscal_year: string;
  status: AnnualReturnStatus;
  member_count_start: number;
  member_count_end: number;
  male_count: number;
  female_count: number;
  subscription_income: number;
  total_income: number;
  total_expenditure: number;
  closing_balance: number;
  gs_approved_at?: string;
  fs_approved_at?: string;
  submitted_at?: string;
  submission_ref?: string;
  income_line_items: FinanceLedgerLineItem[];
  expense_line_items: FinanceLedgerLineItem[];
  steps: AnnualReturnStep[];
}

export interface CandidateNomination {
  id: string;
  candidate_name: string;
  masked_cnic: string;
  position: string;
  nominator_name: string;
  seconder_name: string;
  status: 'draft' | 'submitted' | 'scrutiny' | 'accepted' | 'rejected';
  manifesto_key: string;
}

export interface UnionElection {
  id: string;
  title_key: string;
  polling_date: string;
  nomination_deadline: string;
  objection_deadline: string;
  withdrawal_deadline: string;
  status: ElectionStatus;
  voter_count: number;
  eligible_count: number;
  turnout_percent: number;
  nominations: CandidateNomination[];
}

export type UnionElectionStatus =
  | 'announced'
  | 'nomination_open'
  | 'nomination_closed'
  | 'objection_period'
  | 'candidates_final'
  | 'polling'
  | 'results_announced'
  | 'completed'
  | 'cancelled';

export type UnionElectionType = 'office_bearer' | 'by_election' | 'runoff';
export type UnionElectionCandidateStatus = 'submitted' | 'under_objection' | 'approved' | 'rejected' | 'withdrawn';

export interface UnionElectionCandidateRecord {
  id: string;
  election_id: string;
  contested_position: string;
  candidate_name: string;
  candidate_cnic: string;
  masked_cnic: string;
  membership_number: string;
  union_join_date: string;
  address: string;
  proposer_name: string;
  proposer_cnic: string;
  seconder_name: string;
  seconder_cnic: string;
  status: UnionElectionCandidateStatus;
  objection_reason?: string;
  scrutiny_note?: string;
  photo_attached: boolean;
}

export interface ElectionResultWinner {
  position: string;
  candidate_name: string;
  candidate_cnic: string;
  vote_count: number;
}

export interface ElectionResultSummary {
  election_id: string;
  votes_cast: number;
  turnout_percent: number;
  result_date?: string;
  published: boolean;
  winners_confirmed: boolean;
  office_bearer_sync_ready: boolean;
  winners: ElectionResultWinner[];
}

export interface ElectionDisputeSummary {
  id: string;
  election_id: string;
  candidate_id?: string;
  title: string;
  status: 'open' | 'resolved';
  stage: 'objection' | 'final_list' | 'result';
  filed_on: string;
  note: string;
}

export interface ElectionHistoryEvent {
  id: string;
  election_id: string;
  date: string;
  title: string;
  note: string;
}

export interface UnionElectionRecord {
  id: string;
  reference_no: string;
  election_type: UnionElectionType;
  title: string;
  status: UnionElectionStatus;
  announcement_date: string;
  nomination_start_date: string;
  nomination_end_date: string;
  objection_end_date: string;
  final_list_date: string;
  polling_date: string;
  polling_time: string;
  presiding_officer_name: string;
  presiding_officer_cnic: string;
  presiding_officer_masked_cnic: string;
  eligible_voter_count: number;
  certified_voter_roll_note: string;
  notes?: string;
  active_worker_voting: boolean;
  result_summary?: ElectionResultSummary;
}

export interface UnionElectionDetail extends UnionElectionRecord {
  candidates: UnionElectionCandidateRecord[];
  disputes: ElectionDisputeSummary[];
  history: ElectionHistoryEvent[];
}

export interface UnionElectionWorkspaceSummary {
  current_election: UnionElectionDetail | null;
  data: UnionElectionDetail[];
  nominations_under_review_count: number;
  pending_result_count: number;
  polling_soon_count: number;
  nomination_open_count: number;
  pending_office_bearer_sync_count: number;
  disputes: ElectionDisputeSummary[];
}

export type CoDDemandCategory =
  | 'wages'
  | 'allowances'
  | 'benefits'
  | 'working_conditions'
  | 'leave'
  | 'health_safety'
  | 'job_security'
  | 'other';

export type CBAEvidenceCategory =
  | 'certificate'
  | 'cod'
  | 'order'
  | 'settlement'
  | 'staff_agreement'
  | 'mos';

export type CBAHistoryEventType =
  | 'certified'
  | 'renewal_flagged'
  | 'expired'
  | 'revoked'
  | 'cod_linked'
  | 'settlement_linked'
  | 'document_added';

export interface CoDDemandItem {
  id: string;
  category: CoDDemandCategory;
  title: string;
  current_value?: string;
  demanded_value?: string;
  justification: string;
}

export interface NegotiationEvent {
  id: string;
  title_key: string;
  description_key: string;
  date: string;
  status: UnionComplianceStatus;
}

export interface CharterDemand {
  id: string;
  category: 'wages' | 'allowances' | 'benefits' | 'working_conditions';
  title_key: string;
  justification_key: string;
  stage: CoDStage;
}

export interface NegotiationRound {
  id: string;
  cod_id: string;
  round_number: number;
  meeting_date: string;
  attendees: string;
  outcomes: string;
  next_steps: string;
}

export interface CBAEvidenceItem {
  id: string;
  cba_id: string;
  cod_id?: string;
  category: CBAEvidenceCategory;
  title: string;
  reference: string;
  status: 'available' | 'pending' | 'missing' | 'expiring';
  route?: string;
  issued_on?: string;
  expires_on?: string;
}

export interface CBAHistoryEvent {
  id: string;
  cba_id: string;
  date: string;
  event_type: CBAHistoryEventType;
  note: string;
  actor: string;
}

export interface UnionCBARecord {
  id: string;
  title: string;
  employer: string;
  establishment_name: string;
  certificate_number: string;
  legal_form: string;
  rule_reference: string;
  section_reference: string;
  issuing_authority: string;
  region: string;
  issue_date: string;
  effective_date: string;
  expiry_date: string;
  status: CBAStatus;
  covered_workers: number;
  membership_at_cert: number;
  total_workforce: number;
  membership_percentage: number;
  determination_type: 'single_union' | 'referendum';
  determination_basis: string;
  secret_ballot_date?: string;
  certificate_reference: string;
  notes?: string;
  history: CBAHistoryEvent[];
}

export interface UnionCoDWorkflow {
  id: string;
  cba_id: string;
  union_id: string;
  reference_number: string;
  current_stage: CoDStage;
  demands: CoDDemandItem[];
  submission_date?: string;
  management_response_date?: string;
  management_response?: 'accepted' | 'partial' | 'counter_offer' | 'rejected';
  management_notes?: string;
  conciliation_officer?: string;
  conciliation_start_date?: string;
  conciliation_end_date?: string;
  conciliation_outcome?: string;
  arbitrator_name?: string;
  arbitration_award?: string;
  strike_notice_date?: string;
  strike_notice_expiry?: string;
  strike_active: boolean;
  settlement_date?: string;
  mos_reference?: string;
  settlement_notes?: string;
  next_deadline?: string;
  negotiation_rounds: NegotiationRound[];
}

export interface UnionCBARecordDetail extends UnionCBARecord {
  evidence: CBAEvidenceItem[];
  linked_cod_ids: string[];
  readiness_score: number;
  missing_evidence_count: number;
}

export interface UnionCBAWorkspaceSummary {
  current_record: UnionCBARecordDetail | null;
  renewal_record: UnionCBARecordDetail | null;
  historical_records: UnionCBARecordDetail[];
  workflows: UnionCoDWorkflow[];
  active_workflow: UnionCoDWorkflow | null;
  evidence: CBAEvidenceItem[];
  stats: {
    active_count: number;
    renewal_pending_count: number;
    expired_or_revoked_count: number;
    expiring_90_count: number;
    total_covered_workers: number;
  };
}

export interface UnionGrievanceCase {
  id: string;
  reference_no: string;
  worker_name: string;
  masked_cnic: string;
  employer_name?: string;
  establishment_name?: string;
  category: GrievanceCategory;
  priority: 'normal' | 'urgent' | 'critical';
  status: GrievanceStatus;
  assigned_handler: string;
  sla_deadline: string;
  description?: string;
  legal_case_id?: string;
  escalation_note?: string;
  conciliation_stage?: 'not_started' | 'in_progress' | 'settled' | 'failed';
}

export type LegalForumType = 'labour_court' | 'conciliation' | 'nirc' | 'plat';

export interface LegalEscalationDraft {
  grievance_id: string;
  forum_type: LegalForumType;
  forum_name: string;
  parties: string;
  assigned_advocate?: string;
  escalation_note?: string;
}

export interface LegalHearing {
  id: string;
  hearing_date: string;
  hearing_time: string;
  forum: string;
  agenda_key: string;
  outcome_key?: string;
  next_date?: string;
}

export interface LegalCase {
  id: string;
  case_no: string;
  linked_grievance_ref: string;
  worker_name: string;
  masked_cnic: string;
  parties: string;
  forum: string;
  forum_type?: LegalForumType;
  status: LegalCaseStatus;
  next_hearing: string;
  hearings: LegalHearing[];
  assigned_advocate?: string;
  court_order_ref?: string;
  mos_ref?: string;
  outcome_note?: string;
}

export interface WorkerDues {
  id: string;
  month: string;
  year: number;
  amount: number;
  status: DuesStatus;
  receipt_no?: string;
}

export interface WorkerGrievance {
  id: string;
  reference_no: string;
  category: GrievanceCategory;
  description: string;
  status: GrievanceStatus;
}

export interface WorkerDashboardSummary {
  worker_identity: {
    name: string;
    masked_cnic: string;
    designation: string;
    department: string;
    employer: string;
    union_name: string;
    worker_id: string;
    join_date: string;
    membership_status: MembershipStatus;
  };
  digital_id: DigitalWorkerId;
  benefits: {
    eobi_number?: string;
    eobi_verified: boolean;
    social_security_status: Worker['social_security_status'];
  };
  dues_summary: {
    current_status: DuesStatus;
    outstanding_months: number;
    latest_receipt_no?: string;
    latest_paid_month?: string;
    employer_deduction_status: 'deducted' | 'not_deducted' | 'unknown';
  };
  grievance_summary: {
    active_count: number;
    latest_status?: GrievanceStatus;
    latest_reference?: string;
    sla_label_key: string;
  };
  voting_summary: {
    active_election_title?: string;
    eligible: boolean;
    already_voted: boolean;
    status: ElectionStatus;
  };
  notifications_summary: {
    unread_count: number;
    latest_title_key: string;
  };
  union_summary: {
    registration_no: string;
    cba_status: 'active' | 'expired' | 'pending';
    president_name: string;
    gen_sec_name: string;
    contact_phone: string;
  };
}

export interface DigitalWorkerId {
  available: boolean;
  downloadable: boolean;
  worker_id: string;
  qr_payload: string;
  offline_available: boolean;
  issued_on: string;
}

export interface DuesPayment extends WorkerDues {
  period_key: string;
  employer_deducted: boolean;
  receipt?: DuesReceipt;
}

export interface DuesReceipt {
  receipt_no: string;
  issued_on: string;
  collected_by: string;
  mock_only: boolean;
}

export interface GrievanceTimelineEvent {
  id: string;
  status: GrievanceStatus;
  title_key: string;
  description_key: string;
  date: string;
}

export interface GrievanceCase extends WorkerGrievance {
  priority: 'normal' | 'urgent';
  employer_name: string;
  establishment_name: string;
  sla_deadline: string;
  assigned_handler: string;
  timeline: GrievanceTimelineEvent[];
  legal_case_id?: string;
  legal_case_no?: string;
}

export interface GrievanceDraft {
  category: GrievanceCategory;
  priority: 'normal' | 'urgent';
  employer_name: string;
  establishment_name: string;
  description: string;
  voice_note_attached: boolean;
  attachment_count: number;
}

export interface ElectionCandidate {
  id: string;
  name: string;
  position: string;
  manifesto_key: string;
}

export interface WorkerElection {
  id: string;
  title_key: string;
  start_date: string;
  end_date: string;
  status: ElectionStatus;
  eligible: boolean;
  has_voted: boolean;
  otp_required: boolean;
  candidates: ElectionCandidate[];
}

export interface RightTopic {
  id: string;
  category: 'wages' | 'safety' | 'union_rights' | 'benefits' | 'termination' | 'cba_cod' | 'grievance';
  title_key: string;
  description_key: string;
  action_key: string;
}

export interface WorkerUnionProfile {
  id: string;
  union_name: string;
  registration_no: string;
  affiliation_status: 'affiliated' | 'pending' | 'unknown';
  join_date: string;
  president_name: string;
  gen_sec_name: string;
  contact_phone: string;
  cba_status: 'active' | 'expired' | 'pending';
  documents: Array<{
    id: string;
    title_key: string;
    status: 'current' | 'needs_refresh';
  }>;
}

export interface WorkerNotification {
  id: string;
  category: NotificationCategory;
  title_key: string;
  message_key: string;
  read: boolean;
  created_at: string;
  route: string;
}
