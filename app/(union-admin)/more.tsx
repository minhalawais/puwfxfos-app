import { BadgeCheck, FileArchive, Gavel, Landmark, Scale } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';
import { AnimatedSection } from '@/components/animated-section';
import { AppShell } from '@/components/app-shell';
import { HeaderBar } from '@/components/header-bar';
import { ModuleLinkCard } from '@/components/module-link-card';
import { SectionCard } from '@/components/section-card';
import { SourceNote } from '@/features/union-admin-core/components';

export default function UnionAdminMoreScreen() {
  const { t } = useTranslation();

  return (
    <AppShell>
      <HeaderBar title={t('tabs.more')} subtitle={t('unionCore.more.subtitle')} variant="unionAdmin" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <SectionCard title={t('unionCore.more.modules')} variant="unionAdmin">
          <AnimatedSection index={1}>
            <ModuleLinkCard tone="unionAdmin" icon={Landmark} title={t('union.officeBearers')} subtitle={t('unionCore.more.officeBearers')} href="/(union-admin)/office-bearers" />
          </AnimatedSection>
          <AnimatedSection index={2}>
            <ModuleLinkCard tone="unionAdmin" icon={FileArchive} title={t('union.docs')} subtitle={t('unionCore.more.documents')} href="/(union-admin)/documents-compliance" />
          </AnimatedSection>
          <AnimatedSection index={3}>
            <ModuleLinkCard tone="unionAdmin" icon={BadgeCheck} title={t('union.elections')} subtitle={t('unionCore.more.elections')} href="/(union-admin)/elections" />
          </AnimatedSection>
          <AnimatedSection index={4}>
            <ModuleLinkCard tone="unionAdmin" icon={Scale} title={t('union.cbaCod')} subtitle={t('unionCore.more.cba')} href="/(union-admin)/cba" />
          </AnimatedSection>
          <AnimatedSection index={5}>
            <ModuleLinkCard tone="unionAdmin" icon={Gavel} title={t('union.legal')} subtitle={t('unionCore.more.legal')} href="/(union-admin)/grievances-legal" />
          </AnimatedSection>
        </SectionCard>
        <SourceNote label={t('unionCore.sources.documents')} />
      </ScrollView>
    </AppShell>
  );
}
