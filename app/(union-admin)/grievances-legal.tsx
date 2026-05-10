import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { AppShell } from '@/components/app-shell';
import { DataState } from '@/components/data-state';
import { HeaderBar } from '@/components/header-bar';
import { MetricCard } from '@/components/metric-card';
import { SectionCard } from '@/components/section-card';
import { StatusChip } from '@/components/status-chip';
import { ActionButton, GrievanceQueueCard, HearingCard, LegalCaseCard } from '@/features/union-admin-operations/components';
import { useLogHearingMutation, useUnionLegalOperation, useUpdateGrievanceMutation } from '@/services/union-admin-service';
import { CalendarClock, Gavel, Landmark, Siren } from 'lucide-react-native';
import { rowDirection } from '@/theme/layout';

export default function GrievancesLegalScreen() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useUnionLegalOperation();
  const updateGrievance = useUpdateGrievanceMutation();
  const logHearing = useLogHearingMutation();
  const urgentCount = data?.grievances.filter((item) => item.priority !== 'normal').length ?? 0;

  return (
    <AppShell>
      <HeaderBar title={t('union.legal')} subtitle={t('union.legalSubtitle')} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
        <DataState loading={isLoading} error={isError} empty={!data} loadingLabel={t('states.loading')} errorLabel={t('states.error')} emptyLabel={t('states.empty')}>
          {data ? (
            <>
              <View style={{ flexDirection: rowDirection(), gap: 10 }}>
                <MetricCard icon={Siren} label={t('union.activeCases')} value={String(data.grievances.length)} tone="error" />
                <MetricCard icon={Landmark} label={t('unionOps.legal.legalCases')} value={String(data.legalCases.length)} tone="warning" />
              </View>
              <SectionCard title={t('unionOps.legal.queue')}>
                <View style={{ flexDirection: rowDirection(), gap: 8, flexWrap: 'wrap' }}>
                  <StatusChip tone="error" label={t('unionOps.legal.urgentCount', { count: urgentCount })} />
                  <StatusChip tone="info" label={t('unionOps.legal.maskedNote')} />
                </View>
                <ActionButton label={updateGrievance.data ? t('unionOps.legal.updated', { ref: updateGrievance.data.updateRef }) : t('unionOps.legal.updateMock')} icon={Gavel} onPress={() => updateGrievance.mutate({ grievanceId: 'ug-1', status: 'investigating' })} disabled={updateGrievance.isPending} />
              </SectionCard>
              {data.grievances.map((grievance) => <GrievanceQueueCard key={grievance.id} grievance={grievance} />)}
              <SectionCard title={t('unionOps.legal.caseList')}>
                <ActionButton label={logHearing.data ? t('unionOps.legal.hearingLogged', { ref: logHearing.data.hearingRef }) : t('unionOps.legal.logHearingMock')} icon={CalendarClock} onPress={() => logHearing.mutate({ caseId: 'lc-1', hearingDate: '2026-05-18' })} disabled={logHearing.isPending} />
              </SectionCard>
              {data.legalCases.map((legalCase) => (
                <View key={legalCase.id} style={{ gap: 8 }}>
                  <LegalCaseCard legalCase={legalCase} />
                  <SectionCard title={t('unionOps.legal.hearingsTitle')}>
                    <View style={{ gap: 8 }}>
                      {legalCase.hearings.map((hearing) => <HearingCard key={hearing.id} hearing={hearing} />)}
                    </View>
                  </SectionCard>
                </View>
              ))}
            </>
          ) : null}
        </DataState>
      </ScrollView>
    </AppShell>
  );
}
