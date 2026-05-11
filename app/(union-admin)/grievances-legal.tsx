import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View, TextInput } from 'react-native';
import { AppShell } from '@/components/app-shell';
import { DataState } from '@/components/data-state';
import { HeaderBar } from '@/components/header-bar';
import { MetricCard } from '@/components/metric-card';
import { SectionCard } from '@/components/section-card';
import {
  GrievanceFilterTabs,
  GrievanceQueueCard,
  StandaloneLegalCaseCard,
} from '@/features/union-admin-operations/components';
import { useEscalateGrievanceMutation, useLogHearingMutation, useUnionLegalOperation, useUpdateGrievanceMutation } from '@/services/union-admin-service';
import { AlertTriangle, Landmark, Search, Siren, Gavel } from 'lucide-react-native';
import { directionalText, rowDirection, isRtlLanguage } from '@/theme/layout';
import { tokens } from '@/theme/tokens';

export default function GrievancesLegalScreen() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useUnionLegalOperation();
  const updateGrievance = useUpdateGrievanceMutation();
  const escalateGrievance = useEscalateGrievanceMutation();
  const logHearing = useLogHearingMutation();
  const rtl = isRtlLanguage();

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Upcoming hearings alert
  const upcomingHearings = useMemo(() => {
    if (!data) return [];
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    
    return data.legalCases
      .filter((lc) => lc.next_hearing)
      .filter((lc) => {
        const hearingTime = new Date(lc.next_hearing).getTime();
        return hearingTime >= now && hearingTime <= now + sevenDaysMs;
      });
  }, [data]);

  // Build status counts for filter badges
  const statusCounts = useMemo(() => {
    if (!data) return {} as Record<string, number>;
    return data.grievances.reduce<Record<string, number>>((acc, g) => {
      acc[g.status] = (acc[g.status] ?? 0) + 1;
      return acc;
    }, {});
  }, [data]);

  // Filtered grievances (search + status)
  const filteredGrievances = useMemo(() => {
    if (!data) return [];
    let result = data.grievances;
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(g => 
        g.worker_name.toLowerCase().includes(q) || 
        g.reference_no.toLowerCase().includes(q)
      );
    }
    
    if (activeFilter !== 'all') {
      result = result.filter((g) => g.status === activeFilter);
    }
    return result;
  }, [data, activeFilter, searchQuery]);

  // Standalone legal cases
  const linkedCaseIds = useMemo(() => new Set(data?.grievances.map((g) => g.legal_case_id).filter(Boolean)), [data]);
  const standaloneLegalCases = useMemo(
    () => data?.legalCases.filter((lc) => !linkedCaseIds.has(lc.id)) ?? [],
    [data, linkedCaseIds],
  );

  const urgentCount = data?.grievances.filter((g) => g.priority !== 'normal').length ?? 0;

  return (
    <AppShell>
      <HeaderBar title={t('union.legal')} subtitle={t('union.legalSubtitle')} />

      {/* Hearing Alerts */}
      {upcomingHearings.length > 0 && (
        <View style={{ backgroundColor: tokens.statusErrorBg, borderBottomWidth: 1, borderBottomColor: `${tokens.statusError}44`, padding: 12, flexDirection: rowDirection(), alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={20} color={tokens.statusError} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: tokens.statusError, fontSize: 13, fontWeight: '900' }}>{upcomingHearings.length} Upcoming Hearing{upcomingHearings.length > 1 ? 's' : ''} (Next 7 Days)</Text>
            <Text style={{ color: tokens.statusError, fontSize: 11, ...directionalText() }}>Review your cases immediately.</Text>
          </View>
        </View>
      )}

      {/* Search Bar */}
      {data && (
        <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, backgroundColor: tokens.background }}>
          <View style={{ flexDirection: rowDirection(), alignItems: 'center', backgroundColor: tokens.card, borderWidth: 1, borderColor: tokens.border, borderRadius: 10, paddingHorizontal: 12, height: 44 }}>
            <Search size={18} color={tokens.mutedForeground} style={{ marginRight: rtl ? 0 : 8, marginLeft: rtl ? 8 : 0 }} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by worker name or GRS reference..."
              placeholderTextColor={tokens.mutedForeground}
              style={{ flex: 1, color: tokens.foreground, fontSize: 14, ...directionalText(), paddingVertical: 0 }}
            />
          </View>
        </View>
      )}

      {/* Filter tabs */}
      {data && (
        <View style={{ paddingBottom: 4, backgroundColor: tokens.background, borderBottomWidth: 1, borderBottomColor: tokens.border }}>
          <GrievanceFilterTabs
            active={activeFilter}
            onSelect={setActiveFilter}
            counts={statusCounts}
          />
        </View>
      )}

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <DataState
          loading={isLoading}
          error={isError}
          empty={!data}
          loadingLabel={t('states.loading')}
          errorLabel={t('states.error')}
          emptyLabel={t('states.empty')}
        >
          {data ? (
            <>
              {/* ── Summary Metrics ── */}
              <View style={{ flexDirection: rowDirection(), gap: 10 }}>
                <MetricCard icon={Siren} label={t('union.activeCases')} value={String(data.grievances.length)} tone="error" />
                <MetricCard icon={AlertTriangle} label={t('unionOps.legal.urgentCount', { count: urgentCount })} value={String(urgentCount)} tone="warning" />
                <MetricCard icon={Landmark} label={t('unionOps.legal.legalCases')} value={String(data.legalCases.length)} tone="info" />
              </View>

              {/* ── Grievance Queue ── */}
              <View style={{ gap: 12, marginTop: 4 }}>
                <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 8 }}>
                  <Gavel size={16} color={tokens.portalUnion} />
                  <Text style={{ color: tokens.foreground, fontSize: 14, fontWeight: '900' }}>Active Grievance Queue</Text>
                </View>

                {filteredGrievances.length === 0 ? (
                  <SectionCard>
                    <Text style={{ color: tokens.mutedForeground, textAlign: 'center', paddingVertical: 16 }}>
                      {searchQuery ? 'No cases match your search.' : t('states.empty')}
                    </Text>
                  </SectionCard>
                ) : (
                  filteredGrievances.map((grievance) => {
                    const linkedCase = grievance.legal_case_id
                      ? data.legalCases.find((lc) => lc.id === grievance.legal_case_id)
                      : undefined;
                    return (
                      <GrievanceQueueCard
                        key={grievance.id}
                        grievance={grievance}
                        legalCase={linkedCase}
                        onStatusChange={(id, status) => updateGrievance.mutate({ grievanceId: id, status })}
                        isUpdating={updateGrievance.isPending}
                        onEscalate={(draft) => escalateGrievance.mutate(draft)}
                        isEscalating={escalateGrievance.isPending}
                        onLogHearing={(params) => logHearing.mutate(params)}
                        isLoggingHearing={logHearing.isPending}
                      />
                    );
                  })
                )}
              </View>

              {/* ── Standalone Legal Cases ── */}
              {standaloneLegalCases.length > 0 && (
                <View style={{ gap: 12, marginTop: 8 }}>
                  <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 8 }}>
                    <Landmark size={16} color={tokens.portalUnion} />
                    <Text style={{ color: tokens.foreground, fontSize: 14, fontWeight: '900' }}>
                      {t('unionOps.legal.caseList')}
                    </Text>
                  </View>
                  {standaloneLegalCases.map((legalCase) => (
                    <StandaloneLegalCaseCard
                      key={legalCase.id}
                      legalCase={legalCase}
                      onLogHearing={(params) => logHearing.mutate(params)}
                      isLoggingHearing={logHearing.isPending}
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
