import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { AppShell } from '@/components/app-shell';
import { DataState } from '@/components/data-state';
import { HeaderBar } from '@/components/header-bar';
import {
  ActiveCoDPanel,
  AnimatedCBASection,
  CBAActiveWorkflowHighlights,
  CBARecordDetailModal,
  CBARecordFormModal,
  CBARegistryCard,
  CBARegistryControls,
  CBAMetricGrid,
  CBAWorkspaceHero,
  CBAWorkspaceTabs,
  CoDWorkflowFormModal,
  confirmStageAdvance,
  DemandItemCard,
  EvidenceCard,
  getEvidenceWarnings,
  getFilteredCbaRecords,
  NegotiationRoundCard,
  NegotiationRoundFormModal,
  StickyCBAActionButton,
  type CBAWorkspaceTab,
} from '@/features/union-admin-cba/components';
import {
  useAddNegotiationRoundMutation,
  useAdvanceUnionCoDStageMutation,
  useUnionCBAWorkspace,
  useUpdateUnionCBAStatusMutation,
  useUpsertUnionCBARecordMutation,
  useUpsertUnionCoDWorkflowMutation,
} from '@/services/union-admin-service';
import { directionalText } from '@/theme/layout';
import { tokens } from '@/theme/tokens';
import type { CoDStage, UnionCBARecord, UnionCBARecordDetail, UnionCoDWorkflow } from '@/types/domain';

export default function CBAScreen() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useUnionCBAWorkspace();
  const summary = data ?? {
    current_record: null,
    renewal_record: null,
    historical_records: [],
    workflows: [],
    active_workflow: null,
    evidence: [],
    stats: {
      active_count: 0,
      renewal_pending_count: 0,
      expired_or_revoked_count: 0,
      expiring_90_count: 0,
      total_covered_workers: 0,
    },
  };

  const upsertRecord = useUpsertUnionCBARecordMutation();
  const upsertWorkflow = useUpsertUnionCoDWorkflowMutation();
  const addRound = useAddNegotiationRoundMutation();
  const advanceStage = useAdvanceUnionCoDStageMutation();
  const updateStatus = useUpdateUnionCBAStatusMutation();

  const [activeTab, setActiveTab] = useState<CBAWorkspaceTab>('registry');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'renewal_pending' | 'expired' | 'revoked'>('all');
  const [selectedRecord, setSelectedRecord] = useState<UnionCBARecordDetail | null>(null);
  const [editingRecord, setEditingRecord] = useState<UnionCBARecordDetail | null>(null);
  const [recordFormOpen, setRecordFormOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<UnionCoDWorkflow | null>(null);
  const [workflowFormOpen, setWorkflowFormOpen] = useState(false);
  const [roundFormOpen, setRoundFormOpen] = useState(false);

  const filteredRecords = useMemo(() => getFilteredCbaRecords(summary, query, statusFilter), [summary, query, statusFilter]);
  const evidenceWarnings = useMemo(() => getEvidenceWarnings(summary, t), [summary, t]);

  async function handleSaveRecord(record: UnionCBARecord) {
    await upsertRecord.mutateAsync(record);
  }

  async function handleSaveWorkflow(workflow: UnionCoDWorkflow) {
    await upsertWorkflow.mutateAsync(workflow);
  }

  function handleRenewal(record: UnionCBARecordDetail) {
    void updateStatus.mutateAsync({
      cbaId: record.id,
      status: 'renewal_pending',
      note: 'Renewal posture updated from mobile CBA workspace.',
      actor: 'Union admin',
    });
  }

  function handleAdvanceWorkflow(current: CoDStage, next: CoDStage) {
    if (!summary.active_workflow) return;
    confirmStageAdvance(t, current, next, () => {
      void advanceStage.mutateAsync({
        codId: summary.active_workflow!.id,
        stage: next,
        deadline: next === 'response_pending'
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
          : next === 'strike_notice'
            ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
            : summary.active_workflow?.next_deadline,
        note: `Stage advanced to ${next}`,
      });
    });
  }

  return (
    <AppShell>
      <HeaderBar title={t('union.cbaCod')} subtitle={t('unionCore.cba.workspaceSubtitle')} variant="unionAdmin" />
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 96 }}>
          <CBAWorkspaceHero summary={summary} />
          <CBAWorkspaceTabs active={activeTab} onChange={setActiveTab} />

          {activeTab === 'registry' ? (
            <>
              <CBAMetricGrid summary={summary} />
              <CBARegistryControls query={query} setQuery={setQuery} statusFilter={statusFilter} setStatusFilter={setStatusFilter} />
              <DataState
                loading={isLoading}
                error={isError}
                empty={!filteredRecords.length}
                loadingLabel={t('states.loading')}
                errorLabel={t('states.error')}
                emptyLabel={t('unionCore.cba.emptyRegistry')}
              >
                {filteredRecords.map((record, index) => (
                  <AnimatedCBASection key={record.id} index={index}>
                    <CBARegistryCard
                      record={record}
                      onOpen={() => setSelectedRecord(record)}
                      onEdit={() => {
                        setEditingRecord(record);
                        setRecordFormOpen(true);
                      }}
                      onRenew={() => handleRenewal(record)}
                    />
                  </AnimatedCBASection>
                ))}
              </DataState>
            </>
          ) : null}

          {activeTab === 'cod' ? (
            <>
              <ActiveCoDPanel
                workflow={summary.active_workflow}
                record={summary.current_record}
                onEdit={() => {
                  setEditingWorkflow(summary.active_workflow);
                  setWorkflowFormOpen(true);
                }}
                onAdvance={(nextStage) => summary.active_workflow && handleAdvanceWorkflow(summary.active_workflow.current_stage, nextStage)}
              />
              <DataState
                loading={isLoading}
                error={isError}
                empty={!summary.active_workflow}
                loadingLabel={t('states.loading')}
                errorLabel={t('states.error')}
                emptyLabel={t('unionCore.cba.emptyWorkflow')}
              >
                {summary.active_workflow?.demands.map((demand, index) => (
                  <AnimatedCBASection key={demand.id} index={index}>
                    <DemandItemCard demand={demand} />
                  </AnimatedCBASection>
                ))}
              </DataState>
            </>
          ) : null}

          {activeTab === 'rounds' ? (
            <>
              <CBAActiveWorkflowHighlights workflow={summary.active_workflow} />
              <DataState
                loading={isLoading}
                error={isError}
                empty={!summary.active_workflow?.negotiation_rounds.length}
                loadingLabel={t('states.loading')}
                errorLabel={t('states.error')}
                emptyLabel={t('unionCore.cba.emptyRounds')}
              >
                {summary.active_workflow?.negotiation_rounds.map((round, index) => (
                  <AnimatedCBASection key={round.id} index={index}>
                    <NegotiationRoundCard round={round} />
                  </AnimatedCBASection>
                ))}
              </DataState>
            </>
          ) : null}

          {activeTab === 'evidence' ? (
            <>
              {evidenceWarnings.map((warning, index) => (
                <AnimatedCBASection key={warning.title} index={index}>
                  <View style={{ borderWidth: 1, borderColor: warning.tone === 'error' ? tokens.statusError : tokens.statusWarning, borderRadius: 12, padding: 12, backgroundColor: tokens.card, gap: 4 }}>
                    <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{warning.title}</Text>
                    <Text style={{ color: tokens.mutedForeground, fontSize: 13, lineHeight: 19, ...directionalText() }}>{warning.body}</Text>
                  </View>
                </AnimatedCBASection>
              ))}
              <DataState
                loading={isLoading}
                error={isError}
                empty={!summary.evidence.length}
                loadingLabel={t('states.loading')}
                errorLabel={t('states.error')}
                emptyLabel={t('unionCore.cba.emptyEvidence')}
              >
                {summary.evidence.map((item, index) => (
                  <AnimatedCBASection key={item.id} index={index}>
                    <EvidenceCard item={item} />
                  </AnimatedCBASection>
                ))}
              </DataState>
            </>
          ) : null}
        </ScrollView>

        <StickyCBAActionButton
          tab={activeTab}
          onAddRecord={() => {
            setEditingRecord(null);
            setRecordFormOpen(true);
          }}
          onAddWorkflow={() => {
            setEditingWorkflow(null);
            setWorkflowFormOpen(true);
          }}
          onAddRound={() => setRoundFormOpen(true)}
        />
      </View>

      <CBARecordDetailModal
        open={!!selectedRecord}
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
        onEdit={() => {
          setEditingRecord(selectedRecord);
          setSelectedRecord(null);
          setRecordFormOpen(true);
        }}
      />

      <CBARecordFormModal
        open={recordFormOpen}
        record={editingRecord}
        onClose={() => setRecordFormOpen(false)}
        onSave={handleSaveRecord}
      />

      <CoDWorkflowFormModal
        open={workflowFormOpen}
        workflow={editingWorkflow}
        defaultCbaId={summary.current_record?.id}
        onClose={() => setWorkflowFormOpen(false)}
        onSave={handleSaveWorkflow}
      />

      <NegotiationRoundFormModal
        open={roundFormOpen}
        workflow={summary.active_workflow}
        onClose={() => setRoundFormOpen(false)}
        onSave={async (round) => {
          await addRound.mutateAsync(round);
        }}
      />
    </AppShell>
  );
}
