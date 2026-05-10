import type { ComponentType } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, QrCode, ShieldCheck } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { router, type Href } from 'expo-router';
import { StatusChip } from '@/components/status-chip';
import { alignSelfStart, directionalText, isRtlLanguage, rowDirection } from '@/theme/layout';
import { tokens } from '@/theme/tokens';
import type { DuesPayment, ElectionCandidate, GrievanceCase, GrievanceTimelineEvent, RightTopic, WorkerDashboardSummary } from '@/types/domain';

type IconType = ComponentType<{ size?: number; color?: string }>;

export function WorkerIdentityStrip({ summary }: { summary: WorkerDashboardSummary }) {
  const { t } = useTranslation();
  return (
    <View style={{ backgroundColor: tokens.card, borderWidth: 1, borderColor: tokens.border, borderRadius: 16, padding: 14, gap: 10 }}>
      <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 12 }}>
        <Image source={require('../../../assets/images/puwf_logo.png')} resizeMode="contain" style={{ width: 44, height: 44 }} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: tokens.foreground, fontSize: 19, ...directionalText('900') }}>{summary.worker_identity.name}</Text>
          <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText('700') }}>{summary.worker_identity.designation} - {summary.worker_identity.employer}</Text>
        </View>
        <StatusChip tone={summary.worker_identity.membership_status === 'active' ? 'success' : 'warning'} label={t(`status.membership.${summary.worker_identity.membership_status}`)} />
      </View>
      <View style={{ flexDirection: rowDirection(), gap: 8, flexWrap: 'wrap' }}>
        <StatusChip tone="neutral" label={`${t('workerPortal.identity.cnic')} ${summary.worker_identity.masked_cnic}`} />
        <StatusChip tone="info" label={`${t('workerPortal.identity.id')} ${summary.worker_identity.worker_id}`} />
      </View>
    </View>
  );
}

export function PriorityStatusStrip({ summary }: { summary: WorkerDashboardSummary }) {
  const { t } = useTranslation();
  return (
    <View style={{ flexDirection: rowDirection(), gap: 8 }}>
      <MiniStatus label={t('workerPortal.dashboard.duesNow')} value={t(`status.dues.${summary.dues_summary.current_status}`)} tone="warning" />
      <MiniStatus label={t('workerPortal.dashboard.caseNow')} value={summary.grievance_summary.latest_reference ?? t('common.none')} tone="error" />
      <MiniStatus label={t('workerPortal.dashboard.voteNow')} value={t(`status.election.${summary.voting_summary.status}`)} tone="info" />
    </View>
  );
}

function MiniStatus({ label, value, tone }: { label: string; value: string; tone: 'warning' | 'error' | 'info' }) {
  const color = tone === 'error' ? tokens.statusError : tone === 'warning' ? tokens.statusWarning : tokens.statusInfo;
  return (
    <View style={{ flex: 1, borderWidth: 1, borderColor: tokens.border, borderRadius: 12, padding: 10, backgroundColor: tokens.card, gap: 4 }}>
      <Text style={{ color: tokens.mutedForeground, fontSize: 10, ...directionalText('900') }}>{label}</Text>
      <Text style={{ color, fontSize: 13, ...directionalText('900') }}>{value}</Text>
    </View>
  );
}

export function QuickActionCard({ icon: Icon, title, subtitle, href }: { icon: IconType; title: string; subtitle: string; href: Href }) {
  const DirectionIcon = isRtlLanguage() ? ArrowLeft : ArrowRight;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={() => router.push(href)} style={{ flex: 1, minHeight: 92, backgroundColor: tokens.card, borderWidth: 1, borderColor: tokens.border, borderRadius: 14, padding: 12, gap: 8 }}>
      <View style={{ flexDirection: rowDirection(), alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <Icon size={19} color={tokens.portalWorker} />
        <DirectionIcon size={17} color={tokens.mutedForeground} />
      </View>
      <Text style={{ color: tokens.foreground, fontSize: 13, ...directionalText('900') }}>{title}</Text>
      <Text style={{ color: tokens.mutedForeground, fontWeight: '700', fontSize: 11, lineHeight: 16, ...directionalText() }}>{subtitle}</Text>
    </Pressable>
  );
}

export function DigitalIdCard({ summary }: { summary: WorkerDashboardSummary }) {
  const { t } = useTranslation();
  return (
    <View style={{ backgroundColor: tokens.primary, borderRadius: 18, padding: 16, gap: 14 }}>
      <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 12 }}>
        <Image source={require('../../../assets/images/puwf_logo.png')} resizeMode="contain" style={{ width: 52, height: 52 }} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: tokens.primaryForeground, fontSize: 18, ...directionalText('900') }}>{t('workerPortal.digitalId.title')}</Text>
          <Text style={{ color: tokens.primaryForeground, opacity: 0.76, fontSize: 12, ...directionalText('700') }}>{summary.worker_identity.union_name}</Text>
        </View>
      </View>
      <View style={{ gap: 2 }}>
        <Text style={{ color: tokens.primaryForeground, fontSize: 23, ...directionalText('900') }}>{summary.worker_identity.name}</Text>
        <Text style={{ color: tokens.primaryForeground, opacity: 0.82, ...directionalText() }}>{summary.worker_identity.designation}</Text>
      </View>
      <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 12 }}>
        <View style={{ backgroundColor: tokens.card, borderRadius: 12, padding: 12 }}>
          <QrCode size={74} color={tokens.primary} />
        </View>
        <View style={{ flex: 1, gap: 5 }}>
          <IdLine label="CNIC" value={summary.worker_identity.masked_cnic} />
          <IdLine label={t('workerPortal.identity.id')} value={summary.worker_identity.worker_id} />
          <IdLine label={t('workerPortal.digitalId.issued')} value={summary.digital_id.issued_on} />
        </View>
      </View>
      <StatusChip tone="success" label={t('workerPortal.digitalId.offlineReady')} />
    </View>
  );
}

function IdLine({ label, value }: { label: string; value: string }) {
  return <Text style={{ color: tokens.primaryForeground, fontSize: 12, ...directionalText('800') }}>{label}: <Text style={{ writingDirection: 'ltr' }}>{value}</Text></Text>;
}

export function DuesReceiptCard({ due }: { due: DuesPayment }) {
  const { t } = useTranslation();
  return (
    <View style={{ borderWidth: 1, borderColor: tokens.border, borderRadius: 14, padding: 12, gap: 8, backgroundColor: tokens.card }}>
      <View style={{ flexDirection: rowDirection(), alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: tokens.foreground, fontSize: 15, ...directionalText('900') }}>{t(due.period_key)}</Text>
          <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText('700') }}>{t('workerPortal.dues.amount', { amount: due.amount })}</Text>
        </View>
        <StatusChip tone={due.status === 'paid' ? 'success' : due.status === 'overdue' ? 'error' : 'warning'} label={t(`status.dues.${due.status}`)} />
      </View>
      <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText('700') }}>{due.receipt_no ? `${t('workerPortal.dues.receipt')} ${due.receipt_no}` : t('workerPortal.dues.noReceipt')}</Text>
    </View>
  );
}

export function Timeline({ events }: { events: GrievanceTimelineEvent[] }) {
  const { t } = useTranslation();
  return (
    <View style={{ gap: 10 }}>
      {events.map((event) => (
        <View key={event.id} style={{ flexDirection: rowDirection(), gap: 10 }}>
          <View style={{ alignItems: 'center', width: 24 }}>
            <CheckCircle2 size={18} color={tokens.statusSuccess} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{t(event.title_key)}</Text>
            <Text style={{ color: tokens.mutedForeground, fontSize: 12, lineHeight: 18, ...directionalText() }}>{t(event.description_key)} - <Text style={{ writingDirection: 'ltr' }}>{event.date}</Text></Text>
          </View>
        </View>
      ))}
    </View>
  );
}

export function GrievanceCaseCard({ grievance }: { grievance: GrievanceCase }) {
  const { t } = useTranslation();
  return (
    <View style={{ backgroundColor: tokens.card, borderWidth: 1, borderColor: tokens.border, borderRadius: 14, padding: 12, gap: 8 }}>
      <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 8 }}>
        <Clock3 size={18} color={tokens.statusWarning} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{grievance.reference_no}</Text>
          <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText() }}>{t(`grievance.categories.${grievance.category}`)} - {grievance.establishment_name}</Text>
        </View>
        <StatusChip tone={grievance.status === 'resolved' ? 'success' : grievance.status === 'escalated' ? 'error' : 'warning'} label={t(`status.grievance.${grievance.status}`)} />
      </View>
      <Text style={{ color: tokens.mutedForeground, fontSize: 12, lineHeight: 18, ...directionalText() }}>{t('workerPortal.grievance.sla', { date: grievance.sla_deadline })}</Text>
    </View>
  );
}

export function CandidateCard({ candidate, selected, onPress }: { candidate: ElectionCandidate; selected: boolean; onPress: () => void }) {
  const { t } = useTranslation();
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ selected }} accessibilityLabel={candidate.name} onPress={onPress} style={{ borderWidth: 1, borderColor: selected ? tokens.portalWorker : tokens.border, backgroundColor: selected ? tokens.statusInfoBg : tokens.card, borderRadius: 14, padding: 12, gap: 5 }}>
      <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 8 }}>
        <ShieldCheck size={18} color={selected ? tokens.portalWorker : tokens.mutedForeground} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{candidate.name}</Text>
          <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText() }}>{candidate.position}</Text>
        </View>
      </View>
      <Text style={{ color: tokens.mutedForeground, fontSize: 12, lineHeight: 18, ...directionalText() }}>{t(candidate.manifesto_key)}</Text>
    </Pressable>
  );
}

export function RightsTopicCard({ topic, onPress }: { topic: RightTopic; onPress: () => void }) {
  const { t } = useTranslation();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={t(topic.title_key)} onPress={onPress} style={{ backgroundColor: tokens.card, borderWidth: 1, borderColor: tokens.border, borderRadius: 14, padding: 12, gap: 8 }}>
      <StatusChip tone="info" label={t(`workerPortal.rights.categories.${topic.category}`)} />
      <Text style={{ color: tokens.foreground, fontSize: 16, ...directionalText('900') }}>{t(topic.title_key)}</Text>
      <Text style={{ color: tokens.mutedForeground, lineHeight: 20, ...directionalText() }}>{t(topic.description_key)}</Text>
      <Text style={{ color: tokens.portalWorker, alignSelf: alignSelfStart(), ...directionalText('900') }}>{t(topic.action_key)}</Text>
    </Pressable>
  );
}
