import { useState, useEffect, useRef, type ComponentType } from 'react';
import { Animated, Dimensions, Image, Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, QrCode, ShieldCheck, Landmark } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { router, type Href } from 'expo-router';
import { StatusChip } from '@/components/status-chip';
import { alignSelfStart, directionalText, isRtlLanguage, rowDirection } from '@/theme/layout';
import { tokens } from '@/theme/tokens';
import type { DuesPayment, ElectionCandidate, GrievanceCase, GrievanceTimelineEvent, RightTopic, WorkerDashboardSummary } from '@/types/domain';
import { unionOfficeBearerRecords } from '@/data/mobile-mock-data';

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

/* ── PUWF Official Brand Palette ── */
const ID_NAVY    = '#2E338C';
const ID_GREEN   = '#03A64A';
const ID_CRIMSON = '#A6121F';

export function DigitalIdCard({ summary }: { summary: WorkerDashboardSummary }) {
  const { t } = useTranslation();
  const isActive = summary.worker_identity.membership_status === 'active';
  const rtl = isRtlLanguage();

  return (
    <View
      style={{
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: ID_NAVY,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.24,
        shadowRadius: 24,
        elevation: 14,
      }}
    >
      {/* Crimson left-edge accent strip */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: 5,
          backgroundColor: ID_CRIMSON,
          zIndex: 10,
        }}
      />

      {/* ── Navy header band ── */}
      <View
        style={{
          backgroundColor: ID_NAVY,
          paddingTop: 16,
          paddingBottom: 14,
          paddingLeft: 20,
          paddingRight: 14,
          flexDirection: rowDirection(),
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Image
          source={require('../../../assets/images/puwf_logo.png')}
          resizeMode="contain"
          style={{ width: 44, height: 44 }}
        />
        <View style={{ flex: 1, gap: 2 }}>
          <Text
            style={{ color: '#ffffff', fontSize: 11, lineHeight: 14, fontWeight: '900', letterSpacing: 0.35, flexShrink: 1, writingDirection: 'ltr', textAlign: 'left' }}
            numberOfLines={2}
          >
            PAKISTAN UNITED WORKERS FEDERATION
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '600', ...directionalText('600') }}>
            {t('workerPortal.digitalId.title')}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: ID_GREEN,
            borderRadius: 6,
            paddingHorizontal: 7,
            paddingVertical: 4,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 3,
            alignSelf: 'flex-start',
          }}
        >
          <ShieldCheck size={10} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 8.5, fontWeight: '900', letterSpacing: 0.3 }}>VERIFIED</Text>
        </View>
      </View>

      {/* ── White card body ── */}
      <View style={{ backgroundColor: '#ffffff', paddingLeft: 20, paddingRight: 14, paddingTop: 16, paddingBottom: 14, gap: 14 }}>

        {/* Worker name + membership status pill */}
        <View style={{ flexDirection: rowDirection(), alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={{ color: ID_NAVY, fontSize: 21, fontWeight: '900', letterSpacing: 0.2, ...directionalText('900') }} numberOfLines={2}>
              {summary.worker_identity.name}
            </Text>
            <Text style={{ color: '#555', fontSize: 12, fontWeight: '700', ...directionalText('700') }}>
              {summary.worker_identity.designation}
            </Text>
            <Text style={{ color: '#999', fontSize: 11, fontWeight: '600', ...directionalText('600') }}>
              {summary.worker_identity.union_name}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: isActive ? '#e6f7ee' : '#fff4d8',
              borderRadius: 100,
              borderWidth: 1.5,
              borderColor: isActive ? ID_GREEN : '#c99014',
              paddingHorizontal: 10,
              paddingVertical: 5,
            }}
          >
            <Text style={{ color: isActive ? ID_GREEN : '#a76b00', fontSize: 10, fontWeight: '900', letterSpacing: 0.3 }}>
              {t(`status.membership.${summary.worker_identity.membership_status}`).toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: '#f0f0f0' }} />

        {/* QR + detail fields */}
        <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 14 }}>
          <View
            style={{
              backgroundColor: '#F2F2F2',
              borderRadius: 12,
              padding: 10,
              borderWidth: 1,
              borderColor: '#e4e4e4',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <QrCode size={70} color={ID_NAVY} />
            <Text style={{ color: '#bbb', fontSize: 8, fontWeight: '800', marginTop: 4, letterSpacing: 0.5, writingDirection: 'ltr', textAlign: 'center' }}>
              SCAN TO VERIFY
            </Text>
          </View>
          <View style={{ flex: 1, gap: 9, alignItems: rtl ? 'flex-end' : 'flex-start' }}>
            <IdFieldRow label="CNIC" value={summary.worker_identity.masked_cnic || '-'} />
            <IdFieldRow label={t('workerPortal.identity.id')} value={summary.worker_identity.worker_id || '-'} highlight />
            <IdFieldRow label={t('workerPortal.digitalId.issued')} value={summary.digital_id.issued_on || '-'} forceLtrValue />
          </View>
        </View>

        <View style={{ height: 1, backgroundColor: '#f0f0f0' }} />

        <View style={{ flexDirection: rowDirection(), flexWrap: 'wrap', columnGap: 12, rowGap: 10 }}>
          <View style={{ width: '47%' }}>
            <IdFieldRow label={t('unionCore.members.fields.fatherName')} value={summary.worker_identity.father_name || '-'} compact />
          </View>
          <View style={{ width: '47%' }}>
            <IdFieldRow label={t('unionCore.members.fields.phone')} value={summary.worker_identity.phone || '-'} compact forceLtrValue />
          </View>
          <View style={{ width: '47%' }}>
            <IdFieldRow label={t('unionCore.members.fields.department')} value={summary.worker_identity.department || '-'} compact />
          </View>
          <View style={{ width: '47%' }}>
            <IdFieldRow label={t('unionCore.members.fields.joinedUnion')} value={summary.worker_identity.join_date || '-'} compact forceLtrValue />
          </View>
        </View>
      </View>

      {/* ── Green footer band ── */}
      <View
        style={{
          backgroundColor: ID_GREEN,
          paddingVertical: 10,
          paddingHorizontal: 20,
          flexDirection: rowDirection(),
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 5 }}>
          <ShieldCheck size={13} color="rgba(255,255,255,0.9)" />
          <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: '800', letterSpacing: 0.3, ...directionalText('800') }}>
            {t('workerPortal.digitalId.offlineReady')}
          </Text>
        </View>
        <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10, fontWeight: '600', writingDirection: 'ltr', textAlign: 'left' }}>
          PUWF © {new Date().getFullYear()}
        </Text>
      </View>
    </View>
  );
}

function IdFieldRow({
  label,
  value,
  highlight,
  compact,
  forceLtr,
  forceLtrValue,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  compact?: boolean;
  forceLtr?: boolean;
  forceLtrValue?: boolean;
}) {
  const rtl = isRtlLanguage();
  const localizedLabel = rtl ? label : label.toUpperCase();

  return (
    <View style={{ gap: 1, width: '100%', alignItems: forceLtr ? 'flex-start' : rtl ? 'flex-end' : 'flex-start' }}>
      <Text
        style={{
          width: '100%',
          color: '#b0b0b0',
          fontSize: 9,
          fontWeight: '800',
          letterSpacing: rtl ? 0 : 0.6,
          ...directionalText('800'),
          textAlign: forceLtr ? 'left' : directionalText('800').textAlign,
          writingDirection: forceLtr ? 'ltr' : directionalText('800').writingDirection,
        }}
      >
        {localizedLabel}
      </Text>
      <Text
        style={{
          width: '100%',
          color: highlight ? ID_NAVY : '#2a2a2a',
          fontSize: compact ? 11 : highlight ? 14 : 12,
          fontWeight: highlight ? '900' : '700',
          writingDirection: forceLtr || forceLtrValue ? 'ltr' : directionalText('700').writingDirection,
          textAlign: forceLtr ? 'left' : forceLtrValue ? (rtl ? 'right' : 'left') : directionalText('700').textAlign,
          fontFamily: directionalText(compact ? '600' : '700').fontFamily,
        }}
        numberOfLines={compact ? 2 : 1}
      >
        {value}
      </Text>
    </View>
  );
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

export function GrievanceCaseCard({ grievance, onConfirmResolution, isConfirming }: { grievance: GrievanceCase; onConfirmResolution?: (id: string, satisfied: boolean) => void; isConfirming?: boolean }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const rtl = isRtlLanguage();

  return (
    <View style={{ backgroundColor: tokens.card, borderWidth: 1, borderColor: tokens.border, borderRadius: 14, overflow: 'hidden' }}>
      <Pressable onPress={() => setExpanded(!expanded)} style={{ padding: 12, gap: 8 }}>
        <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 8 }}>
          <Clock3 size={18} color={tokens.statusWarning} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{grievance.reference_no}</Text>
            <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText() }}>{t(`grievance.categories.${grievance.category}`)} - {grievance.establishment_name}</Text>
          </View>
          <StatusChip tone={grievance.status === 'resolved' ? 'success' : grievance.status === 'escalated' ? 'error' : 'warning'} label={t(`status.grievance.${grievance.status}`)} />
        </View>
        <Text style={{ color: tokens.mutedForeground, fontSize: 12, lineHeight: 18, ...directionalText() }}>{t('workerPortal.grievance.sla', { date: grievance.sla_deadline })}</Text>
      </Pressable>

      {expanded && (
        <View style={{ paddingHorizontal: 12, paddingBottom: 12, gap: 12, borderTopWidth: 1, borderTopColor: tokens.border, paddingTop: 12 }}>
          {grievance.legal_case_id && (
             <View style={{ backgroundColor: tokens.statusErrorBg, padding: 8, borderRadius: 8, flexDirection: rowDirection(), alignItems: 'center', gap: 6 }}>
               <Landmark size={14} color={tokens.statusError} />
               <Text style={{ color: tokens.statusError, fontSize: 12, fontWeight: '800' }}>Escalated to Legal Registry</Text>
             </View>
          )}

          <Timeline events={grievance.timeline} />

          {grievance.status === 'resolved' && onConfirmResolution && (
            <View style={{ backgroundColor: tokens.muted, borderRadius: 10, padding: 12, gap: 10, marginTop: 4 }}>
              <Text style={{ color: tokens.foreground, fontSize: 13, fontWeight: '800', textAlign: 'center' }}>Are you satisfied with this resolution?</Text>
              <View style={{ flexDirection: rowDirection(), gap: 8 }}>
                <Pressable
                  disabled={isConfirming}
                  onPress={() => onConfirmResolution(grievance.id, true)}
                  style={{ flex: 1, backgroundColor: tokens.statusSuccess, paddingVertical: 10, borderRadius: 8, alignItems: 'center', opacity: isConfirming ? 0.5 : 1 }}
                >
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: '900' }}>Yes, Close Case</Text>
                </Pressable>
                <Pressable
                  disabled={isConfirming}
                  onPress={() => onConfirmResolution(grievance.id, false)}
                  style={{ flex: 1, backgroundColor: tokens.card, borderWidth: 1, borderColor: tokens.border, paddingVertical: 10, borderRadius: 8, alignItems: 'center', opacity: isConfirming ? 0.5 : 1 }}
                >
                  <Text style={{ color: tokens.foreground, fontSize: 12, fontWeight: '800' }}>No, Request Review</Text>
                </Pressable>
              </View>
            </View>
          )}

          {grievance.status === 'review_requested' && (
             <View style={{ backgroundColor: tokens.statusWarningBg, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: tokens.statusWarning }}>
               <Text style={{ color: tokens.statusWarning, fontSize: 12, fontWeight: '800', textAlign: 'center' }}>Review Requested - Union Admin notified</Text>
             </View>
          )}
        </View>
      )}
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

/* ─────────────────────────────────────────────
   Leadership Ticker — auto-scrolling marquee
   Shows all PUWF regional committee members
───────────────────────────────────────────── */

const SCREEN_WIDTH = Dimensions.get('window').width;
const TICKER_SPEED = 55; // px per second — comfortable reading speed
const PUWF_CRIMSON = '#A6121F';
const PUWF_RED = '#F21D2F';
const PUWF_NAVY = '#2E338C';
const PUWF_GREEN = '#03A64A';
const PUWF_LIGHT = '#F2F2F2';
const CRIMSON_SOFT = 'rgba(166,18,31,0.18)';

export function LeadershipTicker({ unionName }: { unionName?: string }) {
  const { i18n, t } = useTranslation();
  const normalizedUnion = unionName?.trim().toLowerCase();
  const unionBearers = normalizedUnion
    ? unionOfficeBearerRecords.filter((bearer) => bearer.union_name?.toLowerCase() === normalizedUnion)
    : [];

  const groups = [
    {
      label: unionName ?? t('workerPortal.union.label', 'Union leadership'),
      members: unionBearers,
    },
    {
      label: unionName ?? t('workerPortal.union.label', 'Union leadership'),
      members: unionBearers,
    },
  ];

  // Measure total content width to set the animation distance
  const contentWidthRef = useRef(0);
  const animX = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  const startAnimation = (totalWidth: number) => {
    if (totalWidth === 0) return;
    animRef.current?.stop();
    animX.setValue(0);
    const duration = (totalWidth / 2 / TICKER_SPEED) * 1000;
    animRef.current = Animated.loop(
      Animated.timing(animX, {
        toValue: -(totalWidth / 2),
        duration,
        useNativeDriver: true,
      })
    );
    animRef.current.start();
  };

  useEffect(() => {
    if (!unionBearers.length) return undefined;
    if (contentWidthRef.current > 0) {
      startAnimation(contentWidthRef.current);
    }
    return () => {
      animRef.current?.stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language, unionName, unionBearers.length]);

  if (!unionBearers.length) return null;

  return (
    <View
      style={{
        height: 52,
        backgroundColor: PUWF_NAVY,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(242,242,242,0.18)',
      }}
    >
      {/* Scrolling ticker */}
      <Animated.View
        style={{ flexDirection: 'row', alignItems: 'center', transform: [{ translateX: animX }] }}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          if (w > 0 && w !== contentWidthRef.current) {
            contentWidthRef.current = w;
            startAnimation(w);
          }
        }}
      >
        {groups.map((group, gIdx) => (
          <View key={`${group.label}-${gIdx}`} style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* All committee members of this union */}
            {group.members.map((leader, mIdx) => (
              <View key={`${leader.name}-${mIdx}`} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ paddingHorizontal: 10, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor:
                        leader.gender === 'female'
                          ? 'rgba(242,242,242,0.18)'
                          : leader.gender === 'male'
                            ? 'rgba(242,242,242,0.18)'
                            : 'rgba(242,242,242,0.18)',
                      borderWidth: 1,
                      borderColor:
                        leader.gender === 'female'
                          ? 'rgba(242, 29, 47, 0.42)'
                          : leader.gender === 'male'
                            ? 'rgba(3, 166, 74, 0.42)'
                            : 'rgba(242,242,242,0.3)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      shadowColor: leader.gender === 'female' ? PUWF_RED : leader.gender === 'male' ? PUWF_GREEN : '#ffffff',
                      shadowOpacity: 0.18,
                      shadowRadius: 6,
                      shadowOffset: { width: 0, height: 2 },
                    }}
                  >
                    <View
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 13,
                        backgroundColor:
                          leader.gender === 'female'
                            ? 'rgba(242, 29, 47, 0.16)'
                            : leader.gender === 'male'
                              ? 'rgba(3, 166, 74, 0.16)'
                              : 'rgba(242,242,242,0.14)',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {leader.gender === 'female' ? (
                        <MaterialCommunityIcons name="account-tie-woman" size={20} color={PUWF_RED} />
                      ) : leader.gender === 'male' ? (
                        <MaterialCommunityIcons name="account-tie" size={20} color={PUWF_GREEN} />
                      ) : (
                        <MaterialCommunityIcons name="account-circle-outline" size={20} color="#ffffff" />
                      )}
                    </View>
                  </View>
                  <Text
                    style={{ color: 'rgba(242,242,242,0.78)', fontSize: 10, fontWeight: '700' }}
                    numberOfLines={1}
                  >
                    {leader.designation_key ? t(leader.designation_key) : leader.position}
                  </Text>
                  <Text
                    style={{ color: '#ffffff', fontSize: 12, fontWeight: '800' }}
                    numberOfLines={1}
                  >
                    {leader.name}
                  </Text>
                </View>
                {/* Dot separator between members (not after last) */}
                {mIdx < group.members.length - 1 && (
                  <Text style={{ color: PUWF_RED, fontSize: 14, paddingHorizontal: 2 }}>·</Text>
                )}
              </View>
            ))}

            {/* Gold diamond separator between regions */}
            <Text style={{ color: PUWF_GREEN, fontSize: 12, paddingHorizontal: 6 }}>◆</Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}
