import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, ChevronRight, ExternalLink, Info, Tag } from 'lucide-react-native';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { AppShell } from '@/components/app-shell';
import { DataState } from '@/components/data-state';
import { HeaderBar } from '@/components/header-bar';
import { useMarkWorkerNotificationRead, useWorkerNoticeDetail, useWorkerNotifications } from '@/services/worker-service';
import { directionalText, isRtlLanguage, rowDirection } from '@/theme/layout';
import { tokens } from '@/theme/tokens';
import {
  formatNoticeDate,
  getNoticeAuthor,
  getNoticeBody,
  getNoticeCtaLabel,
  getNoticeExcerpt,
  getNoticeRegion,
  getNoticeSourceLabel,
  getNoticeTags,
  getNoticeTheme,
  getNoticeTitle,
  NOTICE_LIGHT,
  NOTICE_NAVY,
} from '@/features/worker-portal/notices';

export default function WorkerNoticeDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const { data: notice, isLoading, isError } = useWorkerNoticeDetail(slug ?? '');
  const { data: summaries = [] } = useWorkerNotifications();
  const markRead = useMarkWorkerNotificationRead();
  const language = i18n.resolvedLanguage ?? 'en';
  const rtl = isRtlLanguage();
  const DirectionIcon = rtl ? ChevronLeft : ChevronRight;

  useEffect(() => {
    if (notice && !notice.read) {
      markRead.mutate({ notificationId: notice.id });
    }
  }, [markRead, notice]);

  const related = summaries.filter((item) => notice?.related_notice_ids.includes(item.id));
  const colors = notice ? getNoticeTheme(notice.theme) : getNoticeTheme('navy');
  const title = notice ? getNoticeTitle(notice, language) : '';
  const excerpt = notice ? getNoticeExcerpt(notice, language) : '';
  const author = notice ? getNoticeAuthor(notice, language) : '';
  const sourceLabel = notice ? getNoticeSourceLabel(notice, language) : '';
  const ctaLabel = notice ? getNoticeCtaLabel(notice, language) : undefined;
  const paragraphs = notice ? getNoticeBody(notice, language).split('\n\n') : [];
  const tags = notice ? getNoticeTags(notice, language) : [];

  return (
    <AppShell>
      <HeaderBar title={t('tabs.notifications')} subtitle={t('workerPortal.notifications.detailSubtitle')} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        <DataState
          loading={isLoading}
          error={isError}
          empty={!notice}
          loadingLabel={t('states.loading')}
          errorLabel={t('states.error')}
          emptyLabel={t('workerPortal.notifications.notFound')}
        >
          {notice ? (
            <>
              <View
                style={{
                  backgroundColor: colors.accent,
                  borderRadius: 28,
                  overflow: 'hidden',
                  padding: 20,
                  gap: 14,
                }}
              >
                <View style={{ flexDirection: rowDirection(), gap: 8, flexWrap: 'wrap' }}>
                  <HeroPill label={notice.source === 'puwf' ? t('workerPortal.notifications.sources.puwf') : notice.union_name ?? t('workerPortal.notifications.sources.union')} />
                  <HeroPill label={t(`workerPortal.notifications.categories.${notice.category}`)} />
                  <HeroPill label={formatNoticeDate(notice.published_at, language)} />
                </View>
                <Text style={{ color: '#ffffff', fontSize: 26, lineHeight: 34, ...directionalText('900') }}>{title}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.88)', fontSize: 14, lineHeight: 21, ...directionalText('600') }}>{excerpt}</Text>
                <View style={{ flexDirection: rowDirection(), alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={{ color: 'rgba(255,255,255,0.72)', fontSize: 11, ...directionalText('700') }}>
                      {t('workerPortal.notifications.publishedBy')}
                    </Text>
                    <Text style={{ color: '#ffffff', fontSize: 14, ...directionalText('800') }}>{author}</Text>
                  </View>
                  <Text style={{ color: 'rgba(255,255,255,0.82)', fontSize: 12, ...directionalText('700') }}>
                    {getNoticeRegion(notice, language) ?? t('workerPortal.notifications.regionFallback')}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: 18,
                  gap: 16,
                }}
              >
                <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 10 }}>
                  <View
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      backgroundColor: colors.soft,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Info size={18} color={colors.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: tokens.foreground, fontSize: 16, ...directionalText('900') }}>
                      {t('workerPortal.notifications.sourceContext')}
                    </Text>
                    <Text style={{ color: tokens.mutedForeground, fontSize: 12, lineHeight: 18, ...directionalText('600') }}>
                      {sourceLabel}
                    </Text>
                  </View>
                </View>

                {notice.document_basis ? (
                  <View style={{ backgroundColor: NOTICE_LIGHT, borderRadius: 18, padding: 14, gap: 6 }}>
                    <Text style={{ color: NOTICE_NAVY, fontSize: 12, ...directionalText('800') }}>
                      {t('workerPortal.notifications.documentBasis')}
                    </Text>
                    <Text style={{ color: tokens.foreground, fontSize: 13, lineHeight: 20, ...directionalText('700') }}>
                      {notice.document_basis}
                    </Text>
                  </View>
                ) : null}

                <View style={{ gap: 12 }}>
                  {paragraphs.map((paragraph) => (
                    <Text key={paragraph} style={{ color: tokens.foreground, fontSize: 15, lineHeight: 24, ...directionalText('500') }}>
                      {paragraph}
                    </Text>
                  ))}
                </View>

                {tags.length ? (
                  <View style={{ gap: 10 }}>
                    <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 8 }}>
                      <Tag size={16} color={colors.accent} />
                      <Text style={{ color: tokens.foreground, fontSize: 14, ...directionalText('800') }}>
                        {t('workerPortal.notifications.tags')}
                      </Text>
                    </View>
                    <View style={{ flexDirection: rowDirection(), gap: 8, flexWrap: 'wrap' }}>
                      {tags.map((tag) => (
                        <View key={tag} style={{ borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: colors.soft }}>
                          <Text style={{ color: colors.accent, fontSize: 11, fontWeight: '800' }}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : null}
              </View>

              {ctaLabel && notice.cta_route ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={ctaLabel}
                  onPress={() => router.push(notice.cta_route as never)}
                  style={({ pressed }) => ({
                    minHeight: 60,
                    borderRadius: 20,
                    backgroundColor: colors.accent,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 18,
                    opacity: pressed ? 0.95 : 1,
                  })}
                >
                  <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 10 }}>
                    <Text style={{ color: '#ffffff', fontSize: 16, ...directionalText('900') }}>{ctaLabel}</Text>
                    <DirectionIcon size={18} color="#ffffff" />
                  </View>
                </Pressable>
              ) : null}

              {notice.external_source_url ? (
                <View style={{ backgroundColor: '#ffffff', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(46, 51, 140, 0.12)', padding: 16, gap: 10 }}>
                  <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 10 }}>
                    <ExternalLink size={18} color={NOTICE_NAVY} />
                    <Text style={{ color: tokens.foreground, fontSize: 14, ...directionalText('800') }}>
                      {t('workerPortal.notifications.referenceLink')}
                    </Text>
                  </View>
                  <Text style={{ color: tokens.mutedForeground, fontSize: 12, lineHeight: 18, writingDirection: 'ltr' }}>
                    {notice.external_source_url}
                  </Text>
                </View>
              ) : null}

              {related.length ? (
                <View style={{ gap: 12 }}>
                  <Text style={{ color: tokens.foreground, fontSize: 18, ...directionalText('900') }}>
                    {t('workerPortal.notifications.related')}
                  </Text>
                  {related.map((item) => (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={getNoticeTitle(item, language)}
                      key={item.id}
                      onPress={() => router.push(`/(worker)/notifications/${item.slug}` as never)}
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: 'rgba(46, 51, 140, 0.12)',
                        padding: 14,
                        gap: 8,
                      }}
                    >
                      <Text style={{ color: tokens.foreground, fontSize: 15, lineHeight: 22, ...directionalText('800') }}>
                        {getNoticeTitle(item, language)}
                      </Text>
                      <Text style={{ color: tokens.mutedForeground, fontSize: 12, lineHeight: 18, ...directionalText('600') }}>
                        {getNoticeExcerpt(item, language)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </>
          ) : null}
        </DataState>
      </ScrollView>
    </AppShell>
  );
}

function HeroPill({ label }: { label: string }) {
  return (
    <View style={{ borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.14)', paddingHorizontal: 10, paddingVertical: 6 }}>
      <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: '800' }}>{label}</Text>
    </View>
  );
}
