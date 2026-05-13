import { useState, type ComponentType } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { AlertTriangle, BadgeCheck, Banknote, CalendarClock, CheckCircle2, ChevronDown, ChevronUp, FileCheck2, FileText, Gavel, HandCoins, Heart, Landmark, ReceiptText, Scale, ShieldCheck, UserRoundCheck, XCircle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '@/components/section-card';
import { StatusChip } from '@/components/status-chip';
import { SourceNote } from '@/features/union-admin-core/components';
import { directionalText, isRtlLanguage, rowDirection } from '@/theme/layout';
import { tokens } from '@/theme/tokens';
import { unionAdminTheme } from '@/theme/union-admin';
import { formatDate } from '@/utils/date';
import type { AnnualReturnDraft, AnnualReturnStep, CandidateNomination, CharterDemand, EmployerRemittance, FinanceLedgerLineItem, LegalCase, LegalEscalationDraft, LegalForumType, NegotiationEvent, UnionGrievanceCase, WelfareClaimCase } from '@/types/domain';

type IconType = ComponentType<{ size?: number; color?: string }>;

const priorityAccent = {
  normal: tokens.statusNeutral,
  high: tokens.statusWarning,
  urgent: tokens.statusWarning,
  critical: tokens.statusError,
};

const priorityAccentBg = {
  normal: tokens.statusNeutralBg,
  high: tokens.statusWarningBg,
  urgent: tokens.statusWarningBg,
  critical: tokens.statusErrorBg,
};

const complianceTone = {
  current: 'success',
  due_soon: 'warning',
  overdue: 'error',
  missing: 'error',
  draft: 'warning',
} as const;

const remittanceTone = {
  received: 'success',
  pending: 'warning',
  late: 'error',
  missing: 'error',
} as const;

const nominationTone = {
  draft: 'neutral',
  submitted: 'info',
  scrutiny: 'warning',
  accepted: 'success',
  rejected: 'error',
} as const;

const legalTone = {
  filed: 'info',
  hearing_scheduled: 'warning',
  adjourned: 'warning',
  order_issued: 'success',
  closed: 'success',
} as const;

export function ActionButton({ label, icon: Icon, onPress, disabled }: { label: string; icon: IconType; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!disabled }} accessibilityLabel={label} disabled={disabled} onPress={onPress} style={{ opacity: disabled ? 0.5 : 1, minHeight: 46, flexDirection: rowDirection(), alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: unionAdminTheme.navy, borderRadius: 14, paddingHorizontal: 12 }}>
      <Icon size={17} color="#ffffff" />
      <Text style={{ color: '#ffffff', ...directionalText('900') }}>{label}</Text>
    </Pressable>
  );
}

export function RemittanceCard({ remittance }: { remittance: EmployerRemittance }) {
  const { t } = useTranslation();
  return (
    <SectionCard variant="unionAdmin">
      <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 10 }}>
        <ReceiptText size={19} color={tokens.portalUnion} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{remittance.deduction_period}</Text>
          <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText() }}>{t('unionOps.finance.remitMeta', { count: remittance.worker_count, amount: remittance.total_amount })}</Text>
        </View>
        <StatusChip tone={remittanceTone[remittance.status]} label={t(`unionOps.status.remittance.${remittance.status}`)} />
      </View>
      <SourceNote label={t('unionOps.finance.bankRef', { ref: remittance.bank_reference ?? t('common.pending') })} />
    </SectionCard>
  );
}

export function DuesLedgerCard({ item }: { item: { id: string; member_name: string; masked_cnic: string; member_id: string; period: string; amount: number; status: string; receipt_no?: string } }) {
  const { t } = useTranslation();
  return (
    <SectionCard variant="unionAdmin">
      <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 10 }}>
        <Banknote size={19} color={tokens.portalUnion} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{item.member_name}</Text>
          <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText() }}>{item.member_id} - {item.masked_cnic}</Text>
        </View>
        <StatusChip tone={item.status === 'paid' ? 'success' : item.status === 'overdue' ? 'error' : 'warning'} label={t(`status.dues.${item.status}`)} />
      </View>
      <SourceNote label={t('unionOps.finance.ledgerMeta', { period: item.period, amount: item.amount, receipt: item.receipt_no ?? t('workerPortal.dues.noReceipt') })} />
    </SectionCard>
  );
}

export function AnnualReturnStepCard({ step }: { step: AnnualReturnStep }) {
  const { t } = useTranslation();
  return (
    <SectionCard variant="unionAdmin">
      <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 10 }}>
        <FileText size={19} color={tokens.portalUnion} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{t(step.title_key)}</Text>
          <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 6, marginTop: 4 }}>
            <View style={{ flex: 1, height: 4, backgroundColor: tokens.border, borderRadius: 2 }}>
              <View style={{ width: `${step.completion_percent}%`, height: 4, backgroundColor: step.completion_percent === 100 ? tokens.statusSuccess : tokens.primary, borderRadius: 2 }} />
            </View>
            <Text style={{ color: tokens.mutedForeground, fontSize: 10, fontWeight: '800' }}>{step.completion_percent}%</Text>
          </View>
        </View>
        <StatusChip tone={complianceTone[step.status]} label={t(`status.compliance.${step.status}`)} />
      </View>
      <SourceNote label={t(step.source_key)} />
    </SectionCard>
  );
}

// ─── Finance Module Components ────────────────────────────────────────────────

export function FinanceAlertBanner({ days, period }: { days: number; period: string }) {
  if (days <= 0) return null;
  const isUrgent = days >= 10;
  return (
    <View style={{ backgroundColor: isUrgent ? 'rgba(242, 29, 47, 0.08)' : 'rgba(166, 18, 31, 0.08)', borderWidth: 1, borderColor: isUrgent ? unionAdminTheme.red : unionAdminTheme.crimson, borderRadius: 18, padding: 14, flexDirection: rowDirection(), alignItems: 'center', gap: 10 }}>
      <AlertTriangle size={18} color={isUrgent ? tokens.statusError : tokens.statusWarning} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: isUrgent ? unionAdminTheme.red : unionAdminTheme.crimson, fontWeight: '900', fontSize: 13 }}>Remittance Overdue — {period}</Text>
        <Text style={{ color: isUrgent ? unionAdminTheme.red : unionAdminTheme.crimson, fontSize: 12 }}>{days} days since expected receipt. IRA 2012 §14 requires payment within 15 days.</Text>
      </View>
    </View>
  );
}

export function FinanceTabSwitcher({ active, onChange }: { active: 'dues' | 'remittances' | 'welfare'; onChange: (tab: 'dues' | 'remittances' | 'welfare') => void }) {
  const tabs: Array<{ key: 'dues' | 'remittances' | 'welfare'; label: string }> = [
    { key: 'dues', label: 'Dues & Ledger' },
    { key: 'remittances', label: 'Remittances' },
    { key: 'welfare', label: 'Welfare Fund' },
  ];
  return (
    <View style={{ flexDirection: rowDirection(), backgroundColor: unionAdminTheme.light, borderRadius: 14, padding: 4, gap: 4, borderWidth: 1, borderColor: unionAdminTheme.border }}>
      {tabs.map((tab) => (
        <Pressable
          key={tab.key}
          accessibilityRole="tab"
          accessibilityState={{ selected: active === tab.key }}
          onPress={() => onChange(tab.key)}
          style={{ flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center', backgroundColor: active === tab.key ? unionAdminTheme.navy : 'transparent' }}
        >
          <Text style={{ fontSize: 11, fontWeight: active === tab.key ? '900' : '700', color: active === tab.key ? '#ffffff' : unionAdminTheme.mutedText }}>{tab.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function RemittanceDetailCard({
  remittance,
  onMarkReceived,
  isMarking,
}: {
  remittance: EmployerRemittance;
  onMarkReceived?: (bankRef: string, date: string) => void;
  isMarking?: boolean;
}) {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [bankRef, setBankRef] = useState('');
  const [date, setDate] = useState('');
  const isLate = remittance.late_days >= 15;

  return (
    <View style={{ borderRadius: 18, borderWidth: 1, borderColor: isLate ? 'rgba(242, 29, 47, 0.24)' : unionAdminTheme.border, backgroundColor: tokens.card, overflow: 'hidden' }}>
      {isLate && <View style={{ height: 3, backgroundColor: unionAdminTheme.red }} />}
      <View style={{ padding: 12, gap: 8 }}>
        <View style={{ flexDirection: rowDirection(), alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: tokens.foreground, fontWeight: '900', fontSize: 14 }}>{remittance.deduction_period}</Text>
            <Text style={{ color: tokens.mutedForeground, fontSize: 12 }}>Rs. {remittance.total_amount.toLocaleString()} — {remittance.worker_count} workers</Text>
          </View>
          <StatusChip tone={remittanceTone[remittance.status]} label={t(`unionOps.status.remittance.${remittance.status}`)} />
        </View>
        {remittance.bank_reference ? (
          <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 6 }}>
            <ReceiptText size={13} color={tokens.mutedForeground} />
            <Text style={{ color: tokens.mutedForeground, fontSize: 12 }}>{remittance.bank_reference}</Text>
          </View>
        ) : null}
        {remittance.late_days > 0 && (
          <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={13} color={isLate ? tokens.statusError : tokens.statusWarning} />
            <Text style={{ color: isLate ? tokens.statusError : tokens.statusWarning, fontSize: 12, fontWeight: '800' }}>{remittance.late_days} days late{isLate ? ' — Statutory violation' : ''}</Text>
          </View>
        )}
        {remittance.status === 'pending' && onMarkReceived && (
          <Pressable
            onPress={() => setShowForm(!showForm)}
            style={{ flexDirection: rowDirection(), alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: unionAdminTheme.navy, borderRadius: 10, paddingVertical: 9 }}
          >
            <CheckCircle2 size={14} color="#ffffff" />
            <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '900' }}>Mark as Received</Text>
            {showForm ? <ChevronUp size={14} color="#ffffff" /> : <ChevronDown size={14} color="#ffffff" />}
          </Pressable>
        )}
        {showForm && (
          <View style={{ gap: 8, paddingTop: 4 }}>
            <TextInput
              placeholder="Bank Reference (e.g. MBL-2026-0512)"
              placeholderTextColor={tokens.mutedForeground}
              value={bankRef}
              onChangeText={setBankRef}
              style={{ borderWidth: 1, borderColor: tokens.border, borderRadius: 8, padding: 10, color: tokens.foreground, fontSize: 13, backgroundColor: tokens.background }}
            />
            <TextInput
              placeholder="Received Date (YYYY-MM-DD)"
              placeholderTextColor={tokens.mutedForeground}
              value={date}
              onChangeText={setDate}
              style={{ borderWidth: 1, borderColor: tokens.border, borderRadius: 8, padding: 10, color: tokens.foreground, fontSize: 13, backgroundColor: tokens.background }}
            />
            <Pressable
              disabled={!bankRef || !date || isMarking}
              onPress={() => { onMarkReceived?.(bankRef, date); setShowForm(false); }}
              style={{ backgroundColor: tokens.statusSuccess, borderRadius: 8, paddingVertical: 10, alignItems: 'center', opacity: (!bankRef || !date || isMarking) ? 0.5 : 1 }}
            >
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: 13 }}>Confirm Receipt</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

export function DuesLedgerCardEnhanced({ item, onRecord, isRecording }: {
  item: { id: string; member_name: string; masked_cnic: string; member_id: string; period: string; amount: number; status: string; receipt_no?: string };
  onRecord?: (memberId: string, period: string) => void;
  isRecording?: boolean;
}) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const toneMap: Record<string, 'success' | 'warning' | 'error'> = { paid: 'success', pending: 'warning', overdue: 'error' };
  const tone = toneMap[item.status] ?? 'warning';

  return (
    <View style={{ borderRadius: 12, borderWidth: 1, borderColor: tone === 'error' ? `${tokens.statusError}44` : tokens.border, backgroundColor: tokens.card, overflow: 'hidden' }}>
      <Pressable onPress={() => setExpanded(!expanded)} style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 10, padding: 12 }}>
        <Banknote size={17} color={tokens.portalUnion} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: tokens.foreground, fontWeight: '800', fontSize: 13 }}>{item.member_name}</Text>
          <Text style={{ color: tokens.mutedForeground, fontSize: 11 }}>{item.member_id} · {item.period} · Rs. {item.amount}</Text>
        </View>
        <StatusChip tone={tone} label={t(`status.dues.${item.status}`)} />
      </Pressable>
      {expanded && (
        <View style={{ paddingHorizontal: 12, paddingBottom: 12, borderTopWidth: 1, borderTopColor: tokens.border, gap: 8, paddingTop: 8 }}>
          <Text style={{ color: tokens.mutedForeground, fontSize: 12 }}>CNIC: {item.masked_cnic}</Text>
          {item.receipt_no ? (
            <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 6 }}>
              <ReceiptText size={13} color={tokens.statusSuccess} />
              <Text style={{ color: tokens.statusSuccess, fontSize: 12, fontWeight: '800' }}>Receipt: {item.receipt_no}</Text>
            </View>
          ) : null}
          {(item.status === 'pending' || item.status === 'overdue') && onRecord && (
            <Pressable
              disabled={isRecording}
              onPress={() => onRecord(item.member_id, item.period)}
              style={{ backgroundColor: tokens.primary, borderRadius: 8, paddingVertical: 8, alignItems: 'center', opacity: isRecording ? 0.5 : 1 }}
            >
              <Text style={{ color: tokens.primaryForeground, fontSize: 12, fontWeight: '900' }}>Record Dues Payment</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const welfareClaimIcon: Record<string, typeof Heart> = {
  medical: Heart,
  death_grant: ShieldCheck,
  hardship: HandCoins,
  education: FileText,
  other: FileText,
};

const welfareTone = {
  pending: 'warning',
  approved: 'info',
  paid: 'success',
  rejected: 'error',
} as const;

export function WelfareCaseCard({
  claim,
  onApprove,
  onReject,
  isActing,
}: {
  claim: WelfareClaimCase;
  onApprove?: (caseId: string, amount: number) => void;
  onReject?: (caseId: string) => void;
  isActing?: boolean;
}) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [approvedAmount, setApprovedAmount] = useState(String(claim.amount_requested));
  const Icon = welfareClaimIcon[claim.claim_type] ?? FileText;

  return (
    <View style={{ borderRadius: 14, borderWidth: 1, borderColor: claim.status === 'pending' ? `${tokens.statusWarning}55` : tokens.border, backgroundColor: tokens.card, overflow: 'hidden' }}>
      <Pressable onPress={() => setExpanded(!expanded)} style={{ padding: 12, gap: 8 }}>
        <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 10 }}>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: tokens.muted, alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={18} color={tokens.portalUnion} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: tokens.foreground, fontWeight: '900', fontSize: 13 }}>{claim.member_name}</Text>
            <Text style={{ color: tokens.mutedForeground, fontSize: 12 }}>{claim.claim_type.replace('_', ' ')} — Rs. {claim.amount_requested.toLocaleString()}</Text>
          </View>
          <StatusChip tone={welfareTone[claim.status]} label={claim.status} />
        </View>
      </Pressable>
      {expanded && (
        <View style={{ paddingHorizontal: 12, paddingBottom: 12, borderTopWidth: 1, borderTopColor: tokens.border, paddingTop: 10, gap: 10 }}>
          <Text style={{ color: tokens.foreground, fontSize: 13, lineHeight: 19 }}>{claim.reason}</Text>
          <Text style={{ color: tokens.mutedForeground, fontSize: 11 }}>Submitted: {formatDate(claim.submitted_on)} · CNIC: {claim.masked_cnic}</Text>
          {claim.payment_ref ? <Text style={{ color: tokens.statusSuccess, fontSize: 12, fontWeight: '800' }}>Payment Ref: {claim.payment_ref}</Text> : null}
          {claim.status === 'pending' && onApprove && onReject && (
            <View style={{ gap: 8 }}>
              <TextInput
                keyboardType="numeric"
                value={approvedAmount}
                onChangeText={setApprovedAmount}
                placeholder="Approved Amount (Rs.)"
                placeholderTextColor={tokens.mutedForeground}
                style={{ borderWidth: 1, borderColor: tokens.border, borderRadius: 8, padding: 10, color: tokens.foreground, fontSize: 13, backgroundColor: tokens.background }}
              />
              <View style={{ flexDirection: rowDirection(), gap: 8 }}>
                <Pressable
                  disabled={isActing}
                  onPress={() => onApprove(claim.id, Number(approvedAmount))}
                  style={{ flex: 1, backgroundColor: tokens.statusSuccess, borderRadius: 8, paddingVertical: 10, alignItems: 'center', opacity: isActing ? 0.5 : 1 }}
                >
                  <Text style={{ color: '#fff', fontWeight: '900', fontSize: 12 }}>Approve & Pay</Text>
                </Pressable>
                <Pressable
                  disabled={isActing}
                  onPress={() => onReject(claim.id)}
                  style={{ flex: 1, backgroundColor: tokens.card, borderWidth: 1, borderColor: tokens.statusError, borderRadius: 8, paddingVertical: 10, alignItems: 'center', opacity: isActing ? 0.5 : 1 }}
                >
                  <Text style={{ color: tokens.statusError, fontWeight: '800', fontSize: 12 }}>Reject</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

// ─── Annual Return Components ──────────────────────────────────────────────────

const lineItemColor: Record<string, string> = {
  dues_income: tokens.statusSuccess,
  grants: tokens.statusSuccess,
  misc_income: tokens.statusSuccess,
  admin_expense: tokens.statusWarning,
  legal_expense: tokens.statusError,
  welfare_paid: tokens.portalWorker,
  misc_expense: tokens.statusWarning,
};

export function AnnualReturnLineItemRow({ item }: { item: FinanceLedgerLineItem }) {
  const isIncome = ['dues_income', 'grants', 'misc_income'].includes(item.category);
  return (
    <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 8, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: tokens.border }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: lineItemColor[item.category] ?? tokens.mutedForeground }} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: tokens.foreground, fontSize: 13 }}>{item.description}</Text>
        {item.reference ? <Text style={{ color: tokens.mutedForeground, fontSize: 11 }}>Ref: {item.reference}</Text> : null}
      </View>
      <Text style={{ color: isIncome ? tokens.statusSuccess : tokens.statusError, fontWeight: '900', fontSize: 13 }}>{isIncome ? '+' : '-'}Rs. {item.amount.toLocaleString()}</Text>
    </View>
  );
}

export function KhalfiaBiyanSection({ data }: { data: AnnualReturnDraft }) {
  const [show, setShow] = useState(false);
  const balanceCheck = data.total_income - data.total_expenditure;
  const balanced = Math.abs(balanceCheck - data.closing_balance) < 1;

  return (
    <View style={{ borderRadius: 14, borderWidth: 1, borderColor: balanced ? `${tokens.statusSuccess}55` : `${tokens.statusError}55`, backgroundColor: tokens.card, overflow: 'hidden' }}>
      <Pressable onPress={() => setShow(!show)} style={{ padding: 14, flexDirection: rowDirection(), alignItems: 'center', gap: 10 }}>
        <FileCheck2 size={20} color={tokens.portalUnion} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: tokens.foreground, fontWeight: '900', fontSize: 15 }}>Khalfiya Biyan — Balance Statement</Text>
          <Text style={{ color: tokens.mutedForeground, fontSize: 12 }}>FY {data.fiscal_year} · {balanced ? 'Balanced ✓' : 'Imbalance detected'}</Text>
        </View>
        {show ? <ChevronUp size={16} color={tokens.mutedForeground} /> : <ChevronDown size={16} color={tokens.mutedForeground} />}
      </Pressable>
      {show && (
        <View style={{ paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1, borderTopColor: tokens.border, gap: 12 }}>
          <View style={{ gap: 4 }}>
            <Text style={{ color: tokens.foreground, fontWeight: '900', fontSize: 13 }}>Income</Text>
            {data.income_line_items.map((item) => <AnnualReturnLineItemRow key={item.id} item={item} />)}
            <View style={{ flexDirection: rowDirection(), justifyContent: 'space-between', paddingTop: 4 }}>
              <Text style={{ color: tokens.statusSuccess, fontWeight: '900' }}>Total Income</Text>
              <Text style={{ color: tokens.statusSuccess, fontWeight: '900' }}>Rs. {data.total_income.toLocaleString()}</Text>
            </View>
          </View>
          <View style={{ height: 1, backgroundColor: tokens.border }} />
          <View style={{ gap: 4 }}>
            <Text style={{ color: tokens.foreground, fontWeight: '900', fontSize: 13 }}>Expenditure</Text>
            {data.expense_line_items.map((item) => <AnnualReturnLineItemRow key={item.id} item={item} />)}
            <View style={{ flexDirection: rowDirection(), justifyContent: 'space-between', paddingTop: 4 }}>
              <Text style={{ color: tokens.statusError, fontWeight: '900' }}>Total Expenditure</Text>
              <Text style={{ color: tokens.statusError, fontWeight: '900' }}>Rs. {data.total_expenditure.toLocaleString()}</Text>
            </View>
          </View>
          <View style={{ height: 1, backgroundColor: tokens.border }} />
          <View style={{ flexDirection: rowDirection(), justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: tokens.foreground, fontWeight: '900', fontSize: 14 }}>Closing Balance</Text>
            <Text style={{ color: balanced ? tokens.statusSuccess : tokens.statusError, fontWeight: '900', fontSize: 16 }}>Rs. {data.closing_balance.toLocaleString()}</Text>
          </View>
          {!balanced && (
            <View style={{ backgroundColor: tokens.statusErrorBg, borderRadius: 8, padding: 8 }}>
              <Text style={{ color: tokens.statusError, fontSize: 12, fontWeight: '800' }}>Equation error: Income − Expenditure ≠ Closing Balance. Review line items before GS/FS signature.</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

export function DualApprovalProgress({ gsApprovedAt, fsApprovedAt }: { gsApprovedAt?: string; fsApprovedAt?: string }) {
  return (
    <View style={{ backgroundColor: tokens.card, borderRadius: 14, borderWidth: 1, borderColor: tokens.border, padding: 14, gap: 12 }}>
      <Text style={{ color: tokens.foreground, fontWeight: '900', fontSize: 14 }}>Dual Approval Required</Text>
      <View style={{ gap: 8 }}>
        {[
          { role: 'General Secretary', approvedAt: gsApprovedAt, icon: UserRoundCheck },
          { role: 'Finance Secretary', approvedAt: fsApprovedAt, icon: FileCheck2 },
        ].map(({ role, approvedAt, icon: Icon }) => (
          <View key={role} style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 10 }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: approvedAt ? tokens.statusSuccessBg : tokens.muted }}>
              <Icon size={18} color={approvedAt ? tokens.statusSuccess : tokens.mutedForeground} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: tokens.foreground, fontWeight: '800', fontSize: 13 }}>{role}</Text>
              <Text style={{ color: approvedAt ? tokens.statusSuccess : tokens.mutedForeground, fontSize: 12 }}>{approvedAt ? `Approved ${formatDate(approvedAt)}` : 'Pending approval'}</Text>
            </View>
            {approvedAt ? <CheckCircle2 size={18} color={tokens.statusSuccess} /> : <XCircle size={18} color={tokens.mutedForeground} />}
          </View>
        ))}
      </View>
    </View>
  );
}

export function ElectionTimelineCard({ label, date, tone }: { label: string; date: string; tone: 'info' | 'warning' | 'success' }) {
  return (
    <View style={{ flex: 1, minHeight: 78, borderWidth: 1, borderColor: tokens.border, borderRadius: 12, padding: 10, backgroundColor: tokens.card, gap: 6 }}>
      <CalendarClock size={17} color={tone === 'warning' ? tokens.statusWarning : tone === 'success' ? tokens.statusSuccess : tokens.statusInfo} />
      <Text style={{ color: tokens.mutedForeground, fontSize: 11, ...directionalText('800') }}>{label}</Text>
      <Text style={{ color: tokens.foreground, fontWeight: '900', writingDirection: 'ltr', textAlign: 'left' }}>{formatDate(date)}</Text>
    </View>
  );
}

export function NominationCard({ nomination }: { nomination: CandidateNomination }) {
  const { t } = useTranslation();
  return (
    <SectionCard>
      <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 10 }}>
        <BadgeCheck size={19} color={tokens.portalUnion} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{nomination.candidate_name}</Text>
          <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText() }}>{nomination.position} - {nomination.masked_cnic}</Text>
        </View>
        <StatusChip tone={nominationTone[nomination.status]} label={t(`unionOps.status.nomination.${nomination.status}`)} />
      </View>
      <SourceNote label={t('unionOps.elections.nominationMeta', { nominator: nomination.nominator_name, seconder: nomination.seconder_name })} />
      <Text style={{ color: tokens.mutedForeground, fontSize: 12, lineHeight: 18, ...directionalText() }}>{t(nomination.manifesto_key)}</Text>
    </SectionCard>
  );
}

export function DemandCard({ demand }: { demand: CharterDemand }) {
  const { t } = useTranslation();
  return (
    <SectionCard>
      <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 10 }}>
        <Scale size={19} color={tokens.portalUnion} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{t(demand.title_key)}</Text>
          <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText() }}>{t(`unionOps.cba.categories.${demand.category}`)}</Text>
        </View>
        <StatusChip tone="info" label={t(`unionOps.status.cod.${demand.stage}`)} />
      </View>
      <Text style={{ color: tokens.mutedForeground, fontSize: 12, lineHeight: 18, ...directionalText() }}>{t(demand.justification_key)}</Text>
    </SectionCard>
  );
}

export function NegotiationTimeline({ events }: { events: NegotiationEvent[] }) {
  const { t } = useTranslation();
  return (
    <View style={{ gap: 10 }}>
      {events.map((event) => (
        <View key={event.id} style={{ flexDirection: rowDirection(), gap: 10 }}>
          <CheckCircle2 size={18} color={event.status === 'current' ? tokens.statusSuccess : tokens.statusWarning} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{t(event.title_key)}</Text>
            <Text style={{ color: tokens.mutedForeground, fontSize: 12, lineHeight: 18, ...directionalText() }}>{t(event.description_key)} - <Text style={{ writingDirection: 'ltr' }}>{formatDate(event.date)}</Text></Text>
          </View>
        </View>
      ))}
    </View>
  );
}

export function SlaChip({ deadline }: { deadline: string }) {
  const { t } = useTranslation();
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const tone: 'error' | 'warning' | 'neutral' = days < 0 ? 'error' : days <= 3 ? 'warning' : 'neutral';
  const label = days < 0
    ? t('unionOps.legal.slaOverdue', { days: Math.abs(days) })
    : days === 0
      ? t('unionOps.legal.slaToday')
      : t('unionOps.legal.slaDays', { days });
  return <StatusChip tone={tone} label={label} />;
}

const GRIEVANCE_STATUSES: import('@/types/domain').GrievanceStatus[] = ['triage', 'investigating', 'escalated', 'resolved'];

export function GrievanceFilterTabs({
  active,
  onSelect,
  counts,
}: {
  active: string;
  onSelect: (s: string) => void;
  counts: Record<string, number>;
}) {
  const { t } = useTranslation();
  const filters = [
    { key: 'all', label: t('common.all') },
    { key: 'triage', label: t('status.grievance.triage') },
    { key: 'investigating', label: t('status.grievance.investigating') },
    { key: 'escalated', label: t('status.grievance.escalated') },
    { key: 'resolved', label: t('status.grievance.resolved') },
  ];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 4 }}>
      {filters.map((f) => {
        const isActive = active === f.key;
        const count = f.key === 'all' ? Object.values(counts).reduce((a, b) => a + b, 0) : (counts[f.key] ?? 0);
        return (
          <Pressable
            key={f.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => onSelect(f.key)}
            style={{
              flexDirection: rowDirection(),
              alignItems: 'center',
              gap: 5,
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 20,
              backgroundColor: isActive ? tokens.primary : tokens.muted,
              borderWidth: 1,
              borderColor: isActive ? tokens.primary : tokens.border,
            }}
          >
            <Text style={{ color: isActive ? tokens.primaryForeground : tokens.mutedForeground, fontSize: 12, fontWeight: '800' }}>
              {f.label}
            </Text>
            {count > 0 && (
              <View style={{ backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : tokens.border, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 }}>
                <Text style={{ color: isActive ? tokens.primaryForeground : tokens.mutedForeground, fontSize: 10, fontWeight: '900' }}>{count}</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const FORUM_PRESETS: Record<LegalForumType, string> = {
  labour_court: 'Labour Court Lahore',
  conciliation: 'Conciliation Office Lahore',
  nirc: 'NIRC Lahore',
  plat: 'PLAT Lahore',
};

const AGENDA_OPTIONS = [
  { key: 'unionOps.legal.hearings.agendaNotice', label: 'First Hearing / Notice' },
  { key: 'unionOps.legal.hearings.agendaEvidence', label: 'Evidence Submission' },
  { key: 'unionOps.legal.hearings.agendaArguments', label: 'Arguments' },
  { key: 'unionOps.legal.hearings.agendaFinalArgs', label: 'Final Arguments' },
  { key: 'unionOps.legal.hearings.agendaOrderReserved', label: 'Order Reserved' },
  { key: 'unionOps.legal.hearings.agendaGeneral', label: 'General' },
];

const OUTCOME_OPTIONS = [
  { key: 'unionOps.legal.hearings.outcomeAdjourned', label: 'Adjourned' },
  { key: 'unionOps.legal.hearings.outcomeEvidence', label: 'Evidence Submitted' },
  { key: 'unionOps.legal.hearings.outcomeOrder', label: 'Order Issued' },
  { key: 'unionOps.legal.hearings.outcomeSettled', label: 'Case Settled' },
];

function HearingLogForm({ caseId, defaultForum, onConfirm, onCancel, isLoading }: {
  caseId: string;
  defaultForum: string;
  onConfirm: (params: { caseId: string; hearingDate: string; hearingTime: string; forum: string; agendaKey: string; outcomeKey?: string }) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [forum, setForum] = useState(defaultForum);
  const [agendaKey, setAgendaKey] = useState(AGENDA_OPTIONS[0]?.key ?? '');
  const [outcomeKey, setOutcomeKey] = useState('');
  const rtl = isRtlLanguage();

  return (
    <View style={{ gap: 10, backgroundColor: tokens.muted, borderRadius: 12, padding: 12 }}>
      <Text style={{ color: tokens.foreground, fontSize: 12, fontWeight: '800' }}>📅 Log Hearing</Text>
      <View style={{ flexDirection: rowDirection(), gap: 8 }}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ color: tokens.mutedForeground, fontSize: 10, fontWeight: '700' }}>Date (YYYY-MM-DD)</Text>
          <TextInput value={date} onChangeText={setDate} placeholder="2026-05-22" placeholderTextColor={tokens.mutedForeground} keyboardType="numbers-and-punctuation" style={{ backgroundColor: tokens.card, borderWidth: 1, borderColor: tokens.border, borderRadius: 8, padding: 8, color: tokens.foreground, fontSize: 13, writingDirection: 'ltr' }} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ color: tokens.mutedForeground, fontSize: 10, fontWeight: '700' }}>Time (HH:MM)</Text>
          <TextInput value={time} onChangeText={setTime} placeholder="10:00" placeholderTextColor={tokens.mutedForeground} keyboardType="numbers-and-punctuation" style={{ backgroundColor: tokens.card, borderWidth: 1, borderColor: tokens.border, borderRadius: 8, padding: 8, color: tokens.foreground, fontSize: 13, writingDirection: 'ltr' }} />
        </View>
      </View>
      <View style={{ gap: 4 }}>
        <Text style={{ color: tokens.mutedForeground, fontSize: 10, fontWeight: '700' }}>Forum</Text>
        <TextInput value={forum} onChangeText={setForum} placeholderTextColor={tokens.mutedForeground} style={{ backgroundColor: tokens.card, borderWidth: 1, borderColor: tokens.border, borderRadius: 8, padding: 8, color: tokens.foreground, fontSize: 13 }} />
      </View>
      <View style={{ gap: 4 }}>
        <Text style={{ color: tokens.mutedForeground, fontSize: 10, fontWeight: '700' }}>Agenda</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          {AGENDA_OPTIONS.map((a) => (
            <Pressable key={a.key} onPress={() => setAgendaKey(a.key)} style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: agendaKey === a.key ? tokens.primary : tokens.card, borderWidth: 1, borderColor: agendaKey === a.key ? tokens.primary : tokens.border }}>
              <Text style={{ color: agendaKey === a.key ? tokens.primaryForeground : tokens.mutedForeground, fontSize: 11, fontWeight: '700' }}>{a.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      <View style={{ gap: 4 }}>
        <Text style={{ color: tokens.mutedForeground, fontSize: 10, fontWeight: '700' }}>Outcome (optional)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          {OUTCOME_OPTIONS.map((o) => (
            <Pressable key={o.key} onPress={() => setOutcomeKey(outcomeKey === o.key ? '' : o.key)} style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: outcomeKey === o.key ? tokens.statusWarningBg : tokens.card, borderWidth: 1, borderColor: outcomeKey === o.key ? tokens.statusWarning : tokens.border }}>
              <Text style={{ color: outcomeKey === o.key ? tokens.statusWarning : tokens.mutedForeground, fontSize: 11, fontWeight: '700' }}>{o.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      <View style={{ flexDirection: rowDirection(), gap: 8 }}>
        <Pressable disabled={!date || isLoading} onPress={() => { if (date) onConfirm({ caseId, hearingDate: date, hearingTime: time, forum, agendaKey, outcomeKey: outcomeKey || undefined }); }} style={{ flex: 1, alignItems: 'center', backgroundColor: tokens.primary, borderRadius: 8, paddingVertical: 10, opacity: (!date || isLoading) ? 0.5 : 1 }}>
          <Text style={{ color: tokens.primaryForeground, fontSize: 12, fontWeight: '900' }}>Save Hearing</Text>
        </Pressable>
        <Pressable onPress={onCancel} style={{ flex: 1, alignItems: 'center', backgroundColor: tokens.muted, borderRadius: 8, paddingVertical: 10, borderWidth: 1, borderColor: tokens.border }}>
          <Text style={{ color: tokens.mutedForeground, fontSize: 12, fontWeight: '800' }}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

function EscalationForm({ grievanceId, onConfirm, onCancel, isLoading }: {
  grievanceId: string;
  onConfirm: (draft: LegalEscalationDraft) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [forumType, setForumType] = useState<LegalForumType>('labour_court');
  const [forumName, setForumName] = useState(FORUM_PRESETS.labour_court);
  const [parties, setParties] = useState('');
  const [advocate, setAdvocate] = useState('Adv. Salman Mirza');
  const [note, setNote] = useState('');

  function handleForumTypeSelect(type: LegalForumType) {
    setForumType(type);
    setForumName(FORUM_PRESETS[type]);
  }

  const FORUM_LABELS: Record<LegalForumType, string> = {
    labour_court: 'Labour Court',
    conciliation: 'Conciliation',
    nirc: 'NIRC',
    plat: 'PLAT',
  };

  return (
    <View style={{ gap: 10, backgroundColor: tokens.statusErrorBg, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: `${tokens.statusError}44` }}>
      <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 6 }}>
        <Gavel size={14} color={tokens.statusError} />
        <Text style={{ color: tokens.statusError, fontSize: 13, fontWeight: '900' }}>Create Legal Case</Text>
      </View>
      <View style={{ gap: 4 }}>
        <Text style={{ color: tokens.mutedForeground, fontSize: 10, fontWeight: '700' }}>Forum Type</Text>
        <View style={{ flexDirection: rowDirection(), gap: 6, flexWrap: 'wrap' }}>
          {(Object.keys(FORUM_LABELS) as LegalForumType[]).map((type) => (
            <Pressable key={type} onPress={() => handleForumTypeSelect(type)} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: forumType === type ? tokens.primary : tokens.card, borderWidth: 1, borderColor: forumType === type ? tokens.primary : tokens.border }}>
              <Text style={{ color: forumType === type ? tokens.primaryForeground : tokens.mutedForeground, fontSize: 11, fontWeight: '800' }}>{FORUM_LABELS[type]}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={{ gap: 4 }}>
        <Text style={{ color: tokens.mutedForeground, fontSize: 10, fontWeight: '700' }}>Forum Name</Text>
        <TextInput value={forumName} onChangeText={setForumName} placeholderTextColor={tokens.mutedForeground} style={{ backgroundColor: tokens.card, borderWidth: 1, borderColor: tokens.border, borderRadius: 8, padding: 8, color: tokens.foreground, fontSize: 13 }} />
      </View>
      <View style={{ gap: 4 }}>
        <Text style={{ color: tokens.mutedForeground, fontSize: 10, fontWeight: '700' }}>Parties (e.g. Worker vs Employer)</Text>
        <TextInput value={parties} onChangeText={setParties} placeholder="Worker vs LWMC" placeholderTextColor={tokens.mutedForeground} style={{ backgroundColor: tokens.card, borderWidth: 1, borderColor: tokens.border, borderRadius: 8, padding: 8, color: tokens.foreground, fontSize: 13 }} />
      </View>
      <View style={{ gap: 4 }}>
        <Text style={{ color: tokens.mutedForeground, fontSize: 10, fontWeight: '700' }}>Assigned Advocate</Text>
        <TextInput value={advocate} onChangeText={setAdvocate} placeholderTextColor={tokens.mutedForeground} style={{ backgroundColor: tokens.card, borderWidth: 1, borderColor: tokens.border, borderRadius: 8, padding: 8, color: tokens.foreground, fontSize: 13 }} />
      </View>
      <View style={{ gap: 4 }}>
        <Text style={{ color: tokens.mutedForeground, fontSize: 10, fontWeight: '700' }}>Escalation Note (optional)</Text>
        <TextInput value={note} onChangeText={setNote} placeholder="Reason for escalation..." placeholderTextColor={tokens.mutedForeground} multiline style={{ backgroundColor: tokens.card, borderWidth: 1, borderColor: tokens.border, borderRadius: 8, padding: 8, color: tokens.foreground, fontSize: 13, minHeight: 56, textAlignVertical: 'top' }} />
      </View>
      <View style={{ flexDirection: rowDirection(), gap: 8 }}>
        <Pressable disabled={!parties || isLoading} onPress={() => { if (parties) onConfirm({ grievance_id: grievanceId, forum_type: forumType, forum_name: forumName, parties, assigned_advocate: advocate || undefined, escalation_note: note || undefined }); }} style={{ flex: 1, alignItems: 'center', backgroundColor: tokens.statusError, borderRadius: 8, paddingVertical: 10, opacity: (!parties || isLoading) ? 0.5 : 1 }}>
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '900' }}>Create Legal Case</Text>
        </Pressable>
        <Pressable onPress={onCancel} style={{ flex: 1, alignItems: 'center', backgroundColor: tokens.muted, borderRadius: 8, paddingVertical: 10, borderWidth: 1, borderColor: tokens.border }}>
          <Text style={{ color: tokens.mutedForeground, fontSize: 12, fontWeight: '800' }}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function GrievanceQueueCard({
  grievance,
  legalCase,
  onStatusChange,
  isUpdating,
  onLogHearing,
  isLoggingHearing,
  onEscalate,
  isEscalating,
}: {
  grievance: UnionGrievanceCase;
  legalCase?: LegalCase;
  onStatusChange: (id: string, status: string) => void;
  isUpdating: boolean;
  onLogHearing?: (params: { caseId: string; hearingDate: string; hearingTime: string; forum: string; agendaKey: string; outcomeKey?: string }) => void;
  isLoggingHearing?: boolean;
  onEscalate?: (draft: LegalEscalationDraft) => void;
  isEscalating?: boolean;
}) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showHearingForm, setShowHearingForm] = useState(false);
  const [showEscalationForm, setShowEscalationForm] = useState(false);
  const [showOutcomeForm, setShowOutcomeForm] = useState(false);
  const accent = priorityAccent[grievance.priority] ?? tokens.statusNeutral;
  const accentBg = priorityAccentBg[grievance.priority] ?? tokens.statusNeutralBg;
  const rtl = isRtlLanguage();
  const canEscalate = grievance.status === 'escalated' && !legalCase;

  return (
    <View style={{ borderRadius: 16, shadowColor: accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: grievance.priority === 'critical' ? 0.18 : 0.06, shadowRadius: 12, elevation: 5 }}>
      <View style={{ borderRadius: 16, backgroundColor: tokens.card, borderWidth: 1, borderColor: grievance.priority === 'critical' ? `${accent}44` : tokens.border, overflow: 'hidden' }}>
        <View style={{ position: 'absolute', top: 0, bottom: 0, width: 4, backgroundColor: accent, ...(rtl ? { right: 0 } : { left: 0 }) }} />
        <View style={{ paddingTop: 14, paddingBottom: 12, paddingLeft: rtl ? 12 : 16, paddingRight: rtl ? 16 : 12, gap: 10 }}>
          {/* Row 1: Ref + Priority */}
          <View style={{ flexDirection: rowDirection(), alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: tokens.foreground, fontSize: 15, ...directionalText('900') }}>{grievance.reference_no}</Text>
            <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 6 }}>
              <View style={{ backgroundColor: accentBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                <Text style={{ color: accent, fontSize: 10, fontWeight: '900' }}>{t(`unionOps.status.priority.${grievance.priority}`)}</Text>
              </View>
              <StatusChip tone={grievance.status === 'escalated' ? 'error' : grievance.status === 'resolved' ? 'success' : 'warning'} label={t(`status.grievance.${grievance.status}`)} />
            </View>
          </View>

          {/* Row 2: Worker */}
          <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 8 }}>
            <Gavel size={15} color={tokens.portalUnion} />
            <Text style={{ color: tokens.foreground, fontSize: 13, ...directionalText('800') }}>{grievance.worker_name}</Text>
            <Text style={{ color: tokens.mutedForeground, fontSize: 11, ...directionalText() }}>· {grievance.masked_cnic}</Text>
          </View>

          {/* Row 3: Category + SLA + Legal badge */}
          <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <StatusChip tone="info" label={t(`grievance.categories.${grievance.category}`)} />
            <SlaChip deadline={grievance.sla_deadline} />
            {legalCase && <StatusChip tone="neutral" label={`⚖️ ${legalCase.case_no}`} />}
          </View>

          {/* Row 4: Handler + establishment */}
          <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 6 }}>
            <UserRoundCheck size={13} color={tokens.mutedForeground} />
            <Text style={{ color: tokens.mutedForeground, fontSize: 11, ...directionalText('700') }}>{t('unionOps.legal.handler', { handler: grievance.assigned_handler })}</Text>
            {grievance.establishment_name ? <Text style={{ color: tokens.mutedForeground, fontSize: 11 }}>· {grievance.establishment_name}</Text> : null}
          </View>

          {/* Description (if present) */}
          {grievance.description ? (
            <Text style={{ color: tokens.mutedForeground, fontSize: 12, lineHeight: 18, ...directionalText() }} numberOfLines={2}>{grievance.description}</Text>
          ) : null}

          {/* Status picker */}
          {!showStatusPicker ? (
            <Pressable onPress={() => setShowStatusPicker(true)} style={{ flexDirection: rowDirection(), alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: tokens.muted, borderRadius: 10, paddingVertical: 8, borderWidth: 1, borderColor: tokens.border }}>
              <Gavel size={14} color={tokens.primary} />
              <Text style={{ color: tokens.primary, fontSize: 12, fontWeight: '800' }}>{t('unionOps.legal.updateStatus')}</Text>
            </Pressable>
          ) : (
            <View style={{ gap: 8 }}>
              <Text style={{ color: tokens.mutedForeground, fontSize: 11, fontWeight: '700' }}>{t('unionOps.legal.selectStatus')}</Text>
              <View style={{ flexDirection: rowDirection(), flexWrap: 'wrap', gap: 6 }}>
                {GRIEVANCE_STATUSES.map((s) => (
                  <Pressable key={s} disabled={isUpdating || s === grievance.status} onPress={() => { onStatusChange(grievance.id, s); setShowStatusPicker(false); }} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: s === grievance.status ? tokens.primary : tokens.border, backgroundColor: s === grievance.status ? tokens.primary : tokens.card, opacity: isUpdating ? 0.6 : 1 }}>
                    <Text style={{ color: s === grievance.status ? tokens.primaryForeground : tokens.foreground, fontSize: 11, fontWeight: '800' }}>{t(`status.grievance.${s}`)}</Text>
                  </Pressable>
                ))}
              </View>
              <Pressable onPress={() => setShowStatusPicker(false)} style={{ alignSelf: 'flex-start' }}>
                <Text style={{ color: tokens.mutedForeground, fontSize: 11 }}>{t('common.cancel')}</Text>
              </Pressable>
            </View>
          )}

          {/* Escalation form — shown when escalated but no legal case yet */}
          {canEscalate && !showEscalationForm && (
            <Pressable onPress={() => setShowEscalationForm(true)} style={{ flexDirection: rowDirection(), alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: tokens.statusErrorBg, borderRadius: 10, paddingVertical: 8, borderWidth: 1, borderColor: tokens.statusError }}>
              <Gavel size={14} color={tokens.statusError} />
              <Text style={{ color: tokens.statusError, fontSize: 12, fontWeight: '900' }}>Create Legal Case</Text>
            </Pressable>
          )}
          {canEscalate && showEscalationForm && (
            <EscalationForm grievanceId={grievance.id} onConfirm={(draft) => { onEscalate?.(draft); setShowEscalationForm(false); }} onCancel={() => setShowEscalationForm(false)} isLoading={!!isEscalating} />
          )}

          {/* Legal case panel (if linked) */}
          {legalCase && (
            <View style={{ borderTopWidth: 1, borderTopColor: tokens.border, paddingTop: 10, gap: 8 }}>
              <Pressable onPress={() => setExpanded((v) => !v)} style={{ flexDirection: rowDirection(), alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 7 }}>
                  <Landmark size={15} color={tokens.portalUnion} />
                  <View>
                    <Text style={{ color: tokens.foreground, fontSize: 13, ...directionalText('900') }}>{legalCase.case_no}</Text>
                    <Text style={{ color: tokens.mutedForeground, fontSize: 11, ...directionalText() }}>{legalCase.forum}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 6 }}>
                  <StatusChip tone={legalTone[legalCase.status]} label={t(`unionOps.status.legal.${legalCase.status}`)} />
                  <Text style={{ color: tokens.mutedForeground, fontSize: 16 }}>{expanded ? '▲' : '▼'}</Text>
                </View>
              </Pressable>

              {expanded && (
                <View style={{ gap: 8 }}>
                  {legalCase.assigned_advocate ? (
                    <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 6 }}>
                      <UserRoundCheck size={13} color={tokens.mutedForeground} />
                      <Text style={{ color: tokens.mutedForeground, fontSize: 11 }}>{legalCase.assigned_advocate}</Text>
                    </View>
                  ) : null}
                  {legalCase.next_hearing ? (
                    <View style={{ backgroundColor: tokens.muted, borderRadius: 10, padding: 10, gap: 4 }}>
                      <Text style={{ color: tokens.mutedForeground, fontSize: 10, fontWeight: '700' }}>{t('unionOps.legal.nextHearing')}</Text>
                      <Text style={{ color: tokens.foreground, fontSize: 13, fontWeight: '900', writingDirection: 'ltr' }}>{formatDate(legalCase.next_hearing)}</Text>
                    </View>
                  ) : null}
                  <Text style={{ color: tokens.mutedForeground, fontSize: 11, fontWeight: '700' }}>{t('unionOps.legal.hearingsTitle')} ({legalCase.hearings.length})</Text>
                  {legalCase.hearings.map((h) => (
                    <View key={h.id} style={{ borderWidth: 1, borderColor: tokens.border, borderRadius: 10, padding: 10, backgroundColor: tokens.card, gap: 4 }}>
                      <View style={{ flexDirection: rowDirection(), alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ color: tokens.foreground, fontSize: 12, fontWeight: '800', writingDirection: 'ltr' }}>{formatDate(h.hearing_date)} {h.hearing_time}</Text>
                        {h.outcome_key && <StatusChip tone="warning" label={t(h.outcome_key)} />}
                      </View>
                      <Text style={{ color: tokens.mutedForeground, fontSize: 11, ...directionalText() }}>{h.forum}</Text>
                      <Text style={{ color: tokens.mutedForeground, fontSize: 11, ...directionalText() }}>{t(h.agenda_key)}</Text>
                    </View>
                  ))}
                  {!showHearingForm ? (
                    <Pressable onPress={() => setShowHearingForm(true)} style={{ flexDirection: rowDirection(), alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: tokens.statusSuccessBg, borderRadius: 10, paddingVertical: 8, borderWidth: 1, borderColor: tokens.statusSuccess }}>
                      <CalendarClock size={14} color={tokens.statusSuccess} />
                      <Text style={{ color: tokens.statusSuccess, fontSize: 12, fontWeight: '800' }}>{t('unionOps.legal.logHearingMock')}</Text>
                    </Pressable>
                  ) : (
                    <HearingLogForm caseId={legalCase.id} defaultForum={legalCase.forum} onConfirm={(params) => { onLogHearing?.(params); setShowHearingForm(false); }} onCancel={() => setShowHearingForm(false)} isLoading={!!isLoggingHearing} />
                  )}
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

export function StandaloneLegalCaseCard({
  legalCase,
  onLogHearing,
  isLoggingHearing,
}: {
  legalCase: LegalCase;
  onLogHearing: (params: { caseId: string; hearingDate: string; hearingTime: string; forum: string; agendaKey: string; outcomeKey?: string }) => void;
  isLoggingHearing: boolean;
}) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [showHearingForm, setShowHearingForm] = useState(false);

  return (
    <View style={{ borderRadius: 14, backgroundColor: tokens.card, borderWidth: 1, borderColor: tokens.border, overflow: 'hidden' }}>
      <Pressable onPress={() => setExpanded((v) => !v)} style={{ flexDirection: rowDirection(), alignItems: 'center', justifyContent: 'space-between', padding: 14, gap: 10 }}>
        <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 10, flex: 1 }}>
          <Landmark size={19} color={tokens.portalUnion} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: tokens.foreground, fontSize: 15, ...directionalText('900') }}>{legalCase.case_no}</Text>
            <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText() }}>{legalCase.worker_name} · {legalCase.forum}</Text>
          </View>
        </View>
        <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 6 }}>
          <StatusChip tone={legalTone[legalCase.status]} label={t(`unionOps.status.legal.${legalCase.status}`)} />
          <Text style={{ color: tokens.mutedForeground }}>{expanded ? '▲' : '▼'}</Text>
        </View>
      </Pressable>

      {expanded && (
        <View style={{ paddingHorizontal: 14, paddingBottom: 14, gap: 8, borderTopWidth: 1, borderTopColor: tokens.border }}>
          <View style={{ backgroundColor: tokens.muted, borderRadius: 10, padding: 10, marginTop: 8, gap: 4 }}>
            <Text style={{ color: tokens.mutedForeground, fontSize: 10, fontWeight: '700' }}>{t('unionOps.legal.nextHearing')}</Text>
            {legalCase.next_hearing ? (
              <Text style={{ color: tokens.foreground, fontSize: 14, fontWeight: '900', writingDirection: 'ltr' }}>{legalCase.next_hearing}</Text>
            ) : (
              <Text style={{ color: tokens.mutedForeground, fontSize: 13 }}>Not scheduled yet</Text>
            )}
            <Text style={{ color: tokens.mutedForeground, fontSize: 11, ...directionalText() }}>{legalCase.parties}</Text>
          </View>

          {legalCase.assigned_advocate ? (
            <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 6 }}>
              <UserRoundCheck size={13} color={tokens.mutedForeground} />
              <Text style={{ color: tokens.mutedForeground, fontSize: 11 }}>{legalCase.assigned_advocate}</Text>
            </View>
          ) : null}

          {legalCase.court_order_ref ? (
            <View style={{ backgroundColor: tokens.statusSuccessBg, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: tokens.statusSuccess }}>
              <Text style={{ color: tokens.statusSuccess, fontSize: 11, fontWeight: '800' }}>⚖️ Court Order: {legalCase.court_order_ref}</Text>
              {legalCase.outcome_note ? <Text style={{ color: tokens.mutedForeground, fontSize: 11, marginTop: 2 }}>{legalCase.outcome_note}</Text> : null}
            </View>
          ) : null}

          <Text style={{ color: tokens.mutedForeground, fontSize: 11, fontWeight: '700' }}>{t('unionOps.legal.hearingsTitle')} ({legalCase.hearings.length})</Text>
          {legalCase.hearings.map((h) => (
            <View key={h.id} style={{ borderWidth: 1, borderColor: tokens.border, borderRadius: 10, padding: 10, gap: 4, backgroundColor: tokens.card }}>
              <View style={{ flexDirection: rowDirection(), alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: tokens.foreground, fontSize: 12, fontWeight: '800', writingDirection: 'ltr' }}>{h.hearing_date} {h.hearing_time}</Text>
                {h.outcome_key && <StatusChip tone="warning" label={t(h.outcome_key)} />}
              </View>
              <Text style={{ color: tokens.mutedForeground, fontSize: 11 }}>{h.forum}</Text>
              <Text style={{ color: tokens.mutedForeground, fontSize: 11 }}>{t(h.agenda_key)}</Text>
            </View>
          ))}

          {!showHearingForm ? (
            <Pressable onPress={() => setShowHearingForm(true)} style={{ flexDirection: rowDirection(), alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: tokens.statusSuccessBg, borderRadius: 10, paddingVertical: 9, borderWidth: 1, borderColor: tokens.statusSuccess }}>
              <CalendarClock size={14} color={tokens.statusSuccess} />
              <Text style={{ color: tokens.statusSuccess, fontSize: 12, fontWeight: '800' }}>{t('unionOps.legal.logHearingMock')}</Text>
            </Pressable>
          ) : (
            <HearingLogForm caseId={legalCase.id} defaultForum={legalCase.forum} onConfirm={(params) => { onLogHearing(params); setShowHearingForm(false); }} onCancel={() => setShowHearingForm(false)} isLoading={isLoggingHearing} />
          )}
        </View>
      )}
    </View>
  );
}

// Cleaned up dangling blocks

export function SummaryLine({ icon: Icon, label, value }: { icon: IconType; label: string; value: string }) {
  return (
    <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 8, paddingVertical: 6 }}>
      <Icon size={17} color={tokens.portalUnion} />
      <Text style={{ color: tokens.mutedForeground, flex: 1, ...directionalText('800') }}>{label}</Text>
      <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{value}</Text>
    </View>
  );
}

export const OperationIcons = { ShieldCheck };
