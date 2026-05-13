import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AppShell } from '@/components/app-shell';
import { DataState } from '@/components/data-state';
import { HeaderBar } from '@/components/header-bar';
import { AnimatedSection } from '@/components/animated-section';
import {
  buildReviewQueues,
  filterAndSortMembers,
  ImportJobCard,
  IntakeActionCard,
  LifecycleEventCard,
  MemberDetailModal,
  MemberFormModal,
  MemberImportModal,
  MemberLifecycleModal,
  MemberMetricGrid,
  MemberWorkspaceHero,
  MemberWorkspaceTabs,
  RegistryControls,
  RegistryMemberCard,
  ReviewQueueCard,
  StickyAddButton,
  type MemberWorkspaceTab,
  type RegistryFilter,
  type RegistrySort,
} from '@/features/union-admin-members/components';
import { useUnionMemberDetail, useUnionMemberImportJobs, useUnionMembers, useUpsertUnionMemberMutation } from '@/services/union-admin-service';
import { useTranslation } from 'react-i18next';
import type { UnionMemberDetail, UnionMemberRecord } from '@/types/domain';

export default function MembersScreen() {
  const { t } = useTranslation();
  const { data = [], isLoading, isError } = useUnionMembers();
  const { data: importJobs = [] } = useUnionMemberImportJobs();
  const upsertMutation = useUpsertUnionMemberMutation();

  const [activeTab, setActiveTab] = useState<MemberWorkspaceTab>('registry');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<RegistryFilter>('all');
  const [sort, setSort] = useState<RegistrySort>('risk');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [formMember, setFormMember] = useState<UnionMemberDetail | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [lifecycleOpen, setLifecycleOpen] = useState(false);

  const { data: detailMember } = useUnionMemberDetail(detailId);

  const filtered = useMemo(() => filterAndSortMembers(data, query, filter, sort), [data, query, filter, sort]);
  const reviewQueues = useMemo(() => buildReviewQueues(data), [data]);
  const lifecycleFeed = useMemo(
    () =>
      (detailMember ? [detailMember] : [])
        .flatMap((member) => member.lifecycle_events.map((event) => ({ event, memberName: member.name })))
        .slice(0, 6),
    [detailMember],
  );

  function toggleSelect(memberId: string) {
    setSelectedIds((current) =>
      current.includes(memberId) ? current.filter((item) => item !== memberId) : [...current, memberId],
    );
  }

  async function handleSaveMember(member: UnionMemberDetail) {
    await upsertMutation.mutateAsync(member);
    setDetailId(member.id);
  }

  function openNewMember() {
    setFormMember(null);
    setFormOpen(true);
  }

  function openEditMember(memberId: string) {
    const summary = data.find((item) => item.id === memberId);
    if (!summary) return;
    setFormMember(detailMember?.id === memberId ? detailMember : summaryToDraft(summary));
    setFormOpen(true);
  }

  return (
    <AppShell>
      <HeaderBar title={t('union.members')} subtitle={t('unionCore.members.workspaceSubtitle')} variant="unionAdmin" />
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 92 }}>
          <AnimatedSection index={0}>
            <MemberWorkspaceHero members={data} />
          </AnimatedSection>

          <AnimatedSection index={1}>
            <MemberWorkspaceTabs active={activeTab} onChange={setActiveTab} />
          </AnimatedSection>

          {activeTab === 'registry' ? (
            <>
              <AnimatedSection index={2}>
                <MemberMetricGrid members={data} />
              </AnimatedSection>
              <AnimatedSection index={3}>
                <RegistryControls
                  query={query}
                  setQuery={setQuery}
                  filter={filter}
                  setFilter={setFilter}
                  sort={sort}
                  setSort={setSort}
                  selectedCount={selectedIds.length}
                />
              </AnimatedSection>
              <DataState
                loading={isLoading}
                error={isError}
                empty={!filtered.length}
                loadingLabel={t('states.loading')}
                errorLabel={t('states.error')}
                emptyLabel={t('unionCore.members.empty')}
              >
                {filtered.map((member, index) => (
                  <AnimatedSection key={member.id} index={index + 4}>
                    <RegistryMemberCard
                      member={member}
                      selected={selectedIds.includes(member.id)}
                      onToggleSelect={() => toggleSelect(member.id)}
                      onOpenDetail={() => setDetailId(member.id)}
                      onEdit={() => openEditMember(member.id)}
                      onVerify={() => setDetailId(member.id)}
                    />
                  </AnimatedSection>
                ))}
              </DataState>
            </>
          ) : null}

          {activeTab === 'intake' ? (
            <>
              <AnimatedSection index={2}>
                <IntakeActionCard
                  icon="add"
                  title={t('unionCore.members.intake.addTitle')}
                  body={t('unionCore.members.intake.addBody')}
                  onPress={openNewMember}
                />
              </AnimatedSection>
              <AnimatedSection index={3}>
                <IntakeActionCard
                  icon="import"
                  title={t('unionCore.members.intake.importTitle')}
                  body={t('unionCore.members.intake.importBody')}
                  onPress={() => setImportOpen(true)}
                />
              </AnimatedSection>
              <AnimatedSection index={4}>
                <IntakeActionCard
                  icon="review"
                  title={t('unionCore.members.intake.reviewTitle')}
                  body={t('unionCore.members.intake.reviewBody')}
                  onPress={() => setActiveTab('review')}
                />
              </AnimatedSection>
              {importJobs.map((job, index) => (
                <AnimatedSection key={job.id} index={index + 5}>
                  <ImportJobCard job={job} />
                </AnimatedSection>
              ))}
            </>
          ) : null}

          {activeTab === 'review' ? (
            <>
              <AnimatedSection index={2}>
                <ReviewQueueCard
                  title={t('unionCore.members.review.formC')}
                  body={t('unionCore.members.review.formCBody')}
                  count={reviewQueues.formC.length}
                  tone="warning"
                  onPress={() => {
                    setActiveTab('registry');
                    setFilter('verification');
                  }}
                />
              </AnimatedSection>
              <AnimatedSection index={3}>
                <ReviewQueueCard
                  title={t('unionCore.members.review.verification')}
                  body={t('unionCore.members.review.verificationBody')}
                  count={reviewQueues.verification.length}
                  tone="info"
                  onPress={() => {
                    setActiveTab('registry');
                    setFilter('verification');
                  }}
                />
              </AnimatedSection>
              <AnimatedSection index={4}>
                <ReviewQueueCard
                  title={t('unionCore.members.review.dues')}
                  body={t('unionCore.members.review.duesBody')}
                  count={reviewQueues.dues.length}
                  tone="error"
                  onPress={() => {
                    setActiveTab('registry');
                    setFilter('dues');
                  }}
                />
              </AnimatedSection>
              <AnimatedSection index={5}>
                <ReviewQueueCard
                  title={t('unionCore.members.review.election')}
                  body={t('unionCore.members.review.electionBody')}
                  count={reviewQueues.election.length}
                  tone="warning"
                  onPress={() => {
                    setActiveTab('registry');
                    setFilter('election');
                  }}
                />
              </AnimatedSection>
              <AnimatedSection index={6}>
                <ReviewQueueCard
                  title={t('unionCore.members.review.annualReturn')}
                  body={t('unionCore.members.review.annualReturnBody')}
                  count={reviewQueues.annualReturn.length}
                  tone="info"
                  onPress={() => {
                    setActiveTab('registry');
                    setSort('risk');
                  }}
                />
              </AnimatedSection>
            </>
          ) : null}

          {activeTab === 'lifecycle' ? (
            <>
              <AnimatedSection index={2}>
                <ReviewQueueCard
                  title={t('unionCore.members.lifecycle.summaryTitle')}
                  body={t('unionCore.members.lifecycle.summaryBody')}
                  count={reviewQueues.deceased.length}
                  tone="warning"
                  onPress={() => setLifecycleOpen(true)}
                />
              </AnimatedSection>
              {(detailMember?.lifecycle_events.length ? detailMember.lifecycle_events : [])
                .slice(0, 6)
                .map((event, index) => (
                  <AnimatedSection key={event.id} index={index + 3}>
                    <LifecycleEventCard event={event} memberName={detailMember?.name ?? ''} />
                  </AnimatedSection>
                ))}
            </>
          ) : null}
        </ScrollView>

        <StickyAddButton onPress={openNewMember} />
      </View>

      <MemberDetailModal
        open={!!detailId && !!detailMember}
        member={detailMember ?? null}
        onClose={() => setDetailId(null)}
        onEdit={() => {
          setFormMember(detailMember ?? null);
          setFormOpen(true);
        }}
      />

      <MemberFormModal
        open={formOpen}
        member={formMember}
        existingMembers={data}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSaveMember}
      />

      <MemberImportModal open={importOpen} onClose={() => setImportOpen(false)} />
      <MemberLifecycleModal open={lifecycleOpen} memberOptions={data} onClose={() => setLifecycleOpen(false)} />
    </AppShell>
  );
}

function summaryToDraft(member: UnionMemberRecord): UnionMemberDetail {
  return {
    ...member,
    permanent_address: '',
    current_address: '',
    establishment_name: member.company_name,
    employer_name: member.company_name,
    trade: '',
    employment_date: member.join_date,
    monthly_salary: 0,
    social_security_number: '',
    wwf_eligible: true,
    pf_status: 'pending',
    gratuity_status: 'pending',
    education_level: '',
    status_reason: 'Member record review in progress.',
    digital_id_qr_data: '',
    verification: {
      nadra_status: member.nadra_verified ? 'verified' : 'pending',
      eobi_status: member.eobi_verified ? 'verified' : 'pending',
      cnic_unique: true,
      election_roll_status: member.election_ready ? 'ready' : 'blocked',
      annual_return_status: member.annual_return_ready ? 'ready' : 'blocked',
      verification_note: '',
    },
    documents: {
      photo_attached: false,
      signature_attached: member.form_c_status === 'complete',
      thumb_attached: member.form_c_status === 'complete',
      cnic_copy_attached: true,
      subscription_consent_attached: member.form_c_status === 'complete',
      supporting_notes: '',
    },
    benefit_records: [],
    lifecycle_events: [],
  };
}
