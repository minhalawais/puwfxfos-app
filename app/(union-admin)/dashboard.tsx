import { BadgeCheck, Banknote, FileArchive, FileCheck2, IdCard, Landmark, Menu, Siren, Users } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { AppShell } from '@/components/app-shell';
import { DataState } from '@/components/data-state';
import { HeaderBar } from '@/components/header-bar';
import { MetricCard } from '@/components/metric-card';
import { SectionCard } from '@/components/section-card';
import { AdminQuickActionCard, SourceNote, UnionRiskStrip } from '@/features/union-admin-core/components';
import { useUnionAdminDashboard } from '@/services/union-admin-service';
import { rowDirection } from '@/theme/layout';

export default function UnionDashboardScreen() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useUnionAdminDashboard();

  return (
    <AppShell>
      <HeaderBar title={t('union.dashboard')} subtitle={data?.union_name} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <DataState loading={isLoading} error={isError} empty={!data} loadingLabel={t('states.loading')} errorLabel={t('states.error')} emptyLabel={t('states.empty')}>
          {data ? (
            <>
              <UnionRiskStrip summary={data} />
              <View style={{ flexDirection: rowDirection(), gap: 10 }}>
                <MetricCard icon={Users} label={t('union.members')} value={String(data.members.total)} tone="info" />
                <MetricCard icon={Banknote} label={t('union.duesHealth')} value={`${data.dues.health_percent}%`} tone="success" />
              </View>
              <View style={{ flexDirection: rowDirection(), gap: 10 }}>
                <MetricCard icon={Siren} label={t('union.activeCases')} value={String(data.cases.active_grievances)} tone="error" />
                <MetricCard icon={FileCheck2} label={t('union.compliance')} value={`${data.compliance_score}`} tone="warning" />
              </View>
              <SectionCard title={t('unionCore.dashboard.quickActions')}>
                <View style={{ flexDirection: rowDirection(), gap: 10 }}>
                  <AdminQuickActionCard icon={IdCard} title={t('union.members')} subtitle={t('unionCore.actions.members')} href="/(union-admin)/members" />
                  <AdminQuickActionCard icon={Landmark} title={t('union.officeBearers')} subtitle={t('unionCore.actions.officeBearers')} href="/(union-admin)/office-bearers" />
                </View>
                <View style={{ flexDirection: rowDirection(), gap: 10, marginTop: 10 }}>
                  <AdminQuickActionCard icon={FileArchive} title={t('union.docs')} subtitle={t('unionCore.actions.documents')} href="/(union-admin)/documents-compliance" />
                  <AdminQuickActionCard icon={BadgeCheck} title={t('union.return')} subtitle={t('unionCore.actions.annualReturn')} href="/(union-admin)/annual-return" />
                </View>
                <View style={{ flexDirection: rowDirection(), gap: 10, marginTop: 10 }}>
                  <AdminQuickActionCard icon={Banknote} title={t('union.finance')} subtitle={t('unionCore.actions.finance')} href="/(union-admin)/finance" />
                  <AdminQuickActionCard icon={Menu} title={t('tabs.more')} subtitle={t('unionCore.actions.more')} href="/(union-admin)/more" />
                </View>
              </SectionCard>
              <SectionCard title={t('union.attention')}>
                <SourceNote label={t('unionCore.sources.dashboard')} />
              </SectionCard>
            </>
          ) : null}
        </DataState>
      </ScrollView>
    </AppShell>
  );
}
