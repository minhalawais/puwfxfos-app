import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View, Pressable, Modal, Switch, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { AppShell } from '@/components/app-shell';
import { DataState } from '@/components/data-state';
import { HeaderBar } from '@/components/header-bar';
import { SectionCard } from '@/components/section-card';
import { StatusChip } from '@/components/status-chip';
import {
  AnnualReturnStepCard,
  ActionButton,
  DualApprovalProgress,
} from '@/features/union-admin-operations/components';
import {
  useApproveAnnualReturnMutation,
  useSubmitAnnualReturnMutation,
  useUnionAnnualReturn,
} from '@/services/union-admin-service';
import { exportFormLPDF, exportFormJPDF, exportAffidavitPDF } from '@/services/pdf-service';
import { AlertCircle, ArrowRight, Banknote, Download, FileCheck2, Info, Send, Users, X, FileText } from 'lucide-react-native';
import { directionalText, rowDirection } from '@/theme/layout';
import { tokens } from '@/theme/tokens';
import type { FinanceLedgerLineItem } from '@/types/domain';

function ExportDocumentCard({ 
  title, 
  subtitle, 
  icon: Icon, 
  onPress, 
  variant = 'primary' 
}: { 
  title: string; 
  subtitle: string; 
  icon: any; 
  onPress: () => Promise<void>; 
  variant?: 'primary' | 'info';
}) {
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    setLoading(true);
    try {
      await onPress();
    } finally {
      setLoading(false);
    }
  };

  const isInfo = variant === 'info';
  const iconBg = isInfo ? (tokens.statusInfoBg || '#EFF6FF') : tokens.statusSuccessBg;
  const iconColor = isInfo ? (tokens.statusInfo || '#2563EB') : tokens.primary;

  return (
    <Pressable onPress={handlePress} disabled={loading}>
      {({ pressed }) => (
        <View style={{
          flexDirection: 'row', // Enforce strict LTR visual layout
          alignItems: 'center',
          backgroundColor: tokens.card,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: tokens.border,
          borderBottomWidth: 3,
          borderBottomColor: iconColor,
          padding: 16,
          gap: 16, // Use gap for spacing instead of margins
          transform: [{ scale: pressed ? 0.98 : 1 }],
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 3,
          opacity: loading ? 0.8 : 1,
        }}>
          {/* Left Side: Document Icon */}
          <View style={{ 
            backgroundColor: iconBg, 
            padding: 12, 
            borderRadius: 12, 
            alignItems: 'center', 
            justifyContent: 'center',
            width: 48,
            height: 48,
          }}>
            <Icon size={24} color={iconColor} />
          </View>

          {/* Middle: Text Content */}
          <View style={{ flex: 1, gap: 2, alignItems: 'flex-start' }}>
            <Text style={{ color: tokens.foreground, fontSize: 16, fontWeight: '800', textAlign: 'left' }}>{title}</Text>
            <Text style={{ color: tokens.mutedForeground, fontSize: 13, fontWeight: '600', textAlign: 'left' }}>{subtitle}</Text>
          </View>

          {/* Right Side: Download/Loading Icon */}
          <View style={{ 
            backgroundColor: tokens.secondary, 
            padding: 10, 
            borderRadius: 20,
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {loading ? (
              <ActivityIndicator size="small" color={tokens.primary} />
            ) : (
              <Download size={20} color={tokens.primary} />
            )}
          </View>
        </View>
      )}
    </Pressable>
  );
}

export default function AnnualReturnScreen() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useUnionAnnualReturn();
  const approve = useApproveAnnualReturnMutation();
  const submit = useSubmitAnnualReturnMutation();

  const [showKBModal, setShowKBModal] = useState(false);
  const [kbChecks, setKbChecks] = useState({ trueRecord: false, noConcealment: false, legalLiability: false });
  const isKbValid = kbChecks.trueRecord && kbChecks.noConcealment && kbChecks.legalLiability;

  const bothApproved = !!(data?.gs_approved_at && data?.fs_approved_at);
  const alreadySubmitted = data?.status === 'submitted';

  const handleApprove = () => {
    if (!data) return;
    approve.mutate({ annualReturnId: data.id, role: 'fs' });
    setShowKBModal(false);
  };

  const membersAdded = data ? data.member_count_end - data.member_count_start : 0;
  // Fallback heuristic if departure count wasn't tracked:
  const membersDeparted = membersAdded < 0 ? Math.abs(membersAdded) : 0; 
  const netAdditions = membersAdded > 0 ? membersAdded : 0;

  return (
    <AppShell>
      <HeaderBar title={t('union.return')} subtitle={"Form L & J Statutory Filing"} />
      
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <DataState loading={isLoading} error={isError} empty={!data} loadingLabel={t('states.loading')} errorLabel={t('states.error')} emptyLabel={t('states.empty')}>
          {data ? (
            <>
              {/* Submission status banner */}
              {alreadySubmitted ? (
                <View style={{ backgroundColor: tokens.statusSuccessBg, borderRadius: 12, borderWidth: 1, borderColor: tokens.statusSuccess, padding: 16, gap: 4 }}>
                  <Text style={{ color: tokens.statusSuccess, fontWeight: '900', fontSize: 15, textAlign: 'center' }}>
                    Annual Return Transmitted ✓
                  </Text>
                  <Text style={{ color: tokens.statusSuccess, fontSize: 13, textAlign: 'center' }}>
                    Successfully filed with the Registrar of Trade Unions.
                  </Text>
                  {data.submission_ref && (
                    <Text style={{ color: tokens.statusSuccess, fontSize: 12, textAlign: 'center', opacity: 0.8, marginTop: 4 }}>
                      Tracking Ref: {data.submission_ref}
                    </Text>
                  )}
                </View>
              ) : (
                <View style={{ backgroundColor: tokens.statusInfoBg, borderRadius: 12, borderWidth: 1, borderColor: tokens.statusInfo, padding: 14, flexDirection: rowDirection(), gap: 12, alignItems: 'flex-start' }}>
                  <Info size={20} color={tokens.statusInfo} style={{ marginTop: 2 }} />
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={{ color: tokens.statusInfo, fontWeight: '900', fontSize: 14 }}>Immutable Ledger Notice</Text>
                    <Text style={{ color: tokens.statusInfo, fontSize: 12, lineHeight: 18 }}>
                      This return is strictly auto-generated from your union's active ledgers. To edit values, you must route back and log corrections in the respective Member or Financial registers.
                    </Text>
                  </View>
                </View>
              )}

              {/* ─── SECTION A: FORM L (Demographics) ─── */}
              <SectionCard title="Form L: Membership Demographics">
                <View style={{ flexDirection: rowDirection(), flexWrap: 'wrap', gap: 8 }}>
                  <DemographicTile label="Total Start of Year" value={data.member_count_start.toLocaleString()} />
                  <DemographicTile label="Members Admitted" value={`+${netAdditions.toLocaleString()}`} tone="success" />
                  <DemographicTile label="Members Departed" value={`-${membersDeparted.toLocaleString()}`} tone="error" />
                  <DemographicTile label="Total End of Year" value={data.member_count_end.toLocaleString()} highlight />
                </View>

                <View style={{ height: 1, backgroundColor: tokens.border, marginVertical: 12 }} />
                
                <View style={{ flexDirection: rowDirection(), gap: 8 }}>
                  <View style={{ flex: 1, flexDirection: rowDirection(), justifyContent: 'space-between', alignItems: 'center', backgroundColor: tokens.muted, borderRadius: 8, padding: 10 }}>
                    <Text style={{ color: tokens.mutedForeground, fontSize: 12, fontWeight: '700' }}>Male (Mrd)</Text>
                    <Text style={{ color: tokens.foreground, fontWeight: '900', fontSize: 15 }}>{data.male_count.toLocaleString()}</Text>
                  </View>
                  <View style={{ flex: 1, flexDirection: rowDirection(), justifyContent: 'space-between', alignItems: 'center', backgroundColor: tokens.muted, borderRadius: 8, padding: 10 }}>
                    <Text style={{ color: tokens.mutedForeground, fontSize: 12, fontWeight: '700' }}>Female (Aurat)</Text>
                    <Text style={{ color: tokens.foreground, fontWeight: '900', fontSize: 15 }}>{data.female_count.toLocaleString()}</Text>
                  </View>
                </View>
              </SectionCard>

              {/* ─── SECTION B: FORM J (Financial Balance) ─── */}
              <SectionCard title="Form J: Financial Balance Sheet">
                {/* Income Expandable */}
                <LedgerAccordion title="Income (Amdani)" total={data.total_income} items={data.income_line_items} tone="success" />
                
                <View style={{ height: 4 }} />
                
                {/* Expenditure Expandable */}
                <LedgerAccordion title="Expenditure (Kharcha)" total={data.total_expenditure} items={data.expense_line_items} tone="error" />

                <View style={{ height: 1, backgroundColor: tokens.border, marginVertical: 12 }} />
                
                <View style={{ flexDirection: rowDirection(), justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: tokens.foreground, fontWeight: '900', fontSize: 15 }}>Closing Balance</Text>
                  <Text style={{ color: tokens.foreground, fontWeight: '900', fontSize: 18 }}>Rs. {data.closing_balance.toLocaleString()}</Text>
                </View>

                {!alreadySubmitted && (
                  <Pressable 
                    onPress={() => router.push('/(union-admin)/finance')}
                    style={({ pressed }) => ({
                      marginTop: 16,
                      backgroundColor: tokens.muted,
                      borderRadius: 10,
                      padding: 12,
                      flexDirection: rowDirection(),
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <AlertCircle size={16} color={tokens.mutedForeground} />
                    <Text style={{ color: tokens.mutedForeground, fontSize: 13, fontWeight: '700' }}>Dispute Data? Route to Financial Ledger</Text>
                  </Pressable>
                )}
              </SectionCard>

              {/* Dual Approval Tracker */}
              <DualApprovalProgress gsApprovedAt={data.gs_approved_at} fsApprovedAt={data.fs_approved_at} />

              {/* FS Approve action (Triggers Khalfiya Biyan Modal) */}
              {!data.fs_approved_at && (
                <ActionButton
                  label="Finance Secretary — Sign Return"
                  icon={FileCheck2}
                  onPress={() => setShowKBModal(true)}
                  disabled={approve.isPending}
                />
              )}

              {/* Final Submit Actions (Only if Both Approved) */}
              {bothApproved && !alreadySubmitted && (
                <View style={{ gap: 10, marginTop: 4 }}>
                  <View style={{ borderWidth: 1, borderColor: `${tokens.statusSuccess}55`, borderRadius: 14, padding: 14, backgroundColor: tokens.statusSuccessBg, gap: 10 }}>
                    <Text style={{ color: tokens.foreground, fontWeight: '900', fontSize: 14 }}>Ready to Transmit</Text>
                    <Text style={{ color: tokens.mutedForeground, fontSize: 12, lineHeight: 18 }}>
                      Both GS and FS have signed the affidavit. The Annual Return is ready to be filed digitally with PUWF and RTU.
                    </Text>
                    <ActionButton
                      label={submit.data ? `Submitted — ${submit.data.submissionRef}` : 'Transmit Annual Return'}
                      icon={Send}
                      onPress={() => submit.mutate({ annualReturnId: data.id })}
                      disabled={submit.isPending}
                    />
                  </View>
                </View>
              )}

              {/* Document Export Center explicitly addressing PRD FIN-002.4 - ALWAYS AVAILABLE */}
              <View style={{ marginTop: 24, marginBottom: 10 }}>
                <Text style={{ color: tokens.foreground, fontSize: 18, fontWeight: '900', marginBottom: 16, paddingLeft: 4 }}>Export Legal Documents</Text>
                
                <View style={{ gap: 12 }}>
                  <ExportDocumentCard
                    title="Form L — Demographics"
                    subtitle="Membership counts & breakdown"
                    icon={Users}
                    onPress={() => exportFormLPDF(data)}
                  />

                  <ExportDocumentCard
                    title="Form J — Financials"
                    subtitle="Income & expenditure ledgers"
                    icon={Banknote}
                    onPress={() => exportFormJPDF(data)}
                  />

                  <ExportDocumentCard
                    title="Khalfiya Biyan"
                    subtitle="Countersigned Legal Affidavit"
                    icon={FileCheck2}
                    variant="info"
                    onPress={() => exportAffidavitPDF(data)}
                  />
                </View>
              </View>

              {/* Modal for Khalfiya Biyan */}
              <Modal visible={showKBModal} animationType="slide" transparent>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                  <View style={{ backgroundColor: tokens.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, maxHeight: '90%' }}>
                    <View style={{ flexDirection: rowDirection(), justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <Text style={{ fontSize: 18, fontWeight: '900', color: tokens.foreground }}>Khalfiya Biyan (Affidavit)</Text>
                      <Pressable onPress={() => setShowKBModal(false)} accessibilityLabel="Close">
                        <X size={24} color={tokens.mutedForeground} />
                      </Pressable>
                    </View>
                    
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
                      <Text style={{ color: tokens.mutedForeground, fontSize: 14, lineHeight: 22 }}>
                        Before legally signing this return on behalf of the union, you must attest to the following statements under PIRA 2010 / IRA 2012:
                      </Text>

                      <View style={{ gap: 12, backgroundColor: tokens.muted, borderRadius: 12, padding: 16 }}>
                        <CheckboxRow 
                          label="I declare that this form corresponds truly to the registers and ledgers of the Union."
                          value={kbChecks.trueRecord}
                          onChange={(v) => setKbChecks(s => ({ ...s, trueRecord: v }))}
                        />
                        <View style={{ height: 1, backgroundColor: tokens.border }} />
                        <CheckboxRow 
                          label="I declare that no assets, liabilities, or members have been concealed or misrepresented."
                          value={kbChecks.noConcealment}
                          onChange={(v) => setKbChecks(s => ({ ...s, noConcealment: v }))}
                        />
                        <View style={{ height: 1, backgroundColor: tokens.border }} />
                        <CheckboxRow 
                          label="I understand that fraudulent submissions result in personal legal liability and potential union deregistration."
                          value={kbChecks.legalLiability}
                          onChange={(v) => setKbChecks(s => ({ ...s, legalLiability: v }))}
                        />
                      </View>

                      <Pressable
                        onPress={handleApprove}
                        disabled={!isKbValid || approve.isPending}
                        style={{
                          backgroundColor: isKbValid ? tokens.primary : tokens.mutedForeground,
                          padding: 16,
                          borderRadius: 12,
                          alignItems: 'center',
                          marginTop: 10,
                        }}
                      >
                        <Text style={{ color: tokens.primaryForeground, fontWeight: '900', fontSize: 16 }}>
                          {approve.isPending ? 'Signing...' : 'Sign Legal Affidavit (Khalfiya Biyan)'}
                        </Text>
                      </Pressable>
                    </ScrollView>
                  </View>
                </View>
              </Modal>

            </>
          ) : null}
        </DataState>
      </ScrollView>
    </AppShell>
  );
}

// ─── LOCAL COMPONENTS ───

function DemographicTile({ label, value, tone = 'neutral', highlight = false }: { label: string, value: string, tone?: 'success'|'error'|'neutral', highlight?: boolean }) {
  let color = tokens.foreground;
  if (tone === 'success') color = tokens.statusSuccess;
  if (tone === 'error') color = tokens.statusError;
  
  return (
    <View style={{ 
      width: '48%', 
      backgroundColor: highlight ? tokens.primary : tokens.muted, 
      borderRadius: 8, 
      padding: 12,
      borderWidth: 1,
      borderColor: highlight ? tokens.primary : tokens.border 
    }}>
      <Text style={{ color: highlight ? tokens.primaryForeground : tokens.mutedForeground, fontSize: 11, fontWeight: '700', marginBottom: 4 }}>{label}</Text>
      <Text style={{ color: highlight ? tokens.primaryForeground : color, fontWeight: '900', fontSize: 16 }}>{value}</Text>
    </View>
  );
}

function LedgerAccordion({ title, total, items, tone }: { title: string, total: number, items: FinanceLedgerLineItem[], tone: 'success' | 'error' }) {
  const [open, setOpen] = useState(false);
  const color = tone === 'success' ? tokens.statusSuccess : tokens.statusError;

  return (
    <View style={{ borderRadius: 10, borderWidth: 1, borderColor: tokens.border, overflow: 'hidden' }}>
      <Pressable onPress={() => setOpen(!open)} style={{ padding: 14, flexDirection: rowDirection(), justifyContent: 'space-between', alignItems: 'center', backgroundColor: tokens.muted }}>
        <Text style={{ color: tokens.foreground, fontWeight: '800', fontSize: 14 }}>{title}</Text>
        <Text style={{ color: color, fontWeight: '900', fontSize: 14 }}>Rs. {total.toLocaleString()}</Text>
      </Pressable>
      {open && (
        <View style={{ padding: 12, gap: 10 }}>
          {items.map(item => (
            <View key={item.id} style={{ flexDirection: rowDirection(), justifyContent: 'space-between', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: tokens.foreground, fontSize: 13, fontWeight: '600' }}>{item.description}</Text>
                {item.reference && <Text style={{ color: tokens.mutedForeground, fontSize: 11 }}>{item.reference}</Text>}
              </View>
              <Text style={{ color: tokens.mutedForeground, fontSize: 13, fontWeight: '800' }}>{item.amount.toLocaleString()}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function CheckboxRow({ label, value, onChange }: { label: string, value: boolean, onChange: (v: boolean) => void }) {
  return (
    <View style={{ flexDirection: rowDirection(), alignItems: 'flex-start', gap: 12 }}>
      {/* Basic switch fallback since standard expo doesn't have cross-platform checkbox immediately accessible here */}
      <Switch value={value} onValueChange={onChange} trackColor={{ true: tokens.primary }} style={{ transform: [{ scale: 0.8 }] }} />
      <Text style={{ flex: 1, color: tokens.foreground, fontSize: 13, lineHeight: 18, marginTop: 2 }}>{label}</Text>
    </View>
  );
}
