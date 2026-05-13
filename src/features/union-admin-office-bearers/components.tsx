import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { z } from 'zod';
import { AlertTriangle, ArrowLeft, ArrowRight, CalendarClock, CheckCircle2, Landmark, Plus, RefreshCcw, ShieldAlert, UserCog, Users, X } from 'lucide-react-native';
import { AnimatedSection } from '@/components/animated-section';
import { MetricCard } from '@/components/metric-card';
import { SectionCard } from '@/components/section-card';
import { StatusChip } from '@/components/status-chip';
import { officeBearerPositionOptions, useUpdateOfficeBearerStatusMutation } from '@/services/union-admin-service';
import { directionalText, isRtlLanguage, rowDirection, textAlign, writingDirection } from '@/theme/layout';
import { tokens } from '@/theme/tokens';
import { unionAdminTheme } from '@/theme/union-admin';
import type { OfficeBearerHistoryEvent, UnionOfficeBearerRecord, UnionOfficeBearerWorkspaceSummary } from '@/types/domain';
import { officeBearerFormSchema, type OfficeBearerFormValues } from './schema';

export type OfficeWorkspaceTab = 'registry' | 'review' | 'history';

export const officeWorkspaceTabs: OfficeWorkspaceTab[] = ['registry', 'review', 'history'];

function stepErrorLabel(t: (key: string) => string, issue?: string) {
  if (!issue) return '';
  return issue.startsWith('unionCore.') ? t(issue) : issue;
}

function formatDate(value?: string) {
  return value || '-';
}

function OfficeModalFrame({
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

function ToggleChip({
  selected,
  label,
  onPress,
  tone = 'neutral',
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

function buildFormValues(record: UnionOfficeBearerRecord | null): OfficeBearerFormValues {
  return {
    name: record?.name ?? '',
    cnic: record?.cnic ?? '',
    position: (record?.position as OfficeBearerFormValues['position']) ?? 'President',
    contact_number: record?.contact_number ?? '',
    email: record?.email ?? '',
    region: record?.region ?? 'Central Punjab',
    appointment_date: record?.appointment_date ?? new Date().toISOString().slice(0, 10),
    term_start_date: record?.term_start_date ?? new Date().toISOString().slice(0, 10),
    term_expiry_date: record?.term_expiry_date ?? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    gender: record?.gender ?? 'male',
    outsider: record?.outsider ?? false,
    notes: record?.notes ?? 'Governance posture reviewed.',
    status: record?.status ?? 'active',
  };
}

function toRecord(values: OfficeBearerFormValues, existing: UnionOfficeBearerRecord | null): UnionOfficeBearerRecord {
  const id = existing?.id ?? `ob-${Date.now()}`;
  const masked = `${values.cnic.replace(/\D/g, '').slice(0, 5)}-*****${values.cnic.replace(/\D/g, '').slice(10, 12)}-${values.cnic.replace(/\D/g, '').slice(12)}`;
  const designationKey =
    values.position === 'President'
      ? 'unionCore.designations.president'
      : values.position === 'General Secretary'
        ? 'unionCore.designations.generalSecretary'
        : values.position === 'Finance Secretary'
          ? 'unionCore.designations.financeSecretary'
          : values.position === 'Secretary Legal Affairs'
            ? 'unionCore.designations.legalSecretary'
            : values.position === 'Secretary Women'
              ? 'unionCore.designations.secretaryWomen'
              : 'unionCore.designations.officeBearer';

  return {
    id,
    name: values.name,
    cnic: values.cnic,
    position: values.position,
    contact_number: values.contact_number,
    email: values.email || undefined,
    region: values.region,
    appointment_date: values.appointment_date,
    term_start_date: values.term_start_date,
    term_expiry_date: values.term_expiry_date,
    outsider: values.outsider,
    status: values.status,
    gender: values.gender,
    notes: values.notes,
    masked_cnic: masked,
    designation_key: designationKey,
    evidence_status: existing?.evidence_status ?? 'current',
    women_representation_role: values.position.includes('(Women)') || values.position === 'Secretary Women' || values.gender === 'female',
    days_to_expiry: existing?.days_to_expiry ?? 0,
    history: existing?.history ?? [
      {
        id: `obh-${Date.now()}`,
        bearer_id: id,
        date: values.appointment_date,
        event_type: 'appointed',
        note: 'Office-bearer added through mobile governance registry.',
        actor: 'Union admin',
      },
    ],
  };
}

export function OfficeWorkspaceHero({ summary }: { summary: UnionOfficeBearerWorkspaceSummary }) {
  const { t } = useTranslation();
  return (
    <SectionCard variant="unionAdmin">
      <View style={{ gap: 12 }}>
        <View style={{ gap: 6 }}>
          <Text style={{ color: unionAdminTheme.text, fontSize: 20, ...directionalText('900') }}>
            {t('unionCore.office.workspaceTitle')}
          </Text>
          <Text style={{ color: unionAdminTheme.mutedText, fontSize: 13, lineHeight: 19, ...directionalText() }}>
            {t('unionCore.office.workspaceBody')}
          </Text>
        </View>
        <View style={{ flexDirection: rowDirection(), gap: 8, flexWrap: 'wrap' }}>
          <StatusChip tone="info" label={t('unionCore.office.total', { count: summary.data.length })} />
          <StatusChip tone={summary.outsider_percentage >= 25 ? 'error' : summary.outsider_percentage >= 20 ? 'warning' : 'success'} label={t('unionCore.office.outsiderPercent', { percent: summary.outsider_percentage })} />
          <StatusChip tone="warning" label={t('unionCore.office.expiringSoon', { count: summary.expiring_soon_count })} />
        </View>
      </View>
    </SectionCard>
  );
}

export function OfficeWorkspaceTabs({
  active,
  onChange,
}: {
  active: OfficeWorkspaceTab;
  onChange: (tab: OfficeWorkspaceTab) => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={{ flexDirection: rowDirection(), flexWrap: 'wrap', gap: 8 }}>
      {officeWorkspaceTabs.map((tab) => (
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
            {t(`unionCore.office.tabs.${tab}`)}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export function OfficeMetricGrid({ summary }: { summary: UnionOfficeBearerWorkspaceSummary }) {
  const { t } = useTranslation();
  const outsiderTone: 'success' | 'warning' | 'error' =
    summary.outsider_percentage >= 25 ? 'error' : summary.outsider_percentage >= 20 ? 'warning' : 'success';
  const metrics = [
    { icon: Users, label: t('unionCore.office.metrics.active'), value: String(summary.data.filter((item) => item.status === 'active' || item.status === 'reinstated').length), tone: 'info' as const },
    { icon: UserCog, label: t('unionCore.office.metrics.women'), value: String(summary.women_count), tone: 'success' as const },
    { icon: CalendarClock, label: t('unionCore.office.metrics.expiring'), value: String(summary.expiring_soon_count), tone: 'warning' as const },
    { icon: ShieldAlert, label: t('unionCore.office.metrics.outsider'), value: `${summary.outsider_percentage}%`, tone: outsiderTone },
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

export function OfficeRegistryControls({
  query,
  setQuery,
}: {
  query: string;
  setQuery: (value: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <SectionCard variant="unionAdmin">
      <View style={{ gap: 8 }}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('unionCore.office.searchPlaceholder')}
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
      </View>
    </SectionCard>
  );
}

function actionToneForStatus(status: UnionOfficeBearerRecord['status']) {
  return status === 'active' || status === 'reinstated' ? 'success' : 'warning';
}

export function OfficeBearerRegistryCard({
  bearer,
  onOpen,
  onEdit,
  onHistory,
  onResign,
  onReplace,
  onReinstate,
}: {
  bearer: UnionOfficeBearerRecord;
  onOpen: () => void;
  onEdit: () => void;
  onHistory: () => void;
  onResign: () => void;
  onReplace: () => void;
  onReinstate: () => void;
}) {
  const { t } = useTranslation();
  const DirectionIcon = isRtlLanguage() ? ArrowLeft : ArrowRight;

  return (
    <Pressable
      onPress={onOpen}
      style={{
        backgroundColor: tokens.card,
        borderWidth: 1,
        borderColor: tokens.border,
        borderRadius: 16,
        padding: 14,
        gap: 10,
      }}
    >
      <View style={{ flexDirection: rowDirection(), justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
        <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 10, flex: 1 }}>
          <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: tokens.statusInfoBg, alignItems: 'center', justifyContent: 'center' }}>
            <Landmark size={21} color={tokens.portalUnion} />
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={{ color: tokens.foreground, fontSize: 16, ...directionalText('900') }}>{bearer.name}</Text>
            <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText('700') }}>
              {bearer.position}
            </Text>
          </View>
        </View>
        <DirectionIcon size={18} color={tokens.mutedForeground} />
      </View>

      <View style={{ flexDirection: rowDirection(), gap: 6, flexWrap: 'wrap' }}>
        <StatusChip tone={actionToneForStatus(bearer.status)} label={t(`unionCore.office.status.${bearer.status}`)} />
        <StatusChip tone="neutral" label={bearer.masked_cnic} />
        {bearer.outsider ? <StatusChip tone="error" label={t('union.outsider')} /> : null}
        {bearer.women_representation_role ? <StatusChip tone="success" label={t('unionCore.office.womenSeat')} /> : null}
      </View>

      <Text style={{ color: tokens.mutedForeground, fontSize: 12, lineHeight: 18, ...directionalText() }}>
        {t('unionCore.office.meta', {
          term: formatDate(bearer.term_expiry_date),
          contact: bearer.contact_number,
        })}
      </Text>

      <View style={{ flexDirection: rowDirection(), gap: 10, flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <ActionText label={t('unionCore.office.actions.view')} onPress={onOpen} primary />
        <ActionText label={t('unionCore.office.actions.edit')} onPress={onEdit} />
        <ActionText label={t('unionCore.office.actions.history')} onPress={onHistory} />
        {bearer.status === 'active' || bearer.status === 'reinstated' ? (
          <>
            <ActionText label={t('unionCore.office.actions.resign')} onPress={onResign} />
            <ActionText label={t('unionCore.office.actions.replace')} onPress={onReplace} />
          </>
        ) : (
          <ActionText label={t('unionCore.office.actions.reinstate')} onPress={onReinstate} />
        )}
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

export function OfficeReviewCard({
  title,
  body,
  tone,
  countLabel,
}: {
  title: string;
  body: string;
  tone: 'warning' | 'error' | 'info' | 'success';
  countLabel: string;
}) {
  return (
    <SectionCard variant="unionAdmin">
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: rowDirection(), justifyContent: 'space-between', gap: 8 }}>
          <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{title}</Text>
          <StatusChip tone={tone} label={countLabel} />
        </View>
        <Text style={{ color: tokens.mutedForeground, fontSize: 12, lineHeight: 18, ...directionalText() }}>{body}</Text>
      </View>
    </SectionCard>
  );
}

export function OfficeHistoryEventCard({ event, name }: { event: OfficeBearerHistoryEvent; name: string }) {
  const { t } = useTranslation();
  return (
    <SectionCard>
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: rowDirection(), justifyContent: 'space-between', gap: 8 }}>
          <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{name}</Text>
          <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText() }}>{event.date}</Text>
        </View>
        <Text style={{ color: tokens.portalUnion, ...directionalText('900') }}>{t(`unionCore.office.history.${event.event_type}`)}</Text>
        <Text style={{ color: tokens.mutedForeground, fontSize: 12, lineHeight: 18, ...directionalText() }}>{event.note}</Text>
        <Text style={{ color: tokens.mutedForeground, fontSize: 11, ...directionalText() }}>{event.actor}</Text>
      </View>
    </SectionCard>
  );
}

export function OfficeBearerDetailModal({
  open,
  bearer,
  onClose,
  onEdit,
  onOpenHistory,
}: {
  open: boolean;
  bearer: UnionOfficeBearerRecord | null;
  onClose: () => void;
  onEdit: () => void;
  onOpenHistory: () => void;
}) {
  const { t } = useTranslation();
  if (!bearer) return null;

  return (
    <OfficeModalFrame open={open} title={bearer.name} subtitle={t('unionCore.office.detailSubtitle')} onClose={onClose}>
      <SectionCard>
        <View style={{ gap: 8 }}>
          <Text style={{ color: tokens.foreground, fontSize: 17, ...directionalText('900') }}>{bearer.position}</Text>
          <View style={{ flexDirection: rowDirection(), gap: 6, flexWrap: 'wrap' }}>
            <StatusChip tone={actionToneForStatus(bearer.status)} label={t(`unionCore.office.status.${bearer.status}`)} />
            <StatusChip tone="neutral" label={bearer.masked_cnic} />
            {bearer.outsider ? <StatusChip tone="error" label={t('union.outsider')} /> : null}
          </View>
          <Text style={{ color: tokens.mutedForeground, fontSize: 12, lineHeight: 18, ...directionalText() }}>{bearer.notes}</Text>
        </View>
      </SectionCard>

      <SectionCard title={t('unionCore.office.sections.identity')}>
        <View style={{ gap: 6 }}>
          <Text style={{ color: tokens.mutedForeground, ...directionalText() }}>{bearer.name}</Text>
          <Text style={{ color: tokens.mutedForeground, ...directionalText() }}>{bearer.contact_number}</Text>
          <Text style={{ color: tokens.mutedForeground, ...directionalText() }}>{bearer.email || '-'}</Text>
          <Text style={{ color: tokens.mutedForeground, ...directionalText() }}>{bearer.region || '-'}</Text>
        </View>
      </SectionCard>

      <SectionCard title={t('unionCore.office.sections.term')}>
        <View style={{ gap: 6 }}>
          <Text style={{ color: tokens.mutedForeground, ...directionalText() }}>{t('unionCore.office.term', { start: bearer.term_start_date, expiry: bearer.term_expiry_date })}</Text>
          <Text style={{ color: tokens.mutedForeground, ...directionalText() }}>{t('unionCore.office.daysLeft', { count: bearer.days_to_expiry })}</Text>
        </View>
      </SectionCard>

      <SectionCard title={t('unionCore.office.sections.actions')}>
        <View style={{ gap: 8 }}>
          <Pressable onPress={onEdit} style={{ minHeight: 44, borderRadius: 12, backgroundColor: tokens.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: tokens.primaryForeground, ...directionalText('900') }}>{t('unionCore.office.actions.edit')}</Text>
          </Pressable>
          <Pressable onPress={onOpenHistory} style={{ minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.card, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{t('unionCore.office.actions.history')}</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/(union-admin)/more')} style={{ minHeight: 44, borderRadius: 12, backgroundColor: tokens.secondary, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: tokens.portalUnion, ...directionalText('900') }}>{t('unionCore.office.actions.openGovernance')}</Text>
          </Pressable>
        </View>
      </SectionCard>
    </OfficeModalFrame>
  );
}

export function OfficeBearerHistoryModal({
  open,
  bearer,
  onClose,
}: {
  open: boolean;
  bearer: UnionOfficeBearerRecord | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  if (!bearer) return null;

  return (
    <OfficeModalFrame open={open} title={t('unionCore.office.actions.history')} subtitle={bearer.name} onClose={onClose}>
      {bearer.history.map((event) => (
        <OfficeHistoryEventCard key={event.id} event={event} name={bearer.name} />
      ))}
    </OfficeModalFrame>
  );
}

export function OfficeBearerFormModal({
  open,
  bearer,
  summary,
  onClose,
  onSave,
}: {
  open: boolean;
  bearer: UnionOfficeBearerRecord | null;
  summary: UnionOfficeBearerWorkspaceSummary;
  onClose: () => void;
  onSave: (record: UnionOfficeBearerRecord) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [values, setValues] = useState<OfficeBearerFormValues>(buildFormValues(bearer));
  const [errors, setErrors] = useState<Partial<Record<keyof OfficeBearerFormValues, string>>>({});
  const [section, setSection] = useState<'identity' | 'position' | 'governance'>('identity');

  useEffect(() => {
    setValues(buildFormValues(bearer));
    setErrors({});
    setSection('identity');
  }, [bearer, open]);

  function setField<K extends keyof OfficeBearerFormValues>(key: K, value: OfficeBearerFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSave() {
    const parsed = officeBearerFormSchema.safeParse(values);
    if (!parsed.success) {
      const nextErrors: Partial<Record<keyof OfficeBearerFormValues, string>> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (typeof key === 'string') {
          nextErrors[key as keyof OfficeBearerFormValues] = issue.message;
        }
      });
      setErrors(nextErrors);
      return;
    }

    const activeRows = summary.data.filter((item) => item.id !== bearer?.id && (item.status === 'active' || item.status === 'reinstated'));
    const nextActiveCount = parsed.data.status === 'active' || parsed.data.status === 'reinstated' ? activeRows.length + 1 : activeRows.length;
    const nextOutsiderCount = activeRows.filter((item) => item.outsider).length + (parsed.data.outsider && (parsed.data.status === 'active' || parsed.data.status === 'reinstated') ? 1 : 0);
    const outsiderPercent = nextActiveCount ? Math.round((nextOutsiderCount / nextActiveCount) * 100) : 0;

    if (outsiderPercent > 25) {
      Alert.alert(t('states.error'), t('unionCore.office.validation.outsiderBlock'));
      return;
    }

    if (outsiderPercent >= 20) {
      Alert.alert(t('unionCore.office.guardrails.outsiderTitle'), t('unionCore.office.guardrails.outsiderBody'));
    }

    await onSave(toRecord(parsed.data, bearer));
    onClose();
  }

  return (
    <OfficeModalFrame open={open} title={bearer ? t('unionCore.office.form.editTitle') : t('unionCore.office.form.addTitle')} subtitle={t(`unionCore.office.form.sections.${section}`)} onClose={onClose}>
      <View style={{ flexDirection: rowDirection(), gap: 6, flexWrap: 'wrap' }}>
        {(['identity', 'position', 'governance'] as const).map((item) => (
          <ToggleChip key={item} selected={section === item} label={t(`unionCore.office.form.sections.${item}`)} onPress={() => setSection(item)} tone="info" />
        ))}
      </View>

      {section === 'identity' ? (
        <SectionCard>
          <View style={{ gap: 10 }}>
            <TextField label={t('unionCore.office.fields.name')} value={values.name} onChangeText={(value) => setField('name', value)} error={errors.name} />
            <TextField label={t('unionCore.office.fields.cnic')} value={values.cnic} onChangeText={(value) => setField('cnic', value)} error={errors.cnic} keyboardType="numeric" />
            <TextField label={t('unionCore.office.fields.contact')} value={values.contact_number} onChangeText={(value) => setField('contact_number', value)} error={errors.contact_number} keyboardType="numeric" />
            <TextField label={t('unionCore.office.fields.email')} value={values.email} onChangeText={(value) => setField('email', value)} error={errors.email} keyboardType="email-address" />
            <TextField label={t('unionCore.office.fields.region')} value={values.region} onChangeText={(value) => setField('region', value)} error={errors.region} />
          </View>
        </SectionCard>
      ) : null}

      {section === 'position' ? (
        <SectionCard>
          <View style={{ gap: 10 }}>
            <View style={{ gap: 6 }}>
              <FieldLabel label={t('unionCore.office.fields.position')} />
              <View style={{ flexDirection: rowDirection(), gap: 8, flexWrap: 'wrap' }}>
                {officeBearerPositionOptions.map((position) => (
                  <ToggleChip key={position} selected={values.position === position} label={position} onPress={() => setField('position', position)} tone="warning" />
                ))}
              </View>
              <FieldError error={errors.position} />
            </View>
            <TextField label={t('unionCore.office.fields.appointmentDate')} value={values.appointment_date} onChangeText={(value) => setField('appointment_date', value)} error={errors.appointment_date} />
            <TextField label={t('unionCore.office.fields.termStart')} value={values.term_start_date} onChangeText={(value) => setField('term_start_date', value)} error={errors.term_start_date} />
            <TextField label={t('unionCore.office.fields.termExpiry')} value={values.term_expiry_date} onChangeText={(value) => setField('term_expiry_date', value)} error={errors.term_expiry_date} />
            <View style={{ gap: 6 }}>
              <FieldLabel label={t('unionCore.office.fields.gender')} />
              <View style={{ flexDirection: rowDirection(), gap: 8, flexWrap: 'wrap' }}>
                {(['male', 'female', 'other'] as const).map((gender) => (
                  <ToggleChip key={gender} selected={values.gender === gender} label={t(`unionCore.office.gender.${gender}`)} onPress={() => setField('gender', gender)} tone="success" />
                ))}
              </View>
            </View>
          </View>
        </SectionCard>
      ) : null}

      {section === 'governance' ? (
        <SectionCard>
          <View style={{ gap: 10 }}>
            <View style={{ gap: 6 }}>
              <FieldLabel label={t('unionCore.office.fields.status')} />
              <View style={{ flexDirection: rowDirection(), gap: 8, flexWrap: 'wrap' }}>
                {(['active', 'reinstated', 'resigned', 'replaced'] as const).map((status) => (
                  <ToggleChip key={status} selected={values.status === status} label={t(`unionCore.office.status.${status}`)} onPress={() => setField('status', status)} tone="info" />
                ))}
              </View>
            </View>
            <View style={{ gap: 6 }}>
              <FieldLabel label={t('unionCore.office.fields.outsider')} />
              <View style={{ flexDirection: rowDirection(), gap: 8 }}>
                <ToggleChip selected={!values.outsider} label={t('unionCore.office.outsiderInternal')} onPress={() => setField('outsider', false)} tone="success" />
                <ToggleChip selected={values.outsider} label={t('unionCore.office.outsiderExternal')} onPress={() => setField('outsider', true)} tone="error" />
              </View>
            </View>
            <TextField label={t('unionCore.office.fields.notes')} value={values.notes} onChangeText={(value) => setField('notes', value)} error={errors.notes} multiline />
          </View>
        </SectionCard>
      ) : null}

      <View style={{ flexDirection: rowDirection(), justifyContent: 'space-between', gap: 10 }}>
        <Pressable onPress={onClose} style={{ flex: 1, minHeight: 46, borderRadius: 12, borderWidth: 1, borderColor: tokens.border, alignItems: 'center', justifyContent: 'center', backgroundColor: tokens.card }}>
          <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{t('common.back')}</Text>
        </Pressable>
        <Pressable onPress={handleSave} style={{ flex: 1, minHeight: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: tokens.primary }}>
          <Text style={{ color: tokens.primaryForeground, ...directionalText('900') }}>{t('common.finish')}</Text>
        </Pressable>
      </View>
    </OfficeModalFrame>
  );
}

export function StickyAddBearerButton({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  return (
    <View style={{ position: 'absolute', bottom: 18, right: isRtlLanguage() ? undefined : 18, left: isRtlLanguage() ? 18 : undefined }}>
      <Pressable onPress={onPress} style={{ minHeight: 54, borderRadius: 999, backgroundColor: unionAdminTheme.navy, paddingHorizontal: 18, flexDirection: rowDirection(), alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <Plus size={18} color="#ffffff" />
        <Text style={{ color: '#ffffff', ...directionalText('900') }}>{t('unionCore.office.form.addTitle')}</Text>
      </Pressable>
    </View>
  );
}

export function useOfficeBearerStatusActions() {
  const { t } = useTranslation();
  const mutation = useUpdateOfficeBearerStatusMutation();

  async function updateStatus(
    bearer: UnionOfficeBearerRecord,
    status: UnionOfficeBearerRecord['status'],
    eventType: OfficeBearerHistoryEvent['event_type'],
    note: string,
  ) {
    try {
      await mutation.mutateAsync({
        bearerId: bearer.id,
        status,
        eventType,
        note,
        actor: t('unionCore.office.actor.unionAdmin'),
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'OUTSIDER_LIMIT_EXCEEDED') {
        Alert.alert(t('states.error'), t('unionCore.office.validation.outsiderBlock'));
        return;
      }
      throw error;
    }
  }

  return { updateStatus, isPending: mutation.isPending };
}

export function getFilteredOfficeBearers(summary: UnionOfficeBearerWorkspaceSummary, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return summary.data;
  return summary.data.filter((item) =>
    [item.name, item.cnic, item.position, item.contact_number].some((value) => value.toLowerCase().includes(normalized)),
  );
}

export function getHistoryFeed(summary: UnionOfficeBearerWorkspaceSummary) {
  return summary.data
    .flatMap((bearer) => bearer.history.map((event) => ({ bearerName: bearer.name, event })))
    .sort((left, right) => right.event.date.localeCompare(left.event.date));
}

export function getReviewCards(summary: UnionOfficeBearerWorkspaceSummary, t: (key: string, options?: Record<string, string | number>) => string) {
  return [
    {
      title: t('unionCore.office.guardrails.outsiderTitle'),
      body: t('unionCore.office.guardrails.outsiderBody'),
      tone: summary.outsider_percentage >= 25 ? 'error' : summary.outsider_percentage >= 20 ? 'warning' : 'success',
      countLabel: `${summary.outsider_percentage}%`,
    },
    {
      title: t('unionCore.office.guardrails.womenTitle'),
      body: t('unionCore.office.guardrails.womenBody'),
      tone: summary.women_count > 0 ? 'success' : 'warning',
      countLabel: `${summary.women_count}`,
    },
    {
      title: t('unionCore.office.guardrails.expiryTitle'),
      body: t('unionCore.office.guardrails.expiryBody'),
      tone: summary.expiring_soon_count ? 'warning' : 'success',
      countLabel: `${summary.expiring_soon_count}`,
    },
    {
      title: t('unionCore.office.guardrails.vacancyTitle'),
      body: t('unionCore.office.guardrails.vacancyBody'),
      tone: summary.vacancies.length ? 'info' : 'success',
      countLabel: `${summary.vacancies.length}`,
    },
  ] as const;
}
