import { BadgeCheck, Banknote, FileArchive, Gavel, IdCard, Landmark, Menu, Siren, Users, Vote } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppShell } from '@/components/app-shell';
import { DataState } from '@/components/data-state';
import { HeaderBar } from '@/components/header-bar';
import { MetricCard } from '@/components/metric-card';
import { SectionCard } from '@/components/section-card';
import { AdminQuickActionCard, UnionRiskStrip } from '@/features/union-admin-core/components';
import { useUnionAdminDashboard } from '@/services/union-admin-service';
import { directionalText, rowDirection } from '@/theme/layout';
import { getUnionAdminTone, unionAdminTheme } from '@/theme/union-admin';
import { formatDate } from '@/utils/date';

function SubMetric({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 4 }}>
      <Text style={{ color: unionAdminTheme.mutedText, fontSize: 10, ...directionalText('600') }}>{label}:</Text>
      <Text style={{ color, fontSize: 10, ...directionalText('800') }}>{value}</Text>
    </View>
  );
}

export default function UnionDashboardScreen() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useUnionAdminDashboard();

  return (
    <AppShell>
      <HeaderBar title={t('union.dashboard')} subtitle={data?.union_name} variant="unionAdmin" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <DataState loading={isLoading} error={isError} empty={!data} loadingLabel={t('states.loading')} errorLabel={t('states.error')} emptyLabel={t('states.empty')}>
          {data ? (
            <>
              <DashboardHero
                title={data.union_name}
                registrationNo={data.registration_no}
                affiliationLabel={t(`status.affiliation.${data.affiliation_status}`)}
                complianceScore={`${data.compliance_score}% ${t('union.compliance')}`}
                members={`${data.members.active} ${t('union.members')}`}
                urgent={`${data.cases.urgent_grievances} ${t('union.urgentGrievances')}`}
                outsider={`${data.governance.office_bearer_outsider_percent}% ${t('union.outsider')}`}
                eyebrow={t('unionCore.dashboard.quickActions')}
              />

              <UnionRiskStrip summary={data} />

              <View style={{ flexDirection: rowDirection(), gap: 10 }}>
                <MetricCard icon={Users} label={t('union.members')} value={String(data.members.total)} tone="info" variant="unionAdmin">
                  <View style={{ flexDirection: rowDirection(), gap: 10, marginTop: 4 }}>
                    <SubMetric label={t('union.male')} value={data.members.male} color={unionAdminTheme.navy} />
                    <SubMetric label={t('union.female')} value={data.members.female} color="#e11d48" />
                  </View>
                </MetricCard>
                <MetricCard icon={Banknote} label={t('union.duesHealth')} value={`${data.dues.health_percent}%`} tone="success" variant="unionAdmin">
                  <View style={{ flexDirection: rowDirection(), gap: 10, marginTop: 4 }}>
                    <SubMetric label={t('union.submitted')} value={data.dues.submitted_count} color="#059669" />
                    <SubMetric label={t('union.pending')} value={data.dues.pending_count} color="#d97706" />
                  </View>
                </MetricCard>
              </View>
              <View style={{ flexDirection: rowDirection(), gap: 10 }}>
                <MetricCard icon={Siren} label={t('union.activeCases')} value={String(data.cases.active_grievances + data.cases.legal_cases)} tone="error" variant="unionAdmin">
                  <View style={{ flexDirection: rowDirection(), gap: 10, marginTop: 4 }}>
                    <SubMetric label={t('union.legal')} value={data.cases.legal_cases} color="#dc2626" />
                    <SubMetric label={t('union.grievances')} value={data.cases.active_grievances} color="#475569" />
                  </View>
                </MetricCard>
                <MetricCard icon={BadgeCheck} label={t('union.committeeMembers')} value={String(data.governance.committee_members_count)} tone="warning" variant="unionAdmin">
                  <View style={{ flexDirection: rowDirection(), gap: 10, marginTop: 4 }}>
                    <SubMetric label={t('union.male')} value={data.governance.committee_male_count} color={unionAdminTheme.navy} />
                    <SubMetric label={t('union.female')} value={data.governance.committee_female_count} color="#e11d48" />
                  </View>
                </MetricCard>
              </View>

              <SectionCard title={t('unionCore.dashboard.quickActions')} variant="unionAdmin">
                <View style={{ flexDirection: rowDirection(), gap: 10 }}>
                  <AdminQuickActionCard icon={IdCard} title={t('union.members')} subtitle={t('unionCore.actions.members')} href="/(union-admin)/members" />
                  <AdminQuickActionCard icon={Banknote} title={t('union.finance')} subtitle={t('unionCore.actions.finance')} href="/(union-admin)/finance" />
                </View>
                <View style={{ flexDirection: rowDirection(), gap: 10, marginTop: 10 }}>
                  <AdminQuickActionCard icon={Vote} title={t('union.elections')} subtitle={t('unionCore.actions.elections')} href="/(union-admin)/elections" />
                  <AdminQuickActionCard icon={Siren} title={t('union.legal')} subtitle={t('unionCore.actions.legal')} href="/(union-admin)/grievances-legal" />
                </View>
                <View style={{ flexDirection: rowDirection(), gap: 10, marginTop: 10 }}>
                  <AdminQuickActionCard icon={Landmark} title={t('union.officeBearers')} subtitle={t('unionCore.actions.officeBearers')} href="/(union-admin)/office-bearers" />
                  <AdminQuickActionCard icon={FileArchive} title={t('union.docs')} subtitle={t('unionCore.actions.documents')} href="/(union-admin)/documents-compliance" />
                </View>
                <View style={{ flexDirection: rowDirection(), gap: 10, marginTop: 10 }}>
                  <AdminQuickActionCard icon={BadgeCheck} title={t('union.return')} subtitle={t('unionCore.actions.annualReturn')} href="/(union-admin)/annual-return" />
                  <AdminQuickActionCard icon={Gavel} title={t('union.cbaCod')} subtitle={t('unionCore.actions.cba')} href="/(union-admin)/cba" />
                </View>
                <View style={{ flexDirection: rowDirection(), gap: 10, marginTop: 10 }}>
                  <AdminQuickActionCard icon={Menu} title={t('tabs.more')} subtitle={t('unionCore.actions.more')} href="/(union-admin)/more" />
                  <View style={{ flex: 1 }} />
                </View>
              </SectionCard>

              <SectionCard title={t('union.attention')} variant="unionAdmin">
                <View style={{ gap: 8 }}>
                  <Text style={{ color: unionAdminTheme.mutedText, fontSize: 12, lineHeight: 16, ...directionalText() }}>
                    {t('union.attentionSubtitle')}
                  </Text>
                  <View style={{ flexDirection: rowDirection(), flexWrap: 'wrap', gap: 8 }}>
                    <AttentionCard label={t('union.annualReturnDue')} value={formatDate(data.governance.annual_return_due)} action={t('union.attentionAction.reviewAnnualReturn')} route="/(union-admin)/annual-return" tone="crimson" />
                    <AttentionCard label={t('union.cbaExpiry')} value={formatDate(data.governance.cba_expiry)} action={t('union.attentionAction.reviewCBA')} route="/(union-admin)/cba" tone="navy" />
                    <AttentionCard label={t('union.nextElection')} value={formatDate(data.governance.next_election)} action={t('union.attentionAction.reviewElection')} route="/(union-admin)/elections" tone="green" />
                  </View>

                  <View style={{ flexDirection: rowDirection(), flexWrap: 'wrap', gap: 8 }}>
                    <AttentionCard label={t('union.pendingFormC')} value={String(data.members.pending_form_c)} action={t('union.attentionAction.reviewMembers')} route="/(union-admin)/members" tone="navy" />
                    <AttentionCard label={t('union.overdueDues')} value={String(data.dues.overdue_members)} action={t('union.attentionAction.reviewDues')} route="/(union-admin)/finance" tone="crimson" />
                    <AttentionCard label={t('union.urgentGrievances')} value={String(data.cases.urgent_grievances)} action={t('union.attentionAction.reviewGrievances')} route="/(union-admin)/grievances-legal" tone="red" />
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

function DashboardHero({
  eyebrow,
  title,
  registrationNo,
  affiliationLabel,
  complianceScore,
  members,
  urgent,
  outsider,
}: {
  eyebrow: string;
  title: string;
  registrationNo: string;
  affiliationLabel: string;
  complianceScore: string;
  members: string;
  urgent: string;
  outsider: string;
}) {
  return (
    <View
      style={{
        borderRadius: 28,
        overflow: 'hidden',
        backgroundColor: unionAdminTheme.navy,
        padding: 18,
        gap: 14,
      }}
    >
      <View style={{ position: 'absolute', top: -28, right: -12, width: 150, height: 150, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.07)' }} />
      <View style={{ position: 'absolute', bottom: -58, left: -6, width: 180, height: 180, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.05)' }} />
      <View style={{ gap: 6 }}>
        <Text style={{ color: 'rgba(255,255,255,0.78)', fontSize: 12, letterSpacing: 1.2, ...directionalText('900') }}>{eyebrow.toUpperCase()}</Text>
        <Text style={{ color: '#ffffff', fontSize: 24, lineHeight: 30, ...directionalText('900') }}>{title}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.78)', fontSize: 13, lineHeight: 20, ...directionalText('600') }}>
          {registrationNo} • {affiliationLabel}
        </Text>
      </View>
    </View>
  );
}

function AttentionCard({
  label,
  value,
  action,
  route,
  tone,
}: {
  label: string;
  value: string;
  action: string;
  route: '/(union-admin)/annual-return' | '/(union-admin)/cba' | '/(union-admin)/elections' | '/(union-admin)/members' | '/(union-admin)/finance' | '/(union-admin)/grievances-legal';
  tone: 'navy' | 'green' | 'crimson' | 'red';
}) {
  const colors = getUnionAdminTone(tone);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(route)}
      style={{
        flex: 1,
        minWidth: 130,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 10,
        backgroundColor: colors.soft,
        overflow: 'hidden',
      }}
    >
      <View style={{ position: 'absolute', top: 0, bottom: 0, width: 4, backgroundColor: colors.accent, left: 0 }} />
      <Text style={{ color: unionAdminTheme.mutedText, fontSize: 11, marginBottom: 2, ...directionalText('800') }}>{label}</Text>
      <Text style={{ color: colors.accent, fontSize: 14, ...directionalText('900') }}>{value}</Text>
      <Text style={{ color: unionAdminTheme.text, fontSize: 11, marginTop: 6, ...directionalText('700') }}>{action}</Text>
    </Pressable>
  );
}
