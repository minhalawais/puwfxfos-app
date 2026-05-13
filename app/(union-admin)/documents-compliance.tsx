import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { AppShell } from '@/components/app-shell';
import { DataState } from '@/components/data-state';
import { HeaderBar } from '@/components/header-bar';
import { MetricCard } from '@/components/metric-card';
import { SectionCard } from '@/components/section-card';
import { StatusChip } from '@/components/status-chip';
import { ComplianceDocumentCard, ComplianceObligationCard, SourceNote } from '@/features/union-admin-core/components';
import { useUnionAdminDashboard, useUnionComplianceCore } from '@/services/union-admin-service';
import { rowDirection } from '@/theme/layout';
import { tokens } from '@/theme/tokens';
import { FileArchive, FileWarning, ShieldCheck } from 'lucide-react-native';

export default function DocumentsComplianceScreen() {
  const { t } = useTranslation();
  const dashboard = useUnionAdminDashboard();
  const { data, isLoading, isError } = useUnionComplianceCore();
  const missingCount = data?.documents.filter((document) => document.status !== 'current').length ?? 0;

  return (
    <AppShell>
      <HeaderBar title={t('union.docs')} subtitle={t('union.docsSubtitle')} variant="unionAdmin" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
        <View style={{ flexDirection: rowDirection(), gap: 10 }}>
          <MetricCard icon={ShieldCheck} label={t('union.compliance')} value={`${dashboard.data?.compliance_score ?? '-'}`} tone="warning" variant="unionAdmin" />
          <MetricCard icon={FileWarning} label={t('unionCore.documents.needsEvidence')} value={String(missingCount)} tone="error" variant="unionAdmin" />
        </View>
        <SectionCard title={t('unionCore.compliance.snapshot')} variant="unionAdmin">
          <View style={{ flexDirection: rowDirection(), gap: 8, flexWrap: 'wrap' }}>
            <StatusChip tone="info" label={t('unionCore.documents.total', { count: data?.documents.length ?? 0 })} />
            <StatusChip tone="warning" label={t('unionCore.compliance.openObligations', { count: data?.obligations.filter((item) => item.status !== 'current').length ?? 0 })} />
          </View>
          <SourceNote label={t('unionCore.sources.documents')} />
        </SectionCard>
        <DataState loading={isLoading} error={isError} empty={!data?.documents.length} loadingLabel={t('states.loading')} errorLabel={t('states.error')} emptyLabel={t('unionCore.documents.empty')}>
          <SectionCard title={t('unionCore.compliance.obligationsTitle')} variant="unionAdmin">
            <View style={{ gap: 10 }}>
              {data?.obligations.map((obligation) => <ComplianceObligationCard key={obligation.id} obligation={obligation} />)}
            </View>
          </SectionCard>
          <SectionCard title={t('unionCore.documents.registry')} variant="unionAdmin">
            <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 8 }}>
              <FileArchive size={18} color={tokens.portalUnion} />
              <SourceNote label={t('unionCore.documents.uploadMock')} />
            </View>
          </SectionCard>
          {data?.documents.map((document) => <ComplianceDocumentCard key={document.id} document={document} />)}
        </DataState>
      </ScrollView>
    </AppShell>
  );
}
