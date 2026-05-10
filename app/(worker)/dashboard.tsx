import { BadgeCheck, Bell, BookOpen, CreditCard, IdCard, Landmark, Menu, ShieldCheck, Siren } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { AppShell } from '@/components/app-shell';
import { DataState } from '@/components/data-state';
import { HeaderBar } from '@/components/header-bar';
import { MetricCard } from '@/components/metric-card';
import { SectionCard } from '@/components/section-card';
import { PriorityStatusStrip, QuickActionCard, WorkerIdentityStrip } from '@/features/worker-portal/components';
import { useWorkerDashboard } from '@/services/worker-service';
import { directionalText, rowDirection } from '@/theme/layout';
import { tokens } from '@/theme/tokens';

export default function WorkerDashboardScreen() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useWorkerDashboard();

  return (
    <AppShell>
      <HeaderBar title={t('worker.dashboard')} subtitle={data?.worker_identity.union_name} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <DataState loading={isLoading} error={isError} empty={!data} loadingLabel={t('states.loading')} errorLabel={t('states.error')} emptyLabel={t('states.empty')}>
          {data ? (
            <>
              <WorkerIdentityStrip summary={data} />
              <PriorityStatusStrip summary={data} />

              <View style={{ flexDirection: rowDirection(), gap: 10 }}>
                <MetricCard icon={CreditCard} label={t('worker.dues')} value={t(`status.dues.${data.dues_summary.current_status}`)} tone="warning" />
                <MetricCard icon={Siren} label={t('worker.grievances')} value={String(data.grievance_summary.active_count)} tone="error" />
              </View>
              <View style={{ flexDirection: rowDirection(), gap: 10 }}>
                <MetricCard icon={BadgeCheck} label={t('worker.vote')} value={t(`status.election.${data.voting_summary.status}`)} tone="info" />
                <MetricCard icon={Bell} label={t('worker.notices')} value={String(data.notifications_summary.unread_count)} tone="neutral" />
              </View>

              <SectionCard title={t('workerPortal.dashboard.nextActions')}>
                <View style={{ flexDirection: rowDirection(), gap: 10 }}>
                  <QuickActionCard icon={IdCard} title={t('worker.digitalId')} subtitle={t('workerPortal.dashboard.idAction')} href="/(worker)/digital-id" />
                  <QuickActionCard icon={Siren} title={t('worker.grievances')} subtitle={t('workerPortal.dashboard.grievanceAction')} href="/(worker)/grievances" />
                </View>
                <View style={{ flexDirection: rowDirection(), gap: 10, marginTop: 10 }}>
                  <QuickActionCard icon={BookOpen} title={t('worker.rights')} subtitle={t('workerPortal.dashboard.rightsAction')} href="/(worker)/rights" />
                  <QuickActionCard icon={Landmark} title={t('worker.myUnion')} subtitle={t('workerPortal.dashboard.unionAction')} href="/(worker)/my-union" />
                </View>
                <View style={{ flexDirection: rowDirection(), gap: 10, marginTop: 10 }}>
                  <QuickActionCard icon={Bell} title={t('tabs.notifications')} subtitle={t('workerPortal.dashboard.noticeAction')} href="/(worker)/notifications" />
                  <QuickActionCard icon={Menu} title={t('tabs.more')} subtitle={t('workerPortal.dashboard.moreAction')} href="/(worker)/more" />
                </View>
              </SectionCard>

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
