import { useState, useEffect, useRef, type ComponentType } from 'react';
import { Animated, Dimensions, Image, Pressable, Text, View } from 'react-native';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, QrCode, ShieldCheck, Landmark } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { router, type Href } from 'expo-router';
import { StatusChip } from '@/components/status-chip';
import { alignSelfStart, directionalText, isRtlLanguage, rowDirection } from '@/theme/layout';
import { tokens } from '@/theme/tokens';
import type { DuesPayment, ElectionCandidate, GrievanceCase, GrievanceTimelineEvent, RightTopic, WorkerDashboardSummary } from '@/types/domain';
import { UNION_LEADERS } from '@/data/union-leadership';

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
const GOLD = '#c99014';
const GOLD_SOFT = 'rgba(201,144,20,0.18)';

export function LeadershipTicker() {
  const { i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';

  // Group leaders by region (preserving order from data file)
  type RegionGroup = { region: string; regionUrdu: string; members: typeof UNION_LEADERS };
  const grouped: RegionGroup[] = [];
  for (const leader of UNION_LEADERS) {
    const existing = grouped.find((g) => g.region === leader.region);
    if (existing) {
      existing.members.push(leader);
    } else {
      grouped.push({ region: leader.region, regionUrdu: leader.regionUrdu, members: [leader] });
    }
  }
  // Duplicate groups for seamless infinite loop
  const groups = [...grouped, ...grouped];

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
    if (contentWidthRef.current > 0) {
      startAnimation(contentWidthRef.current);
    }
    return () => {
      animRef.current?.stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  return (
    <View
      style={{
        height: 46,
        backgroundColor: tokens.primary,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
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
          <View key={`${group.region}-${gIdx}`} style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* Region tag — shown only once per group */}
            <View
              style={{
                backgroundColor: GOLD_SOFT,
                borderWidth: 1,
                borderColor: GOLD,
                borderRadius: 6,
                paddingHorizontal: 9,
                paddingVertical: 3,
                marginHorizontal: 10,
              }}
            >
              <Text style={{ color: GOLD, fontSize: 10, fontWeight: '800' }}>
                {isUrdu ? group.regionUrdu : group.region}
              </Text>
            </View>

            {/* All members of this region */}
            {group.members.map((leader, mIdx) => (
              <View key={`${leader.name}-${mIdx}`} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ paddingHorizontal: 10, paddingVertical: 6 }}>
                  <Text
                    style={{ color: 'rgba(255,255,255,0.68)', fontSize: 10, fontWeight: '700' }}
                    numberOfLines={1}
                  >
                    {isUrdu ? leader.roleUrdu : leader.role}
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
                  <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, paddingHorizontal: 2 }}>·</Text>
                )}
              </View>
            ))}

            {/* Gold diamond separator between regions */}
            <Text style={{ color: GOLD, fontSize: 12, paddingHorizontal: 6 }}>◆</Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}
