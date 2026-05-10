import { Download, Share2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { AppShell } from '@/components/app-shell';
import { DataState } from '@/components/data-state';
import { HeaderBar } from '@/components/header-bar';
import { SectionCard } from '@/components/section-card';
import { DigitalIdCard } from '@/features/worker-portal/components';
import { useWorkerDashboard } from '@/services/worker-service';
import { directionalText, rowDirection } from '@/theme/layout';
import { tokens } from '@/theme/tokens';

export default function DigitalIdScreen() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useWorkerDashboard();

  return (
    <AppShell>
      <HeaderBar title={t('worker.digitalId')} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <DataState loading={isLoading} error={isError} empty={!data} loadingLabel={t('states.loading')} errorLabel={t('states.error')} emptyLabel={t('states.empty')}>
          {data ? (
            <>
              <DigitalIdCard summary={data} />
              <SectionCard title={t('workerPortal.digitalId.actions')}>
                <View style={{ flexDirection: rowDirection(), gap: 10 }}>
                  <Action icon={Download} label={t('workerPortal.digitalId.downloadMock')} />
                  <Action icon={Share2} label={t('workerPortal.digitalId.shareMock')} />
                </View>
              </SectionCard>
            </>
          ) : null}
        </DataState>
      </ScrollView>
    </AppShell>
  );
}

function Action({ icon: Icon, label }: { icon: typeof Download; label: string }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} style={{ minHeight: 48, flex: 1, borderWidth: 1, borderColor: tokens.border, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: rowDirection(), gap: 8, backgroundColor: tokens.card }}>
      <Icon size={18} color={tokens.primary} />
      <Text style={{ color: tokens.primary, ...directionalText('900') }}>{label}</Text>
    </Pressable>
  );
}
