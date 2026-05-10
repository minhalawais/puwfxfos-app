import { CreditCard, ReceiptText, WalletCards } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { AppShell } from '@/components/app-shell';
import { DataState } from '@/components/data-state';
import { HeaderBar } from '@/components/header-bar';
import { MetricCard } from '@/components/metric-card';
import { SectionCard } from '@/components/section-card';
import { StatusChip } from '@/components/status-chip';
import { DuesReceiptCard } from '@/features/worker-portal/components';
import { useWorkerDues } from '@/services/worker-service';
import { directionalText, rowDirection } from '@/theme/layout';
import { tokens } from '@/theme/tokens';

export default function DuesScreen() {
  const { t } = useTranslation();
  const { data = [], isLoading, isError } = useWorkerDues();
  const outstanding = data.filter((due) => due.status === 'pending' || due.status === 'overdue').length;
  const paid = data.filter((due) => due.status === 'paid').length;
  const lastReceipt = data.find((due) => due.receipt)?.receipt_no;

  return (
    <AppShell>
      <HeaderBar title={t('worker.dues')} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <DataState loading={isLoading} error={isError} empty={data.length === 0} loadingLabel={t('states.loading')} errorLabel={t('states.error')} emptyLabel={t('workerPortal.dues.empty')}>
          <View style={{ flexDirection: rowDirection(), gap: 10 }}>
            <MetricCard icon={CreditCard} label={t('workerPortal.dues.outstanding')} value={String(outstanding)} tone={outstanding ? 'warning' : 'success'} />
            <MetricCard icon={WalletCards} label={t('workerPortal.dues.paidMonths')} value={String(paid)} tone="success" />
          </View>
          <SectionCard title={t('workerPortal.dues.summary')}>
            <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 8 }}>
              <ReceiptText size={18} color={tokens.primary} />
              <Text style={{ flex: 1, color: tokens.mutedForeground, ...directionalText('800') }}>{t('workerPortal.dues.latestReceipt')}</Text>
              <StatusChip tone={lastReceipt ? 'success' : 'warning'} label={lastReceipt ?? t('common.pending')} />
            </View>
            <Text style={{ color: tokens.mutedForeground, fontSize: 12, lineHeight: 18, ...directionalText() }}>{t('workerPortal.dues.employerDeduction')}</Text>
          </SectionCard>
          <SectionCard title={t('workerPortal.dues.ledger')}>
            <View style={{ gap: 10 }}>
              {data.map((due) => <DuesReceiptCard key={due.id} due={due} />)}
            </View>
          </SectionCard>
        </DataState>
      </ScrollView>
    </AppShell>
  );
}
