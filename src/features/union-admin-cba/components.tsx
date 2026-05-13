import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import {
  ArrowRight,
  CalendarClock,
  FilePlus2,
  FileSignature,
  Landmark,
  Link2,
  Plus,
  RefreshCcw,
  Scale,
  Search,
  X,
} from 'lucide-react-native';
import { AnimatedSection } from '@/components/animated-section';
import { MetricCard } from '@/components/metric-card';
import { SectionCard } from '@/components/section-card';
import { StatusChip } from '@/components/status-chip';
import { directionalText, rowDirection, textAlign, writingDirection } from '@/theme/layout';
import { tokens } from '@/theme/tokens';
import { unionAdminTheme } from '@/theme/union-admin';
import type {
  CBAEvidenceItem,
  CBAStatus,
  CoDDemandCategory,
  CoDStage,
  NegotiationRound,
  UnionCBARecord,
  UnionCBARecordDetail,
  UnionCBAWorkspaceSummary,
  UnionCoDWorkflow,
} from '@/types/domain';
import {
  cbaRecordFormSchema,
  codWorkflowFormSchema,
  negotiationRoundFormSchema,
  type CBARecordFormValues,
  type CoDDemandFormValues,
  type CoDWorkflowFormValues,
  type NegotiationRoundFormValues,
} from './schema';

export type CBAWorkspaceTab = 'registry' | 'cod' | 'rounds' | 'evidence';

export const cbaWorkspaceTabs: CBAWorkspaceTab[] = ['registry', 'cod', 'rounds', 'evidence'];

type CBAStatusFilter = 'all' | CBAStatus;

function formatDate(value?: string) {
  return value || '-';
}

function daysUntil(value: string) {
  const diff = new Date(value).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function cbaTone(status: CBAStatus) {
  if (status === 'active') return 'success' as const;
  if (status === 'renewal_pending') return 'warning' as const;
  return 'error' as const;
}

function codTone(stage: CoDStage) {
  if (stage === 'settlement' || stage === 'closed') return 'success' as const;
  if (stage === 'conciliation' || stage === 'arbitration' || stage === 'strike_notice') return 'warning' as const;
  if (stage === 'draft') return 'neutral' as const;
  return 'info' as const;
}

function evidenceTone(status: CBAEvidenceItem['status']) {
  if (status === 'available') return 'success' as const;
  if (status === 'expiring') return 'warning' as const;
  if (status === 'pending') return 'info' as const;
  return 'error' as const;
}

function normalizeIssue(error?: string[] | string) {
  if (!error) return undefined;
  return Array.isArray(error) ? error[0] : error;
}

function stepErrorLabel(t: (key: string) => string, issue?: string) {
  if (!issue) return '';
  return issue.startsWith('unionCore.') ? t(issue) : issue;
}

function demandCategoryOptions(t: (key: string) => string): Array<{ value: CoDDemandCategory; label: string }> {
  return [
    { value: 'wages', label: t('unionCore.cba.categories.wages') },
    { value: 'allowances', label: t('unionCore.cba.categories.allowances') },
    { value: 'benefits', label: t('unionCore.cba.categories.benefits') },
    { value: 'working_conditions', label: t('unionCore.cba.categories.working_conditions') },
    { value: 'leave', label: t('unionCore.cba.categories.leave') },
    { value: 'health_safety', label: t('unionCore.cba.categories.health_safety') },
    { value: 'job_security', label: t('unionCore.cba.categories.job_security') },
    { value: 'other', label: t('unionCore.cba.categories.other') },
  ];
}

function codStageOptions(t: (key: string) => string): Array<{ value: CoDStage; label: string }> {
  return [
    { value: 'draft', label: t('unionCore.cba.status.cod.draft') },
    { value: 'submitted', label: t('unionCore.cba.status.cod.submitted') },
    { value: 'response_pending', label: t('unionCore.cba.status.cod.response_pending') },
    { value: 'negotiation', label: t('unionCore.cba.status.cod.negotiation') },
    { value: 'conciliation', label: t('unionCore.cba.status.cod.conciliation') },
    { value: 'arbitration', label: t('unionCore.cba.status.cod.arbitration') },
    { value: 'strike_notice', label: t('unionCore.cba.status.cod.strike_notice') },
    { value: 'settlement', label: t('unionCore.cba.status.cod.settlement') },
    { value: 'closed', label: t('unionCore.cba.status.cod.closed') },
  ];
}

function buildDemandDraft(): CoDDemandFormValues {
  return {
    id: `dem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    category: 'wages',
    title: '',
    current_value: '',
    demanded_value: '',
    justification: '',
  };
}

function buildCbaRecordFormValues(record: UnionCBARecordDetail | null): CBARecordFormValues {
  return {
    title: record?.title ?? '',
    employer: record?.employer ?? '',
    establishment_name: record?.establishment_name ?? '',
    certificate_number: record?.certificate_number ?? '',
    legal_form: record?.legal_form ?? 'Form S.A.',
    rule_reference: record?.rule_reference ?? 'Rule 38(2)',
    section_reference: record?.section_reference ?? 'Section 24(2), PIRA 2010',
    issuing_authority: record?.issuing_authority ?? '',
    region: record?.region ?? 'Central Punjab',
    issue_date: record?.issue_date ?? new Date().toISOString().slice(0, 10),
    effective_date: record?.effective_date ?? new Date().toISOString().slice(0, 10),
    expiry_date: record?.expiry_date ?? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    status: record?.status ?? 'active',
    covered_workers: record?.covered_workers ?? 0,
    membership_at_cert: record?.membership_at_cert ?? 0,
    total_workforce: record?.total_workforce ?? 0,
    membership_percentage: record?.membership_percentage ?? 0,
    determination_type: record?.determination_type ?? 'referendum',
    determination_basis: record?.determination_basis ?? '',
    secret_ballot_date: record?.secret_ballot_date ?? '',
    certificate_reference: record?.certificate_reference ?? '',
    notes: record?.notes ?? '',
  };
}

function buildCoDWorkflowFormValues(workflow: UnionCoDWorkflow | null, defaultCbaId?: string): CoDWorkflowFormValues {
  return {
    cba_id: workflow?.cba_id ?? defaultCbaId ?? '',
    reference_number: workflow?.reference_number ?? '',
    current_stage: workflow?.current_stage ?? 'draft',
    demands: workflow?.demands.length ? workflow.demands : [buildDemandDraft()],
    submission_date: workflow?.submission_date ?? '',
    management_response_date: workflow?.management_response_date ?? '',
    management_response: workflow?.management_response ?? null,
    management_notes: workflow?.management_notes ?? '',
    conciliation_officer: workflow?.conciliation_officer ?? '',
    conciliation_start_date: workflow?.conciliation_start_date ?? '',
    conciliation_end_date: workflow?.conciliation_end_date ?? '',
    conciliation_outcome: workflow?.conciliation_outcome ?? '',
    arbitrator_name: workflow?.arbitrator_name ?? '',
    arbitration_award: workflow?.arbitration_award ?? '',
    strike_notice_date: workflow?.strike_notice_date ?? '',
    strike_notice_expiry: workflow?.strike_notice_expiry ?? '',
    settlement_date: workflow?.settlement_date ?? '',
    mos_reference: workflow?.mos_reference ?? '',
    settlement_notes: workflow?.settlement_notes ?? '',
    next_deadline: workflow?.next_deadline ?? '',
  };
}

function buildRoundFormValues(): NegotiationRoundFormValues {
  return {
    meeting_date: new Date().toISOString().slice(0, 10),
    attendees: '',
    outcomes: '',
    next_steps: '',
  };
}

function toCbaRecord(values: CBARecordFormValues, existing: UnionCBARecordDetail | null): UnionCBARecord {
  const id = existing?.id ?? `cba-${Date.now()}`;
  return {
    id,
    title: values.title,
    employer: values.employer,
    establishment_name: values.establishment_name,
    certificate_number: values.certificate_number,
    legal_form: values.legal_form,
    rule_reference: values.rule_reference,
    section_reference: values.section_reference,
    issuing_authority: values.issuing_authority,
    region: values.region,
    issue_date: values.issue_date,
    effective_date: values.effective_date,
    expiry_date: values.expiry_date,
    status: values.status,
    covered_workers: values.covered_workers,
    membership_at_cert: values.membership_at_cert,
    total_workforce: values.total_workforce,
    membership_percentage: values.membership_percentage,
    determination_type: values.determination_type,
    determination_basis: values.determination_basis,
    secret_ballot_date: values.secret_ballot_date || undefined,
    certificate_reference: values.certificate_reference,
    notes: values.notes || undefined,
    history: existing?.history ?? [
      {
        id: `cba-h-${Date.now()}`,
        cba_id: id,
        date: values.issue_date,
        event_type: 'certified',
        note: 'Bargaining record added through mobile workspace.',
        actor: 'Union admin',
      },
    ],
  };
}

function toWorkflow(values: CoDWorkflowFormValues, existing: UnionCoDWorkflow | null): UnionCoDWorkflow {
  return {
    id: existing?.id ?? `cod-${Date.now()}`,
    cba_id: values.cba_id,
    union_id: existing?.union_id ?? 'union-lwmc-001',
    reference_number: values.reference_number,
    current_stage: values.current_stage,
    demands: values.demands,
    submission_date: values.submission_date || undefined,
    management_response_date: values.management_response_date || undefined,
    management_response: values.management_response ?? undefined,
    management_notes: values.management_notes || undefined,
    conciliation_officer: values.conciliation_officer || undefined,
    conciliation_start_date: values.conciliation_start_date || undefined,
    conciliation_end_date: values.conciliation_end_date || undefined,
    conciliation_outcome: values.conciliation_outcome || undefined,
    arbitrator_name: values.arbitrator_name || undefined,
    arbitration_award: values.arbitration_award || undefined,
    strike_notice_date: values.strike_notice_date || undefined,
    strike_notice_expiry: values.strike_notice_expiry || undefined,
    strike_active: values.current_stage === 'strike_notice',
    settlement_date: values.settlement_date || undefined,
    mos_reference: values.mos_reference || undefined,
    settlement_notes: values.settlement_notes || undefined,
    next_deadline: values.next_deadline || undefined,
    negotiation_rounds: existing?.negotiation_rounds ?? [],
  };
}

function toRound(values: NegotiationRoundFormValues, workflow: UnionCoDWorkflow): NegotiationRound {
  return {
    id: `round-${Date.now()}`,
    cod_id: workflow.id,
    round_number: (workflow.negotiation_rounds[0]?.round_number ?? 0) + 1,
    meeting_date: values.meeting_date,
    attendees: values.attendees,
    outcomes: values.outcomes,
    next_steps: values.next_steps,
  };
}

function FieldLabel({ label }: { label: string }) {
  return <Text style={{ color: tokens.foreground, fontSize: 13, ...directionalText('900') }}>{label}</Text>;
}

function FieldError({ error }: { error?: string }) {
  const { t } = useTranslation();
  if (!error) return null;
  return <Text style={{ color: tokens.statusError, fontSize: 12, ...directionalText() }}>{stepErrorLabel(t, error)}</Text>;
}

function WorkspaceModalFrame({
  open,
  title,
  subtitle,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal visible={open} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: tokens.background }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 18, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: tokens.border, backgroundColor: tokens.card, flexDirection: rowDirection(), alignItems: 'flex-start', gap: 12 }}>
          <Pressable onPress={onClose} style={{ width: 40, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: tokens.muted }}>
            <X size={18} color={tokens.foreground} />
          </Pressable>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ color: tokens.foreground, fontSize: 20, ...directionalText('900') }}>{title}</Text>
            {subtitle ? <Text style={{ color: tokens.mutedForeground, fontSize: 12, lineHeight: 18, ...directionalText() }}>{subtitle}</Text> : null}
          </View>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>{children}</ScrollView>
      </View>
    </Modal>
  );
}

function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType = 'default',
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  error?: string;
  keyboardType?: 'default' | 'numeric';
  multiline?: boolean;
}) {
  return (
    <View style={{ gap: 6 }}>
      <FieldLabel label={label} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={tokens.mutedForeground}
        keyboardType={keyboardType}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={{
          minHeight: multiline ? 92 : 46,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: error ? tokens.statusError : tokens.border,
          paddingHorizontal: 12,
          paddingVertical: multiline ? 12 : 0,
          color: tokens.foreground,
          backgroundColor: tokens.card,
          textAlign: textAlign(),
          writingDirection: writingDirection(),
        }}
      />
      <FieldError error={error} />
    </View>
  );
}

function ToggleChip({
  selected,
  label,
  onPress,
  tone = 'info',
}: {
  selected: boolean;
  label: string;
  onPress: () => void;
  tone?: 'neutral' | 'info' | 'warning' | 'success' | 'error';
}) {
  return (
    <Pressable onPress={onPress}>
      <StatusChip tone={selected ? tone : 'neutral'} label={label} />
    </Pressable>
  );
}

export function CBAWorkspaceHero({ summary }: { summary: UnionCBAWorkspaceSummary }) {
  const { t } = useTranslation();
  const current = summary.current_record;
  const days = current ? daysUntil(current.expiry_date) : null;

  return (
    <SectionCard variant="unionAdmin">
      <View style={{ gap: 12 }}>
        <View style={{ gap: 6 }}>
          <Text style={{ color: unionAdminTheme.text, fontSize: 20, ...directionalText('900') }}>{t('unionCore.cba.workspaceTitle')}</Text>
          <Text style={{ color: unionAdminTheme.mutedText, fontSize: 13, lineHeight: 19, ...directionalText() }}>{t('unionCore.cba.workspaceBody')}</Text>
        </View>
        {current ? (
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: rowDirection(), justifyContent: 'space-between', gap: 12 }}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ color: tokens.foreground, fontSize: 16, ...directionalText('900') }}>{current.establishment_name}</Text>
                <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText() }}>{current.certificate_number}</Text>
              </View>
              <StatusChip tone={cbaTone(current.status)} label={t(`unionCore.cba.status.cba.${current.status}`)} />
            </View>
            <View style={{ flexDirection: rowDirection(), gap: 8, flexWrap: 'wrap' }}>
              <StatusChip tone="info" label={t('unionCore.cba.hero.stage', { stage: summary.active_workflow ? t(`unionCore.cba.status.cod.${summary.active_workflow.current_stage}`) : '-' })} />
              <StatusChip tone={days !== null && days <= 30 ? 'error' : days !== null && days <= 90 ? 'warning' : 'success'} label={t('unionCore.cba.hero.expiry', { count: days ?? 0 })} />
              <StatusChip tone="warning" label={t('unionCore.cba.hero.missingEvidence', { count: current.missing_evidence_count })} />
            </View>
          </View>
        ) : null}
      </View>
    </SectionCard>
  );
}

export function CBAWorkspaceTabs({
  active,
  onChange,
}: {
  active: CBAWorkspaceTab;
  onChange: (tab: CBAWorkspaceTab) => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={{ flexDirection: rowDirection(), flexWrap: 'wrap', gap: 8 }}>
      {cbaWorkspaceTabs.map((tab) => (
        <Pressable
          key={tab}
          onPress={() => onChange(tab)}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: active === tab ? unionAdminTheme.navy : unionAdminTheme.border,
            backgroundColor: active === tab ? unionAdminTheme.softNavy : tokens.card,
          }}
        >
          <Text style={{ color: active === tab ? unionAdminTheme.navy : unionAdminTheme.mutedText, ...directionalText('900') }}>
            {t(`unionCore.cba.tabs.${tab}`)}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export function CBAMetricGrid({ summary }: { summary: UnionCBAWorkspaceSummary }) {
  const { t } = useTranslation();
  const metrics = [
    { icon: Landmark, label: t('unionCore.cba.metrics.active'), value: String(summary.stats.active_count), tone: 'success' as const },
    { icon: RefreshCcw, label: t('unionCore.cba.metrics.renewal'), value: String(summary.stats.renewal_pending_count), tone: 'warning' as const },
    { icon: CalendarClock, label: t('unionCore.cba.metrics.expiring'), value: String(summary.stats.expiring_90_count), tone: 'warning' as const },
    { icon: Scale, label: t('unionCore.cba.metrics.covered'), value: String(summary.stats.total_covered_workers), tone: 'info' as const },
  ];

  return (
    <View style={{ flexDirection: rowDirection(), gap: 8, flexWrap: 'wrap' }}>
      {metrics.map((metric) => (
        <View key={metric.label} style={{ width: '48%' }}>
          <MetricCard icon={metric.icon} label={metric.label} value={metric.value} tone={metric.tone} variant="unionAdmin" />
        </View>
      ))}
    </View>
  );
}

export function CBARegistryControls({
  query,
  setQuery,
  statusFilter,
  setStatusFilter,
}: {
  query: string;
  setQuery: (value: string) => void;
  statusFilter: CBAStatusFilter;
  setStatusFilter: (value: CBAStatusFilter) => void;
}) {
  const { t } = useTranslation();
  const filters: CBAStatusFilter[] = ['all', 'active', 'renewal_pending', 'expired', 'revoked'];
  return (
    <SectionCard>
      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 8, borderWidth: 1, borderColor: tokens.border, borderRadius: 12, paddingHorizontal: 12, backgroundColor: tokens.background }}>
          <Search size={16} color={tokens.mutedForeground} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('unionCore.cba.searchPlaceholder')}
            placeholderTextColor={tokens.mutedForeground}
            style={{ flex: 1, minHeight: 46, color: tokens.foreground, textAlign: textAlign(), writingDirection: writingDirection() }}
          />
        </View>
        <View style={{ flexDirection: rowDirection(), gap: 8, flexWrap: 'wrap' }}>
          {filters.map((filter) => (
            <ToggleChip
              key={filter}
              selected={statusFilter === filter}
              label={filter === 'all' ? t('unionCore.cba.filters.all') : t(`unionCore.cba.status.cba.${filter}`)}
              tone={filter === 'expired' || filter === 'revoked' ? 'error' : filter === 'renewal_pending' ? 'warning' : 'info'}
              onPress={() => setStatusFilter(filter)}
            />
          ))}
        </View>
      </View>
    </SectionCard>
  );
}

export function getFilteredCbaRecords(
  summary: UnionCBAWorkspaceSummary,
  query: string,
  statusFilter: CBAStatusFilter,
) {
  const all = [summary.current_record, summary.renewal_record, ...summary.historical_records].filter(Boolean) as UnionCBARecordDetail[];
  return all.filter((record) => {
    const matchesStatus = statusFilter === 'all' ? true : record.status === statusFilter;
    const haystack = `${record.establishment_name} ${record.certificate_number} ${record.issuing_authority} ${record.certificate_reference}`.toLowerCase();
    const matchesQuery = haystack.includes(query.trim().toLowerCase());
    return matchesStatus && matchesQuery;
  });
}

export function CBARegistryCard({
  record,
  onOpen,
  onEdit,
  onRenew,
}: {
  record: UnionCBARecordDetail;
  onOpen: () => void;
  onEdit: () => void;
  onRenew: () => void;
}) {
  const { t } = useTranslation();
  const expiryDays = daysUntil(record.expiry_date);
  return (
    <SectionCard>
      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: rowDirection(), alignItems: 'flex-start', gap: 10 }}>
          <View style={{ width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: tokens.secondary }}>
            <Landmark size={18} color={tokens.portalUnion} />
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={{ color: tokens.foreground, fontSize: 18, ...directionalText('900') }}>{record.establishment_name}</Text>
            <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText() }}>{record.certificate_number}</Text>
            <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText() }}>{record.issuing_authority}</Text>
          </View>
          <StatusChip tone={cbaTone(record.status)} label={t(`unionCore.cba.status.cba.${record.status}`)} />
        </View>
        <View style={{ flexDirection: rowDirection(), gap: 8, flexWrap: 'wrap' }}>
          <StatusChip tone="info" label={t('unionCore.cba.registry.covered', { count: record.covered_workers })} />
          <StatusChip tone={expiryDays <= 30 ? 'error' : expiryDays <= 90 ? 'warning' : 'success'} label={t('unionCore.cba.registry.expiryLabel', { count: expiryDays })} />
          <StatusChip tone={record.missing_evidence_count ? 'warning' : 'success'} label={t('unionCore.cba.registry.readiness', { percent: record.readiness_score })} />
        </View>
        <View style={{ flexDirection: rowDirection(), gap: 8, flexWrap: 'wrap' }}>
          <Pressable onPress={onOpen} style={{ paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, backgroundColor: tokens.portalUnion }}>
            <Text style={{ color: tokens.primaryForeground, ...directionalText('900') }}>{t('unionCore.cba.actions.view')}</Text>
          </Pressable>
          <Pressable onPress={onEdit} style={{ paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: tokens.border }}>
            <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{t('unionCore.cba.actions.editRecord')}</Text>
          </Pressable>
          {record.status !== 'renewal_pending' ? (
            <Pressable onPress={onRenew} style={{ paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: tokens.statusWarning }}>
              <Text style={{ color: tokens.statusWarning, ...directionalText('900') }}>{t('unionCore.cba.actions.markRenewal')}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </SectionCard>
  );
}

export function CBARecordDetailModal({
  open,
  record,
  onClose,
  onEdit,
}: {
  open: boolean;
  record: UnionCBARecordDetail | null;
  onClose: () => void;
  onEdit: () => void;
}) {
  const { t } = useTranslation();
  if (!record) return null;

  return (
    <WorkspaceModalFrame open={open} onClose={onClose} title={record.establishment_name} subtitle={t('unionCore.cba.detailSubtitle')}>
      <SectionCard title={t('unionCore.cba.sections.identity')}>
        <View style={{ gap: 8 }}>
          <SummaryLine label={t('unionCore.cba.fields.certificateNumber')} value={record.certificate_number} />
          <SummaryLine label={t('unionCore.cba.fields.issuer')} value={record.issuing_authority} />
          <SummaryLine label={t('unionCore.cba.fields.effectiveDate')} value={record.effective_date} />
          <SummaryLine label={t('unionCore.cba.fields.expiryDate')} value={record.expiry_date} />
          <SummaryLine label={t('unionCore.cba.fields.reference')} value={record.certificate_reference} />
        </View>
      </SectionCard>

      <SectionCard title={t('unionCore.cba.sections.coverage')}>
        <View style={{ gap: 8 }}>
          <SummaryLine label={t('unionCore.cba.fields.coveredWorkers')} value={String(record.covered_workers)} />
          <SummaryLine label={t('unionCore.cba.fields.membershipAtCert')} value={String(record.membership_at_cert)} />
          <SummaryLine label={t('unionCore.cba.fields.totalWorkforce')} value={String(record.total_workforce)} />
          <SummaryLine label={t('unionCore.cba.fields.membershipPercent')} value={`${record.membership_percentage}%`} />
        </View>
      </SectionCard>

      <SectionCard title={t('unionCore.cba.sections.basis')}>
        <Text style={{ color: tokens.mutedForeground, fontSize: 13, lineHeight: 20, ...directionalText() }}>{record.determination_basis}</Text>
      </SectionCard>

      <SectionCard title={t('unionCore.cba.sections.evidence')}>
        <View style={{ flexDirection: rowDirection(), gap: 8, flexWrap: 'wrap' }}>
          <StatusChip tone={record.missing_evidence_count ? 'warning' : 'success'} label={t('unionCore.cba.registry.readiness', { percent: record.readiness_score })} />
          <StatusChip tone="warning" label={t('unionCore.cba.hero.missingEvidence', { count: record.missing_evidence_count })} />
        </View>
      </SectionCard>

      <SectionCard title={t('unionCore.cba.sections.history')}>
        <View style={{ gap: 10 }}>
          {record.history.map((item) => (
            <View key={item.id} style={{ borderWidth: 1, borderColor: tokens.border, borderRadius: 12, padding: 10, gap: 4 }}>
              <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{item.note}</Text>
              <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText() }}>{item.actor} • {item.date}</Text>
            </View>
          ))}
        </View>
      </SectionCard>

      <Pressable onPress={onEdit} style={{ minHeight: 46, borderRadius: 12, backgroundColor: tokens.portalUnion, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: tokens.primaryForeground, ...directionalText('900') }}>{t('unionCore.cba.actions.editRecord')}</Text>
      </Pressable>
    </WorkspaceModalFrame>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 8 }}>
      <Text style={{ color: tokens.mutedForeground, flex: 1, ...directionalText('800') }}>{label}</Text>
      <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{value}</Text>
    </View>
  );
}

export function CBARecordFormModal({
  open,
  record,
  onClose,
  onSave,
}: {
  open: boolean;
  record: UnionCBARecordDetail | null;
  onClose: () => void;
  onSave: (record: UnionCBARecord) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [values, setValues] = useState<CBARecordFormValues>(buildCbaRecordFormValues(record));
  const [errors, setErrors] = useState<Partial<Record<keyof CBARecordFormValues, string>>>({});

  useEffect(() => {
    setValues(buildCbaRecordFormValues(record));
    setErrors({});
  }, [record, open]);

  async function handleSave() {
    const parsed = cbaRecordFormSchema.safeParse(values);
    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      setErrors({
        title: normalizeIssue(flattened.title),
        employer: normalizeIssue(flattened.employer),
        establishment_name: normalizeIssue(flattened.establishment_name),
        certificate_number: normalizeIssue(flattened.certificate_number),
        legal_form: normalizeIssue(flattened.legal_form),
        rule_reference: normalizeIssue(flattened.rule_reference),
        section_reference: normalizeIssue(flattened.section_reference),
        issuing_authority: normalizeIssue(flattened.issuing_authority),
        region: normalizeIssue(flattened.region),
        issue_date: normalizeIssue(flattened.issue_date),
        effective_date: normalizeIssue(flattened.effective_date),
        expiry_date: normalizeIssue(flattened.expiry_date),
        certificate_reference: normalizeIssue(flattened.certificate_reference),
        determination_basis: normalizeIssue(flattened.determination_basis),
      });
      return;
    }

    await onSave(toCbaRecord(parsed.data, record));
    onClose();
  }

  return (
    <WorkspaceModalFrame open={open} onClose={onClose} title={record ? t('unionCore.cba.form.editTitle') : t('unionCore.cba.form.addTitle')} subtitle={t('unionCore.cba.form.subtitle')}>
      <SectionCard title={t('unionCore.cba.sections.identity')}>
        <View style={{ gap: 10 }}>
          <TextField label={t('unionCore.cba.fields.title')} value={values.title} onChangeText={(value) => setValues((current) => ({ ...current, title: value }))} error={errors.title} />
          <TextField label={t('unionCore.cba.fields.employer')} value={values.employer} onChangeText={(value) => setValues((current) => ({ ...current, employer: value }))} error={errors.employer} />
          <TextField label={t('unionCore.cba.fields.establishment')} value={values.establishment_name} onChangeText={(value) => setValues((current) => ({ ...current, establishment_name: value }))} error={errors.establishment_name} />
          <TextField label={t('unionCore.cba.fields.certificateNumber')} value={values.certificate_number} onChangeText={(value) => setValues((current) => ({ ...current, certificate_number: value }))} error={errors.certificate_number} />
          <TextField label={t('unionCore.cba.fields.issuer')} value={values.issuing_authority} onChangeText={(value) => setValues((current) => ({ ...current, issuing_authority: value }))} error={errors.issuing_authority} />
          <TextField label={t('unionCore.cba.fields.reference')} value={values.certificate_reference} onChangeText={(value) => setValues((current) => ({ ...current, certificate_reference: value }))} error={errors.certificate_reference} />
        </View>
      </SectionCard>

      <SectionCard title={t('unionCore.cba.sections.validity')}>
        <View style={{ gap: 10 }}>
          <TextField label={t('unionCore.cba.fields.issueDate')} value={values.issue_date} onChangeText={(value) => setValues((current) => ({ ...current, issue_date: value }))} error={errors.issue_date} />
          <TextField label={t('unionCore.cba.fields.effectiveDate')} value={values.effective_date} onChangeText={(value) => setValues((current) => ({ ...current, effective_date: value }))} error={errors.effective_date} />
          <TextField label={t('unionCore.cba.fields.expiryDate')} value={values.expiry_date} onChangeText={(value) => setValues((current) => ({ ...current, expiry_date: value }))} error={errors.expiry_date} />
          <TextField label={t('unionCore.cba.fields.region')} value={values.region} onChangeText={(value) => setValues((current) => ({ ...current, region: value }))} error={errors.region} />
        </View>
      </SectionCard>

      <SectionCard title={t('unionCore.cba.sections.coverage')}>
        <View style={{ gap: 10 }}>
          <TextField label={t('unionCore.cba.fields.coveredWorkers')} value={String(values.covered_workers)} keyboardType="numeric" onChangeText={(value) => setValues((current) => ({ ...current, covered_workers: Number(value) || 0 }))} />
          <TextField label={t('unionCore.cba.fields.membershipAtCert')} value={String(values.membership_at_cert)} keyboardType="numeric" onChangeText={(value) => setValues((current) => ({ ...current, membership_at_cert: Number(value) || 0 }))} />
          <TextField label={t('unionCore.cba.fields.totalWorkforce')} value={String(values.total_workforce)} keyboardType="numeric" onChangeText={(value) => setValues((current) => ({ ...current, total_workforce: Number(value) || 0 }))} />
          <TextField label={t('unionCore.cba.fields.membershipPercent')} value={String(values.membership_percentage)} keyboardType="numeric" onChangeText={(value) => setValues((current) => ({ ...current, membership_percentage: Number(value) || 0 }))} />
        </View>
      </SectionCard>

      <SectionCard title={t('unionCore.cba.sections.basis')}>
        <View style={{ gap: 10 }}>
          <TextField label={t('unionCore.cba.fields.legalForm')} value={values.legal_form} onChangeText={(value) => setValues((current) => ({ ...current, legal_form: value }))} error={errors.legal_form} />
          <TextField label={t('unionCore.cba.fields.ruleReference')} value={values.rule_reference} onChangeText={(value) => setValues((current) => ({ ...current, rule_reference: value }))} error={errors.rule_reference} />
          <TextField label={t('unionCore.cba.fields.sectionReference')} value={values.section_reference} onChangeText={(value) => setValues((current) => ({ ...current, section_reference: value }))} error={errors.section_reference} />
          <TextField label={t('unionCore.cba.fields.determinationBasis')} value={values.determination_basis} onChangeText={(value) => setValues((current) => ({ ...current, determination_basis: value }))} multiline error={errors.determination_basis} />
        </View>
      </SectionCard>

      <Pressable onPress={handleSave} style={{ minHeight: 48, borderRadius: 12, backgroundColor: tokens.portalUnion, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: tokens.primaryForeground, ...directionalText('900') }}>{t('common.save')}</Text>
      </Pressable>
    </WorkspaceModalFrame>
  );
}

export function ActiveCoDPanel({
  workflow,
  record,
  onEdit,
  onAdvance,
}: {
  workflow: UnionCoDWorkflow | null;
  record: UnionCBARecordDetail | null;
  onEdit: () => void;
  onAdvance: (nextStage: CoDStage) => void;
}) {
  const { t } = useTranslation();
  if (!workflow || !record) {
    return (
      <SectionCard>
        <Text style={{ color: tokens.mutedForeground, ...directionalText() }}>{t('unionCore.cba.emptyWorkflow')}</Text>
      </SectionCard>
    );
  }

  const nextStage =
    workflow.current_stage === 'draft' ? 'submitted'
      : workflow.current_stage === 'submitted' ? 'response_pending'
        : workflow.current_stage === 'response_pending' ? 'negotiation'
          : workflow.current_stage === 'negotiation' ? 'conciliation'
            : workflow.current_stage === 'conciliation' ? 'arbitration'
              : workflow.current_stage === 'arbitration' ? 'strike_notice'
                : workflow.current_stage === 'strike_notice' ? 'settlement'
                  : 'closed';

  return (
    <SectionCard>
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: rowDirection(), alignItems: 'flex-start', gap: 10 }}>
          <View style={{ width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: tokens.secondary }}>
            <FileSignature size={18} color={tokens.portalUnion} />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ color: tokens.foreground, fontSize: 18, ...directionalText('900') }}>{workflow.reference_number}</Text>
            <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText() }}>{record.establishment_name}</Text>
          </View>
          <StatusChip tone={codTone(workflow.current_stage)} label={t(`unionCore.cba.status.cod.${workflow.current_stage}`)} />
        </View>
        <View style={{ flexDirection: rowDirection(), gap: 8, flexWrap: 'wrap' }}>
          <StatusChip tone="info" label={t('unionCore.cba.cod.submittedOn', { date: formatDate(workflow.submission_date) })} />
          <StatusChip tone="warning" label={t('unionCore.cba.cod.nextDeadline', { date: formatDate(workflow.next_deadline) })} />
          {workflow.management_response ? <StatusChip tone="info" label={t(`unionCore.cba.responses.${workflow.management_response}`)} /> : null}
        </View>
        <Text style={{ color: tokens.mutedForeground, fontSize: 13, lineHeight: 20, ...directionalText() }}>
          {workflow.management_notes || t('unionCore.cba.cod.noResponseNote')}
        </Text>
        <View style={{ flexDirection: rowDirection(), gap: 8, flexWrap: 'wrap' }}>
          <Pressable onPress={onEdit} style={{ paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, backgroundColor: tokens.portalUnion }}>
            <Text style={{ color: tokens.primaryForeground, ...directionalText('900') }}>{t('unionCore.cba.actions.editWorkflow')}</Text>
          </Pressable>
          {workflow.current_stage !== 'closed' ? (
            <Pressable onPress={() => onAdvance(nextStage)} style={{ paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: tokens.border }}>
              <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{t('unionCore.cba.actions.advanceStage')}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </SectionCard>
  );
}

export function DemandItemCard({
  demand,
}: {
  demand: CoDDemandFormValues;
}) {
  const { t } = useTranslation();
  return (
    <SectionCard>
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: rowDirection(), alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <Text style={{ color: tokens.foreground, flex: 1, ...directionalText('900') }}>{demand.title}</Text>
          <StatusChip tone="info" label={t(`unionCore.cba.categories.${demand.category}`)} />
        </View>
        {demand.current_value ? <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText() }}>{t('unionCore.cba.cod.currentValue', { value: demand.current_value })}</Text> : null}
        {demand.demanded_value ? <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText() }}>{t('unionCore.cba.cod.demandedValue', { value: demand.demanded_value })}</Text> : null}
        <Text style={{ color: tokens.mutedForeground, fontSize: 13, lineHeight: 19, ...directionalText() }}>{demand.justification}</Text>
      </View>
    </SectionCard>
  );
}

export function CoDWorkflowFormModal({
  open,
  workflow,
  defaultCbaId,
  onClose,
  onSave,
}: {
  open: boolean;
  workflow: UnionCoDWorkflow | null;
  defaultCbaId?: string;
  onClose: () => void;
  onSave: (workflow: UnionCoDWorkflow) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [values, setValues] = useState<CoDWorkflowFormValues>(buildCoDWorkflowFormValues(workflow, defaultCbaId));
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    setValues(buildCoDWorkflowFormValues(workflow, defaultCbaId));
    setErrors({});
  }, [workflow, defaultCbaId, open]);

  async function handleSave() {
    const parsed = codWorkflowFormSchema.safeParse(values);
    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      setErrors({
        reference_number: normalizeIssue(flattened.reference_number),
        cba_id: normalizeIssue(flattened.cba_id),
        demands: normalizeIssue(flattened.demands),
        settlement_date: normalizeIssue(flattened.settlement_date),
        mos_reference: normalizeIssue(flattened.mos_reference),
        strike_notice_date: normalizeIssue(flattened.strike_notice_date),
        strike_notice_expiry: normalizeIssue(flattened.strike_notice_expiry),
      });
      return;
    }

    await onSave(toWorkflow(parsed.data, workflow));
    onClose();
  }

  const categoryOptions = demandCategoryOptions(t);
  const stageOptions = codStageOptions(t);

  return (
    <WorkspaceModalFrame open={open} onClose={onClose} title={workflow ? t('unionCore.cba.cod.editTitle') : t('unionCore.cba.cod.addTitle')} subtitle={t('unionCore.cba.cod.formSubtitle')}>
      <SectionCard title={t('unionCore.cba.cod.sections.core')}>
        <View style={{ gap: 10 }}>
          <TextField label={t('unionCore.cba.fields.linkedCba')} value={values.cba_id} onChangeText={(value) => setValues((current) => ({ ...current, cba_id: value }))} error={errors.cba_id} />
          <TextField label={t('unionCore.cba.fields.reference')} value={values.reference_number} onChangeText={(value) => setValues((current) => ({ ...current, reference_number: value }))} error={errors.reference_number} />
          <View style={{ flexDirection: rowDirection(), gap: 8, flexWrap: 'wrap' }}>
            {stageOptions.map((option) => (
              <ToggleChip key={option.value} selected={values.current_stage === option.value} label={option.label} onPress={() => setValues((current) => ({ ...current, current_stage: option.value }))} tone={codTone(option.value)} />
            ))}
          </View>
        </View>
      </SectionCard>

      <SectionCard title={t('unionCore.cba.cod.sections.demands')}>
        <View style={{ gap: 10 }}>
          {values.demands.map((demand, index) => (
            <View key={demand.id} style={{ borderWidth: 1, borderColor: tokens.border, borderRadius: 12, padding: 10, gap: 8 }}>
              <View style={{ flexDirection: rowDirection(), justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{t('unionCore.cba.cod.demandNumber', { count: index + 1 })}</Text>
                {values.demands.length > 1 ? (
                  <Pressable onPress={() => setValues((current) => ({ ...current, demands: current.demands.filter((item) => item.id !== demand.id) }))}>
                    <Text style={{ color: tokens.statusError, ...directionalText('900') }}>{t('common.remove')}</Text>
                  </Pressable>
                ) : null}
              </View>
              <View style={{ flexDirection: rowDirection(), gap: 8, flexWrap: 'wrap' }}>
                {categoryOptions.map((option) => (
                  <ToggleChip
                    key={option.value}
                    selected={demand.category === option.value}
                    label={option.label}
                    onPress={() =>
                      setValues((current) => ({
                        ...current,
                        demands: current.demands.map((item) => (item.id === demand.id ? { ...item, category: option.value } : item)),
                      }))
                    }
                    tone="info"
                  />
                ))}
              </View>
              <TextField label={t('unionCore.cba.fields.demandTitle')} value={demand.title} onChangeText={(value) => setValues((current) => ({ ...current, demands: current.demands.map((item) => (item.id === demand.id ? { ...item, title: value } : item)) }))} />
              <TextField label={t('unionCore.cba.fields.currentValue')} value={demand.current_value || ''} onChangeText={(value) => setValues((current) => ({ ...current, demands: current.demands.map((item) => (item.id === demand.id ? { ...item, current_value: value } : item)) }))} />
              <TextField label={t('unionCore.cba.fields.demandedValue')} value={demand.demanded_value || ''} onChangeText={(value) => setValues((current) => ({ ...current, demands: current.demands.map((item) => (item.id === demand.id ? { ...item, demanded_value: value } : item)) }))} />
              <TextField label={t('unionCore.cba.fields.justification')} value={demand.justification} onChangeText={(value) => setValues((current) => ({ ...current, demands: current.demands.map((item) => (item.id === demand.id ? { ...item, justification: value } : item)) }))} multiline />
            </View>
          ))}
          <FieldError error={errors.demands} />
          <Pressable onPress={() => setValues((current) => ({ ...current, demands: [...current.demands, buildDemandDraft()] }))} style={{ minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: tokens.border, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{t('unionCore.cba.actions.addDemand')}</Text>
          </Pressable>
        </View>
      </SectionCard>

      <SectionCard title={t('unionCore.cba.cod.sections.response')}>
        <View style={{ gap: 10 }}>
          <TextField label={t('unionCore.cba.fields.submissionDate')} value={values.submission_date || ''} onChangeText={(value) => setValues((current) => ({ ...current, submission_date: value }))} />
          <TextField label={t('unionCore.cba.fields.managementResponseDate')} value={values.management_response_date || ''} onChangeText={(value) => setValues((current) => ({ ...current, management_response_date: value }))} />
          <View style={{ flexDirection: rowDirection(), gap: 8, flexWrap: 'wrap' }}>
            {(['accepted', 'partial', 'counter_offer', 'rejected'] as const).map((response) => (
              <ToggleChip key={response} selected={values.management_response === response} label={t(`unionCore.cba.responses.${response}`)} onPress={() => setValues((current) => ({ ...current, management_response: response }))} tone="warning" />
            ))}
          </View>
          <TextField label={t('unionCore.cba.fields.managementNotes')} value={values.management_notes || ''} onChangeText={(value) => setValues((current) => ({ ...current, management_notes: value }))} multiline />
        </View>
      </SectionCard>

      <SectionCard title={t('unionCore.cba.cod.sections.settlement')}>
        <View style={{ gap: 10 }}>
          <TextField label={t('unionCore.cba.fields.conciliationOfficer')} value={values.conciliation_officer || ''} onChangeText={(value) => setValues((current) => ({ ...current, conciliation_officer: value }))} />
          <TextField label={t('unionCore.cba.fields.conciliationStart')} value={values.conciliation_start_date || ''} onChangeText={(value) => setValues((current) => ({ ...current, conciliation_start_date: value }))} />
          <TextField label={t('unionCore.cba.fields.arbitrator')} value={values.arbitrator_name || ''} onChangeText={(value) => setValues((current) => ({ ...current, arbitrator_name: value }))} />
          <TextField label={t('unionCore.cba.fields.strikeNoticeDate')} value={values.strike_notice_date || ''} onChangeText={(value) => setValues((current) => ({ ...current, strike_notice_date: value }))} error={errors.strike_notice_date} />
          <TextField label={t('unionCore.cba.fields.strikeNoticeExpiry')} value={values.strike_notice_expiry || ''} onChangeText={(value) => setValues((current) => ({ ...current, strike_notice_expiry: value }))} error={errors.strike_notice_expiry} />
          <TextField label={t('unionCore.cba.fields.settlementDate')} value={values.settlement_date || ''} onChangeText={(value) => setValues((current) => ({ ...current, settlement_date: value }))} error={errors.settlement_date} />
          <TextField label={t('unionCore.cba.fields.mosReference')} value={values.mos_reference || ''} onChangeText={(value) => setValues((current) => ({ ...current, mos_reference: value }))} error={errors.mos_reference} />
          <TextField label={t('unionCore.cba.fields.settlementNotes')} value={values.settlement_notes || ''} onChangeText={(value) => setValues((current) => ({ ...current, settlement_notes: value }))} multiline />
          <TextField label={t('unionCore.cba.fields.nextDeadline')} value={values.next_deadline || ''} onChangeText={(value) => setValues((current) => ({ ...current, next_deadline: value }))} />
        </View>
      </SectionCard>

      <Pressable onPress={handleSave} style={{ minHeight: 48, borderRadius: 12, backgroundColor: tokens.portalUnion, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: tokens.primaryForeground, ...directionalText('900') }}>{t('common.save')}</Text>
      </Pressable>
    </WorkspaceModalFrame>
  );
}

export function NegotiationRoundCard({ round }: { round: NegotiationRound }) {
  const { t } = useTranslation();
  return (
    <SectionCard>
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: rowDirection(), justifyContent: 'space-between', gap: 12 }}>
          <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{t('unionCore.cba.rounds.round', { count: round.round_number })}</Text>
          <StatusChip tone="info" label={round.meeting_date} />
        </View>
        <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText() }}>{round.attendees}</Text>
        <Text style={{ color: tokens.foreground, fontSize: 13, lineHeight: 19, ...directionalText() }}>{round.outcomes}</Text>
        <Text style={{ color: tokens.mutedForeground, fontSize: 13, lineHeight: 19, ...directionalText() }}>{t('unionCore.cba.rounds.nextSteps', { value: round.next_steps })}</Text>
      </View>
    </SectionCard>
  );
}

export function NegotiationRoundFormModal({
  open,
  workflow,
  onClose,
  onSave,
}: {
  open: boolean;
  workflow: UnionCoDWorkflow | null;
  onClose: () => void;
  onSave: (round: NegotiationRound) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [values, setValues] = useState<NegotiationRoundFormValues>(buildRoundFormValues());
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    setValues(buildRoundFormValues());
    setErrors({});
  }, [workflow, open]);

  if (!workflow) return null;
  const activeWorkflow = workflow;

  async function handleSave() {
    const parsed = negotiationRoundFormSchema.safeParse(values);
    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      setErrors({
        meeting_date: normalizeIssue(flattened.meeting_date),
        attendees: normalizeIssue(flattened.attendees),
        outcomes: normalizeIssue(flattened.outcomes),
        next_steps: normalizeIssue(flattened.next_steps),
      });
      return;
    }

    await onSave(toRound(parsed.data, activeWorkflow));
    onClose();
  }

  return (
    <WorkspaceModalFrame open={open} onClose={onClose} title={t('unionCore.cba.rounds.addTitle')} subtitle={activeWorkflow.reference_number}>
      <TextField label={t('unionCore.cba.fields.meetingDate')} value={values.meeting_date} onChangeText={(value) => setValues((current) => ({ ...current, meeting_date: value }))} error={errors.meeting_date} />
      <TextField label={t('unionCore.cba.fields.attendees')} value={values.attendees} onChangeText={(value) => setValues((current) => ({ ...current, attendees: value }))} error={errors.attendees} multiline />
      <TextField label={t('unionCore.cba.fields.outcomes')} value={values.outcomes} onChangeText={(value) => setValues((current) => ({ ...current, outcomes: value }))} error={errors.outcomes} multiline />
      <TextField label={t('unionCore.cba.fields.nextSteps')} value={values.next_steps} onChangeText={(value) => setValues((current) => ({ ...current, next_steps: value }))} error={errors.next_steps} multiline />
      <Pressable onPress={handleSave} style={{ minHeight: 48, borderRadius: 12, backgroundColor: tokens.portalUnion, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: tokens.primaryForeground, ...directionalText('900') }}>{t('common.save')}</Text>
      </Pressable>
    </WorkspaceModalFrame>
  );
}

export function EvidenceCard({ item }: { item: CBAEvidenceItem }) {
  const { t } = useTranslation();
  return (
    <SectionCard>
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: rowDirection(), alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{item.title}</Text>
            <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText() }}>{item.reference}</Text>
          </View>
          <StatusChip tone={evidenceTone(item.status)} label={t(`unionCore.cba.evidence.status.${item.status}`)} />
        </View>
        <View style={{ flexDirection: rowDirection(), gap: 8, flexWrap: 'wrap' }}>
          <StatusChip tone="neutral" label={t(`unionCore.cba.evidence.category.${item.category}`)} />
          {item.expires_on ? <StatusChip tone="warning" label={t('unionCore.cba.evidence.expiresOn', { date: item.expires_on })} /> : null}
        </View>
        {item.route ? (
          <Pressable onPress={() => router.push(item.route as never)} style={{ minHeight: 42, borderRadius: 12, borderWidth: 1, borderColor: tokens.border, alignItems: 'center', justifyContent: 'center', flexDirection: rowDirection(), gap: 8 }}>
            <Link2 size={16} color={tokens.foreground} />
            <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{t('unionCore.cba.actions.openLinkedModule')}</Text>
          </Pressable>
        ) : null}
      </View>
    </SectionCard>
  );
}

export function getEvidenceWarnings(summary: UnionCBAWorkspaceSummary, t: (key: string, options?: Record<string, unknown>) => string) {
  const warnings = [];
  const missingSettlement = summary.evidence.filter((item) => item.category === 'mos' && item.status !== 'available').length;
  if (missingSettlement) {
    warnings.push({
      title: t('unionCore.cba.evidenceWarnings.mosTitle'),
      body: t('unionCore.cba.evidenceWarnings.mosBody', { count: missingSettlement }),
      tone: 'warning' as const,
    });
  }

  const expiringCerts = ([summary.current_record, summary.renewal_record, ...summary.historical_records].filter(
    (item): item is UnionCBARecordDetail => !!item,
  )).filter((item) => daysUntil(item.expiry_date) >= 0 && daysUntil(item.expiry_date) <= 90).length;
  if (expiringCerts) {
    warnings.push({
      title: t('unionCore.cba.evidenceWarnings.expiryTitle'),
      body: t('unionCore.cba.evidenceWarnings.expiryBody', { count: expiringCerts }),
      tone: 'error' as const,
    });
  }

  return warnings;
}

export function StickyCBAActionButton({
  tab,
  onAddRecord,
  onAddWorkflow,
  onAddRound,
}: {
  tab: CBAWorkspaceTab;
  onAddRecord: () => void;
  onAddWorkflow: () => void;
  onAddRound: () => void;
}) {
  const { t } = useTranslation();
  const action =
    tab === 'registry'
      ? { label: t('unionCore.cba.actions.addRecord'), icon: Plus, onPress: onAddRecord }
      : tab === 'cod'
        ? { label: t('unionCore.cba.actions.addWorkflow'), icon: FilePlus2, onPress: onAddWorkflow }
        : tab === 'rounds'
          ? { label: t('unionCore.cba.actions.addRound'), icon: Plus, onPress: onAddRound }
          : { label: t('unionCore.cba.actions.openDocuments'), icon: ArrowRight, onPress: () => router.push('/(union-admin)/documents-compliance') };

  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', right: 16, bottom: 16 }}>
      <Pressable onPress={action.onPress} style={{ minHeight: 52, borderRadius: 999, backgroundColor: unionAdminTheme.navy, paddingHorizontal: 18, flexDirection: rowDirection(), alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: unionAdminTheme.shadow, shadowOpacity: 0.18, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 6 }}>
        <action.icon size={18} color="#ffffff" />
        <Text style={{ color: '#ffffff', ...directionalText('900') }}>{action.label}</Text>
      </Pressable>
    </View>
  );
}

export function CBAActiveWorkflowHighlights({ workflow }: { workflow: UnionCoDWorkflow | null }) {
  const { t } = useTranslation();
  if (!workflow) return null;
  return (
    <SectionCard>
      <View style={{ gap: 8 }}>
        <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{t('unionCore.cba.rounds.highlights')}</Text>
        <StatusChip tone={codTone(workflow.current_stage)} label={t(`unionCore.cba.status.cod.${workflow.current_stage}`)} />
        {workflow.negotiation_rounds[0] ? (
          <Text style={{ color: tokens.mutedForeground, fontSize: 13, lineHeight: 19, ...directionalText() }}>
            {t('unionCore.cba.rounds.latest', {
              round: workflow.negotiation_rounds[0].round_number,
              date: workflow.negotiation_rounds[0].meeting_date,
            })}
          </Text>
        ) : null}
        <Text style={{ color: tokens.mutedForeground, fontSize: 13, lineHeight: 19, ...directionalText() }}>
          {t('unionCore.cba.cod.nextDeadline', { date: formatDate(workflow.next_deadline) })}
        </Text>
      </View>
    </SectionCard>
  );
}

export function AnimatedCBASection({ children, index }: { children: React.ReactNode; index: number }) {
  return <AnimatedSection index={index}>{children}</AnimatedSection>;
}

export function confirmStageAdvance(
  t: (key: string) => string,
  current: CoDStage,
  next: CoDStage,
  onConfirm: () => void,
) {
  Alert.alert(
    t('unionCore.cba.advanceConfirmTitle'),
    `${t(`unionCore.cba.status.cod.${current}`)} -> ${t(`unionCore.cba.status.cod.${next}`)}`,
    [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.continue'), onPress: onConfirm },
    ],
  );
}
