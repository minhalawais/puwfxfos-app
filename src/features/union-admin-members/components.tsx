import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDot,
  CircleOff,
  FileSpreadsheet,
  FolderUp,
  IdCard,
  Plus,
  ShieldCheck,
  UserPlus,
  Users,
  Vote,
  Wallet,
  X,
} from 'lucide-react-native';
import { MetricCard } from '@/components/metric-card';
import { SectionCard } from '@/components/section-card';
import { StatPill } from '@/components/stat-pill';
import { StatusChip } from '@/components/status-chip';
import { useAddMemberLifecycleEventMutation, useCommitMemberImportMutation, usePreviewMemberImportMutation, useUpdateMemberVerificationMutation } from '@/services/union-admin-service';
import { alignSelfStart, directionalText, isRtlLanguage, rowDirection, textAlign, writingDirection } from '@/theme/layout';
import { tokens } from '@/theme/tokens';
import { getUnionAdminTone, unionAdminTheme } from '@/theme/union-admin';
import type { MemberImportJob, MemberImportPreview, MemberLifecycleEvent, UnionMemberDetail, UnionMemberRecord } from '@/types/domain';
import {
  unionMemberBenefitsSchema,
  unionMemberDocumentsSchema,
  unionMemberEmploymentSchema,
  unionMemberFormSchema,
  unionMemberIdentitySchema,
  unionMemberLifecycleSchema,
  unionMemberMembershipSchema,
  type UnionMemberFormValues,
} from './schema';

export type MemberWorkspaceTab = 'registry' | 'intake' | 'review' | 'lifecycle';
export type RegistryFilter = 'all' | 'active' | 'pending' | 'verification' | 'dues' | 'election' | 'deceased';
export type RegistrySort = 'risk' | 'newest' | 'name' | 'dues';

export const workspaceTabs: MemberWorkspaceTab[] = ['registry', 'intake', 'review', 'lifecycle'];
export const registryFilters: RegistryFilter[] = ['all', 'active', 'pending', 'verification', 'dues', 'election', 'deceased'];
export const registrySorts: RegistrySort[] = ['risk', 'newest', 'name', 'dues'];

const riskWeight = { urgent: 0, medium: 1, low: 2 };
const duesWeight = { overdue: 0, pending: 1, waived: 2, paid: 3 };

function formatDate(value?: string) {
  if (!value) return '-';
  return value;
}

function toneForRisk(risk: UnionMemberRecord['data_risk']) {
  return risk === 'urgent' ? 'error' : risk === 'medium' ? 'warning' : 'success';
}

function toneForVerification(detail: UnionMemberDetail['verification']['nadra_status']) {
  return detail === 'verified' ? 'success' : detail === 'failed' ? 'error' : 'warning';
}

function stepErrorLabel(t: (key: string) => string, issue?: string) {
  if (!issue) return '';
  return issue.startsWith('unionCore.') ? t(issue) : issue;
}

export function filterAndSortMembers(
  members: UnionMemberRecord[],
  query: string,
  filter: RegistryFilter,
  sort: RegistrySort,
) {
  const normalized = query.trim().toLowerCase();

  const filtered = members.filter((member) => {
    const matchesQuery =
      !normalized ||
      [
        member.name,
        member.member_id,
        member.masked_cnic,
        member.job_title,
        member.department,
        member.eobi_number ?? '',
      ].some((value) => value.toLowerCase().includes(normalized));

    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && member.membership_status === 'active') ||
      (filter === 'pending' && member.membership_status === 'pending') ||
      (filter === 'verification' && (!member.nadra_verified || member.form_c_status !== 'complete')) ||
      (filter === 'dues' && member.dues_status === 'overdue') ||
      (filter === 'election' && !member.election_ready) ||
      (filter === 'deceased' && member.membership_status === 'deceased');

    return matchesQuery && matchesFilter;
  });

  return filtered.sort((left, right) => {
    if (sort === 'name') return left.name.localeCompare(right.name);
    if (sort === 'newest') return right.joined_union_on.localeCompare(left.joined_union_on);
    if (sort === 'dues') return duesWeight[left.dues_status] - duesWeight[right.dues_status];
    return riskWeight[left.data_risk] - riskWeight[right.data_risk];
  });
}

export function buildReviewQueues(members: UnionMemberRecord[]) {
  return {
    formC: members.filter((member) => member.form_c_status !== 'complete'),
    verification: members.filter((member) => !member.nadra_verified || member.data_risk !== 'low'),
    dues: members.filter((member) => member.dues_status === 'overdue'),
    election: members.filter((member) => !member.election_ready),
    annualReturn: members.filter((member) => !member.annual_return_ready),
    deceased: members.filter((member) => member.membership_status === 'deceased'),
  };
}

export function MemberWorkspaceHero({ members }: { members: UnionMemberRecord[] }) {
  const { t } = useTranslation();
  const metrics = useMemo(() => {
    const total = members.length;
    const active = members.filter((member) => member.membership_status === 'active').length;
    const electionReady = members.filter((member) => member.election_ready).length;
    const urgent = members.filter((member) => member.data_risk === 'urgent').length;

    return { total, active, electionReady, urgent };
  }, [members]);

  return (
    <SectionCard variant="unionAdmin">
      <View style={{ gap: 12 }}>
        <View style={{ gap: 6 }}>
          <Text style={{ color: unionAdminTheme.text, fontSize: 20, ...directionalText('900') }}>
            {t('unionCore.members.workspaceTitle')}
          </Text>
          <Text style={{ color: unionAdminTheme.mutedText, fontSize: 13, lineHeight: 19, ...directionalText() }}>
            {t('unionCore.members.workspaceBody')}
          </Text>
        </View>
        <View style={{ flexDirection: rowDirection(), gap: 8, flexWrap: 'wrap' }}>
          <StatPill label={t('unionCore.members.metrics.total')} value={String(metrics.total)} />
          <StatPill label={t('unionCore.members.metrics.active')} value={String(metrics.active)} />
          <StatPill label={t('unionCore.members.metrics.ready')} value={String(metrics.electionReady)} />
          <StatPill label={t('unionCore.members.metrics.risk')} value={String(metrics.urgent)} />
        </View>
      </View>
    </SectionCard>
  );
}

export function MemberWorkspaceTabs({
  active,
  onChange,
}: {
  active: MemberWorkspaceTab;
  onChange: (tab: MemberWorkspaceTab) => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={{ flexDirection: rowDirection(), flexWrap: 'wrap', gap: 8 }}>
      {workspaceTabs.map((tab) => (
        <Pressable
          key={tab}
          onPress={() => onChange(tab)}
          accessibilityRole="button"
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
            {t(`unionCore.members.tabs.${tab}`)}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export function MemberMetricGrid({ members }: { members: UnionMemberRecord[] }) {
  const { t } = useTranslation();
  const metrics = [
    {
      icon: Users,
      label: t('unionCore.members.metrics.total'),
      value: String(members.length),
      tone: 'info' as const,
    },
    {
      icon: CheckCircle2,
      label: t('unionCore.members.metrics.formComplete'),
      value: String(members.filter((member) => member.form_c_status === 'complete').length),
      tone: 'success' as const,
    },
    {
      icon: Vote,
      label: t('unionCore.members.metrics.ready'),
      value: String(members.filter((member) => member.election_ready).length),
      tone: 'success' as const,
    },
    {
      icon: AlertTriangle,
      label: t('unionCore.members.metrics.overdue'),
      value: String(members.filter((member) => member.dues_status === 'overdue').length),
      tone: 'warning' as const,
    },
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

function QuickActionText({
  label,
  onPress,
  tone = 'neutral',
}: {
  label: string;
  onPress: () => void;
  tone?: 'neutral' | 'primary';
}) {
  return (
    <Pressable onPress={onPress} style={{ paddingVertical: 6, paddingHorizontal: 4 }}>
      <Text
        style={{
          color: tone === 'primary' ? tokens.portalUnion : tokens.mutedForeground,
          fontSize: 12,
          ...directionalText('900'),
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function RegistryControls({
  query,
  setQuery,
  filter,
  setFilter,
  sort,
  setSort,
  selectedCount,
}: {
  query: string;
  setQuery: (value: string) => void;
  filter: RegistryFilter;
  setFilter: (value: RegistryFilter) => void;
  sort: RegistrySort;
  setSort: (value: RegistrySort) => void;
  selectedCount: number;
}) {
  const { t } = useTranslation();
  return (
    <SectionCard>
      <View style={{ gap: 10 }}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('union.searchMembers')}
          placeholderTextColor={tokens.mutedForeground}
          style={{
            minHeight: 46,
            borderWidth: 1,
            borderColor: tokens.border,
            borderRadius: 12,
            paddingHorizontal: 12,
            color: tokens.foreground,
            backgroundColor: tokens.background,
            textAlign: textAlign(),
            writingDirection: writingDirection(),
          }}
        />
        <View style={{ gap: 8 }}>
          <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText('800') }}>
            {t('unionCore.members.filtersLabel')}
          </Text>
          <View style={{ flexDirection: rowDirection(), gap: 8, flexWrap: 'wrap' }}>
            {registryFilters.map((item) => (
              <Pressable key={item} onPress={() => setFilter(item)}>
                <StatusChip tone={filter === item ? 'info' : 'neutral'} label={t(`unionCore.members.filters.${item}`)} />
              </Pressable>
            ))}
          </View>
        </View>
        <View style={{ gap: 8 }}>
          <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText('800') }}>
            {t('unionCore.members.sortLabel')}
          </Text>
          <View style={{ flexDirection: rowDirection(), gap: 8, flexWrap: 'wrap' }}>
            {registrySorts.map((item) => (
              <Pressable key={item} onPress={() => setSort(item)}>
                <StatusChip tone={sort === item ? 'warning' : 'neutral'} label={t(`unionCore.members.sorts.${item}`)} />
              </Pressable>
            ))}
          </View>
        </View>
        {selectedCount ? (
          <View style={{ flexDirection: rowDirection(), justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <Text style={{ color: tokens.foreground, ...directionalText('900') }}>
              {t('unionCore.members.batchSelected', { count: selectedCount })}
            </Text>
            <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText() }}>
              {t('unionCore.members.batchHint')}
            </Text>
          </View>
        ) : null}
      </View>
    </SectionCard>
  );
}

export function RegistryMemberCard({
  member,
  selected,
  onToggleSelect,
  onOpenDetail,
  onEdit,
  onVerify,
}: {
  member: UnionMemberRecord;
  selected: boolean;
  onToggleSelect: () => void;
  onOpenDetail: () => void;
  onEdit: () => void;
  onVerify: () => void;
}) {
  const { t } = useTranslation();
  const DirectionIcon = isRtlLanguage() ? ArrowLeft : ArrowRight;
  return (
    <Pressable
      onPress={onOpenDetail}
      style={{
        backgroundColor: tokens.card,
        borderWidth: 1,
        borderColor: selected ? unionAdminTheme.navy : unionAdminTheme.border,
        borderRadius: 20,
        padding: 14,
        gap: 10,
      }}
    >
      <View style={{ flexDirection: rowDirection(), justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
        <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 10, flex: 1 }}>
          <Pressable
            onPress={onToggleSelect}
            hitSlop={8}
            style={{
              width: 26,
              height: 26,
              borderRadius: 999,
              borderWidth: 1.5,
              borderColor: selected ? unionAdminTheme.navy : unionAdminTheme.border,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: selected ? unionAdminTheme.softNavy : tokens.card,
            }}
          >
            {selected ? <CheckCircle2 size={16} color={unionAdminTheme.navy} /> : null}
          </Pressable>
          <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: unionAdminTheme.softNavy, alignItems: 'center', justifyContent: 'center' }}>
            <IdCard size={21} color={unionAdminTheme.navy} />
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={{ color: tokens.foreground, fontSize: 16, ...directionalText('900') }}>{member.name}</Text>
            <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText('700') }}>
              {member.member_id} · {member.job_title}
            </Text>
          </View>
        </View>
        <DirectionIcon size={18} color={tokens.mutedForeground} />
      </View>

      <View style={{ flexDirection: rowDirection(), gap: 6, flexWrap: 'wrap' }}>
        <StatusChip tone={member.membership_status === 'active' ? 'success' : member.membership_status === 'deceased' ? 'error' : 'warning'} label={t(`status.membership.${member.membership_status}`)} />
        <StatusChip tone="neutral" label={member.masked_cnic} />
        <StatusChip tone={toneForRisk(member.data_risk)} label={t(`unionCore.members.risk.${member.data_risk}`)} />
      </View>

      <Text style={{ color: tokens.mutedForeground, fontSize: 12, lineHeight: 18, ...directionalText() }}>
        {member.department} · {member.province} · {t('unionCore.members.readinessMeta', { score: member.readiness_score, dues: t(`status.dues.${member.dues_status}`) })}
      </Text>

      <View style={{ flexDirection: rowDirection(), justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <QuickActionText label={t('unionCore.members.actions.view')} onPress={onOpenDetail} tone="primary" />
        <QuickActionText label={t('unionCore.members.actions.edit')} onPress={onEdit} />
        <QuickActionText label={t('unionCore.members.actions.verify')} onPress={onVerify} />
      </View>
    </Pressable>
  );
}

export function ReviewQueueCard({
  title,
  body,
  count,
  tone,
  onPress,
}: {
  title: string;
  body: string;
  count: number;
  tone: 'warning' | 'error' | 'info';
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: tokens.card,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: tone === 'error' ? 'rgba(242, 29, 47, 0.18)' : tone === 'warning' ? 'rgba(166, 18, 31, 0.18)' : unionAdminTheme.border,
        padding: 14,
        gap: 8,
      }}
    >
      <View style={{ flexDirection: rowDirection(), justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{title}</Text>
        <StatusChip tone={tone} label={String(count)} />
      </View>
      <Text style={{ color: tokens.mutedForeground, fontSize: 12, lineHeight: 18, ...directionalText() }}>{body}</Text>
    </Pressable>
  );
}

export function ImportJobCard({ job }: { job: MemberImportJob }) {
  const { t } = useTranslation();
  return (
    <SectionCard variant="unionAdmin">
      <View style={{ gap: 6 }}>
        <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{job.file_name}</Text>
        <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText() }}>
          {t('unionCore.members.import.jobMeta', {
            date: formatDate(job.imported_at.slice(0, 10)),
            imported: job.imported_rows,
            total: job.total_rows,
          })}
        </Text>
        <View style={{ flexDirection: rowDirection(), gap: 8, flexWrap: 'wrap' }}>
          <StatusChip tone={job.status === 'completed' ? 'success' : job.status === 'failed' ? 'error' : 'warning'} label={t(`unionCore.members.import.status.${job.status}`)} />
          <StatusChip tone="warning" label={t('unionCore.members.import.duplicates', { count: job.duplicate_rows })} />
          <StatusChip tone={job.error_rows ? 'error' : 'neutral'} label={t('unionCore.members.import.errors', { count: job.error_rows })} />
        </View>
      </View>
    </SectionCard>
  );
}

export function LifecycleEventCard({
  event,
  memberName,
}: {
  event: MemberLifecycleEvent;
  memberName: string;
}) {
  const { t } = useTranslation();
  return (
    <SectionCard>
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: rowDirection(), justifyContent: 'space-between', gap: 8 }}>
          <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{memberName}</Text>
          <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText() }}>{event.event_date}</Text>
        </View>
        <Text style={{ color: tokens.portalUnion, ...directionalText('900') }}>{t(event.title_key)}</Text>
        <Text style={{ color: tokens.mutedForeground, fontSize: 12, lineHeight: 18, ...directionalText() }}>
          {t(event.description_key)}
        </Text>
        {event.notes ? (
          <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText() }}>{event.notes}</Text>
        ) : null}
      </View>
    </SectionCard>
  );
}

function ModalFrame({
  open,
  title,
  subtitle,
  onClose,
  children,
  scrollViewRef,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  scrollViewRef?: React.RefObject<ScrollView | null>;
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
        <ScrollView ref={scrollViewRef} contentContainerStyle={{ padding: 16, gap: 12 }}>{children}</ScrollView>
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
  return <Text style={{ color: tokens.statusError, fontSize: 12, ...directionalText() }}>{stepErrorLabel(t, error)}</Text>;
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
  keyboardType?: 'default' | 'numeric' | 'email-address';
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

function ToggleField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      style={{
        borderRadius: 12,
        borderWidth: 1,
        borderColor: value ? tokens.portalUnion : tokens.border,
        backgroundColor: value ? tokens.secondary : tokens.card,
        padding: 12,
        flexDirection: rowDirection(),
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Text style={{ color: tokens.foreground, ...directionalText('800') }}>{label}</Text>
      {value ? <CheckCircle2 size={18} color={tokens.portalUnion} /> : <CircleOff size={18} color={tokens.mutedForeground} />}
    </Pressable>
  );
}

function OptionSelector<T extends string>({
  label,
  value,
  options,
  onChange,
  error,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
  error?: string;
}) {
  return (
    <View style={{ gap: 6 }}>
      <FieldLabel label={label} />
      <View style={{ flexDirection: rowDirection(), flexWrap: 'wrap', gap: 8 }}>
        {options.map((option) => (
          <Pressable key={option.value} onPress={() => onChange(option.value)}>
            <StatusChip tone={option.value === value ? 'info' : 'neutral'} label={option.label} />
          </Pressable>
        ))}
      </View>
      <FieldError error={error} />
    </View>
  );
}

function buildFormValues(member: UnionMemberDetail | null): UnionMemberFormValues {
  return {
    name: member?.name ?? '',
    father_name: member?.father_name ?? '',
    cnic: member?.cnic ?? '',
    date_of_birth: member?.date_of_birth ?? '1990-01-01',
    gender: member?.gender ?? 'male',
    phone: member?.phone ?? '',
    email: member?.email ?? '',
    permanent_address: member?.permanent_address ?? '',
    current_address: member?.current_address ?? '',
    district: member?.district ?? '',
    province: member?.province ?? 'Punjab',
    establishment_name: member?.establishment_name ?? '',
    employer_name: member?.employer_name ?? '',
    department: member?.department ?? '',
    job_title: member?.job_title ?? '',
    trade: member?.trade ?? '',
    employment_date: member?.employment_date ?? member?.join_date ?? '2026-01-01',
    employment_type: member?.employment_type ?? 'permanent',
    monthly_salary: member?.monthly_salary ?? 0,
    joined_union_on: member?.joined_union_on ?? '2026-01-01',
    monthly_subscription: member?.monthly_subscription ?? 200,
    membership_status: member?.membership_status ?? 'pending',
    status_reason: member?.status_reason ?? 'Awaiting registry review.',
    dues_status: member?.dues_status ?? 'pending',
    eobi_number: member?.eobi_number ?? '',
    social_security_number: member?.social_security_number ?? '',
    wwf_eligible: member?.wwf_eligible ?? true,
    pf_status: member?.pf_status ?? 'pending',
    gratuity_status: member?.gratuity_status ?? 'pending',
    digital_id_generated: member?.digital_id_generated ?? false,
    nadra_status: member?.verification.nadra_status ?? 'pending',
    eobi_status: member?.verification.eobi_status ?? 'pending',
    photo_attached: member?.documents.photo_attached ?? false,
    signature_attached: member?.documents.signature_attached ?? false,
    thumb_attached: member?.documents.thumb_attached ?? false,
    cnic_copy_attached: member?.documents.cnic_copy_attached ?? false,
    subscription_consent_attached: member?.documents.subscription_consent_attached ?? false,
    supporting_notes: member?.documents.supporting_notes ?? '',
    lifecycle_event_type: member?.membership_status === 'deceased' ? 'deceased' : 'joined',
    lifecycle_event_date: member?.joined_union_on ?? '2026-01-01',
    lifecycle_notes: member?.status_reason ?? 'Member record updated.',
    beneficiary_name: member?.deceased_record?.beneficiary_name ?? '',
    beneficiary_cnic: member?.deceased_record?.beneficiary_cnic ?? '',
    beneficiary_relation: member?.deceased_record?.beneficiary_relation ?? '',
    beneficiary_phone: member?.deceased_record?.beneficiary_phone ?? '',
    death_grant_status: member?.deceased_record?.death_grant_status ?? 'pending',
    death_grant_amount: member?.deceased_record?.death_grant_amount ?? 0,
  };
}

function toDetail(values: UnionMemberFormValues, existing: UnionMemberDetail | null): UnionMemberDetail {
  const id = existing?.id ?? `member-${Date.now()}`;
  return {
    ...(existing ?? {
      id,
      member_id: `PUWF-MOB-${String(Date.now()).slice(-6)}`,
      masked_cnic: values.cnic,
      social_security_status: 'pending',
      union_name: 'Green Clean Labour Union LWMC',
      company_name: values.employer_name,
      join_date: values.employment_date,
      annual_return_ready: false,
      readiness_score: 0,
      data_risk: 'medium',
      nadra_verified: false,
      digital_id_generated: false,
      election_ready: false,
      eobi_verified: false,
    }),
    id,
    cnic: values.cnic,
    name: values.name,
    phone: values.phone,
    father_name: values.father_name,
    job_title: values.job_title,
    department: values.department,
    company_name: values.employer_name,
    join_date: values.employment_date,
    employment_type: values.employment_type,
    union_name: existing?.union_name ?? 'Green Clean Labour Union LWMC',
    membership_status: values.membership_status,
    eobi_number: values.eobi_number,
    eobi_verified: values.eobi_status === 'verified',
    social_security_status: values.social_security_number ? 'verified' : 'pending',
    member_id: existing?.member_id ?? `PUWF-MOB-${String(Date.now()).slice(-6)}`,
    masked_cnic: values.cnic,
    form_c_status: existing?.form_c_status ?? 'draft',
    dues_status: values.dues_status,
    election_ready: existing?.election_ready ?? false,
    annual_return_ready: existing?.annual_return_ready ?? false,
    readiness_score: existing?.readiness_score ?? 0,
    data_risk: existing?.data_risk ?? 'medium',
    nadra_verified: values.nadra_status === 'verified',
    digital_id_generated: values.digital_id_generated,
    district: values.district,
    province: values.province,
    monthly_subscription: values.monthly_subscription,
    joined_union_on: values.joined_union_on,
    full_name_urdu: existing?.full_name_urdu ?? '',
    date_of_birth: values.date_of_birth,
    gender: values.gender,
    email: values.email,
    permanent_address: values.permanent_address,
    current_address: values.current_address,
    establishment_name: values.establishment_name,
    employer_name: values.employer_name,
    trade: values.trade,
    employment_date: values.employment_date,
    monthly_salary: values.monthly_salary,
    social_security_number: values.social_security_number,
    wwf_eligible: values.wwf_eligible,
    pf_status: values.pf_status,
    gratuity_status: values.gratuity_status,
    education_level: existing?.education_level ?? '',
    status_reason: values.status_reason,
    digital_id_qr_data: values.digital_id_generated ? existing?.digital_id_qr_data ?? `${id}|${values.cnic}` : '',
    verification: {
      nadra_status: values.nadra_status,
      eobi_status: values.eobi_status,
      cnic_unique: true,
      election_roll_status: existing?.verification.election_roll_status ?? 'blocked',
      annual_return_status: existing?.verification.annual_return_status ?? 'blocked',
      verification_note: existing?.verification.verification_note ?? '',
    },
    documents: {
      photo_attached: values.photo_attached,
      signature_attached: values.signature_attached,
      thumb_attached: values.thumb_attached,
      cnic_copy_attached: values.cnic_copy_attached,
      subscription_consent_attached: values.subscription_consent_attached,
      supporting_notes: values.supporting_notes,
    },
    benefit_records: existing?.benefit_records ?? [],
    lifecycle_events: existing?.lifecycle_events ?? [],
    deceased_record:
      values.membership_status === 'deceased'
        ? {
            date_of_death: values.lifecycle_event_date,
            beneficiary_name: values.beneficiary_name ?? '',
            beneficiary_cnic: values.beneficiary_cnic ?? '',
            beneficiary_relation: values.beneficiary_relation ?? '',
            beneficiary_phone: values.beneficiary_phone ?? '',
            death_grant_status: values.death_grant_status,
            death_grant_amount: values.death_grant_amount,
          }
        : undefined,
  };
}

const stepConfig = [
  { key: 'identity', schema: unionMemberIdentitySchema },
  { key: 'employment', schema: unionMemberEmploymentSchema },
  { key: 'membership', schema: unionMemberMembershipSchema },
  { key: 'benefits', schema: unionMemberBenefitsSchema },
  { key: 'documents', schema: unionMemberDocumentsSchema },
  { key: 'lifecycle', schema: unionMemberLifecycleSchema },
] as const;

export function MemberFormModal({
  open,
  member,
  existingMembers,
  onClose,
  onSubmit,
}: {
  open: boolean;
  member: UnionMemberDetail | null;
  existingMembers: UnionMemberRecord[];
  onClose: () => void;
  onSubmit: (detail: UnionMemberDetail) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const form = useForm<UnionMemberFormValues>({ defaultValues: buildFormValues(member) });
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    form.reset(buildFormValues(member));
    setStep(0);
  }, [form, member, open]);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  }, [step]);

  const values = form.watch();
  const currentSchema = stepConfig[step].schema;
  const isLastStep = step === stepConfig.length - 1;

  function resetState() {
    setStep(0);
    form.reset(buildFormValues(member));
  }

  function validateCurrentStep() {
    const result = currentSchema.safeParse(values);
    if (result.success) {
      form.clearErrors();
      return true;
    }

    result.error.issues.forEach((issue) => {
      const path = issue.path[0];
      if (typeof path === 'string') {
        form.setError(path as keyof UnionMemberFormValues, { type: 'validate', message: issue.message });
      }
    });
    return false;
  }

  async function handleNext() {
    if (!isLastStep) {
      setStep((current) => current + 1);
      return;
    }

    // const finalResult = unionMemberFormSchema.safeParse(values);
    // if (!finalResult.success) {
    //   Alert.alert(t('states.error'), t('unionCore.members.validation.fixAll'));
    //   return;
    // }

    const duplicate = existingMembers.find(
      (item) => item.cnic.replace(/\D/g, '') === values.cnic.replace(/\D/g, '') && item.id !== member?.id,
    );
    if (duplicate) {
      Alert.alert(t('states.error'), t('unionCore.members.validation.duplicateCnic'));
      return;
    }

    await onSubmit(toDetail(values, member));
    resetState();
    onClose();
  }

  function handleClose() {
    resetState();
    onClose();
  }

  const errorFor = (field: keyof UnionMemberFormValues) => form.formState.errors[field]?.message;

  return (
    <ModalFrame
      open={open}
      onClose={handleClose}
      title={member ? t('unionCore.members.form.editTitle') : t('unionCore.members.form.addTitle')}
      subtitle={t(`unionCore.members.form.steps.${stepConfig[step].key}`)}
      scrollViewRef={scrollViewRef}
    >
      <View style={{ flexDirection: rowDirection(), gap: 6, flexWrap: 'wrap' }}>
        {stepConfig.map((item, index) => (
          <StatusChip
            key={item.key}
            tone={index === step ? 'info' : index < step ? 'success' : 'neutral'}
            label={t(`unionCore.members.form.steps.${item.key}`)}
          />
        ))}
      </View>

      {stepConfig[step].key === 'identity' ? (
        <SectionCard>
          <View style={{ gap: 10 }}>
            <TextField label={t('unionCore.members.fields.name')} value={values.name} onChangeText={(value) => form.setValue('name', value)} error={errorFor('name')} />
            <TextField label={t('unionCore.members.fields.fatherName')} value={values.father_name} onChangeText={(value) => form.setValue('father_name', value)} error={errorFor('father_name')} />
            <TextField label={t('unionCore.members.fields.cnic')} value={values.cnic} onChangeText={(value) => form.setValue('cnic', value)} error={errorFor('cnic')} keyboardType="numeric" />
            <TextField label={t('unionCore.members.fields.dob')} value={values.date_of_birth} onChangeText={(value) => form.setValue('date_of_birth', value)} error={errorFor('date_of_birth')} />
            <OptionSelector label={t('unionCore.members.fields.gender')} value={values.gender} onChange={(value) => form.setValue('gender', value)} error={errorFor('gender')} options={[
              { value: 'male', label: t('unionCore.members.options.male') },
              { value: 'female', label: t('unionCore.members.options.female') },
              { value: 'other', label: t('unionCore.members.options.other') },
            ]} />
            <TextField label={t('unionCore.members.fields.phone')} value={values.phone} onChangeText={(value) => form.setValue('phone', value)} error={errorFor('phone')} keyboardType="numeric" />
            <TextField label={t('unionCore.members.fields.email')} value={values.email} onChangeText={(value) => form.setValue('email', value)} error={errorFor('email')} keyboardType="email-address" />
            <TextField label={t('unionCore.members.fields.address')} value={values.permanent_address} onChangeText={(value) => form.setValue('permanent_address', value)} error={errorFor('permanent_address')} multiline />
            <TextField label={t('unionCore.members.fields.currentAddress')} value={values.current_address} onChangeText={(value) => form.setValue('current_address', value)} error={errorFor('current_address')} multiline />
            <TextField label={t('unionCore.members.fields.district')} value={values.district} onChangeText={(value) => form.setValue('district', value)} error={errorFor('district')} />
            <TextField label={t('unionCore.members.fields.province')} value={values.province} onChangeText={(value) => form.setValue('province', value)} error={errorFor('province')} />
          </View>
        </SectionCard>
      ) : null}

      {stepConfig[step].key === 'employment' ? (
        <SectionCard>
          <View style={{ gap: 10 }}>
            <TextField label={t('unionCore.members.fields.establishment')} value={values.establishment_name} onChangeText={(value) => form.setValue('establishment_name', value)} error={errorFor('establishment_name')} />
            <TextField label={t('unionCore.members.fields.employer')} value={values.employer_name} onChangeText={(value) => form.setValue('employer_name', value)} error={errorFor('employer_name')} />
            <TextField label={t('unionCore.members.fields.department')} value={values.department} onChangeText={(value) => form.setValue('department', value)} error={errorFor('department')} />
            <TextField label={t('unionCore.members.fields.designation')} value={values.job_title} onChangeText={(value) => form.setValue('job_title', value)} error={errorFor('job_title')} />
            <TextField label={t('unionCore.members.fields.trade')} value={values.trade} onChangeText={(value) => form.setValue('trade', value)} error={errorFor('trade')} />
            <TextField label={t('unionCore.members.fields.employmentDate')} value={values.employment_date} onChangeText={(value) => form.setValue('employment_date', value)} error={errorFor('employment_date')} />
            <OptionSelector label={t('unionCore.members.fields.employmentType')} value={values.employment_type} onChange={(value) => form.setValue('employment_type', value)} error={errorFor('employment_type')} options={[
              { value: 'permanent', label: t('unionCore.members.options.permanent') },
              { value: 'temporary', label: t('unionCore.members.options.temporary') },
              { value: 'contract', label: t('unionCore.members.options.contract') },
              { value: 'daily_wage', label: t('unionCore.members.options.dailyWage') },
            ]} />
            <TextField label={t('unionCore.members.fields.salary')} value={String(values.monthly_salary)} onChangeText={(value) => form.setValue('monthly_salary', Number(value || 0))} error={errorFor('monthly_salary')} keyboardType="numeric" />
          </View>
        </SectionCard>
      ) : null}

      {stepConfig[step].key === 'membership' ? (
        <SectionCard>
          <View style={{ gap: 10 }}>
            <TextField label={t('unionCore.members.fields.joinedUnion')} value={values.joined_union_on} onChangeText={(value) => form.setValue('joined_union_on', value)} error={errorFor('joined_union_on')} />
            <TextField label={t('unionCore.members.fields.subscription')} value={String(values.monthly_subscription)} onChangeText={(value) => form.setValue('monthly_subscription', Number(value || 0))} error={errorFor('monthly_subscription')} keyboardType="numeric" />
            <OptionSelector label={t('unionCore.members.fields.membershipStatus')} value={values.membership_status} onChange={(value) => form.setValue('membership_status', value)} error={errorFor('membership_status')} options={([
              'pending', 'active', 'suspended', 'resigned', 'transferred', 'terminated', 'retired', 'deceased',
            ] as const).map((value) => ({ value, label: t(`status.membership.${value}`) }))} />
            <OptionSelector label={t('unionCore.members.fields.duesStatus')} value={values.dues_status} onChange={(value) => form.setValue('dues_status', value)} error={errorFor('dues_status')} options={([
              'paid', 'pending', 'overdue', 'waived',
            ] as const).map((value) => ({ value, label: t(`status.dues.${value}`) }))} />
            <TextField label={t('unionCore.members.fields.statusReason')} value={values.status_reason} onChangeText={(value) => form.setValue('status_reason', value)} error={errorFor('status_reason')} multiline />
          </View>
        </SectionCard>
      ) : null}

      {stepConfig[step].key === 'benefits' ? (
        <SectionCard>
          <View style={{ gap: 10 }}>
            <TextField label={t('unionCore.members.fields.eobi')} value={values.eobi_number} onChangeText={(value) => form.setValue('eobi_number', value)} error={errorFor('eobi_number')} />
            <TextField label={t('unionCore.members.fields.socialSecurity')} value={values.social_security_number} onChangeText={(value) => form.setValue('social_security_number', value)} error={errorFor('social_security_number')} />
            <TextField label={t('unionCore.members.fields.pfStatus')} value={values.pf_status} onChangeText={(value) => form.setValue('pf_status', value)} error={errorFor('pf_status')} />
            <TextField label={t('unionCore.members.fields.gratuityStatus')} value={values.gratuity_status} onChangeText={(value) => form.setValue('gratuity_status', value)} error={errorFor('gratuity_status')} />
            <ToggleField label={t('unionCore.members.fields.wwfEligible')} value={values.wwf_eligible} onChange={(value) => form.setValue('wwf_eligible', value)} />
            <ToggleField label={t('unionCore.members.fields.digitalId')} value={values.digital_id_generated} onChange={(value) => form.setValue('digital_id_generated', value)} />
            <OptionSelector label={t('unionCore.members.fields.nadraStatus')} value={values.nadra_status} onChange={(value) => form.setValue('nadra_status', value)} error={errorFor('nadra_status')} options={[
              { value: 'verified', label: t('unionCore.members.verification.verified') },
              { value: 'pending', label: t('unionCore.members.verification.pending') },
              { value: 'failed', label: t('unionCore.members.verification.failed') },
            ]} />
            <OptionSelector label={t('unionCore.members.fields.eobiStatus')} value={values.eobi_status} onChange={(value) => form.setValue('eobi_status', value)} error={errorFor('eobi_status')} options={[
              { value: 'verified', label: t('unionCore.members.verification.verified') },
              { value: 'pending', label: t('unionCore.members.verification.pending') },
              { value: 'failed', label: t('unionCore.members.verification.failed') },
            ]} />
          </View>
        </SectionCard>
      ) : null}

      {stepConfig[step].key === 'documents' ? (
        <SectionCard>
          <View style={{ gap: 10 }}>
            <ToggleField label={t('unionCore.members.fields.photoAttached')} value={values.photo_attached} onChange={(value) => form.setValue('photo_attached', value)} />
            <ToggleField label={t('unionCore.members.fields.signatureAttached')} value={values.signature_attached} onChange={(value) => form.setValue('signature_attached', value)} />
            <ToggleField label={t('unionCore.members.fields.thumbAttached')} value={values.thumb_attached} onChange={(value) => form.setValue('thumb_attached', value)} />
            <ToggleField label={t('unionCore.members.fields.cnicCopyAttached')} value={values.cnic_copy_attached} onChange={(value) => form.setValue('cnic_copy_attached', value)} />
            <ToggleField label={t('unionCore.members.fields.subscriptionConsent')} value={values.subscription_consent_attached} onChange={(value) => form.setValue('subscription_consent_attached', value)} />
            <TextField label={t('unionCore.members.fields.supportingNotes')} value={values.supporting_notes} onChangeText={(value) => form.setValue('supporting_notes', value)} error={errorFor('supporting_notes')} multiline />
          </View>
        </SectionCard>
      ) : null}

      {stepConfig[step].key === 'lifecycle' ? (
        <SectionCard>
          <View style={{ gap: 10 }}>
            <OptionSelector label={t('unionCore.members.fields.lifecycleType')} value={values.lifecycle_event_type} onChange={(value) => form.setValue('lifecycle_event_type', value)} error={errorFor('lifecycle_event_type')} options={([
              'joined', 'promoted', 'transferred', 'salary_change', 'converted', 'reinstated', 'terminated', 'retired', 'deceased',
            ] as const).map((value) => ({ value, label: t(`unionCore.members.lifecycle.types.${value}`) }))} />
            <TextField label={t('unionCore.members.fields.lifecycleDate')} value={values.lifecycle_event_date} onChangeText={(value) => form.setValue('lifecycle_event_date', value)} error={errorFor('lifecycle_event_date')} />
            <TextField label={t('unionCore.members.fields.lifecycleNotes')} value={values.lifecycle_notes} onChangeText={(value) => form.setValue('lifecycle_notes', value)} error={errorFor('lifecycle_notes')} multiline />
            {values.lifecycle_event_type === 'deceased' ? (
              <View style={{ gap: 10 }}>
                <TextField label={t('unionCore.members.fields.beneficiaryName')} value={values.beneficiary_name ?? ''} onChangeText={(value) => form.setValue('beneficiary_name', value)} error={errorFor('beneficiary_name')} />
                <TextField label={t('unionCore.members.fields.beneficiaryCnic')} value={values.beneficiary_cnic ?? ''} onChangeText={(value) => form.setValue('beneficiary_cnic', value)} error={errorFor('beneficiary_cnic')} />
                <TextField label={t('unionCore.members.fields.beneficiaryRelation')} value={values.beneficiary_relation ?? ''} onChangeText={(value) => form.setValue('beneficiary_relation', value)} error={errorFor('beneficiary_relation')} />
                <TextField label={t('unionCore.members.fields.beneficiaryPhone')} value={values.beneficiary_phone ?? ''} onChangeText={(value) => form.setValue('beneficiary_phone', value)} error={errorFor('beneficiary_phone')} />
              </View>
            ) : null}
          </View>
        </SectionCard>
      ) : null}

      <View style={{ flexDirection: rowDirection(), justifyContent: 'space-between', gap: 10 }}>
        <Pressable
          onPress={() => (step === 0 ? handleClose() : setStep((current) => current - 1))}
          style={{ flex: 1, minHeight: 46, borderRadius: 12, borderWidth: 1, borderColor: tokens.border, alignItems: 'center', justifyContent: 'center', backgroundColor: tokens.card }}
        >
          <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{t('common.back')}</Text>
        </Pressable>
        <Pressable
          onPress={handleNext}
          style={{ flex: 1, minHeight: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: tokens.primary }}
        >
          <Text style={{ color: tokens.primaryForeground, ...directionalText('900') }}>{isLastStep ? t('common.finish') : t('common.next')}</Text>
        </Pressable>
      </View>
    </ModalFrame>
  );
}

export function MemberDetailModal({
  open,
  member,
  onClose,
  onEdit,
}: {
  open: boolean;
  member: UnionMemberDetail | null;
  onClose: () => void;
  onEdit: () => void;
}) {
  const { t } = useTranslation();
  const verifyMutation = useUpdateMemberVerificationMutation();

  if (!member) return null;
  const currentMember = member;

  async function toggleVerification() {
    const next = currentMember.verification.nadra_status === 'verified' ? 'pending' : 'verified';
    await verifyMutation.mutateAsync({
      memberId: currentMember.id,
      verification: { nadra_status: next, eobi_status: next === 'verified' ? 'verified' : currentMember.verification.eobi_status },
    });
  }

  return (
    <ModalFrame open={open} onClose={onClose} title={currentMember.name} subtitle={t('unionCore.members.detailSubtitle')}>
      <SectionCard>
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: rowDirection(), justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <Text style={{ color: tokens.foreground, fontSize: 17, ...directionalText('900') }}>{currentMember.member_id}</Text>
            <StatusChip tone={toneForRisk(currentMember.data_risk)} label={t(`unionCore.members.risk.${currentMember.data_risk}`)} />
          </View>
          <View style={{ flexDirection: rowDirection(), gap: 6, flexWrap: 'wrap' }}>
            <StatusChip tone={currentMember.membership_status === 'active' ? 'success' : currentMember.membership_status === 'deceased' ? 'error' : 'warning'} label={t(`status.membership.${currentMember.membership_status}`)} />
            <StatusChip tone="neutral" label={currentMember.masked_cnic} />
            <StatusChip tone={currentMember.election_ready ? 'success' : 'warning'} label={currentMember.election_ready ? t('unionCore.members.electionReady') : t('unionCore.members.electionBlocked')} />
          </View>
          <Text style={{ color: tokens.mutedForeground, fontSize: 12, lineHeight: 18, ...directionalText() }}>
            {t('unionCore.members.readinessMeta', { score: currentMember.readiness_score, dues: t(`status.dues.${currentMember.dues_status}`) })}
          </Text>
        </View>
      </SectionCard>

      <SectionCard title={t('unionCore.members.sections.identity')}>
        <View style={{ gap: 6 }}>
          <Text style={{ color: tokens.mutedForeground, ...directionalText() }}>{currentMember.name}</Text>
          <Text style={{ color: tokens.mutedForeground, ...directionalText() }}>{currentMember.father_name}</Text>
          <Text style={{ color: tokens.mutedForeground, ...directionalText() }}>{currentMember.phone}</Text>
          <Text style={{ color: tokens.mutedForeground, ...directionalText() }}>{currentMember.permanent_address}</Text>
        </View>
      </SectionCard>

      <SectionCard title={t('unionCore.members.sections.employment')}>
        <View style={{ gap: 6 }}>
          <Text style={{ color: tokens.mutedForeground, ...directionalText() }}>{currentMember.job_title}</Text>
          <Text style={{ color: tokens.mutedForeground, ...directionalText() }}>{currentMember.department}</Text>
          <Text style={{ color: tokens.mutedForeground, ...directionalText() }}>{currentMember.establishment_name}</Text>
          <Text style={{ color: tokens.mutedForeground, ...directionalText() }}>{currentMember.employment_date}</Text>
        </View>
      </SectionCard>

      <SectionCard title={t('unionCore.members.sections.compliance')}>
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: rowDirection(), gap: 6, flexWrap: 'wrap' }}>
            <StatusChip tone={toneForVerification(currentMember.verification.nadra_status)} label={`${t('unionCore.members.fields.nadraStatus')}: ${t(`unionCore.members.verification.${currentMember.verification.nadra_status}`)}`} />
            <StatusChip tone={toneForVerification(currentMember.verification.eobi_status)} label={`${t('unionCore.members.fields.eobiStatus')}: ${t(`unionCore.members.verification.${currentMember.verification.eobi_status}`)}`} />
          </View>
          <Text style={{ color: tokens.mutedForeground, fontSize: 12, lineHeight: 18, ...directionalText() }}>
            {currentMember.verification.verification_note}
          </Text>
          {currentMember.deceased_record ? (
            <View style={{ gap: 4 }}>
              <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{t('unionCore.members.sections.beneficiary')}</Text>
              <Text style={{ color: tokens.mutedForeground, ...directionalText() }}>
                {currentMember.deceased_record.beneficiary_name} · {currentMember.deceased_record.beneficiary_relation}
              </Text>
            </View>
          ) : null}
        </View>
      </SectionCard>

      <SectionCard title={t('unionCore.members.sections.timeline')}>
        <View style={{ gap: 8 }}>
          {currentMember.lifecycle_events.map((event) => (
            <View key={event.id} style={{ flexDirection: rowDirection(), gap: 8 }}>
              <CircleDot size={16} color={tokens.portalUnion} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{t(event.title_key)}</Text>
                <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText() }}>{event.event_date}</Text>
                {event.notes ? <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText() }}>{event.notes}</Text> : null}
              </View>
            </View>
          ))}
        </View>
      </SectionCard>

      <SectionCard title={t('unionCore.members.sections.actions')}>
        <View style={{ gap: 8 }}>
          <Pressable onPress={onEdit} style={{ minHeight: 44, borderRadius: 12, backgroundColor: tokens.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: tokens.primaryForeground, ...directionalText('900') }}>{t('unionCore.members.actions.edit')}</Text>
          </Pressable>
          <Pressable onPress={toggleVerification} style={{ minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.card, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{t('unionCore.members.actions.toggleVerification')}</Text>
          </Pressable>
          <View style={{ flexDirection: rowDirection(), gap: 8 }}>
            <Pressable onPress={() => router.push('/(union-admin)/finance')} style={{ flex: 1, minHeight: 42, borderRadius: 12, backgroundColor: tokens.secondary, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: tokens.portalUnion, ...directionalText('900') }}>{t('unionCore.members.actions.openDues')}</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/(union-admin)/documents-compliance')} style={{ flex: 1, minHeight: 42, borderRadius: 12, backgroundColor: tokens.secondary, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: tokens.portalUnion, ...directionalText('900') }}>{t('unionCore.members.actions.openDocuments')}</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/(union-admin)/elections')} style={{ flex: 1, minHeight: 42, borderRadius: 12, backgroundColor: tokens.secondary, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: tokens.portalUnion, ...directionalText('900') }}>{t('unionCore.members.actions.openElection')}</Text>
            </Pressable>
          </View>
        </View>
      </SectionCard>
    </ModalFrame>
  );
}

export function MemberImportModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const previewMutation = usePreviewMemberImportMutation();
  const commitMutation = useCommitMemberImportMutation();
  const [preview, setPreview] = useState<MemberImportPreview | null>(null);

  async function handlePickFile() {
    const result = await DocumentPicker.getDocumentAsync({ multiple: false });
    if (result.canceled) return;
    const asset = result.assets[0];
    const nextPreview = await previewMutation.mutateAsync({ fileName: asset.name });
    setPreview(nextPreview);
  }

  async function handleCommit() {
    if (!preview) return;
    await commitMutation.mutateAsync(preview.id);
    Alert.alert(t('common.finish'), t('unionCore.members.import.completed'));
    setPreview(null);
    onClose();
  }

  return (
    <ModalFrame open={open} onClose={onClose} title={t('unionCore.members.import.title')} subtitle={t('unionCore.members.import.subtitle')}>
      <SectionCard>
        <View style={{ gap: 10 }}>
          <Pressable onPress={handlePickFile} style={{ minHeight: 48, borderRadius: 12, backgroundColor: tokens.primary, alignItems: 'center', justifyContent: 'center', flexDirection: rowDirection(), gap: 8 }}>
            <FolderUp size={18} color={tokens.primaryForeground} />
            <Text style={{ color: tokens.primaryForeground, ...directionalText('900') }}>{t('unionCore.members.import.pickFile')}</Text>
          </Pressable>
          <Text style={{ color: tokens.mutedForeground, fontSize: 12, lineHeight: 18, ...directionalText() }}>
            {t('unionCore.members.import.flow')}
          </Text>
        </View>
      </SectionCard>

      {preview ? (
        <>
          <SectionCard title={preview.file_name}>
            <View style={{ flexDirection: rowDirection(), gap: 8, flexWrap: 'wrap' }}>
              <StatusChip tone="success" label={t('unionCore.members.import.ready', { count: preview.ready_rows })} />
              <StatusChip tone="warning" label={t('unionCore.members.import.duplicates', { count: preview.duplicate_rows })} />
              <StatusChip tone="error" label={t('unionCore.members.import.errors', { count: preview.error_rows })} />
            </View>
          </SectionCard>
          <SectionCard title={t('unionCore.members.import.previewRows')}>
            <View style={{ gap: 8 }}>
              {preview.rows.map((row) => (
                <View key={row.row_number} style={{ borderRadius: 12, borderWidth: 1, borderColor: tokens.border, padding: 10, gap: 4 }}>
                  <View style={{ flexDirection: rowDirection(), justifyContent: 'space-between', gap: 8 }}>
                    <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{row.worker_name}</Text>
                    <StatusChip tone={row.status === 'ready' ? 'success' : row.status === 'duplicate' ? 'warning' : 'error'} label={t(`unionCore.members.import.rowStatus.${row.status}`)} />
                  </View>
                  <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText() }}>{row.cnic}</Text>
                </View>
              ))}
            </View>
          </SectionCard>
          <SectionCard title={t('unionCore.members.import.issueTitle')}>
            <View style={{ gap: 8 }}>
              {preview.issues.map((issue, index) => (
                <Text key={`${issue.row_number}-${index}`} style={{ color: issue.severity === 'error' ? tokens.statusError : tokens.statusWarning, fontSize: 12, lineHeight: 18, ...directionalText() }}>
                  {t('unionCore.members.import.issueRow', { row: issue.row_number })} {t(issue.message_key)}
                </Text>
              ))}
            </View>
          </SectionCard>
          <Pressable onPress={handleCommit} style={{ minHeight: 48, borderRadius: 12, backgroundColor: tokens.portalUnion, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: tokens.primaryForeground, ...directionalText('900') }}>{t('unionCore.members.import.confirm')}</Text>
          </Pressable>
        </>
      ) : null}
    </ModalFrame>
  );
}

export function MemberLifecycleModal({
  open,
  memberOptions,
  onClose,
}: {
  open: boolean;
  memberOptions: UnionMemberRecord[];
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const lifecycleMutation = useAddMemberLifecycleEventMutation();
  const [memberId, setMemberId] = useState(memberOptions[0]?.id ?? '');
  const [eventType, setEventType] = useState<MemberLifecycleEvent['event_type']>('promoted');
  const [eventDate, setEventDate] = useState('2026-05-09');
  const [notes, setNotes] = useState('');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [beneficiaryCnic, setBeneficiaryCnic] = useState('');
  const [beneficiaryRelation, setBeneficiaryRelation] = useState('');
  const [beneficiaryPhone, setBeneficiaryPhone] = useState('');

  async function handleSave() {
    if (!memberId || !notes) {
      Alert.alert(t('states.error'), t('unionCore.members.validation.lifecycleNotes'));
      return;
    }

    if (eventType === 'deceased' && (!beneficiaryName || !beneficiaryCnic || !beneficiaryRelation || !beneficiaryPhone)) {
      Alert.alert(t('states.error'), t('unionCore.members.validation.beneficiaryNeeded'));
      return;
    }

    await lifecycleMutation.mutateAsync({
      memberId,
      event: {
        event_type: eventType,
        event_date: eventDate,
        notes,
        beneficiary_name: beneficiaryName,
        beneficiary_cnic: beneficiaryCnic.replace(/\D/g, ''),
        beneficiary_relation: beneficiaryRelation,
        beneficiary_phone: beneficiaryPhone,
      },
    });

    setNotes('');
    setBeneficiaryName('');
    setBeneficiaryCnic('');
    setBeneficiaryRelation('');
    setBeneficiaryPhone('');
    onClose();
  }

  return (
    <ModalFrame open={open} onClose={onClose} title={t('unionCore.members.lifecycle.recordTitle')} subtitle={t('unionCore.members.lifecycle.recordBody')}>
      <SectionCard>
        <View style={{ gap: 10 }}>
          <OptionSelector
            label={t('unionCore.members.fields.member')}
            value={memberId}
            onChange={setMemberId}
            options={memberOptions.slice(0, 6).map((member) => ({ value: member.id, label: member.name }))}
          />
          <OptionSelector
            label={t('unionCore.members.fields.lifecycleType')}
            value={eventType}
            onChange={(value) => setEventType(value)}
            options={(['promoted', 'transferred', 'salary_change', 'reinstated', 'terminated', 'retired', 'deceased'] as const).map((item) => ({ value: item, label: t(`unionCore.members.lifecycle.types.${item}`) }))}
          />
          <TextField label={t('unionCore.members.fields.lifecycleDate')} value={eventDate} onChangeText={setEventDate} />
          <TextField label={t('unionCore.members.fields.lifecycleNotes')} value={notes} onChangeText={setNotes} multiline />
          {eventType === 'deceased' ? (
            <View style={{ gap: 10 }}>
              <TextField label={t('unionCore.members.fields.beneficiaryName')} value={beneficiaryName} onChangeText={setBeneficiaryName} />
              <TextField label={t('unionCore.members.fields.beneficiaryCnic')} value={beneficiaryCnic} onChangeText={setBeneficiaryCnic} keyboardType="numeric" />
              <TextField label={t('unionCore.members.fields.beneficiaryRelation')} value={beneficiaryRelation} onChangeText={setBeneficiaryRelation} />
              <TextField label={t('unionCore.members.fields.beneficiaryPhone')} value={beneficiaryPhone} onChangeText={setBeneficiaryPhone} keyboardType="numeric" />
            </View>
          ) : null}
          <Pressable onPress={handleSave} style={{ minHeight: 46, borderRadius: 12, backgroundColor: tokens.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: tokens.primaryForeground, ...directionalText('900') }}>{t('unionCore.members.lifecycle.recordCta')}</Text>
          </Pressable>
        </View>
      </SectionCard>
    </ModalFrame>
  );
}

export function IntakeActionCard({
  icon,
  title,
  body,
  onPress,
}: {
  icon: 'add' | 'import' | 'review';
  title: string;
  body: string;
  onPress: () => void;
}) {
  const Icon = icon === 'add' ? UserPlus : icon === 'import' ? FileSpreadsheet : ShieldCheck;
  return (
    <Pressable onPress={onPress} style={{ backgroundColor: tokens.card, borderWidth: 1, borderColor: unionAdminTheme.border, borderRadius: 20, padding: 14, gap: 8 }}>
      <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: unionAdminTheme.softNavy, alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={20} color={unionAdminTheme.navy} />
      </View>
      <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{title}</Text>
      <Text style={{ color: tokens.mutedForeground, fontSize: 12, lineHeight: 18, ...directionalText() }}>{body}</Text>
    </Pressable>
  );
}

export function StickyAddButton({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  return (
    <View style={{ position: 'absolute', bottom: 18, right: isRtlLanguage() ? undefined : 18, left: isRtlLanguage() ? 18 : undefined }}>
      <Pressable onPress={onPress} style={{ minHeight: 54, borderRadius: 999, backgroundColor: unionAdminTheme.navy, paddingHorizontal: 18, flexDirection: rowDirection(), alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: unionAdminTheme.shadow, shadowOpacity: 0.18, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } }}>
        <Plus size={18} color="#ffffff" />
        <Text style={{ color: '#ffffff', ...directionalText('900') }}>{t('unionCore.members.form.addTitle')}</Text>
      </Pressable>
    </View>
  );
}
