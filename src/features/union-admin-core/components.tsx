import type { ComponentType } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { ArrowLeft, ArrowRight, CalendarClock, IdCard, ShieldCheck, UserRoundCheck } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '@/components/section-card';
import { StatusChip } from '@/components/status-chip';
import { alignSelfStart, directionalText, isRtlLanguage, rowDirection } from '@/theme/layout';
import { tokens } from '@/theme/tokens';
import { getUnionAdminTone, unionAdminTheme } from '@/theme/union-admin';
import { formatDate } from '@/utils/date';
import type { UnionAdminDashboardSummary, UnionComplianceDocument, UnionComplianceObligation, UnionMemberRecord, UnionOfficeBearerRecord } from '@/types/domain';

type IconType = ComponentType<{ size?: number; color?: string }>;

const complianceTone = {
  current: 'success',
  due_soon: 'warning',
  overdue: 'error',
  missing: 'error',
  draft: 'warning',
} as const;

export function UnionRiskStrip({ summary }: { summary: UnionAdminDashboardSummary }) {
  const { t } = useTranslation();
  return (
    <View style={{ gap: 6 }}>
      {summary.risks.map((risk) => (
        <Pressable
          key={risk.id}
          accessibilityRole="button"
          accessibilityLabel={t(risk.title_key)}
          onPress={() => router.push(risk.route as Href)}
          style={{
            minHeight: 72,
            flexDirection: rowDirection(),
            alignItems: 'center',
            gap: 10,
            borderWidth: 1,
            borderColor: risk.tone === 'error' ? 'rgba(242, 29, 47, 0.18)' : risk.tone === 'warning' ? 'rgba(166, 18, 31, 0.18)' : unionAdminTheme.border,
            borderRadius: 18,
            backgroundColor: risk.tone === 'error' ? 'rgba(242, 29, 47, 0.07)' : risk.tone === 'warning' ? 'rgba(166, 18, 31, 0.07)' : unionAdminTheme.softNavy,
            padding: 12,
            overflow: 'hidden',
          }}
        >
          <View style={{ position: 'absolute', top: 0, bottom: 0, width: 4, backgroundColor: risk.tone === 'error' ? unionAdminTheme.red : risk.tone === 'warning' ? unionAdminTheme.crimson : unionAdminTheme.navy, ...(isRtlLanguage() ? { right: 0 } : { left: 0 }) }} />
          <View style={{ width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' }}>
            <CalendarClock size={16} color={risk.tone === 'error' ? unionAdminTheme.red : risk.tone === 'warning' ? unionAdminTheme.crimson : unionAdminTheme.navy} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: unionAdminTheme.text, fontSize: 14, ...directionalText('900') }}>{t(risk.title_key)}</Text>
            <Text style={{ color: unionAdminTheme.mutedText, fontSize: 11, lineHeight: 16, ...directionalText('700') }}>{t(risk.detail_key)}</Text>
          </View>
          {isRtlLanguage() ? <ArrowLeft size={15} color={unionAdminTheme.navy} /> : <ArrowRight size={15} color={unionAdminTheme.navy} />}
        </Pressable>
      ))}
    </View>
  );
}

export function AdminQuickActionCard({ icon: Icon, title, subtitle, href }: { icon: IconType; title: string; subtitle: string; href: Href }) {
  const DirectionIcon = isRtlLanguage() ? ArrowLeft : ArrowRight;
  const colors = getUnionAdminTone('navy');
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={() => router.push(href)}
      style={{
        flex: 1,
        minHeight: 100,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 20,
        padding: 14,
        gap: 10,
        shadowColor: unionAdminTheme.shadow,
        shadowOpacity: 0.05,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: rowDirection(), alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <View style={{ width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.soft, borderWidth: 1, borderColor: colors.border }}>
          <Icon size={19} color={unionAdminTheme.navy} />
        </View>
        <DirectionIcon size={17} color={unionAdminTheme.navy} />
      </View>
      <Text style={{ color: unionAdminTheme.text, fontSize: 14, ...directionalText('900') }}>{title}</Text>
      <Text style={{ color: unionAdminTheme.mutedText, fontWeight: '700', fontSize: 11, lineHeight: 16, ...directionalText() }}>{subtitle}</Text>
    </Pressable>
  );
}

export function UnionMemberCard({ member }: { member: UnionMemberRecord }) {
  const { t } = useTranslation();
  return (
    <SectionCard variant="unionAdmin">
      <View style={{ flexDirection: rowDirection(), alignItems: 'flex-start', gap: 10 }}>
        <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: unionAdminTheme.softNavy, alignItems: 'center', justifyContent: 'center' }}>
          <IdCard size={19} color={unionAdminTheme.navy} />
        </View>
        <View style={{ flex: 1, gap: 5 }}>
          <View style={{ flexDirection: rowDirection(), alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <Text style={{ flex: 1, color: tokens.foreground, fontSize: 15, ...directionalText('900') }}>{member.name}</Text>
            <StatusChip tone={member.membership_status === 'active' ? 'success' : 'warning'} label={t(`status.membership.${member.membership_status}`)} />
          </View>
          <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText('700') }}>{member.member_id} - {member.job_title}</Text>
          <View style={{ flexDirection: rowDirection(), gap: 6, flexWrap: 'wrap' }}>
            <StatusChip tone="neutral" label={`${t('workerPortal.identity.cnic')} ${member.masked_cnic}`} />
            <StatusChip tone={complianceTone[member.form_c_status === 'complete' ? 'current' : member.form_c_status === 'draft' ? 'draft' : 'missing']} label={t(`unionCore.formC.${member.form_c_status}`)} />
            <StatusChip tone={member.election_ready ? 'success' : 'warning'} label={member.election_ready ? t('unionCore.members.electionReady') : t('unionCore.members.electionBlocked')} />
          </View>
        </View>
      </View>
    </SectionCard>
  );
}

export function OfficeBearerCard({ bearer }: { bearer: UnionOfficeBearerRecord }) {
  const { t } = useTranslation();
  return (
    <SectionCard variant="unionAdmin">
      <View style={{ flexDirection: rowDirection(), alignItems: 'flex-start', gap: 10 }}>
        <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: unionAdminTheme.softGreen, alignItems: 'center', justifyContent: 'center' }}>
          <UserRoundCheck size={19} color={unionAdminTheme.green} />
        </View>
        <View style={{ flex: 1, gap: 5 }}>
          <View style={{ flexDirection: rowDirection(), alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <Text style={{ flex: 1, color: tokens.foreground, fontSize: 15, ...directionalText('900') }}>{bearer.name}</Text>
            <StatusChip tone={bearer.status === 'active' ? 'success' : 'warning'} label={t(`unionCore.officeStatus.${bearer.status}`)} />
          </View>
          <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText('800') }}>{t(bearer.designation_key)} - {bearer.masked_cnic}</Text>
          <Text style={{ color: tokens.mutedForeground, fontSize: 12, lineHeight: 17, ...directionalText() }}>{t('unionCore.office.term', { start: formatDate(bearer.term_start_date), expiry: formatDate(bearer.term_expiry_date) })}</Text>
          <View style={{ flexDirection: rowDirection(), gap: 6, flexWrap: 'wrap' }}>
            {bearer.outsider ? <StatusChip tone="error" label={t('union.outsider')} /> : <StatusChip tone="success" label={t('unionCore.office.workerBearer')} />}
            <StatusChip tone={complianceTone[bearer.evidence_status]} label={t(`status.compliance.${bearer.evidence_status}`)} />
          </View>
        </View>
      </View>
    </SectionCard>
  );
}

export function ComplianceObligationCard({ obligation }: { obligation: UnionComplianceObligation }) {
  const { t } = useTranslation();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={t(obligation.title_key)} onPress={() => router.push(obligation.route as Href)} style={{ backgroundColor: '#ffffff', borderWidth: 1, borderColor: unionAdminTheme.border, borderRadius: 18, padding: 14, gap: 8, minHeight: 90 }}>
      <View style={{ flexDirection: rowDirection(), alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <Text style={{ flex: 1, color: tokens.foreground, fontSize: 15, ...directionalText('900') }}>{t(obligation.title_key)}</Text>
        <StatusChip tone={complianceTone[obligation.status]} label={t(`status.compliance.${obligation.status}`)} />
      </View>
      <Text style={{ color: tokens.mutedForeground, fontSize: 12, lineHeight: 18, ...directionalText('700') }}>{t(obligation.source_key)} - {t('unionCore.compliance.due', { date: formatDate(obligation.due_date) })}</Text>
    </Pressable>
  );
}

export function ComplianceDocumentCard({ document }: { document: UnionComplianceDocument }) {
  const { t } = useTranslation();
  return (
    <SectionCard variant="unionAdmin">
      <View style={{ flexDirection: rowDirection(), alignItems: 'flex-start', gap: 10 }}>
        <ShieldCheck size={20} color={document.status === 'current' ? tokens.statusSuccess : tokens.statusWarning} />
        <View style={{ flex: 1, gap: 5 }}>
          <View style={{ flexDirection: rowDirection(), alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <Text style={{ flex: 1, color: tokens.foreground, ...directionalText('900') }}>{t(document.title_key)}</Text>
            <StatusChip tone={complianceTone[document.status]} label={t(`status.compliance.${document.status}`)} />
          </View>
          <Text style={{ color: tokens.mutedForeground, fontSize: 12, lineHeight: 18, ...directionalText() }}>{t(document.source_key)}</Text>
          <View style={{ flexDirection: rowDirection(), gap: 6, flexWrap: 'wrap' }}>
            <StatusChip tone="neutral" label={t(document.owner_role_key)} />
            <StatusChip tone="info" label={t('unionCore.documents.evidenceCount', { count: document.evidence_count })} />
            {document.expiry_date ? <StatusChip tone="warning" label={t('unionCore.documents.expiry', { date: formatDate(document.expiry_date) })} /> : null}
            {document.due_date ? <StatusChip tone="warning" label={t('unionCore.compliance.due', { date: formatDate(document.due_date) })} /> : null}
          </View>
        </View>
      </View>
    </SectionCard>
  );
}

export function SourceNote({ label }: { label: string }) {
  return (
    <Text style={{ color: unionAdminTheme.mutedText, fontSize: 11, fontWeight: '800', lineHeight: 16, alignSelf: alignSelfStart(), ...directionalText() }}>{label}</Text>
  );
}
