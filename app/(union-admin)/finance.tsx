import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { AppShell } from '@/components/app-shell';
import { DataState } from '@/components/data-state';
import { HeaderBar } from '@/components/header-bar';
import { MetricCard } from '@/components/metric-card';
import {
  DuesLedgerCardEnhanced,
  FinanceAlertBanner,
  FinanceTabSwitcher,
  RemittanceDetailCard,
  SummaryLine,
  WelfareCaseCard,
} from '@/features/union-admin-operations/components';
import {
  useApproveWelfareCaseMutation,
  useMarkRemittanceReceivedMutation,
  useRecordUnionDuesMutation,
  useRejectWelfareCaseMutation,
  useUnionFinance,
} from '@/services/union-admin-service';
import { Banknote, Heart, Users, WalletCards } from 'lucide-react-native';
import { rowDirection } from '@/theme/layout';
import { tokens } from '@/theme/tokens';
import { useState } from 'react';

export default function FinanceScreen() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useUnionFinance();
  const recordDues = useRecordUnionDuesMutation();
  const markReceived = useMarkRemittanceReceivedMutation();
  const approveWelfare = useApproveWelfareCaseMutation();
  const rejectWelfare = useRejectWelfareCaseMutation();
  const [activeTab, setActiveTab] = useState<'dues' | 'remittances' | 'welfare'>('dues');
  const [search, setSearch] = useState('');

  const pendingRemittance = data?.remittances.find((r) => r.status === 'pending');

  return (
    <AppShell>
      <HeaderBar title={t('union.finance')} subtitle={t('unionOps.finance.subtitle')} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <DataState loading={isLoading} error={isError} empty={!data} loadingLabel={t('states.loading')} errorLabel={t('states.error')} emptyLabel={t('states.empty')}>
          {data ? (
            <>
              {/* Remittance Alert */}
              {data.remittance_alert_days > 0 && pendingRemittance && (
                <FinanceAlertBanner days={data.remittance_alert_days} period={pendingRemittance.deduction_period} />
              )}

              {/* Summary Metrics */}
              <View style={{ flexDirection: rowDirection(), gap: 10 }}>
                <MetricCard icon={Banknote} label={t('union.collected')} value={`Rs. ${data.collected_amount.toLocaleString()}`} tone="success" />
                <MetricCard icon={WalletCards} label={t('union.outstanding')} value={`Rs. ${data.outstanding_amount.toLocaleString()}`} tone="warning" />
              </View>
              <View style={{ flexDirection: rowDirection(), gap: 10 }}>
                <MetricCard icon={Users} label={t('unionOps.finance.overdueMembers')} value={String(data.overdue_members)} tone="error" />
                <MetricCard icon={Heart} label="Welfare Fund" value={`Rs. ${data.welfare_fund_balance.toLocaleString()}`} tone="info" />
              </View>

              {/* Tab Switcher */}
              <FinanceTabSwitcher active={activeTab} onChange={setActiveTab} />

              {/* Dues & Ledger Tab */}
              {activeTab === 'dues' && (
                <View style={{ gap: 8 }}>
                  <View style={{ flexDirection: rowDirection(), alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ color: tokens.foreground, fontWeight: '900', fontSize: 15 }}>Member Dues Ledger</Text>
                    <Text style={{ color: tokens.mutedForeground, fontSize: 12 }}>{data.dues_ledger.length} entries</Text>
                  </View>
                  {data.dues_ledger.map((item) => (
                    <DuesLedgerCardEnhanced
                      key={item.id}
                      item={item}
                      onRecord={(memberId, period) => recordDues.mutate({ memberId, period, amount: item.amount })}
                      isRecording={recordDues.isPending}
                    />
                  ))}
                  {recordDues.data ? (
                    <View style={{ backgroundColor: tokens.statusSuccessBg, borderRadius: 8, padding: 10 }}>
                      <Text style={{ color: tokens.statusSuccess, fontWeight: '800', fontSize: 13, textAlign: 'center' }}>
                        Dues recorded — Receipt: {recordDues.data.receiptNo}
                      </Text>
                    </View>
                  ) : null}
                </View>
              )}

              {/* Remittances Tab */}
              {activeTab === 'remittances' && (
                <View style={{ gap: 8 }}>
                  <View style={{ flexDirection: rowDirection(), alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ color: tokens.foreground, fontWeight: '900', fontSize: 15 }}>Employer Remittances</Text>
                    <Text style={{ color: tokens.mutedForeground, fontSize: 12 }}>15-day rule applies</Text>
                  </View>
                  {data.remittances.map((remittance) => (
                    <RemittanceDetailCard
                      key={remittance.id}
                      remittance={remittance}
                      onMarkReceived={(bankRef, date) =>
                        markReceived.mutate({
                          remittanceId: remittance.id,
                          bank_reference: bankRef,
                          received_date: date,
                          amount_confirmed: remittance.total_amount,
                        })
                      }
                      isMarking={markReceived.isPending}
                    />
                  ))}
                  {markReceived.data ? (
                    <View style={{ backgroundColor: tokens.statusSuccessBg, borderRadius: 8, padding: 10 }}>
                      <Text style={{ color: tokens.statusSuccess, fontWeight: '800', fontSize: 13, textAlign: 'center' }}>
                        Remittance confirmed — Ref: {markReceived.data.receiptRef}
                      </Text>
                    </View>
                  ) : null}
                </View>
              )}

              {/* Welfare Fund Tab */}
              {activeTab === 'welfare' && (
                <View style={{ gap: 8 }}>
                  <View style={{ flexDirection: rowDirection(), alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ color: tokens.foreground, fontWeight: '900', fontSize: 15 }}>Welfare Claims</Text>
                    <Text style={{ color: data.welfare_claims_pending > 0 ? tokens.statusWarning : tokens.statusSuccess, fontWeight: '800', fontSize: 12 }}>
                      {data.welfare_claims_pending} pending
                    </Text>
                  </View>
                  <View style={{ backgroundColor: tokens.card, borderRadius: 10, borderWidth: 1, borderColor: tokens.border, padding: 12, flexDirection: rowDirection(), justifyContent: 'space-between' }}>
                    <Text style={{ color: tokens.mutedForeground, fontSize: 13 }}>Welfare Fund Balance</Text>
                    <Text style={{ color: tokens.statusSuccess, fontWeight: '900', fontSize: 14 }}>Rs. {data.welfare_fund_balance.toLocaleString()}</Text>
                  </View>
                  {data.welfare_cases.map((claim) => (
                    <WelfareCaseCard
                      key={claim.id}
                      claim={claim}
                      onApprove={(caseId, amount) => approveWelfare.mutate({ caseId, amount_approved: amount, payment_ref: `WF-${caseId}-${Date.now()}` })}
                      onReject={(caseId) => rejectWelfare.mutate({ caseId, reason: 'Insufficient documentation or eligibility criteria not met.' })}
                      isActing={approveWelfare.isPending || rejectWelfare.isPending}
                    />
                  ))}
                </View>
              )}
            </>
          ) : null}
        </DataState>
      </ScrollView>
    </AppShell>
  );
}
