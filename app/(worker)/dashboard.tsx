import { BadgeCheck, Bell, BookOpen, ChevronLeft, ChevronRight, CreditCard, IdCard, Landmark, ShieldCheck, Siren } from 'lucide-react-native';
import { router, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { AppShell } from '@/components/app-shell';
import { DataState } from '@/components/data-state';
import { HeaderBar } from '@/components/header-bar';
import { MetricCard } from '@/components/metric-card';
import { SectionCard } from '@/components/section-card';
import { LeadershipTicker, PriorityStatusStrip, WorkerIdentityStrip } from '@/features/worker-portal/components';
import { useWorkerDashboard } from '@/services/worker-service';
import { directionalText, isRtlLanguage, rowDirection } from '@/theme/layout';
import { tokens } from '@/theme/tokens';

const ACTION_NAVY = '#2E338C';
const ACTION_GREEN = '#03A64A';
const ACTION_CRIMSON = '#A6121F';
const ACTION_RED = '#F21D2F';
const ACTION_LIGHT = '#F2F2F2';

export default function WorkerDashboardScreen() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useWorkerDashboard();

  return (
    <AppShell>
      <HeaderBar title={t('worker.dashboard')} subtitle={data?.worker_identity.union_name} />
      <LeadershipTicker unionName={data?.worker_identity.union_name} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <DataState loading={isLoading} error={isError} empty={!data} loadingLabel={t('states.loading')} errorLabel={t('states.error')} emptyLabel={t('states.empty')}>
          {data ? (
            <>
              <WorkerIdentityStrip summary={data} />

              <SectionCard title={t('workerPortal.dashboard.nextActions')}>
                <View style={{ gap: 10 }}>
                  <WorkerActionButton icon={BookOpen} title={t('workerPortal.dashboard.knowRights')} subtitle={t('workerPortal.dashboard.rightsAction')} href="/(worker)/rights" tone="navy" />
                  <WorkerActionButton icon={Siren} title={t('workerPortal.dashboard.seeGrievances')} subtitle={t('workerPortal.dashboard.grievanceAction')} href="/(worker)/grievances" tone="crimson" />
                  <WorkerActionButton icon={BadgeCheck} title={t('workerPortal.dashboard.takePartElections')} subtitle={t('workerPortal.dashboard.voteAction')} href="/(worker)/voting" tone="green" />
                  <WorkerActionButton icon={Landmark} title={t('worker.myUnion')} subtitle={t('workerPortal.dashboard.unionAction')} href="/(worker)/my-union" tone="navySoft" />
                  <WorkerActionButton icon={Bell} title={t('workerPortal.dashboard.noticesLabel')} subtitle={t('workerPortal.dashboard.noticeAction')} href="/(worker)/notifications" tone="crimsonSoft" />
                </View>
              </SectionCard>

              <PriorityStatusStrip summary={data} />

              <View style={{ flexDirection: rowDirection(), gap: 10 }}>
                <MetricCard icon={CreditCard} label={t('worker.dues')} value={t(`status.dues.${data.dues_summary.current_status}`)} tone="warning" />
                <MetricCard icon={Siren} label={t('worker.grievances')} value={String(data.grievance_summary.active_count)} tone="error" />
              </View>
              <View style={{ flexDirection: rowDirection(), gap: 10 }}>
                <MetricCard icon={BadgeCheck} label={t('worker.vote')} value={t(`status.election.${data.voting_summary.status}`)} tone="info" />
                <MetricCard icon={Bell} label={t('worker.notices')} value={String(data.notifications_summary.unread_count)} tone="neutral" />
              </View>

              <SectionCard title={t('worker.quickStatus')}>
                <View style={{ gap: 10 }}>
                  <StatusRow icon={IdCard} label={t('worker.digitalId')} value={data.digital_id.available ? t('common.available') : t('common.pending')} />
                  <StatusRow icon={ShieldCheck} label={t('worker.socialSecurity')} value={t(`status.benefits.${data.benefits.social_security_status}`)} />
                  <StatusRow icon={Siren} label={t('workerPortal.dashboard.sla')} value={t(data.grievance_summary.sla_label_key)} />
                </View>
              </SectionCard>
            </>
          ) : null}
        </DataState>
      </ScrollView>
    </AppShell>
  );
}

function StatusRow({ icon: Icon, label, value }: { icon: typeof IdCard; label: string; value: string }) {
  return (
    <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 10 }}>
      <Icon size={18} color={tokens.primary} />
      <Text style={{ flex: 1, color: tokens.mutedForeground, ...directionalText('700') }}>{label}</Text>
      <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{value}</Text>
    </View>
  );
}

type ActionIconType = typeof BookOpen;

function WorkerActionButton({
  icon: Icon,
  title,
  subtitle,
  href,
  tone,
}: {
  icon: ActionIconType;
  title: string;
  subtitle: string;
  href: Href;
  tone: 'navy' | 'green' | 'crimson' | 'navySoft' | 'crimsonSoft';
}) {
  const rtl = isRtlLanguage();
  const DirectionIcon = rtl ? ChevronLeft : ChevronRight;

  const toneStyles = {
    navy: {
      cardBg: 'rgba(46, 51, 140, 0.08)',
      cardBorder: 'rgba(46, 51, 140, 0.16)',
      stripe: ACTION_NAVY,
      iconBg: ACTION_NAVY,
      iconFg: '#ffffff',
      badgeBg: 'rgba(46, 51, 140, 0.10)',
      badgeFg: ACTION_NAVY,
    },
    green: {
      cardBg: 'rgba(3, 166, 74, 0.08)',
      cardBorder: 'rgba(3, 166, 74, 0.18)',
      stripe: ACTION_GREEN,
      iconBg: ACTION_GREEN,
      iconFg: '#ffffff',
      badgeBg: 'rgba(3, 166, 74, 0.10)',
      badgeFg: ACTION_GREEN,
    },
    crimson: {
      cardBg: 'rgba(242, 29, 47, 0.08)',
      cardBorder: 'rgba(166, 18, 31, 0.18)',
      stripe: ACTION_CRIMSON,
      iconBg: ACTION_RED,
      iconFg: '#ffffff',
      badgeBg: 'rgba(166, 18, 31, 0.10)',
      badgeFg: ACTION_CRIMSON,
    },
    navySoft: {
      cardBg: ACTION_LIGHT,
      cardBorder: 'rgba(46, 51, 140, 0.14)',
      stripe: ACTION_NAVY,
      iconBg: '#ffffff',
      iconFg: ACTION_NAVY,
      badgeBg: 'rgba(46, 51, 140, 0.08)',
      badgeFg: ACTION_NAVY,
    },
    crimsonSoft: {
      cardBg: ACTION_LIGHT,
      cardBorder: 'rgba(166, 18, 31, 0.14)',
      stripe: ACTION_CRIMSON,
      iconBg: '#ffffff',
      iconFg: ACTION_CRIMSON,
      badgeBg: 'rgba(166, 18, 31, 0.08)',
      badgeFg: ACTION_CRIMSON,
    },
  }[tone];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={() => router.push(href)}
      style={({ pressed }) => ({
        minHeight: 88,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: toneStyles.cardBorder,
        backgroundColor: toneStyles.cardBg,
        overflow: 'hidden',
        opacity: pressed ? 0.92 : 1,
        transform: [{ scale: pressed ? 0.988 : 1 }],
      })}
    >
      <View style={{ position: 'absolute', top: 0, bottom: 0, width: 5, backgroundColor: toneStyles.stripe, ...(rtl ? { right: 0 } : { left: 0 }) }} />
      <View
        style={{
          minHeight: 88,
          paddingVertical: 14,
          paddingLeft: rtl ? 16 : 18,
          paddingRight: rtl ? 18 : 16,
          flexDirection: rowDirection(),
          alignItems: 'center',
          gap: 12,
        }}
      >
        <View
          style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            backgroundColor: toneStyles.iconBg,
            borderWidth: 1,
            borderColor: toneStyles.cardBorder,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: toneStyles.stripe,
            shadowOpacity: 0.12,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 3,
          }}
        >
          <Icon size={21} color={toneStyles.iconFg} />
        </View>

        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ color: tokens.foreground, fontSize: 15, ...directionalText('900') }}>
            {title}
          </Text>
          <Text style={{ color: tokens.mutedForeground, fontSize: 11, lineHeight: 17, ...directionalText('700') }}>
            {subtitle}
          </Text>
        </View>

        <View
          style={{
            minWidth: 34,
            height: 34,
            borderRadius: 999,
            backgroundColor: toneStyles.badgeBg,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 8,
          }}
        >
          <DirectionIcon size={18} color={toneStyles.badgeFg} />
        </View>
      </View>
    </Pressable>
  );
}
