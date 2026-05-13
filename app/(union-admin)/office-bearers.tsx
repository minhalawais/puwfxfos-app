import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { AnimatedSection } from '@/components/animated-section';
import { AppShell } from '@/components/app-shell';
import { DataState } from '@/components/data-state';
import { HeaderBar } from '@/components/header-bar';
import {
  getFilteredOfficeBearers,
  getHistoryFeed,
  getReviewCards,
  OfficeBearerDetailModal,
  OfficeBearerFormModal,
  OfficeBearerHistoryModal,
  OfficeBearerRegistryCard,
  OfficeHistoryEventCard,
  OfficeMetricGrid,
  OfficeRegistryControls,
  OfficeReviewCard,
  OfficeWorkspaceHero,
  OfficeWorkspaceTabs,
  StickyAddBearerButton,
  useOfficeBearerStatusActions,
  type OfficeWorkspaceTab,
} from '@/features/union-admin-office-bearers/components';
import { useOfficeBearers, useUpsertOfficeBearerMutation } from '@/services/union-admin-service';
import type { UnionOfficeBearerRecord } from '@/types/domain';

export default function OfficeBearersScreen() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useOfficeBearers();
  const summary = data ?? { data: [], outsider_percentage: 0, women_count: 0, expiring_soon_count: 0, vacancies: [] };
  const upsertMutation = useUpsertOfficeBearerMutation();
  const { updateStatus } = useOfficeBearerStatusActions();

  const [activeTab, setActiveTab] = useState<OfficeWorkspaceTab>('registry');
  const [query, setQuery] = useState('');
  const [selectedBearer, setSelectedBearer] = useState<UnionOfficeBearerRecord | null>(null);
  const [historyBearer, setHistoryBearer] = useState<UnionOfficeBearerRecord | null>(null);
  const [formBearer, setFormBearer] = useState<UnionOfficeBearerRecord | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const filtered = useMemo(() => getFilteredOfficeBearers(summary, query), [summary, query]);
  const historyFeed = useMemo(() => getHistoryFeed(summary), [summary]);
  const reviewCards = useMemo(() => getReviewCards(summary, (key, options) => t(key, options)), [summary, t]);

  async function saveBearer(record: UnionOfficeBearerRecord) {
    await upsertMutation.mutateAsync(record);
    setSelectedBearer(record);
  }

  return (
    <AppShell>
      <HeaderBar title={t('union.officeBearers')} subtitle={t('unionCore.office.workspaceSubtitle')} variant="unionAdmin" />
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 92 }}>
          <OfficeWorkspaceHero summary={summary} />
          <OfficeWorkspaceTabs active={activeTab} onChange={setActiveTab} />

          {activeTab === 'registry' ? (
            <>
              <OfficeMetricGrid summary={summary} />
              <OfficeRegistryControls query={query} setQuery={setQuery} />
              <DataState
                loading={isLoading}
                error={isError}
                empty={!filtered.length}
                loadingLabel={t('states.loading')}
                errorLabel={t('states.error')}
                emptyLabel={t('unionCore.office.empty')}
              >
                {filtered.map((bearer, index) => (
                  <AnimatedBearer key={bearer.id} index={index}>
                    <OfficeBearerRegistryCard
                      bearer={bearer}
                      onOpen={() => setSelectedBearer(bearer)}
                      onEdit={() => {
                        setFormBearer(bearer);
                        setFormOpen(true);
                      }}
                      onHistory={() => setHistoryBearer(bearer)}
                      onResign={() => updateStatus(bearer, 'resigned', 'resigned', t('unionCore.office.historyNotes.resigned'))}
                      onReplace={() => updateStatus(bearer, 'replaced', 'replaced', t('unionCore.office.historyNotes.replaced'))}
                      onReinstate={() => updateStatus(bearer, 'reinstated', 'reinstated', t('unionCore.office.historyNotes.reinstated'))}
                    />
                  </AnimatedBearer>
                ))}
              </DataState>
            </>
          ) : null}

          {activeTab === 'review' ? (
            <>
              {reviewCards.map((card, index) => (
                <AnimatedBearer key={card.title} index={index}>
                  <OfficeReviewCard title={card.title} body={card.body} tone={card.tone} countLabel={card.countLabel} />
                </AnimatedBearer>
              ))}
              {summary.vacancies.length ? (
                <AnimatedBearer index={reviewCards.length + 1}>
                  <OfficeReviewCard
                    title={t('unionCore.office.vacancyList')}
                    body={summary.vacancies.join(', ')}
                    tone="info"
                    countLabel={String(summary.vacancies.length)}
                  />
                </AnimatedBearer>
              ) : null}
            </>
          ) : null}

          {activeTab === 'history' ? (
            <>
              {historyFeed.map(({ bearerName, event }, index) => (
                <AnimatedBearer key={event.id} index={index}>
                  <OfficeHistoryEventCard event={event} name={bearerName} />
                </AnimatedBearer>
              ))}
            </>
          ) : null}
        </ScrollView>

        <StickyAddBearerButton
          onPress={() => {
            setFormBearer(null);
            setFormOpen(true);
          }}
        />
      </View>

      <OfficeBearerDetailModal
        open={!!selectedBearer}
        bearer={selectedBearer}
        onClose={() => setSelectedBearer(null)}
        onEdit={() => {
          setFormBearer(selectedBearer);
          setFormOpen(true);
        }}
        onOpenHistory={() => {
          setHistoryBearer(selectedBearer);
          setSelectedBearer(null);
        }}
      />

      <OfficeBearerHistoryModal open={!!historyBearer} bearer={historyBearer} onClose={() => setHistoryBearer(null)} />

      <OfficeBearerFormModal
        open={formOpen}
        bearer={formBearer}
        summary={summary}
        onClose={() => setFormOpen(false)}
        onSave={saveBearer}
      />
    </AppShell>
  );
}

function AnimatedBearer({ children, index }: { children: React.ReactNode; index: number }) {
  return <AnimatedSection index={index}>{children}</AnimatedSection>;
}
