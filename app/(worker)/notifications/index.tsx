import { router } from 'expo-router';
import {
  BadgeCheck,
  Bell,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Landmark,
  ShieldCheck,
  Siren,
  Users,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { AppShell } from '@/components/app-shell';
import { DataState } from '@/components/data-state';
import { HeaderBar } from '@/components/header-bar';
import { useMarkWorkerNotificationRead, useWorkerNotifications } from '@/services/worker-service';
import { directionalText, isRtlLanguage, rowDirection } from '@/theme/layout';
import { tokens } from '@/theme/tokens';
import type { NoticeCategory, NoticeSource, WorkerNoticeSummary } from '@/types/domain';
import {
  formatNoticeDate,
  getNoticeExcerpt,
  getNoticeRegion,
  getNoticeTheme,
  getNoticeTitle,
  NOTICE_CRIMSON,
  NOTICE_GREEN,
  NOTICE_LIGHT,
  NOTICE_NAVY,
  NOTICE_RED,
} from '@/features/worker-portal/notices';

type NoticeFilter = 'all' | NoticeSource | 'rights' | 'election' | 'membership' | 'legal_aid';

const FILTERS: NoticeFilter[] = ['all', 'puwf', 'union', 'rights', 'election', 'membership', 'legal_aid'];

export default function NotificationsScreen() {
  const { t, i18n } = useTranslation();
  const { data = [], isLoading, isError } = useWorkerNotifications();
  const markRead = useMarkWorkerNotificationRead();
  const [activeFilter, setActiveFilter] = useState<NoticeFilter>('all');
  const language = i18n.resolvedLanguage ?? 'en';

  const filteredNotices = useMemo(
    () =>
      data.filter((notice) => {
        if (activeFilter === 'all') {
          return true;
        }

        if (activeFilter === 'puwf' || activeFilter === 'union') {
          return notice.source === activeFilter;
        }

        return notice.category === activeFilter;
      }),
    [activeFilter, data],
  );

  const featuredNotice = filteredNotices.find((notice) => notice.featured) ?? filteredNotices[0];
  const remainingNotices = filteredNotices.filter((notice) => notice.id !== featuredNotice?.id);

  return (
    <AppShell>
      <HeaderBar title={t('tabs.notifications')} subtitle={t('workerPortal.notifications.subtitle')} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        <DataState
          loading={isLoading}
          error={isError}
          empty={data.length === 0}
          loadingLabel={t('states.loading')}
          errorLabel={t('states.error')}
          emptyLabel={t('workerPortal.notifications.empty')}
        >
          <View
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 24,
              borderWidth: 1,
              borderColor: 'rgba(46, 51, 140, 0.10)',
              padding: 18,
              gap: 10,
            }}
          >
            <Text style={{ color: NOTICE_CRIMSON, fontSize: 12, letterSpacing: 1.2, ...directionalText('900') }}>
              {t('workerPortal.notifications.eyebrow')}
            </Text>
            <Text style={{ color: tokens.foreground, fontSize: 24, lineHeight: 30, ...directionalText('900') }}>
              {t('workerPortal.notifications.heroTitle')}
            </Text>
            <Text style={{ color: tokens.mutedForeground, fontSize: 13, lineHeight: 20, ...directionalText('600') }}>
              {t('workerPortal.notifications.heroBody')}
            </Text>
            <View style={{ flexDirection: rowDirection(), gap: 8, flexWrap: 'wrap' }}>
              <MetaPill label={`${data.filter((notice) => !notice.read).length} ${t('workerPortal.notifications.unreadCountSuffix')}`} bg="rgba(46, 51, 140, 0.08)" fg={NOTICE_NAVY} />
              <MetaPill label={t('workerPortal.notifications.sources.puwf')} bg="rgba(3, 166, 74, 0.10)" fg={NOTICE_GREEN} />
              <MetaPill label={t('workerPortal.notifications.sources.union')} bg="rgba(242, 29, 47, 0.10)" fg={NOTICE_RED} />
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
            {FILTERS.map((filter) => {
              const active = filter === activeFilter;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t(`workerPortal.notifications.filters.${filter}`)}
                  key={filter}
                  onPress={() => setActiveFilter(filter)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 999,
                    backgroundColor: active ? NOTICE_NAVY : '#ffffff',
                    borderWidth: 1,
                    borderColor: active ? NOTICE_NAVY : 'rgba(46, 51, 140, 0.14)',
                  }}
                >
                  <Text style={{ color: active ? '#ffffff' : NOTICE_NAVY, fontSize: 12, ...directionalText('800') }}>
                    {t(`workerPortal.notifications.filters.${filter}`)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {featuredNotice ? (
            <FeaturedNoticeCard
              language={language}
              notice={featuredNotice}
              onPress={() => openNotice(markRead, featuredNotice)}
              t={t}
            />
          ) : (
            <View style={{ paddingVertical: 24 }}>
              <Text style={{ color: tokens.mutedForeground, textAlign: 'center', ...directionalText('700') }}>
                {t('workerPortal.notifications.noFilterResults')}
              </Text>
            </View>
          )}

          <View style={{ gap: 12 }}>
            {remainingNotices.map((notice) => (
              <NoticeCard key={notice.id} language={language} notice={notice} onPress={() => openNotice(markRead, notice)} t={t} />
            ))}
          </View>
        </DataState>
      </ScrollView>
    </AppShell>
  );
}

function openNotice(markRead: ReturnType<typeof useMarkWorkerNotificationRead>, notice: WorkerNoticeSummary) {
  markRead.mutate({ notificationId: notice.id });
  router.push(`/(worker)/notifications/${notice.slug}` as never);
}

function FeaturedNoticeCard({
  language,
  notice,
  onPress,
  t,
}: {
  language: string;
  notice: WorkerNoticeSummary;
  onPress: () => void;
  t: (key: string) => string;
}) {
  const rtl = isRtlLanguage();
  const DirectionIcon = rtl ? ChevronLeft : ChevronRight;
  const colors = getNoticeTheme(notice.theme);
  const title = getNoticeTitle(notice, language);
  const excerpt = getNoticeExcerpt(notice, language);
  const sourceLabel = notice.source === 'puwf' ? t('workerPortal.notifications.sources.puwf') : notice.union_name ?? t('workerPortal.notifications.sources.union');
  const region = getNoticeRegion(notice, language);
  const Icon = getNoticeIcon(notice.category);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => ({
        borderRadius: 26,
        overflow: 'hidden',
        opacity: pressed ? 0.95 : 1,
      })}
    >
      <View
        style={{
          backgroundColor: colors.accent,
          padding: 18,
          gap: 14,
        }}
      >
        <View style={{ position: 'absolute', top: -30, right: rtl ? undefined : -20, left: rtl ? -20 : undefined, width: 140, height: 140, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.07)' }} />
        <View style={{ position: 'absolute', bottom: -40, left: rtl ? undefined : -10, right: rtl ? -10 : undefined, width: 180, height: 180, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.05)' }} />
        <View style={{ flexDirection: rowDirection(), alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <MetaPill label={t('workerPortal.notifications.featured')} bg="rgba(255,255,255,0.15)" fg="#ffffff" />
          <MetaPill label={formatNoticeDate(notice.published_at, language)} bg="rgba(255,255,255,0.15)" fg="#ffffff" />
        </View>

        <View style={{ flexDirection: rowDirection(), alignItems: 'flex-start', gap: 14 }}>
          <View
            style={{
              width: 54,
              height: 54,
              borderRadius: 18,
              backgroundColor: 'rgba(255,255,255,0.14)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={24} color="#ffffff" />
          </View>
          <View style={{ flex: 1, gap: 8 }}>
            <View style={{ flexDirection: rowDirection(), gap: 8, flexWrap: 'wrap' }}>
              <MetaPill label={sourceLabel} bg="rgba(255,255,255,0.12)" fg="#ffffff" />
              <MetaPill label={t(`workerPortal.notifications.categories.${notice.category}`)} bg="rgba(255,255,255,0.12)" fg="#ffffff" />
            </View>
            <Text style={{ color: '#ffffff', fontSize: 23, lineHeight: 30, ...directionalText('900') }}>{title}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.88)', fontSize: 13, lineHeight: 20, ...directionalText('600') }}>{excerpt}</Text>
          </View>
        </View>

        <View style={{ flexDirection: rowDirection(), alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <Text style={{ flex: 1, color: 'rgba(255,255,255,0.86)', fontSize: 12, ...directionalText('700') }}>
            {region ?? t('workerPortal.notifications.regionFallback')}
          </Text>
          <View style={{ width: 38, height: 38, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' }}>
            <DirectionIcon size={18} color="#ffffff" />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function NoticeCard({
  language,
  notice,
  onPress,
  t,
}: {
  language: string;
  notice: WorkerNoticeSummary;
  onPress: () => void;
  t: (key: string) => string;
}) {
  const rtl = isRtlLanguage();
  const DirectionIcon = rtl ? ChevronLeft : ChevronRight;
  const colors = getNoticeTheme(notice.theme);
  const title = getNoticeTitle(notice, language);
  const excerpt = getNoticeExcerpt(notice, language);
  const sourceLabel = notice.source === 'puwf' ? t('workerPortal.notifications.sources.puwf') : notice.union_name ?? t('workerPortal.notifications.sources.union');
  const Icon = getNoticeIcon(notice.category);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: notice.read ? '#ffffff' : NOTICE_LIGHT,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: notice.read ? colors.border : colors.accent,
        overflow: 'hidden',
        opacity: pressed ? 0.96 : 1,
      })}
    >
      <View style={{ position: 'absolute', top: 0, bottom: 0, width: 5, backgroundColor: colors.accent, ...(rtl ? { right: 0 } : { left: 0 }) }} />
      <View style={{ padding: 16, gap: 12 }}>
        <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 12 }}>
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: 16,
              backgroundColor: colors.soft,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={20} color={colors.accent} />
          </View>
          <View style={{ flex: 1, gap: 6 }}>
            <View style={{ flexDirection: rowDirection(), gap: 8, flexWrap: 'wrap' }}>
              <MetaPill label={sourceLabel} bg={colors.soft} fg={colors.accent} />
              <MetaPill label={t(`workerPortal.notifications.categories.${notice.category}`)} bg="rgba(46, 51, 140, 0.06)" fg={NOTICE_NAVY} />
              {!notice.read ? <MetaPill label={t('workerPortal.notifications.unread')} bg="rgba(242, 29, 47, 0.10)" fg={NOTICE_RED} /> : null}
            </View>
            <Text style={{ color: tokens.foreground, fontSize: 17, lineHeight: 24, ...directionalText('900') }}>{title}</Text>
          </View>
        </View>

        <Text style={{ color: tokens.mutedForeground, fontSize: 13, lineHeight: 20, ...directionalText('600') }}>{excerpt}</Text>

        <View style={{ flexDirection: rowDirection(), alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <Text style={{ flex: 1, color: tokens.mutedForeground, fontSize: 12, ...directionalText('700') }}>
            {getNoticeRegion(notice, language) ?? t('workerPortal.notifications.regionFallback')}
          </Text>
          <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 8 }}>
            <Text style={{ color: tokens.mutedForeground, fontSize: 11, fontWeight: '800', writingDirection: 'ltr' }}>
              {formatNoticeDate(notice.published_at, language)}
            </Text>
            <View style={{ width: 30, height: 30, borderRadius: 999, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' }}>
              <DirectionIcon size={16} color={colors.accent} />
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function MetaPill({ label, bg, fg }: { label: string; bg: string; fg: string }) {
  return (
    <View style={{ borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: bg }}>
      <Text style={{ color: fg, fontSize: 11, lineHeight: 14, fontWeight: '800' }}>{label}</Text>
    </View>
  );
}

function getNoticeIcon(category: NoticeCategory) {
  switch (category) {
    case 'election':
      return BadgeCheck;
    case 'affiliation':
      return Landmark;
    case 'compliance':
      return ShieldCheck;
    case 'membership':
      return Users;
    case 'rights':
      return BookOpen;
    case 'legal_aid':
      return Siren;
    case 'dues':
      return CreditCard;
    case 'field_activity':
    default:
      return Bell;
  }
}
