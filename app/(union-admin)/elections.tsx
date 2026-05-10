import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { AppShell } from '@/components/app-shell';
import { DataState } from '@/components/data-state';
import { HeaderBar } from '@/components/header-bar';
import {
  AnimatedElectionSection,
  CandidateQueueCard,
  DisputeCard,
  ElectionDetailModal,
  ElectionMetricGrid,
  ElectionNominationFormModal,
  ElectionRegistryCard,
  ElectionRegistryControls,
  ElectionScheduleFormModal,
  ElectionWorkspaceHero,
  ElectionWorkspaceTabs,
  filterElectionRegistry,
  getDisputeCards,
  getNominationQueue,
  getResultCards,
  ResultSummaryCard,
  StickyElectionActionButton,
  type ElectionStatusFilter,
  type ElectionWorkspaceTab,
  WatchlistStrip,
} from '@/features/union-admin-elections/components';
import {
  useMarkElectionOfficeBearerSyncReadyMutation,
  usePublishElectionResultsMutation,
  useReviewElectionCandidateMutation,
  useSubmitUnionElectionNominationMutation,
  useUnionElectionWorkspace,
  useUpsertUnionElectionMutation,
} from '@/services/union-admin-service';
import type { UnionElectionDetail } from '@/types/domain';

export default function ElectionsScreen() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useUnionElectionWorkspace();
  const summary =
    data ?? {
      current_election: null,
      data: [],
      nominations_under_review_count: 0,
      pending_result_count: 0,
      polling_soon_count: 0,
      nomination_open_count: 0,
      pending_office_bearer_sync_count: 0,
      disputes: [],
    };

  const upsertElection = useUpsertUnionElectionMutation();
  const reviewCandidate = useReviewElectionCandidateMutation();
  const submitNomination = useSubmitUnionElectionNominationMutation();
  const publishResults = usePublishElectionResultsMutation();
  const markSyncReady = useMarkElectionOfficeBearerSyncReadyMutation();

  const [activeTab, setActiveTab] = useState<ElectionWorkspaceTab>('registry');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ElectionStatusFilter>('all');
  const [selectedElection, setSelectedElection] = useState<UnionElectionDetail | null>(null);
  const [formElection, setFormElection] = useState<UnionElectionDetail | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [nominationElection, setNominationElection] = useState<UnionElectionDetail | null>(null);
  const [nominationOpen, setNominationOpen] = useState(false);

  const filtered = useMemo(() => filterElectionRegistry(summary.data, query, filter), [summary.data, query, filter]);
  const nominationQueue = useMemo(() => getNominationQueue(summary), [summary]);
  const resultCards = useMemo(() => getResultCards(summary), [summary]);
  const disputes = useMemo(() => getDisputeCards(summary), [summary]);

  async function handleSaveElection(election: UnionElectionDetail) {
    await upsertElection.mutateAsync(election);
    setSelectedElection(election);
  }

  async function handlePublish(election: UnionElectionDetail) {
    await publishResults.mutateAsync({
      electionId: election.id,
      votesCast: election.result_summary?.votes_cast || Math.max(1, Math.round(election.eligible_voter_count * 0.72)),
      resultDate: new Date().toISOString().slice(0, 10),
    });
  }

  return (
    <AppShell>
      <HeaderBar title={t('union.elections')} subtitle={t('unionCore.elections.workspaceSubtitle')} />
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 92 }}>
          <ElectionWorkspaceHero summary={summary} />
          <ElectionWorkspaceTabs active={activeTab} onChange={setActiveTab} />

          {activeTab === 'registry' ? (
            <>
              <ElectionMetricGrid summary={summary} />
              <WatchlistStrip summary={summary} />
              <ElectionRegistryControls query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} />
              <DataState
                loading={isLoading}
                error={isError}
                empty={!filtered.length}
                loadingLabel={t('states.loading')}
                errorLabel={t('states.error')}
                emptyLabel={t('unionCore.elections.emptyRegistry')}
              >
                {filtered.map((election, index) => (
                  <AnimatedElectionSection key={election.id} index={index}>
                    <ElectionRegistryCard
                      election={election}
                      onOpen={() => setSelectedElection(election)}
                      onEdit={() => {
                        setFormElection(election);
                        setFormOpen(true);
                      }}
                      onOpenNominations={() => {
                        setNominationElection(election);
                        setNominationOpen(true);
                      }}
                      onPublishResults={() => handlePublish(election)}
                    />
                  </AnimatedElectionSection>
                ))}
              </DataState>
            </>
          ) : null}

          {activeTab === 'nominations' ? (
            <DataState
              loading={isLoading}
              error={isError}
              empty={!nominationQueue.length}
              loadingLabel={t('states.loading')}
              errorLabel={t('states.error')}
              emptyLabel={t('unionCore.elections.emptyNominations')}
            >
              {nominationQueue.map((candidate, index) => (
                <AnimatedElectionSection key={candidate.id} index={index}>
                  <CandidateQueueCard
                    candidate={candidate}
                    onApprove={() =>
                      reviewCandidate.mutate({
                        electionId: candidate.election_id,
                        candidateId: candidate.id,
                        status: 'approved',
                        scrutinyNote: 'Approved after scrutiny review.',
                      })
                    }
                    onReject={() =>
                      reviewCandidate.mutate({
                        electionId: candidate.election_id,
                        candidateId: candidate.id,
                        status: 'rejected',
                        objectionReason: 'Rejected after scrutiny mismatch in nomination packet.',
                      })
                    }
                    onObject={() =>
                      reviewCandidate.mutate({
                        electionId: candidate.election_id,
                        candidateId: candidate.id,
                        status: 'under_objection',
                        objectionReason: 'Moved to objection review pending proposer/seconder verification.',
                      })
                    }
                  />
                </AnimatedElectionSection>
              ))}
            </DataState>
          ) : null}

          {activeTab === 'results' ? (
            <DataState
              loading={isLoading}
              error={isError}
              empty={!resultCards.length}
              loadingLabel={t('states.loading')}
              errorLabel={t('states.error')}
              emptyLabel={t('unionCore.elections.emptyResults')}
            >
              {resultCards.map((election, index) => (
                <AnimatedElectionSection key={election.id} index={index}>
                  <ResultSummaryCard
                    election={election}
                    onPublish={() => handlePublish(election)}
                    onSync={() => markSyncReady.mutate({ electionId: election.id })}
                  />
                </AnimatedElectionSection>
              ))}
            </DataState>
          ) : null}

          {activeTab === 'disputes' ? (
            <DataState
              loading={isLoading}
              error={isError}
              empty={!disputes.length}
              loadingLabel={t('states.loading')}
              errorLabel={t('states.error')}
              emptyLabel={t('unionCore.elections.emptyDisputes')}
            >
              {disputes.map((dispute, index) => (
                <AnimatedElectionSection key={dispute.id} index={index}>
                  <DisputeCard dispute={dispute} />
                </AnimatedElectionSection>
              ))}
            </DataState>
          ) : null}
        </ScrollView>

        <StickyElectionActionButton
          tab={activeTab}
          onAddSchedule={() => {
            setFormElection(null);
            setFormOpen(true);
          }}
          onAddNomination={() => {
            setNominationElection(summary.current_election);
            setNominationOpen(true);
          }}
        />
      </View>

      <ElectionDetailModal
        open={!!selectedElection}
        election={selectedElection}
        onClose={() => setSelectedElection(null)}
        onEdit={() => {
          setFormElection(selectedElection);
          setFormOpen(true);
        }}
      />

      <ElectionScheduleFormModal
        open={formOpen}
        election={formElection}
        onClose={() => setFormOpen(false)}
        onSave={handleSaveElection}
      />

      <ElectionNominationFormModal
        open={nominationOpen}
        election={nominationElection}
        onClose={() => setNominationOpen(false)}
        onSave={async (candidate) => {
          await submitNomination.mutateAsync(candidate);
        }}
      />
    </AppShell>
  );
}
