import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { AppShell } from '@/components/app-shell';
import { DataState } from '@/components/data-state';
import { HeaderBar } from '@/components/header-bar';
import { MetricCard } from '@/components/metric-card';
import { SectionCard } from '@/components/section-card';
import { StatusChip } from '@/components/status-chip';
import { ActionButton, DuesLedgerCard, RemittanceCard, SummaryLine } from '@/features/union-admin-operations/components';
import { useRecordUnionDuesMutation, useUnionFinance } from '@/services/union-admin-service';
import { Banknote, FileText, ReceiptText, Users, WalletCards } from 'lucide-react-native';
import { rowDirection } from '@/theme/layout';

export default function FinanceScreen() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useUnionFinance();
  const recordDues = useRecordUnionDuesMutation();

  return (
    <AppShell>
      <HeaderBar title={t('union.finance')} subtitle={t('unionOps.finance.subtitle')} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <DataState loading={isLoading} error={isError} empty={!data} loadingLabel={t('states.loading')} errorLabel={t('states.error')} emptyLabel={t('states.empty')}>
          {data ? (
            <>
              <View style={{ flexDirection: rowDirection(), gap: 10 }}>
                <MetricCard icon={Banknote} label={t('union.collected')} value={`Rs. ${data.collected_amount}`} tone="success" />
                <MetricCard icon={WalletCards} label={t('union.outstanding')} value={`Rs. ${data.outstanding_amount}`} tone="warning" />
              </View>
              <View style={{ flexDirection: rowDirection(), gap: 10 }}>
                <MetricCard icon={Users} label={t('unionOps.finance.overdueMembers')} value={String(data.overdue_members)} tone="error" />
                <MetricCard icon={FileText} label={t('unionOps.finance.prefill')} value={`${data.annual_return_prefill_percent}%`} tone="info" />
              </View>
              <SectionCard title={t('unionOps.finance.snapshot')}>
                <SummaryLine icon={ReceiptText} label={t('workerPortal.dues.latestReceipt')} value={data.latest_receipt_no} />
                <SummaryLine icon={Users} label={t('unionOps.finance.welfare')} value={String(data.welfare_claims_pending)} />
                <ActionButton label={recordDues.data ? t('unionOps.finance.recorded', { ref: recordDues.data.receiptNo }) : t('unionOps.finance.recordMock')} icon={ReceiptText} onPress={() => recordDues.mutate({ memberId: 'PUWF-LWMC-0003', period: '2026-05', amount: 200 })} disabled={recordDues.isPending} />
              </SectionCard>
              <SectionCard title={t('union.remittances')}>
                <View style={{ flexDirection: rowDirection(), gap: 8, flexWrap: 'wrap' }}>
                  <StatusChip tone="warning" label={t('unionOps.finance.lateRule')} />
                  <StatusChip tone="info" label={t('unionOps.finance.bulkMock')} />
                </View>
              </SectionCard>
              {data.remittances.map((remittance) => <RemittanceCard key={remittance.id} remittance={remittance} />)}
              <SectionCard title={t('workerPortal.dues.ledger')}>
                <View style={{ gap: 10 }}>
                  {data.dues_ledger.map((item) => <DuesLedgerCard key={item.id} item={item} />)}
                </View>
              </SectionCard>
            </>
          ) : null}
        </DataState>
      </ScrollView>
    </AppShell>
  );
}
