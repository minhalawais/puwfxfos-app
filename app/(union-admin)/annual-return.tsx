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
import { directionalText, isRtlLanguage, rowDirection } from '@/theme/layout';
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

  // Use directional alignment for text content
  const isRtl = isRtlLanguage();

  return (
    <Pressable onPress={handlePress} disabled={loading}>
      {({ pressed }) => (
        <View style={{
          flexDirection: rowDirection(),
          alignItems: 'center',
          backgroundColor: tokens.card,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: tokens.border,
          borderBottomWidth: 3,
          borderBottomColor: iconColor,
          padding: 16,
          gap: 16,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 3,
          opacity: loading ? 0.8 : 1,
        }}>
          {/* Document Icon */}
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

          {/* Text Content */}
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ color: tokens.foreground, fontSize: 16, ...directionalText('800') }}>{title}</Text>
            <Text style={{ color: tokens.mutedForeground, fontSize: 13, ...directionalText('600') }}>{subtitle}</Text>
          </View>

          {/* Download/Loading Icon */}
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
      <HeaderBar title={t('union.return')} subtitle={t('unionCore.annualReturnWorkspace.subtitle')} variant="unionAdmin" />
      
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <DataState loading={isLoading} error={isError} empty={!data} loadingLabel={t('states.loading')} errorLabel={t('states.error')} emptyLabel={t('states.empty')}>
          {data ? (
            <>
              {/* Submission status banner */}
              {alreadySubmitted ? (
                <View style={{ backgroundColor: tokens.statusSuccessBg, borderRadius: 12, borderWidth: 1, borderColor: tokens.statusSuccess, padding: 16, gap: 4 }}>
                  <Text style={{ color: tokens.statusSuccess, fontSize: 15, ...directionalText('900') }}>
                    {t('unionCore.annualReturnWorkspace.banner.submitted')}
                  </Text>
                  <Text style={{ color: tokens.statusSuccess, fontSize: 13, ...directionalText('600') }}>
                    {t('unionCore.annualReturnWorkspace.banner.submittedDetail')}
                  </Text>
                  {data.submission_ref && (
                    <Text style={{ color: tokens.statusSuccess, fontSize: 12, opacity: 0.8, marginTop: 4, ...directionalText('500') }}>
                      {t('unionCore.annualReturnWorkspace.banner.trackingRef', { ref: data.submission_ref })}
                    </Text>
                  )}
                </View>
              ) : (
                <View style={{ backgroundColor: tokens.statusInfoBg, borderRadius: 12, borderWidth: 1, borderColor: tokens.statusInfo, padding: 14, flexDirection: rowDirection(), gap: 12, alignItems: 'flex-start' }}>
                  <Info size={20} color={tokens.statusInfo} style={{ marginTop: 2 }} />
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={{ color: tokens.statusInfo, fontSize: 14, ...directionalText('900') }}>{t('unionCore.annualReturnWorkspace.banner.ledgerNotice')}</Text>
                    <Text style={{ color: tokens.statusInfo, fontSize: 12, lineHeight: 18, ...directionalText('600') }}>
                      {t('unionCore.annualReturnWorkspace.banner.ledgerDetail')}
                    </Text>
                  </View>
                </View>
              )}

              {/* ─── SECTION A: FORM L (Demographics) ─── */}
              <SectionCard title={t('unionCore.annualReturnWorkspace.formL.title')}>
                <View style={{ flexDirection: rowDirection(), flexWrap: 'wrap', gap: 8 }}>
                  <DemographicTile label={t('unionCore.annualReturnWorkspace.formL.startOfYear')} value={data.member_count_start.toLocaleString()} />
                  <DemographicTile label={t('unionCore.annualReturnWorkspace.formL.admitted')} value={`+${netAdditions.toLocaleString()}`} tone="success" />
                  <DemographicTile label={t('unionCore.annualReturnWorkspace.formL.departed')} value={`-${membersDeparted.toLocaleString()}`} tone="error" />
                  <DemographicTile label={t('unionCore.annualReturnWorkspace.formL.endOfYear')} value={data.member_count_end.toLocaleString()} highlight />
                </View>

                <View style={{ height: 1, backgroundColor: tokens.border, marginVertical: 12 }} />
                
                <View style={{ flexDirection: rowDirection(), gap: 8 }}>
                  <View style={{ flex: 1, flexDirection: rowDirection(), justifyContent: 'space-between', alignItems: 'center', backgroundColor: tokens.muted, borderRadius: 8, padding: 10 }}>
                    <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText('700') }}>{t('unionCore.annualReturnWorkspace.formL.male')}</Text>
                    <Text style={{ color: tokens.foreground, fontSize: 15, ...directionalText('900') }}>{data.male_count.toLocaleString()}</Text>
                  </View>
                  <View style={{ flex: 1, flexDirection: rowDirection(), justifyContent: 'space-between', alignItems: 'center', backgroundColor: tokens.muted, borderRadius: 8, padding: 10 }}>
                    <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText('700') }}>{t('unionCore.annualReturnWorkspace.formL.female')}</Text>
                    <Text style={{ color: tokens.foreground, fontSize: 15, ...directionalText('900') }}>{data.female_count.toLocaleString()}</Text>
                  </View>
                </View>
              </SectionCard>

              {/* ─── SECTION B: FORM J (Financial Balance) ─── */}
              <SectionCard title={t('unionCore.annualReturnWorkspace.formJ.title')}>
                {/* Income Expandable */}
                <LedgerAccordion title={t('unionCore.annualReturnWorkspace.formJ.income')} total={data.total_income} items={data.income_line_items} tone="success" />
                
                <View style={{ height: 4 }} />
                
                {/* Expenditure Expandable */}
                <LedgerAccordion title={t('unionCore.annualReturnWorkspace.formJ.expenditure')} total={data.total_expenditure} items={data.expense_line_items} tone="error" />

                <View style={{ height: 1, backgroundColor: tokens.border, marginVertical: 12 }} />
                
                <View style={{ flexDirection: rowDirection(), justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: tokens.foreground, fontSize: 15, ...directionalText('900') }}>{t('unionCore.annualReturnWorkspace.formJ.closingBalance')}</Text>
                  <Text style={{ color: tokens.foreground, fontSize: 18, ...directionalText('900') }}>Rs. {data.closing_balance.toLocaleString()}</Text>
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
                    <Text style={{ color: tokens.mutedForeground, fontSize: 13, ...directionalText('700') }}>{t('unionCore.annualReturnWorkspace.formJ.disputeData')}</Text>
                  </Pressable>
                )}
              </SectionCard>

              {/* Dual Approval Tracker */}
              <DualApprovalProgress gsApprovedAt={data.gs_approved_at} fsApprovedAt={data.fs_approved_at} />

              {/* FS Approve action (Triggers Khalfiya Biyan Modal) */}
              {!data.fs_approved_at && (
                <ActionButton
                  label={t('unionCore.annualReturnWorkspace.approvals.fsSign')}
                  icon={FileCheck2}
                  onPress={() => setShowKBModal(true)}
                  disabled={approve.isPending}
                />
              )}

              {/* Final Submit Actions (Only if Both Approved) */}
              {bothApproved && !alreadySubmitted && (
                <View style={{ gap: 10, marginTop: 4 }}>
                  <View style={{ borderWidth: 1, borderColor: `${tokens.statusSuccess}55`, borderRadius: 14, padding: 14, backgroundColor: tokens.statusSuccessBg, gap: 10 }}>
                    <Text style={{ color: tokens.foreground, fontSize: 14, ...directionalText('900') }}>{t('unionCore.annualReturnWorkspace.approvals.ready')}</Text>
                    <Text style={{ color: tokens.mutedForeground, fontSize: 12, lineHeight: 18, ...directionalText('600') }}>
                      {t('unionCore.annualReturnWorkspace.approvals.readyDetail')}
                    </Text>
                    <ActionButton
                      label={submit.data ? `Submitted — ${submit.data.submissionRef}` : t('unionCore.annualReturnWorkspace.approvals.transmit')}
                      icon={Send}
                      onPress={() => submit.mutate({ annualReturnId: data.id })}
                      disabled={submit.isPending}
                    />
                  </View>
                </View>
              )}

              {/* Document Export Center explicitly addressing PRD FIN-002.4 - ALWAYS AVAILABLE */}
              <View style={{ marginTop: 24, marginBottom: 10 }}>
                <Text style={{ color: tokens.foreground, fontSize: 18, marginBottom: 16, paddingHorizontal: 4, ...directionalText('900') }}>{t('unionCore.annualReturnWorkspace.exports.title')}</Text>
                
                <View style={{ gap: 12 }}>
                  <ExportDocumentCard
                    title={t('unionCore.annualReturnWorkspace.exports.formLTitle')}
                    subtitle={t('unionCore.annualReturnWorkspace.exports.formLSub')}
                    icon={Users}
                    onPress={() => exportFormLPDF(data)}
                  />

                  <ExportDocumentCard
                    title={t('unionCore.annualReturnWorkspace.exports.formJTitle')}
                    subtitle={t('unionCore.annualReturnWorkspace.exports.formJSub')}
                    icon={Banknote}
                    onPress={() => exportFormJPDF(data)}
                  />

                  <ExportDocumentCard
                    title={t('unionCore.annualReturnWorkspace.exports.kbTitle')}
                    subtitle={t('unionCore.annualReturnWorkspace.exports.kbSub')}
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
                      <Text style={{ fontSize: 18, color: tokens.foreground, ...directionalText('900') }}>{t('unionCore.annualReturnWorkspace.affidavit.title')}</Text>
                      <Pressable onPress={() => setShowKBModal(false)} accessibilityLabel="Close">
                        <X size={24} color={tokens.mutedForeground} />
                      </Pressable>
                    </View>
                    
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
                      <Text style={{ color: tokens.mutedForeground, fontSize: 14, lineHeight: 22, ...directionalText('600') }}>
                        {t('unionCore.annualReturnWorkspace.affidavit.intro')}
                      </Text>

                      <View style={{ gap: 12, backgroundColor: tokens.muted, borderRadius: 12, padding: 16 }}>
                        <CheckboxRow 
                          label={t('unionCore.annualReturnWorkspace.affidavit.check1')}
                          value={kbChecks.trueRecord}
                          onChange={(v) => setKbChecks(s => ({ ...s, trueRecord: v }))}
                        />
                        <View style={{ height: 1, backgroundColor: tokens.border }} />
                        <CheckboxRow 
                          label={t('unionCore.annualReturnWorkspace.affidavit.check2')}
                          value={kbChecks.noConcealment}
                          onChange={(v) => setKbChecks(s => ({ ...s, noConcealment: v }))}
                        />
                        <View style={{ height: 1, backgroundColor: tokens.border }} />
                        <CheckboxRow 
                          label={t('unionCore.annualReturnWorkspace.affidavit.check3')}
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
                        <Text style={{ color: tokens.primaryForeground, fontSize: 16, ...directionalText('900') }}>
                          {approve.isPending ? t('unionCore.annualReturnWorkspace.affidavit.signing') : t('unionCore.annualReturnWorkspace.affidavit.sign')}
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
      <Text style={{ color: highlight ? tokens.primaryForeground : tokens.mutedForeground, fontSize: 11, marginBottom: 4, ...directionalText('700') }}>{label}</Text>
      <Text style={{ color: highlight ? tokens.primaryForeground : color, fontSize: 16, ...directionalText('900') }}>{value}</Text>
    </View>
  );
}

function LedgerAccordion({ title, total, items, tone }: { title: string, total: number, items: FinanceLedgerLineItem[], tone: 'success' | 'error' }) {
  const [open, setOpen] = useState(false);
  const color = tone === 'success' ? tokens.statusSuccess : tokens.statusError;

  return (
    <View style={{ borderRadius: 10, borderWidth: 1, borderColor: tokens.border, overflow: 'hidden' }}>
      <Pressable onPress={() => setOpen(!open)} style={{ padding: 14, flexDirection: rowDirection(), justifyContent: 'space-between', alignItems: 'center', backgroundColor: tokens.muted }}>
        <Text style={{ color: tokens.foreground, fontSize: 14, ...directionalText('800') }}>{title}</Text>
        <Text style={{ color: color, fontSize: 14, ...directionalText('900') }}>Rs. {total.toLocaleString()}</Text>
      </Pressable>
      {open && (
        <View style={{ padding: 12, gap: 10 }}>
          {items.map(item => (
            <View key={item.id} style={{ flexDirection: rowDirection(), justifyContent: 'space-between', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: tokens.foreground, fontSize: 13, ...directionalText('600') }}>{item.description}</Text>
                {item.reference && <Text style={{ color: tokens.mutedForeground, fontSize: 11, ...directionalText() }}>{item.reference}</Text>}
              </View>
              <Text style={{ color: tokens.mutedForeground, fontSize: 13, ...directionalText('800') }}>{item.amount.toLocaleString()}</Text>
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
      <Switch value={value} onValueChange={onChange} trackColor={{ true: tokens.primary }} style={{ transform: [{ scale: 0.8 }] }} />
      <Text style={{ flex: 1, color: tokens.foreground, fontSize: 13, lineHeight: 18, marginTop: 2, ...directionalText() }}>{label}</Text>
    </View>
  );
}
