import { BadgeCheck, Bell, BookOpen, Landmark } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';
import { AnimatedSection } from '@/components/animated-section';
import { AppShell } from '@/components/app-shell';
import { HeaderBar } from '@/components/header-bar';
import { ModuleLinkCard } from '@/components/module-link-card';
import { SectionCard } from '@/components/section-card';

export default function WorkerMoreScreen() {
  const { t } = useTranslation();

  return (
    <AppShell>
      <HeaderBar title={t('tabs.more')} subtitle={t('workerPortal.more.subtitle')} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <SectionCard title={t('workerPortal.more.modules')}>
          <AnimatedSection index={1}>
            <ModuleLinkCard icon={BadgeCheck} title={t('worker.vote')} subtitle={t('workerPortal.more.vote')} href="/(worker)/voting" />
          </AnimatedSection>
          <AnimatedSection index={2}>
            <ModuleLinkCard icon={BookOpen} title={t('worker.rights')} subtitle={t('workerPortal.more.rights')} href="/(worker)/rights" />
          </AnimatedSection>
          <AnimatedSection index={3}>
            <ModuleLinkCard icon={Landmark} title={t('worker.myUnion')} subtitle={t('workerPortal.more.union')} href="/(worker)/my-union" />
          </AnimatedSection>
          <AnimatedSection index={4}>
            <ModuleLinkCard icon={Bell} title={t('tabs.notifications')} subtitle={t('workerPortal.more.notifications')} href="/(worker)/notifications" />
          </AnimatedSection>
        </SectionCard>
      </ScrollView>
    </AppShell>
  );
}
