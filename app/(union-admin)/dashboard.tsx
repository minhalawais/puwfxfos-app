import { BadgeCheck, Banknote, FileArchive, FileCheck2, Gavel, IdCard, Landmark, Menu, Siren, Users } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppShell } from '@/components/app-shell';
import { DataState } from '@/components/data-state';
import { HeaderBar } from '@/components/header-bar';
import { MetricCard } from '@/components/metric-card';
import { SectionCard } from '@/components/section-card';
import { AdminQuickActionCard, SourceNote, UnionRiskStrip } from '@/features/union-admin-core/components';
import { useUnionAdminDashboard } from '@/services/union-admin-service';
import { directionalText, rowDirection } from '@/theme/layout';
import { formatDate } from '@/utils/date';

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
                  <AdminQuickActionCard icon={Siren} title={t('union.legal')} subtitle={t('unionCore.actions.grievances')} href="/(union-admin)/grievances-legal" />
                </View>
                <View style={{ flexDirection: rowDirection(), gap: 10, marginTop: 10 }}>
                  <AdminQuickActionCard icon={Gavel} title={t('union.cbaCod')} subtitle={t('unionCore.actions.cba')} href="/(union-admin)/cba" />
                  <AdminQuickActionCard icon={Menu} title={t('tabs.more')} subtitle={t('unionCore.actions.more')} href="/(union-admin)/more" />
                </View>
              </SectionCard>
              <SectionCard title={t('union.attention')}>
                <View style={{ gap: 8 }}>
                  <Text style={{ color: '#475569', fontSize: 13, lineHeight: 18, ...directionalText() }}>{t('union.attentionSubtitle')}</Text>
                  <View style={{ gap: 14 }}>
                  <View style={{ flexDirection: rowDirection(), flexWrap: 'wrap', gap: 10 }}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => router.push('/(union-admin)/annual-return')}
                      style={{ flex: 1, minWidth: 150, borderRadius: 16, borderWidth: 1, borderColor: '#d9e6dd', padding: 14, backgroundColor: '#f6faf7' }}
                    >
                      <Text style={{ fontSize: 12, marginBottom: 4, ...directionalText('800') }}>{t('union.annualReturnDue')}</Text>
                      <Text style={{ color: '#06452f', fontSize: 16, ...directionalText('700') }}>{formatDate(data.governance.annual_return_due)}</Text>
                      <Text style={{ color: '#475569', fontSize: 12, marginTop: 8, ...directionalText() }}>{t('union.attentionAction.reviewAnnualReturn')}</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => router.push('/(union-admin)/cba')}
                      style={{ flex: 1, minWidth: 150, borderRadius: 16, borderWidth: 1, borderColor: '#d9e6dd', padding: 14, backgroundColor: '#f6faf7' }}
                    >
                      <Text style={{ fontSize: 12, marginBottom: 4, ...directionalText('800') }}>{t('union.cbaExpiry')}</Text>
                      <Text style={{ color: '#06452f', fontSize: 16, ...directionalText('700') }}>{formatDate(data.governance.cba_expiry)}</Text>
                      <Text style={{ color: '#475569', fontSize: 12, marginTop: 8, ...directionalText() }}>{t('union.attentionAction.reviewCBA')}</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => router.push('/(union-admin)/elections')}
                      style={{ flex: 1, minWidth: 150, borderRadius: 16, borderWidth: 1, borderColor: '#d9e6dd', padding: 14, backgroundColor: '#f6faf7' }}
                    >
                      <Text style={{ fontSize: 12, marginBottom: 4, ...directionalText('800') }}>{t('union.nextElection')}</Text>
                      <Text style={{ color: '#06452f', fontSize: 16, ...directionalText('700') }}>{formatDate(data.governance.next_election)}</Text>
                      <Text style={{ color: '#475569', fontSize: 12, marginTop: 8, ...directionalText() }}>{t('union.attentionAction.reviewElection')}</Text>
                    </Pressable>
                  </View>

                  <View style={{ flexDirection: rowDirection(), flexWrap: 'wrap', gap: 10 }}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => router.push('/(union-admin)/members')}
                      style={{ flex: 1, minWidth: 150, borderRadius: 16, borderWidth: 1, borderColor: '#d9e6dd', padding: 14, backgroundColor: '#f6faf7' }}
                    >
                      <Text style={{ fontSize: 12, marginBottom: 4, ...directionalText('800') }}>{t('union.pendingFormC')}</Text>
                      <Text style={{ color: '#06452f', fontSize: 16, ...directionalText('700') }}>{data.members.pending_form_c}</Text>
                      <Text style={{ color: '#475569', fontSize: 12, marginTop: 8, ...directionalText() }}>{t('union.attentionAction.reviewMembers')}</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => router.push('/(union-admin)/finance')}
                      style={{ flex: 1, minWidth: 150, borderRadius: 16, borderWidth: 1, borderColor: '#d9e6dd', padding: 14, backgroundColor: '#f6faf7' }}
                    >
                      <Text style={{ fontSize: 12, marginBottom: 4, ...directionalText('800') }}>{t('union.overdueDues')}</Text>
                      <Text style={{ color: '#06452f', fontSize: 16, ...directionalText('700') }}>{data.dues.overdue_members}</Text>
                      <Text style={{ color: '#475569', fontSize: 12, marginTop: 8, ...directionalText() }}>{t('union.attentionAction.reviewDues')}</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => router.push('/(union-admin)/grievances-legal')}
                      style={{ flex: 1, minWidth: 150, borderRadius: 16, borderWidth: 1, borderColor: '#d9e6dd', padding: 14, backgroundColor: '#f6faf7' }}
                    >
                      <Text style={{ fontSize: 12, marginBottom: 4, ...directionalText('800') }}>{t('union.urgentGrievances')}</Text>
                      <Text style={{ color: '#b42318', fontSize: 16, ...directionalText('700') }}>{data.cases.urgent_grievances}</Text>
                      <Text style={{ color: '#475569', fontSize: 12, marginTop: 8, ...directionalText() }}>{t('union.attentionAction.reviewGrievances')}</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
              </SectionCard>
            </>
          ) : null}
        </DataState>
      </ScrollView>
    </AppShell>
  );
}
