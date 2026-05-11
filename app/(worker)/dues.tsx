import { AlertCircle, CheckCircle2, CreditCard, FileWarning, ReceiptText, WalletCards } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { AppShell } from '@/components/app-shell';
import { DataState } from '@/components/data-state';
import { HeaderBar } from '@/components/header-bar';
import { MetricCard } from '@/components/metric-card';
import { SectionCard } from '@/components/section-card';
import { StatusChip } from '@/components/status-chip';
import { useWorkerDues, useSubmitDuesDisputeMutation } from '@/services/worker-service';
import { directionalText, rowDirection } from '@/theme/layout';
import { tokens } from '@/theme/tokens';
import type { DuesDisputeReason, DuesPayment } from '@/types/domain';

function DuesStatusBanner({ outstanding, overdue }: { outstanding: number; overdue: boolean }) {
  const { t } = useTranslation();
  if (overdue) {
    return (
      <View style={{ backgroundColor: tokens.statusErrorBg, borderWidth: 1, borderColor: tokens.statusError, borderRadius: 12, padding: 14, flexDirection: rowDirection(), alignItems: 'center', gap: 10 }}>
        <AlertCircle size={20} color={tokens.statusError} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: tokens.statusError, fontWeight: '900', fontSize: 14 }}>{t('workerPortal.dues.overdueTitle')}</Text>
          <Text style={{ color: tokens.statusError, fontSize: 12, lineHeight: 18 }}>
            {t('workerPortal.dues.overdueBody', { outstanding })}
          </Text>
        </View>
      </View>
    );
  }
  if (outstanding > 0) {
    return (
      <View style={{ backgroundColor: tokens.statusWarningBg, borderWidth: 1, borderColor: tokens.statusWarning, borderRadius: 12, padding: 12, flexDirection: rowDirection(), alignItems: 'center', gap: 10 }}>
        <AlertCircle size={18} color={tokens.statusWarning} />
        <Text style={{ flex: 1, color: tokens.statusWarning, fontSize: 13, fontWeight: '800' }}>
          {t('workerPortal.dues.pendingBody', { outstanding })}
        </Text>
      </View>
    );
  }
  return (
    <View style={{ backgroundColor: tokens.statusSuccessBg, borderWidth: 1, borderColor: tokens.statusSuccess, borderRadius: 12, padding: 12, flexDirection: rowDirection(), alignItems: 'center', gap: 10 }}>
      <CheckCircle2 size={18} color={tokens.statusSuccess} />
      <Text style={{ flex: 1, color: tokens.statusSuccess, fontSize: 13, fontWeight: '800' }}>{t('workerPortal.dues.paidUp')}</Text>
    </View>
  );
}

const DISPUTE_REASONS: Array<{ key: DuesDisputeReason; labelKey: string }> = [
  { key: 'not_deducted', labelKey: 'workerPortal.dues.disputeReasons.notDeducted' },
  { key: 'wrong_amount', labelKey: 'workerPortal.dues.disputeReasons.wrongAmount' },
  { key: 'already_paid', labelKey: 'workerPortal.dues.disputeReasons.alreadyPaid' },
  { key: 'other', labelKey: 'workerPortal.dues.disputeReasons.other' },
];

function DuesReceiptCard({ due, onDispute, isDisputing }: {
  due: DuesPayment;
  onDispute?: (dueId: string, period: string, reason: DuesDisputeReason, description: string) => void;
  isDisputing?: boolean;
}) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState<DuesDisputeReason>('not_deducted');
  const [disputeDescription, setDisputeDescription] = useState('');

  const tone = due.status === 'paid' ? 'success' : due.status === 'overdue' ? 'error' : 'warning';

  return (
    <View style={{ borderRadius: 14, borderWidth: 1, borderColor: due.status === 'overdue' ? `${tokens.statusError}44` : tokens.border, backgroundColor: tokens.card, overflow: 'hidden' }}>
      <Pressable onPress={() => setExpanded(!expanded)} style={{ padding: 12, gap: 6 }}>
        <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 10 }}>
          <ReceiptText size={17} color={due.status === 'paid' ? tokens.statusSuccess : tokens.statusWarning} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: tokens.foreground, fontWeight: '800', fontSize: 13 }}>{t(due.period_key)}</Text>
            <Text style={{ color: tokens.mutedForeground, fontSize: 12 }}>Rs. {due.amount} · {due.employer_deducted ? t('workerPortal.dues.deducted') : t('workerPortal.dues.notDeducted')}</Text>
          </View>
          <StatusChip tone={tone} label={t(`status.dues.${due.status}`)} />
        </View>
      </Pressable>

      {expanded && (
        <View style={{ paddingHorizontal: 12, paddingBottom: 12, borderTopWidth: 1, borderTopColor: tokens.border, paddingTop: 10, gap: 10 }}>
          {/* Receipt detail */}
          {due.receipt ? (
            <View style={{ backgroundColor: tokens.statusSuccessBg, borderRadius: 8, padding: 10, gap: 4 }}>
              <Text style={{ color: tokens.statusSuccess, fontWeight: '900', fontSize: 12 }}>{t('workerPortal.dues.receiptNo', { ref: due.receipt.receipt_no })}</Text>
              <Text style={{ color: tokens.statusSuccess, fontSize: 12 }}>{t('workerPortal.dues.receiptMeta', { date: due.receipt.issued_on, collector: due.receipt.collected_by })}</Text>
            </View>
          ) : (
            <View style={{ backgroundColor: tokens.muted, borderRadius: 8, padding: 8 }}>
              <Text style={{ color: tokens.mutedForeground, fontSize: 12, textAlign: 'center' }}>{t('workerPortal.dues.noReceiptDesc')}</Text>
            </View>
          )}

          {/* Employer deduction indicator */}
          <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: due.employer_deducted ? tokens.statusSuccess : tokens.statusWarning }} />
            <Text style={{ color: due.employer_deducted ? tokens.statusSuccess : tokens.statusWarning, fontSize: 12, fontWeight: '800' }}>
              {due.employer_deducted ? t('workerPortal.dues.deductionConfirmed') : t('workerPortal.dues.deductionPending')}
            </Text>
          </View>

          {/* Dispute button */}
          {due.status !== 'paid' && onDispute && (
            <Pressable
              onPress={() => setShowDisputeForm(!showDisputeForm)}
              style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 6, justifyContent: 'center', borderWidth: 1, borderColor: tokens.border, borderRadius: 8, paddingVertical: 8 }}
            >
              <FileWarning size={14} color={tokens.mutedForeground} />
              <Text style={{ color: tokens.mutedForeground, fontSize: 12, fontWeight: '800' }}>{t('workerPortal.dues.disputeBtn')}</Text>
            </Pressable>
          )}

          {/* Dispute form */}
          {showDisputeForm && (
            <View style={{ gap: 8, backgroundColor: tokens.muted, borderRadius: 10, padding: 12 }}>
              <Text style={{ color: tokens.foreground, fontWeight: '800', fontSize: 13 }}>{t('workerPortal.dues.disputeTitle')}</Text>
              <View style={{ flexDirection: rowDirection(), flexWrap: 'wrap', gap: 6 }}>
                {DISPUTE_REASONS.map((r) => (
                  <Pressable
                    key={r.key}
                    onPress={() => setDisputeReason(r.key)}
                    style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: disputeReason === r.key ? tokens.primary : tokens.border, backgroundColor: disputeReason === r.key ? tokens.secondary : tokens.card }}
                  >
                    <Text style={{ color: disputeReason === r.key ? tokens.primary : tokens.mutedForeground, fontSize: 11, fontWeight: '700' }}>{t(r.labelKey)}</Text>
                  </Pressable>
                ))}
              </View>
              <TextInput
                multiline
                placeholder={t('workerPortal.dues.disputePlaceholder')}
                placeholderTextColor={tokens.mutedForeground}
                value={disputeDescription}
                onChangeText={setDisputeDescription}
                style={{ minHeight: 72, borderWidth: 1, borderColor: tokens.border, borderRadius: 8, padding: 10, color: tokens.foreground, textAlignVertical: 'top', backgroundColor: tokens.card, fontSize: 13 }}
              />
              <Pressable
                disabled={isDisputing}
                onPress={() => {
                  onDispute?.(due.id, due.period_key, disputeReason, disputeDescription);
                  setShowDisputeForm(false);
                }}
                style={{ backgroundColor: tokens.primary, borderRadius: 8, paddingVertical: 10, alignItems: 'center', opacity: isDisputing ? 0.5 : 1 }}
              >
                <Text style={{ color: tokens.primaryForeground, fontWeight: '900', fontSize: 13 }}>{t('workerPortal.dues.disputeSubmit')}</Text>
              </Pressable>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

export default function DuesScreen() {
  const { t } = useTranslation();
  const { data = [], isLoading, isError } = useWorkerDues();
  const submitDispute = useSubmitDuesDisputeMutation();

  const outstanding = data.filter((d) => d.status === 'pending' || d.status === 'overdue').length;
  const paid = data.filter((d) => d.status === 'paid').length;
  const hasOverdue = data.some((d) => d.status === 'overdue');
  const lastReceipt = data.find((d) => d.receipt)?.receipt_no;

  return (
    <AppShell>
      <HeaderBar title={t('worker.dues')} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <DataState loading={isLoading} error={isError} empty={data.length === 0} loadingLabel={t('states.loading')} errorLabel={t('states.error')} emptyLabel={t('workerPortal.dues.empty')}>
          {/* Status Banner */}
          <DuesStatusBanner outstanding={outstanding} overdue={hasOverdue} />

          {/* Metrics */}
          <View style={{ flexDirection: rowDirection(), gap: 10 }}>
            <MetricCard icon={CreditCard} label={t('workerPortal.dues.outstanding')} value={String(outstanding)} tone={outstanding ? (hasOverdue ? 'error' : 'warning') : 'success'} />
            <MetricCard icon={WalletCards} label={t('workerPortal.dues.paidMonths')} value={String(paid)} tone="success" />
          </View>

          {/* Summary */}
          <SectionCard title={t('workerPortal.dues.summary')}>
            <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 8 }}>
              <ReceiptText size={18} color={tokens.primary} />
              <Text style={{ flex: 1, color: tokens.mutedForeground, ...directionalText('800') }}>{t('workerPortal.dues.latestReceipt')}</Text>
              <StatusChip tone={lastReceipt ? 'success' : 'warning'} label={lastReceipt ?? t('common.pending')} />
            </View>
            <Text style={{ color: tokens.mutedForeground, fontSize: 12, lineHeight: 18, ...directionalText() }}>
              {t('workerPortal.dues.employerDeduction')}
            </Text>
          </SectionCard>

          {/* Dispute success */}
          {submitDispute.data && (
            <View style={{ backgroundColor: tokens.statusSuccessBg, borderRadius: 8, padding: 12, borderWidth: 1, borderColor: tokens.statusSuccess }}>
              <Text style={{ color: tokens.statusSuccess, fontWeight: '800', fontSize: 13, textAlign: 'center' }}>
                {t('workerPortal.dues.disputeSuccess', { ref: submitDispute.data.disputeRef })}
              </Text>
            </View>
          )}

          {/* Ledger */}
          <SectionCard title={t('workerPortal.dues.ledger')}>
            <View style={{ gap: 10 }}>
              {data.map((due) => (
                <DuesReceiptCard
                  key={due.id}
                  due={due}
                  onDispute={(dueId, period, reason, description) =>
                    submitDispute.mutate({ dues_id: dueId, period, reason, description })
                  }
                  isDisputing={submitDispute.isPending}
                />
              ))}
            </View>
          </SectionCard>
        </DataState>
      </ScrollView>
    </AppShell>
  );
}
