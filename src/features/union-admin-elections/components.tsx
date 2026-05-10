import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  FileSignature,
  Gavel,
  Link2,
  Plus,
  Search,
  ShieldAlert,
  Users,
  Vote,
  X,
} from 'lucide-react-native';
import { AnimatedSection } from '@/components/animated-section';
import { MetricCard } from '@/components/metric-card';
import { SectionCard } from '@/components/section-card';
import { StatusChip } from '@/components/status-chip';
import { directionalText, isRtlLanguage, rowDirection, textAlign, writingDirection } from '@/theme/layout';
import { tokens } from '@/theme/tokens';
import type {
  ElectionDisputeSummary,
  ElectionResultSummary,
  UnionElectionCandidateRecord,
  UnionElectionDetail,
  UnionElectionStatus,
  UnionElectionWorkspaceSummary,
} from '@/types/domain';
import {
  electionNominationFormSchema,
  electionScheduleFormSchema,
  type ElectionNominationFormValues,
  type ElectionScheduleFormValues,
} from './schema';

export type ElectionWorkspaceTab = 'registry' | 'nominations' | 'results' | 'disputes';
export type ElectionStatusFilter = 'all' | UnionElectionStatus;

export const electionWorkspaceTabs: ElectionWorkspaceTab[] = ['registry', 'nominations', 'results', 'disputes'];

const electionFilters: ElectionStatusFilter[] = [
  'all',
  'announced',
  'nomination_open',
  'nomination_closed',
  'objection_period',
  'candidates_final',
  'polling',
  'results_announced',
  'completed',
  'cancelled',
];

function formatDate(value?: string) {
  return value || '-';
}

function daysUntil(value: string) {
  const diff = new Date(value).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function electionTone(status: UnionElectionStatus) {
  if (status === 'completed') return 'success' as const;
  if (status === 'cancelled') return 'error' as const;
  if (status === 'polling' || status === 'results_announced' || status === 'objection_period') return 'warning' as const;
  if (status === 'nomination_open' || status === 'candidates_final') return 'info' as const;
  return 'neutral' as const;
}

function candidateTone(status: UnionElectionCandidateRecord['status']) {
  if (status === 'approved') return 'success' as const;
  if (status === 'rejected') return 'error' as const;
  if (status === 'withdrawn') return 'neutral' as const;
  if (status === 'under_objection') return 'warning' as const;
  return 'info' as const;
}

function buildScheduleValues(election: UnionElectionDetail | null): ElectionScheduleFormValues {
  return {
    reference_no: election?.reference_no ?? '',
    title: election?.title ?? '',
    election_type: election?.election_type ?? 'office_bearer',
    announcement_date: election?.announcement_date ?? new Date().toISOString().slice(0, 10),
    nomination_start_date: election?.nomination_start_date ?? new Date().toISOString().slice(0, 10),
    nomination_end_date: election?.nomination_end_date ?? new Date().toISOString().slice(0, 10),
    objection_end_date: election?.objection_end_date ?? new Date().toISOString().slice(0, 10),
    final_list_date: election?.final_list_date ?? new Date().toISOString().slice(0, 10),
    polling_date: election?.polling_date ?? new Date().toISOString().slice(0, 10),
    polling_time: election?.polling_time ?? '09:00 - 17:00',
    presiding_officer_name: election?.presiding_officer_name ?? '',
    presiding_officer_cnic: election?.presiding_officer_cnic ?? '',
    eligible_voter_count: election?.eligible_voter_count ?? 0,
    certified_voter_roll_note: election?.certified_voter_roll_note ?? '',
    notes: election?.notes ?? '',
  };
}

function buildNominationValues(): ElectionNominationFormValues {
  return {
    contested_position: '',
    candidate_name: '',
    candidate_cnic: '',
    membership_number: '',
    union_join_date: new Date().toISOString().slice(0, 10),
    address: '',
    proposer_name: '',
    proposer_cnic: '',
    seconder_name: '',
    seconder_cnic: '',
    scrutiny_note: 'Initial nomination received for scrutiny review.',
    photo_attached: false,
  };
}

function toElectionDetail(values: ElectionScheduleFormValues, existing: UnionElectionDetail | null): UnionElectionDetail {
  return {
    id: existing?.id ?? `election-${Date.now()}`,
    reference_no: values.reference_no,
    election_type: values.election_type,
    title: values.title,
    status: existing?.status ?? 'announced',
    announcement_date: values.announcement_date,
    nomination_start_date: values.nomination_start_date,
    nomination_end_date: values.nomination_end_date,
    objection_end_date: values.objection_end_date,
    final_list_date: values.final_list_date,
    polling_date: values.polling_date,
    polling_time: values.polling_time,
    presiding_officer_name: values.presiding_officer_name,
    presiding_officer_cnic: values.presiding_officer_cnic,
    presiding_officer_masked_cnic: '',
    eligible_voter_count: values.eligible_voter_count,
    certified_voter_roll_note: values.certified_voter_roll_note,
    notes: values.notes,
    active_worker_voting: existing?.active_worker_voting ?? false,
    result_summary: existing?.result_summary ?? {
      election_id: existing?.id ?? `election-${Date.now()}`,
      votes_cast: 0,
      turnout_percent: 0,
      published: false,
      winners_confirmed: false,
      office_bearer_sync_ready: false,
      winners: [],
    },
    candidates: existing?.candidates ?? [],
    disputes: existing?.disputes ?? [],
    history: existing?.history ?? [
      {
        id: `e-history-${Date.now()}`,
        election_id: existing?.id ?? `election-${Date.now()}`,
        date: values.announcement_date,
        title: 'Election announced',
        note: 'Election schedule created through the mobile governance workspace.',
      },
    ],
  };
}

function toCandidateRecord(values: ElectionNominationFormValues, electionId: string): UnionElectionCandidateRecord {
  return {
    id: `candidate-${Date.now()}`,
    election_id: electionId,
    contested_position: values.contested_position,
    candidate_name: values.candidate_name,
    candidate_cnic: values.candidate_cnic,
    masked_cnic: '',
    membership_number: values.membership_number,
    union_join_date: values.union_join_date,
    address: values.address,
    proposer_name: values.proposer_name,
    proposer_cnic: values.proposer_cnic,
    seconder_name: values.seconder_name,
    seconder_cnic: values.seconder_cnic,
    status: 'submitted',
    scrutiny_note: values.scrutiny_note,
    photo_attached: values.photo_attached,
  };
}

function ModalFrame({
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

function FieldLabel({ label }: { label: string }) {
  return <Text style={{ color: tokens.foreground, fontSize: 13, ...directionalText('900') }}>{label}</Text>;
}

function FieldError({ error }: { error?: string }) {
  const { t } = useTranslation();
  if (!error) return null;
  return <Text style={{ color: tokens.statusError, fontSize: 12, ...directionalText() }}>{t(error)}</Text>;
}

function TextField({
  label,
  value,
  onChangeText,
  error,
  keyboardType = 'default',
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
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

function FilterChip({
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

export function ElectionWorkspaceHero({ summary }: { summary: UnionElectionWorkspaceSummary }) {
  const { t } = useTranslation();
  const current = summary.current_election;
  return (
    <SectionCard>
      <View style={{ gap: 12 }}>
        <View style={{ gap: 6 }}>
          <Text style={{ color: tokens.foreground, fontSize: 20, ...directionalText('900') }}>{t('unionCore.elections.workspaceTitle')}</Text>
          <Text style={{ color: tokens.mutedForeground, fontSize: 13, lineHeight: 19, ...directionalText() }}>{t('unionCore.elections.workspaceBody')}</Text>
        </View>
        {current ? (
          <View style={{ gap: 8 }}>
            <Text style={{ color: tokens.foreground, fontSize: 16, ...directionalText('900') }}>{current.title}</Text>
            <View style={{ flexDirection: rowDirection(), gap: 8, flexWrap: 'wrap' }}>
              <StatusChip tone={electionTone(current.status)} label={t(`unionCore.elections.status.${current.status}`)} />
              <StatusChip tone="warning" label={t('unionCore.elections.hero.daysRemaining', { count: daysUntil(current.polling_date) })} />
              <StatusChip tone="info" label={t('unionCore.elections.hero.eligible', { count: current.eligible_voter_count })} />
              <StatusChip tone="warning" label={t('unionCore.elections.hero.review', { count: summary.nominations_under_review_count })} />
            </View>
          </View>
        ) : null}
      </View>
    </SectionCard>
  );
}

export function ElectionWorkspaceTabs({
  active,
  onChange,
}: {
  active: ElectionWorkspaceTab;
  onChange: (tab: ElectionWorkspaceTab) => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={{ flexDirection: rowDirection(), flexWrap: 'wrap', gap: 8 }}>
      {electionWorkspaceTabs.map((tab) => (
        <Pressable
          key={tab}
          onPress={() => onChange(tab)}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: active === tab ? tokens.portalUnion : tokens.border,
            backgroundColor: active === tab ? tokens.secondary : tokens.card,
          }}
        >
          <Text style={{ color: active === tab ? tokens.portalUnion : tokens.mutedForeground, ...directionalText('900') }}>
            {t(`unionCore.elections.tabs.${tab}`)}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export function ElectionMetricGrid({ summary }: { summary: UnionElectionWorkspaceSummary }) {
  const { t } = useTranslation();
  const metrics = [
    { icon: Vote, label: t('unionCore.elections.metrics.registry'), value: String(summary.data.length), tone: 'info' as const },
    { icon: FileSignature, label: t('unionCore.elections.metrics.review'), value: String(summary.nominations_under_review_count), tone: 'warning' as const },
    { icon: CalendarClock, label: t('unionCore.elections.metrics.pollingSoon'), value: String(summary.polling_soon_count), tone: 'warning' as const },
    { icon: ShieldAlert, label: t('unionCore.elections.metrics.pendingResults'), value: String(summary.pending_result_count), tone: 'error' as const },
  ];
  return (
    <View style={{ flexDirection: rowDirection(), gap: 8, flexWrap: 'wrap' }}>
      {metrics.map((metric) => (
        <View key={metric.label} style={{ width: '48%' }}>
          <MetricCard icon={metric.icon} label={metric.label} value={metric.value} tone={metric.tone} />
        </View>
      ))}
    </View>
  );
}

export function ElectionRegistryControls({
  query,
  setQuery,
  filter,
  setFilter,
}: {
  query: string;
  setQuery: (value: string) => void;
  filter: ElectionStatusFilter;
  setFilter: (value: ElectionStatusFilter) => void;
}) {
  const { t } = useTranslation();
  return (
    <SectionCard>
      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 8, borderWidth: 1, borderColor: tokens.border, borderRadius: 12, paddingHorizontal: 12, backgroundColor: tokens.background }}>
          <Search size={16} color={tokens.mutedForeground} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('unionCore.elections.searchPlaceholder')}
            placeholderTextColor={tokens.mutedForeground}
            style={{ flex: 1, minHeight: 46, color: tokens.foreground, textAlign: textAlign(), writingDirection: writingDirection() }}
          />
        </View>
        <View style={{ flexDirection: rowDirection(), gap: 8, flexWrap: 'wrap' }}>
          {electionFilters.map((item) => (
            <FilterChip
              key={item}
              selected={filter === item}
              label={item === 'all' ? t('unionCore.elections.filters.all') : t(`unionCore.elections.status.${item}`)}
              onPress={() => setFilter(item)}
              tone={item === 'polling' || item === 'results_announced' ? 'warning' : item === 'completed' ? 'success' : 'info'}
            />
          ))}
        </View>
      </View>
    </SectionCard>
  );
}

export function WatchlistStrip({ summary }: { summary: UnionElectionWorkspaceSummary }) {
  const { t } = useTranslation();
  return (
    <SectionCard>
      <View style={{ flexDirection: rowDirection(), gap: 8, flexWrap: 'wrap' }}>
        <StatusChip tone="info" label={t('unionCore.elections.watchlist.nominationOpen', { count: summary.nomination_open_count })} />
        <StatusChip tone="warning" label={t('unionCore.elections.watchlist.pollingSoon', { count: summary.polling_soon_count })} />
        <StatusChip tone="error" label={t('unionCore.elections.watchlist.pendingResults', { count: summary.pending_result_count })} />
      </View>
    </SectionCard>
  );
}

export function ElectionRegistryCard({
  election,
  onOpen,
  onEdit,
  onOpenNominations,
  onPublishResults,
}: {
  election: UnionElectionDetail;
  onOpen: () => void;
  onEdit: () => void;
  onOpenNominations: () => void;
  onPublishResults: () => void;
}) {
  const { t } = useTranslation();
  const DirectionIcon = isRtlLanguage() ? ArrowLeft : ArrowRight;
  return (
    <Pressable onPress={onOpen} style={{ backgroundColor: tokens.card, borderWidth: 1, borderColor: tokens.border, borderRadius: 16, padding: 14, gap: 10 }}>
      <View style={{ flexDirection: rowDirection(), justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={{ color: tokens.foreground, fontSize: 16, ...directionalText('900') }}>{election.title}</Text>
          <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText('700') }}>{election.reference_no}</Text>
        </View>
        <DirectionIcon size={18} color={tokens.mutedForeground} />
      </View>
      <View style={{ flexDirection: rowDirection(), gap: 6, flexWrap: 'wrap' }}>
        <StatusChip tone={electionTone(election.status)} label={t(`unionCore.elections.status.${election.status}`)} />
        <StatusChip tone="neutral" label={election.presiding_officer_name} />
        <StatusChip tone="info" label={t('unionCore.elections.hero.eligible', { count: election.eligible_voter_count })} />
      </View>
      <Text style={{ color: tokens.mutedForeground, fontSize: 12, lineHeight: 18, ...directionalText() }}>
        {t('unionCore.elections.meta', { poll: election.polling_date, officer: election.presiding_officer_name })}
      </Text>
      <View style={{ flexDirection: rowDirection(), justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <ActionText label={t('unionCore.elections.actions.view')} onPress={onOpen} primary />
        <ActionText label={t('unionCore.elections.actions.edit')} onPress={onEdit} />
        <ActionText label={t('unionCore.elections.actions.openNominations')} onPress={onOpenNominations} />
        {(election.status === 'polling' || election.status === 'results_announced') ? (
          <ActionText label={t('unionCore.elections.actions.publishResults')} onPress={onPublishResults} />
        ) : null}
      </View>
    </Pressable>
  );
}

function ActionText({
  label,
  onPress,
  primary = false,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={{ paddingVertical: 4 }}>
      <Text style={{ color: primary ? tokens.portalUnion : tokens.mutedForeground, fontSize: 12, ...directionalText('900') }}>{label}</Text>
    </Pressable>
  );
}

export function CandidateQueueCard({
  candidate,
  onApprove,
  onReject,
  onObject,
}: {
  candidate: UnionElectionCandidateRecord;
  onApprove: () => void;
  onReject: () => void;
  onObject: () => void;
}) {
  const { t } = useTranslation();
  return (
    <SectionCard>
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: rowDirection(), justifyContent: 'space-between', gap: 8 }}>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{candidate.candidate_name}</Text>
            <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText() }}>{candidate.contested_position}</Text>
          </View>
          <StatusChip tone={candidateTone(candidate.status)} label={t(`unionCore.elections.candidateStatus.${candidate.status}`)} />
        </View>
        <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText() }}>
          {t('unionCore.elections.nominationMeta', {
            proposer: candidate.proposer_name,
            seconder: candidate.seconder_name,
          })}
        </Text>
        {candidate.objection_reason ? <Text style={{ color: tokens.statusWarning, fontSize: 12, ...directionalText() }}>{candidate.objection_reason}</Text> : null}
        <View style={{ flexDirection: rowDirection(), gap: 8, flexWrap: 'wrap' }}>
          <ActionText label={t('unionCore.elections.actions.approve')} onPress={onApprove} primary />
          <ActionText label={t('unionCore.elections.actions.object')} onPress={onObject} />
          <ActionText label={t('unionCore.elections.actions.reject')} onPress={onReject} />
        </View>
      </View>
    </SectionCard>
  );
}

export function ResultSummaryCard({
  election,
  onPublish,
  onSync,
}: {
  election: UnionElectionDetail;
  onPublish: () => void;
  onSync: () => void;
}) {
  const { t } = useTranslation();
  const result = election.result_summary;
  const turnout = result?.turnout_percent ?? 0;
  return (
    <SectionCard>
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: rowDirection(), justifyContent: 'space-between', gap: 8 }}>
          <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{election.title}</Text>
          <StatusChip tone={result?.published ? 'success' : 'warning'} label={result?.published ? t('unionCore.elections.result.published') : t('unionCore.elections.result.pending')} />
        </View>
        <Text style={{ color: tokens.mutedForeground, fontSize: 12, lineHeight: 18, ...directionalText() }}>
          {t('unionCore.elections.result.meta', {
            votes: result?.votes_cast ?? 0,
            turnout,
            date: formatDate(result?.result_date),
          })}
        </Text>
        {result?.winners[0] ? (
          <Text style={{ color: tokens.foreground, fontSize: 13, lineHeight: 19, ...directionalText() }}>
            {t('unionCore.elections.result.winner', {
              position: result.winners[0].position,
              name: result.winners[0].candidate_name,
            })}
          </Text>
        ) : null}
        <View style={{ flexDirection: rowDirection(), gap: 8, flexWrap: 'wrap' }}>
          <StatusChip tone={result?.office_bearer_sync_ready ? 'success' : 'warning'} label={result?.office_bearer_sync_ready ? t('unionCore.elections.result.syncReady') : t('unionCore.elections.result.syncPending')} />
          {election.active_worker_voting ? <StatusChip tone="info" label={t('unionCore.elections.result.workerVoting')} /> : null}
        </View>
        <View style={{ flexDirection: rowDirection(), gap: 8 }}>
          <Pressable onPress={onPublish} style={{ flex: 1, minHeight: 42, borderRadius: 12, backgroundColor: tokens.portalUnion, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: tokens.primaryForeground, ...directionalText('900') }}>{t('unionCore.elections.actions.publishResults')}</Text>
          </Pressable>
          <Pressable onPress={onSync} style={{ flex: 1, minHeight: 42, borderRadius: 12, backgroundColor: tokens.secondary, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: tokens.portalUnion, ...directionalText('900') }}>{t('unionCore.elections.actions.markSyncReady')}</Text>
          </Pressable>
        </View>
      </View>
    </SectionCard>
  );
}

export function DisputeCard({ dispute }: { dispute: ElectionDisputeSummary }) {
  const { t } = useTranslation();
  return (
    <SectionCard>
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: rowDirection(), justifyContent: 'space-between', gap: 8 }}>
          <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{dispute.title}</Text>
          <StatusChip tone={dispute.status === 'open' ? 'warning' : 'success'} label={t(`unionCore.elections.disputeStatus.${dispute.status}`)} />
        </View>
        <Text style={{ color: tokens.portalUnion, fontSize: 12, ...directionalText('900') }}>{t(`unionCore.elections.disputeStage.${dispute.stage}`)}</Text>
        <Text style={{ color: tokens.mutedForeground, fontSize: 12, lineHeight: 18, ...directionalText() }}>{dispute.note}</Text>
      </View>
    </SectionCard>
  );
}

export function ElectionDetailModal({
  open,
  election,
  onClose,
  onEdit,
}: {
  open: boolean;
  election: UnionElectionDetail | null;
  onClose: () => void;
  onEdit: () => void;
}) {
  const { t } = useTranslation();
  if (!election) return null;
  const activeElection = election;
  return (
    <ModalFrame open={open} title={election.title} subtitle={t('unionCore.elections.detailSubtitle')} onClose={onClose}>
      <SectionCard>
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: rowDirection(), justifyContent: 'space-between', gap: 8 }}>
            <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{election.reference_no}</Text>
            <StatusChip tone={electionTone(election.status)} label={t(`unionCore.elections.status.${election.status}`)} />
          </View>
          <Text style={{ color: tokens.mutedForeground, fontSize: 12, lineHeight: 18, ...directionalText() }}>{election.notes}</Text>
        </View>
      </SectionCard>
      <SectionCard title={t('unionCore.elections.sections.timeline')}>
        <View style={{ gap: 6 }}>
          <Text style={{ color: tokens.mutedForeground, ...directionalText() }}>{t('unionCore.elections.fields.announcementDate')}: {election.announcement_date}</Text>
          <Text style={{ color: tokens.mutedForeground, ...directionalText() }}>{t('unionCore.elections.fields.nominationStart')}: {election.nomination_start_date}</Text>
          <Text style={{ color: tokens.mutedForeground, ...directionalText() }}>{t('unionCore.elections.fields.nominationEnd')}: {election.nomination_end_date}</Text>
          <Text style={{ color: tokens.mutedForeground, ...directionalText() }}>{t('unionCore.elections.fields.pollingDate')}: {election.polling_date}</Text>
        </View>
      </SectionCard>
      <SectionCard title={t('unionCore.elections.sections.authority')}>
        <View style={{ gap: 6 }}>
          <Text style={{ color: tokens.mutedForeground, ...directionalText() }}>{election.presiding_officer_name}</Text>
          <Text style={{ color: tokens.mutedForeground, ...directionalText() }}>{election.presiding_officer_masked_cnic}</Text>
          <Text style={{ color: tokens.mutedForeground, ...directionalText() }}>{t('unionCore.elections.hero.eligible', { count: election.eligible_voter_count })}</Text>
        </View>
      </SectionCard>
      <SectionCard title={t('unionCore.elections.sections.actions')}>
        <View style={{ gap: 8 }}>
          <Pressable onPress={onEdit} style={{ minHeight: 44, borderRadius: 12, backgroundColor: tokens.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: tokens.primaryForeground, ...directionalText('900') }}>{t('unionCore.elections.actions.edit')}</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/(union-admin)/office-bearers')} style={{ minHeight: 44, borderRadius: 12, backgroundColor: tokens.secondary, alignItems: 'center', justifyContent: 'center', flexDirection: rowDirection(), gap: 8 }}>
            <Link2 size={16} color={tokens.portalUnion} />
            <Text style={{ color: tokens.portalUnion, ...directionalText('900') }}>{t('unionCore.elections.actions.openOfficeBearers')}</Text>
          </Pressable>
        </View>
      </SectionCard>
    </ModalFrame>
  );
}

export function ElectionScheduleFormModal({
  open,
  election,
  onClose,
  onSave,
}: {
  open: boolean;
  election: UnionElectionDetail | null;
  onClose: () => void;
  onSave: (election: UnionElectionDetail) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [values, setValues] = useState<ElectionScheduleFormValues>(buildScheduleValues(election));
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    setValues(buildScheduleValues(election));
    setErrors({});
  }, [election, open]);

  async function handleSave() {
    const parsed = electionScheduleFormSchema.safeParse(values);
    if (!parsed.success) {
      const nextErrors: Record<string, string | undefined> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (typeof key === 'string') nextErrors[key] = issue.message;
      });
      setErrors(nextErrors);
      return;
    }
    await onSave(toElectionDetail(parsed.data, election));
    onClose();
  }

  return (
    <ModalFrame open={open} title={election ? t('unionCore.elections.form.editTitle') : t('unionCore.elections.form.addTitle')} subtitle={t('unionCore.elections.form.subtitle')} onClose={onClose}>
      <SectionCard title={t('unionCore.elections.form.timeline')}>
        <View style={{ gap: 10 }}>
          <TextField label={t('unionCore.elections.fields.reference')} value={values.reference_no} onChangeText={(value) => setValues((current) => ({ ...current, reference_no: value }))} error={errors.reference_no} />
          <TextField label={t('unionCore.elections.fields.title')} value={values.title} onChangeText={(value) => setValues((current) => ({ ...current, title: value }))} error={errors.title} />
          <TextField label={t('unionCore.elections.fields.announcementDate')} value={values.announcement_date} onChangeText={(value) => setValues((current) => ({ ...current, announcement_date: value }))} error={errors.announcement_date} />
          <TextField label={t('unionCore.elections.fields.nominationStart')} value={values.nomination_start_date} onChangeText={(value) => setValues((current) => ({ ...current, nomination_start_date: value }))} error={errors.nomination_start_date} />
          <TextField label={t('unionCore.elections.fields.nominationEnd')} value={values.nomination_end_date} onChangeText={(value) => setValues((current) => ({ ...current, nomination_end_date: value }))} error={errors.nomination_end_date} />
          <TextField label={t('unionCore.elections.fields.objectionEnd')} value={values.objection_end_date} onChangeText={(value) => setValues((current) => ({ ...current, objection_end_date: value }))} error={errors.objection_end_date} />
          <TextField label={t('unionCore.elections.fields.finalListDate')} value={values.final_list_date} onChangeText={(value) => setValues((current) => ({ ...current, final_list_date: value }))} error={errors.final_list_date} />
          <TextField label={t('unionCore.elections.fields.pollingDate')} value={values.polling_date} onChangeText={(value) => setValues((current) => ({ ...current, polling_date: value }))} error={errors.polling_date} />
          <TextField label={t('unionCore.elections.fields.pollingTime')} value={values.polling_time} onChangeText={(value) => setValues((current) => ({ ...current, polling_time: value }))} error={errors.polling_time} />
        </View>
      </SectionCard>
      <SectionCard title={t('unionCore.elections.form.authority')}>
        <View style={{ gap: 10 }}>
          <TextField label={t('unionCore.elections.fields.presidingOfficer')} value={values.presiding_officer_name} onChangeText={(value) => setValues((current) => ({ ...current, presiding_officer_name: value }))} error={errors.presiding_officer_name} />
          <TextField label={t('unionCore.elections.fields.presidingOfficerCnic')} value={values.presiding_officer_cnic} onChangeText={(value) => setValues((current) => ({ ...current, presiding_officer_cnic: value }))} error={errors.presiding_officer_cnic} keyboardType="numeric" />
          <TextField label={t('unionCore.elections.fields.notes')} value={values.notes} onChangeText={(value) => setValues((current) => ({ ...current, notes: value }))} error={errors.notes} multiline />
        </View>
      </SectionCard>
      <SectionCard title={t('unionCore.elections.form.voterRoll')}>
        <View style={{ gap: 10 }}>
          <TextField label={t('unionCore.elections.fields.eligibleCount')} value={String(values.eligible_voter_count)} onChangeText={(value) => setValues((current) => ({ ...current, eligible_voter_count: Number(value || '0') }))} error={errors.eligible_voter_count} keyboardType="numeric" />
          <TextField label={t('unionCore.elections.fields.rollNote')} value={values.certified_voter_roll_note} onChangeText={(value) => setValues((current) => ({ ...current, certified_voter_roll_note: value }))} error={errors.certified_voter_roll_note} multiline />
        </View>
      </SectionCard>
      <Pressable onPress={handleSave} style={{ minHeight: 48, borderRadius: 12, backgroundColor: tokens.portalUnion, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: tokens.primaryForeground, ...directionalText('900') }}>{t('common.save')}</Text>
      </Pressable>
    </ModalFrame>
  );
}

export function ElectionNominationFormModal({
  open,
  election,
  onClose,
  onSave,
}: {
  open: boolean;
  election: UnionElectionDetail | null;
  onClose: () => void;
  onSave: (candidate: UnionElectionCandidateRecord) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [values, setValues] = useState<ElectionNominationFormValues>(buildNominationValues());
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    setValues(buildNominationValues());
    setErrors({});
  }, [election, open]);

  if (!election) return null;
  const activeElection = election;

  async function handleSave() {
    const parsed = electionNominationFormSchema.safeParse(values);
    if (!parsed.success) {
      const nextErrors: Record<string, string | undefined> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (typeof key === 'string') nextErrors[key] = issue.message;
      });
      setErrors(nextErrors);
      return;
    }
    await onSave(toCandidateRecord(parsed.data, activeElection.id));
    onClose();
  }

  return (
    <ModalFrame open={open} title={t('unionCore.elections.nominationForm.title')} subtitle={activeElection.title} onClose={onClose}>
      <SectionCard>
        <View style={{ gap: 10 }}>
          <TextField label={t('unionCore.elections.fields.position')} value={values.contested_position} onChangeText={(value) => setValues((current) => ({ ...current, contested_position: value }))} error={errors.contested_position} />
          <TextField label={t('unionCore.elections.fields.candidateName')} value={values.candidate_name} onChangeText={(value) => setValues((current) => ({ ...current, candidate_name: value }))} error={errors.candidate_name} />
          <TextField label={t('unionCore.elections.fields.candidateCnic')} value={values.candidate_cnic} onChangeText={(value) => setValues((current) => ({ ...current, candidate_cnic: value }))} error={errors.candidate_cnic} keyboardType="numeric" />
          <TextField label={t('unionCore.elections.fields.membershipNumber')} value={values.membership_number} onChangeText={(value) => setValues((current) => ({ ...current, membership_number: value }))} error={errors.membership_number} />
          <TextField label={t('unionCore.elections.fields.joinDate')} value={values.union_join_date} onChangeText={(value) => setValues((current) => ({ ...current, union_join_date: value }))} error={errors.union_join_date} />
          <TextField label={t('unionCore.elections.fields.address')} value={values.address} onChangeText={(value) => setValues((current) => ({ ...current, address: value }))} error={errors.address} multiline />
          <TextField label={t('unionCore.elections.fields.proposer')} value={values.proposer_name} onChangeText={(value) => setValues((current) => ({ ...current, proposer_name: value }))} error={errors.proposer_name} />
          <TextField label={t('unionCore.elections.fields.proposerCnic')} value={values.proposer_cnic} onChangeText={(value) => setValues((current) => ({ ...current, proposer_cnic: value }))} error={errors.proposer_cnic} keyboardType="numeric" />
          <TextField label={t('unionCore.elections.fields.seconder')} value={values.seconder_name} onChangeText={(value) => setValues((current) => ({ ...current, seconder_name: value }))} error={errors.seconder_name} />
          <TextField label={t('unionCore.elections.fields.seconderCnic')} value={values.seconder_cnic} onChangeText={(value) => setValues((current) => ({ ...current, seconder_cnic: value }))} error={errors.seconder_cnic} keyboardType="numeric" />
          <TextField label={t('unionCore.elections.fields.notes')} value={values.scrutiny_note} onChangeText={(value) => setValues((current) => ({ ...current, scrutiny_note: value }))} error={errors.scrutiny_note} multiline />
          <View style={{ flexDirection: rowDirection(), gap: 8, alignItems: 'center' }}>
            <FilterChip selected={values.photo_attached} label={t('unionCore.elections.nominationForm.photoAttached')} onPress={() => setValues((current) => ({ ...current, photo_attached: !current.photo_attached }))} tone="success" />
            <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText() }}>{t('unionCore.elections.nominationForm.legalNote')}</Text>
          </View>
        </View>
      </SectionCard>
      <Pressable onPress={handleSave} style={{ minHeight: 48, borderRadius: 12, backgroundColor: tokens.portalUnion, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: tokens.primaryForeground, ...directionalText('900') }}>{t('common.save')}</Text>
      </Pressable>
    </ModalFrame>
  );
}

export function StickyElectionActionButton({
  tab,
  onAddSchedule,
  onAddNomination,
}: {
  tab: ElectionWorkspaceTab;
  onAddSchedule: () => void;
  onAddNomination: () => void;
}) {
  const { t } = useTranslation();
  const action =
    tab === 'registry'
      ? { label: t('unionCore.elections.actions.addSchedule'), icon: Plus, onPress: onAddSchedule }
      : tab === 'nominations'
        ? { label: t('unionCore.elections.actions.addNomination'), icon: FileSignature, onPress: onAddNomination }
        : tab === 'results'
          ? { label: t('unionCore.elections.actions.openOfficeBearers'), icon: BadgeCheck, onPress: () => router.push('/(union-admin)/office-bearers') }
          : { label: t('unionCore.elections.actions.openLegal'), icon: Gavel, onPress: () => router.push('/(union-admin)/grievances-legal') };

  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', right: isRtlLanguage() ? undefined : 16, left: isRtlLanguage() ? 16 : undefined, bottom: 16 }}>
      <Pressable onPress={action.onPress} style={{ minHeight: 52, borderRadius: 999, backgroundColor: tokens.portalUnion, paddingHorizontal: 18, flexDirection: rowDirection(), alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 6 }}>
        <action.icon size={18} color={tokens.primaryForeground} />
        <Text style={{ color: tokens.primaryForeground, ...directionalText('900') }}>{action.label}</Text>
      </Pressable>
    </View>
  );
}

export function getHighlightedElection(summary: UnionElectionWorkspaceSummary) {
  return summary.current_election;
}

export function filterElectionRegistry(
  records: UnionElectionDetail[],
  query: string,
  filter: ElectionStatusFilter,
) {
  const normalized = query.trim().toLowerCase();
  return records.filter((item) => {
    const matchesQuery =
      !normalized ||
      [
        item.title,
        item.reference_no,
        item.presiding_officer_name,
        item.polling_date,
      ].some((value) => value.toLowerCase().includes(normalized));
    const matchesFilter = filter === 'all' || item.status === filter;
    return matchesQuery && matchesFilter;
  });
}

export function getNominationQueue(summary: UnionElectionWorkspaceSummary) {
  return summary.data
    .flatMap((item) => item.candidates)
    .filter((item) => item.status === 'submitted' || item.status === 'under_objection' || item.status === 'approved');
}

export function getResultCards(summary: UnionElectionWorkspaceSummary) {
  return summary.data.filter(
    (item) => item.status === 'polling' || item.status === 'results_announced' || item.status === 'completed',
  );
}

export function getDisputeCards(summary: UnionElectionWorkspaceSummary) {
  return summary.disputes;
}

export function AnimatedElectionSection({ children, index }: { children: React.ReactNode; index: number }) {
  return <AnimatedSection index={index}>{children}</AnimatedSection>;
}
