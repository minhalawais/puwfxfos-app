import type { ComponentType } from 'react';
import { Pressable, Text, View } from 'react-native';
import { BadgeCheck, Banknote, CalendarClock, CheckCircle2, FileText, Gavel, Landmark, ReceiptText, Scale, ShieldCheck, UserRoundCheck } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '@/components/section-card';
import { StatusChip } from '@/components/status-chip';
import { SourceNote } from '@/features/union-admin-core/components';
import { directionalText, rowDirection } from '@/theme/layout';
import { tokens } from '@/theme/tokens';
import type { AnnualReturnStep, CandidateNomination, CharterDemand, EmployerRemittance, LegalCase, LegalHearing, NegotiationEvent, UnionGrievanceCase } from '@/types/domain';

type IconType = ComponentType<{ size?: number; color?: string }>;

const complianceTone = {
  current: 'success',
  due_soon: 'warning',
  overdue: 'error',
  missing: 'error',
  draft: 'warning',
} as const;

const remittanceTone = {
  received: 'success',
  pending: 'warning',
  late: 'error',
  missing: 'error',
} as const;

const nominationTone = {
  draft: 'neutral',
  submitted: 'info',
  scrutiny: 'warning',
  accepted: 'success',
  rejected: 'error',
} as const;

const legalTone = {
  filed: 'info',
  hearing_scheduled: 'warning',
  adjourned: 'warning',
  order_issued: 'success',
  closed: 'success',
} as const;

export function ActionButton({ label, icon: Icon, onPress, disabled }: { label: string; icon: IconType; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!disabled }} accessibilityLabel={label} disabled={disabled} onPress={onPress} style={{ opacity: disabled ? 0.5 : 1, minHeight: 46, flexDirection: rowDirection(), alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: tokens.primary, borderRadius: 12, paddingHorizontal: 12 }}>
      <Icon size={17} color={tokens.primaryForeground} />
      <Text style={{ color: tokens.primaryForeground, ...directionalText('900') }}>{label}</Text>
    </Pressable>
  );
}

export function RemittanceCard({ remittance }: { remittance: EmployerRemittance }) {
  const { t } = useTranslation();
  return (
    <SectionCard>
      <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 10 }}>
        <ReceiptText size={19} color={tokens.portalUnion} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{remittance.deduction_period}</Text>
          <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText() }}>{t('unionOps.finance.remitMeta', { count: remittance.worker_count, amount: remittance.total_amount })}</Text>
        </View>
        <StatusChip tone={remittanceTone[remittance.status]} label={t(`unionOps.status.remittance.${remittance.status}`)} />
      </View>
      <SourceNote label={t('unionOps.finance.bankRef', { ref: remittance.bank_reference ?? t('common.pending') })} />
    </SectionCard>
  );
}

export function DuesLedgerCard({ item }: { item: { id: string; member_name: string; masked_cnic: string; member_id: string; period: string; amount: number; status: string; receipt_no?: string } }) {
  const { t } = useTranslation();
  return (
    <SectionCard>
      <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 10 }}>
        <Banknote size={19} color={tokens.portalUnion} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{item.member_name}</Text>
          <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText() }}>{item.member_id} - {item.masked_cnic}</Text>
        </View>
        <StatusChip tone={item.status === 'paid' ? 'success' : item.status === 'overdue' ? 'error' : 'warning'} label={t(`status.dues.${item.status}`)} />
      </View>
      <SourceNote label={t('unionOps.finance.ledgerMeta', { period: item.period, amount: item.amount, receipt: item.receipt_no ?? t('workerPortal.dues.noReceipt') })} />
    </SectionCard>
  );
}

export function AnnualReturnStepCard({ step }: { step: AnnualReturnStep }) {
  const { t } = useTranslation();
  return (
    <SectionCard>
      <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 10 }}>
        <FileText size={19} color={tokens.portalUnion} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{t(step.title_key)}</Text>
          <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText() }}>{t('unionOps.annual.completePct', { percent: step.completion_percent })}</Text>
        </View>
        <StatusChip tone={complianceTone[step.status]} label={t(`status.compliance.${step.status}`)} />
      </View>
      <SourceNote label={t(step.source_key)} />
    </SectionCard>
  );
}

export function ElectionTimelineCard({ label, date, tone }: { label: string; date: string; tone: 'info' | 'warning' | 'success' }) {
  return (
    <View style={{ flex: 1, minHeight: 78, borderWidth: 1, borderColor: tokens.border, borderRadius: 12, padding: 10, backgroundColor: tokens.card, gap: 6 }}>
      <CalendarClock size={17} color={tone === 'warning' ? tokens.statusWarning : tone === 'success' ? tokens.statusSuccess : tokens.statusInfo} />
      <Text style={{ color: tokens.mutedForeground, fontSize: 11, ...directionalText('800') }}>{label}</Text>
      <Text style={{ color: tokens.foreground, fontWeight: '900', writingDirection: 'ltr', textAlign: 'left' }}>{date}</Text>
    </View>
  );
}

export function NominationCard({ nomination }: { nomination: CandidateNomination }) {
  const { t } = useTranslation();
  return (
    <SectionCard>
      <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 10 }}>
        <BadgeCheck size={19} color={tokens.portalUnion} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{nomination.candidate_name}</Text>
          <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText() }}>{nomination.position} - {nomination.masked_cnic}</Text>
        </View>
        <StatusChip tone={nominationTone[nomination.status]} label={t(`unionOps.status.nomination.${nomination.status}`)} />
      </View>
      <SourceNote label={t('unionOps.elections.nominationMeta', { nominator: nomination.nominator_name, seconder: nomination.seconder_name })} />
      <Text style={{ color: tokens.mutedForeground, fontSize: 12, lineHeight: 18, ...directionalText() }}>{t(nomination.manifesto_key)}</Text>
    </SectionCard>
  );
}

export function DemandCard({ demand }: { demand: CharterDemand }) {
  const { t } = useTranslation();
  return (
    <SectionCard>
      <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 10 }}>
        <Scale size={19} color={tokens.portalUnion} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{t(demand.title_key)}</Text>
          <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText() }}>{t(`unionOps.cba.categories.${demand.category}`)}</Text>
        </View>
        <StatusChip tone="info" label={t(`unionOps.status.cod.${demand.stage}`)} />
      </View>
      <Text style={{ color: tokens.mutedForeground, fontSize: 12, lineHeight: 18, ...directionalText() }}>{t(demand.justification_key)}</Text>
    </SectionCard>
  );
}

export function NegotiationTimeline({ events }: { events: NegotiationEvent[] }) {
  const { t } = useTranslation();
  return (
    <View style={{ gap: 10 }}>
      {events.map((event) => (
        <View key={event.id} style={{ flexDirection: rowDirection(), gap: 10 }}>
          <CheckCircle2 size={18} color={event.status === 'current' ? tokens.statusSuccess : tokens.statusWarning} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{t(event.title_key)}</Text>
            <Text style={{ color: tokens.mutedForeground, fontSize: 12, lineHeight: 18, ...directionalText() }}>{t(event.description_key)} - <Text style={{ writingDirection: 'ltr' }}>{event.date}</Text></Text>
          </View>
        </View>
      ))}
    </View>
  );
}

export function GrievanceQueueCard({ grievance }: { grievance: UnionGrievanceCase }) {
  const { t } = useTranslation();
  return (
    <SectionCard>
      <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 10 }}>
        <Gavel size={19} color={grievance.priority === 'critical' ? tokens.statusError : tokens.portalUnion} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{grievance.reference_no}</Text>
          <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText() }}>{grievance.worker_name} - {grievance.masked_cnic}</Text>
        </View>
        <StatusChip tone={grievance.priority === 'critical' ? 'error' : 'warning'} label={t(`unionOps.status.priority.${grievance.priority}`)} />
      </View>
      <View style={{ flexDirection: rowDirection(), gap: 6, flexWrap: 'wrap' }}>
        <StatusChip tone="info" label={t(`grievance.categories.${grievance.category}`)} />
        <StatusChip tone={grievance.status === 'escalated' ? 'error' : 'warning'} label={t(`status.grievance.${grievance.status}`)} />
        <StatusChip tone="neutral" label={t('unionOps.legal.sla', { date: grievance.sla_deadline })} />
      </View>
      <SourceNote label={t('unionOps.legal.handler', { handler: grievance.assigned_handler })} />
    </SectionCard>
  );
}

export function LegalCaseCard({ legalCase }: { legalCase: LegalCase }) {
  const { t } = useTranslation();
  return (
    <SectionCard>
      <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 10 }}>
        <Landmark size={19} color={tokens.portalUnion} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{legalCase.case_no}</Text>
          <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText() }}>{legalCase.worker_name} - {legalCase.masked_cnic}</Text>
        </View>
        <StatusChip tone={legalTone[legalCase.status]} label={t(`unionOps.status.legal.${legalCase.status}`)} />
      </View>
      <SourceNote label={t('unionOps.legal.caseMeta', { forum: legalCase.forum, hearing: legalCase.next_hearing })} />
    </SectionCard>
  );
}

export function HearingCard({ hearing }: { hearing: LegalHearing }) {
  const { t } = useTranslation();
  return (
    <View style={{ borderWidth: 1, borderColor: tokens.border, borderRadius: 12, padding: 10, backgroundColor: tokens.card, gap: 6 }}>
      <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{hearing.forum}</Text>
      <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText() }}>{hearing.hearing_date} - {hearing.hearing_time}</Text>
      <Text style={{ color: tokens.mutedForeground, fontSize: 12, lineHeight: 18, ...directionalText() }}>{t(hearing.agenda_key)}</Text>
      {hearing.outcome_key ? <StatusChip tone="warning" label={t(hearing.outcome_key)} /> : null}
    </View>
  );
}

export function SummaryLine({ icon: Icon, label, value }: { icon: IconType; label: string; value: string }) {
  return (
    <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 8, paddingVertical: 6 }}>
      <Icon size={17} color={tokens.portalUnion} />
      <Text style={{ color: tokens.mutedForeground, flex: 1, ...directionalText('800') }}>{label}</Text>
      <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{value}</Text>
    </View>
  );
}

export const OperationIcons = { ShieldCheck };
