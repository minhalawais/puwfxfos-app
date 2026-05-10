import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { AppShell } from '@/components/app-shell';
import { DataState } from '@/components/data-state';
import { HeaderBar } from '@/components/header-bar';
import { MetricCard } from '@/components/metric-card';
import { SectionCard } from '@/components/section-card';
import { StatusChip } from '@/components/status-chip';
import { AnnualReturnStepCard, ActionButton, SummaryLine } from '@/features/union-admin-operations/components';
import { useApproveAnnualReturnMutation, useUnionAnnualReturn } from '@/services/union-admin-service';
import { Banknote, FileCheck2, FileText, UserRoundCheck, Users } from 'lucide-react-native';
import { rowDirection } from '@/theme/layout';

export default function AnnualReturnScreen() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useUnionAnnualReturn();
  const approve = useApproveAnnualReturnMutation();

  return (
    <AppShell>
      <HeaderBar title={t('union.return')} subtitle={t('unionOps.annual.subtitle')} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
        <DataState loading={isLoading} error={isError} empty={!data} loadingLabel={t('states.loading')} errorLabel={t('states.error')} emptyLabel={t('states.empty')}>
          {data ? (
            <>
              <View style={{ flexDirection: rowDirection(), gap: 10 }}>
                <MetricCard icon={Users} label={t('unionOps.annual.memberMovement')} value={`${data.member_count_start} -> ${data.member_count_end}`} tone="info" />
                <MetricCard icon={Banknote} label={t('unionOps.annual.closingBalance')} value={`Rs. ${data.closing_balance}`} tone="success" />
              </View>
              <SectionCard title={t('unionOps.annual.reviewState')}>
                <View style={{ flexDirection: rowDirection(), gap: 8, flexWrap: 'wrap' }}>
                  <StatusChip tone="warning" label={t(`unionOps.status.annual.${data.status}`)} />
                  <StatusChip tone="info" label={t('unionOps.annual.income', { amount: data.total_income })} />
                  <StatusChip tone="warning" label={t('unionOps.annual.expense', { amount: data.total_expenditure })} />
                </View>
                <SummaryLine icon={UserRoundCheck} label={t('unionOps.annual.gsReview')} value={data.gs_approved_at ?? t('common.pending')} />
                <SummaryLine icon={FileCheck2} label={t('unionOps.annual.fsReview')} value={data.fs_approved_at ?? t('common.pending')} />
                <ActionButton label={approve.data ? t('unionOps.annual.approved', { ref: approve.data.approvalRef }) : t('unionOps.annual.approveMock')} icon={FileText} onPress={() => approve.mutate({ annualReturnId: data.id, role: 'fs' })} disabled={approve.isPending} />
              </SectionCard>
              {data.steps.map((step) => <AnnualReturnStepCard key={step.id} step={step} />)}
            </>
          ) : null}
        </DataState>
      </ScrollView>
    </AppShell>
  );
}
