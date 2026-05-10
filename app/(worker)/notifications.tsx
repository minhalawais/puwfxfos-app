import { router } from 'expo-router';
import { Bell, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { AppShell } from '@/components/app-shell';
import { DataState } from '@/components/data-state';
import { HeaderBar } from '@/components/header-bar';
import { StatusChip } from '@/components/status-chip';
import { useMarkWorkerNotificationRead, useWorkerNotifications } from '@/services/worker-service';
import { directionalText, isRtlLanguage, rowDirection } from '@/theme/layout';
import { tokens } from '@/theme/tokens';

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const { data = [], isLoading, isError } = useWorkerNotifications();
  const markRead = useMarkWorkerNotificationRead();
  const DirectionIcon = isRtlLanguage() ? ChevronLeft : ChevronRight;

  return (
    <AppShell>
      <HeaderBar title={t('tabs.notifications')} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
        <DataState loading={isLoading} error={isError} empty={data.length === 0} loadingLabel={t('states.loading')} errorLabel={t('states.error')} emptyLabel={t('workerPortal.notifications.empty')}>
          {data.map((notice) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t(notice.title_key)}
              key={notice.id}
              onPress={() => {
                markRead.mutate({ notificationId: notice.id });
                router.push(notice.route as never);
              }}
              style={{ backgroundColor: notice.read ? tokens.card : tokens.statusInfoBg, borderWidth: 1, borderColor: tokens.border, borderRadius: 14, padding: 12, gap: 8 }}
            >
              <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 8 }}>
                <Bell size={18} color={notice.read ? tokens.mutedForeground : tokens.portalWorker} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{t(notice.title_key)}</Text>
                  <Text style={{ color: tokens.mutedForeground, fontSize: 12, lineHeight: 18, ...directionalText() }}>{t(notice.message_key)}</Text>
                </View>
                <DirectionIcon size={18} color={tokens.mutedForeground} />
              </View>
              <View style={{ flexDirection: rowDirection(), gap: 8, alignItems: 'center' }}>
                <StatusChip tone={notice.read ? 'neutral' : 'info'} label={notice.read ? t('workerPortal.notifications.read') : t('workerPortal.notifications.unread')} />
                <StatusChip tone="neutral" label={t(`workerPortal.notifications.categories.${notice.category}`)} />
                <Text style={{ color: tokens.mutedForeground, fontSize: 11, fontWeight: '800', writingDirection: 'ltr' }}>{notice.created_at}</Text>
              </View>
            </Pressable>
          ))}
        </DataState>
      </ScrollView>
    </AppShell>
  );
}
