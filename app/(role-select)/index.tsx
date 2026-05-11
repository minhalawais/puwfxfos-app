import { router, type Href } from 'expo-router';
import type { ComponentType } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  BriefcaseBusiness,
  Building2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Globe,
  ShieldCheck,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocaleStore } from '@/stores/locale-store';
import { directionalText, isRtlLanguage, rowDirection } from '@/theme/layout';
import { tokens } from '@/theme/tokens';

type PortalEntry = {
  id: string;
  title: string;
  subtitle: string;
  supportLine: string;
  actionLabel: string;
  icon: ComponentType<{ size?: number; color?: string }>;
  href: Href;
  accent: string;
  accentBg: string;
  recommended: boolean;
};

export default function RoleSelectScreen() {
  const { t } = useTranslation();
  const { locale, setLocale } = useLocaleStore();
  const insets = useSafeAreaInsets();
  const rtl = isRtlLanguage();
  const DirectionIcon = rtl ? ChevronLeft : ChevronRight;

  const portals: PortalEntry[] = [
    {
      id: 'worker',
      title: t('role.workerBadge'),
      subtitle: t('role.workerSubtitle'),
      supportLine: `${t('role.workerHighlights.id')} · ${t('role.workerHighlights.dues')} · ${t('role.workerHighlights.grievance')}`,
      actionLabel: t('role.workerEntry'),
      icon: BriefcaseBusiness,
      href: '/(worker)/onboarding' as Href,
      accent: tokens.portalWorker,
      accentBg: tokens.statusInfoBg,
      recommended: true,
    },
    {
      id: 'union',
      title: t('role.unionBadge'),
      subtitle: t('role.unionSubtitle'),
      supportLine: `${t('role.unionHighlights.members')} · ${t('role.unionHighlights.returns')} · ${t('role.unionHighlights.elections')}`,
      actionLabel: t('role.unionEntry'),
      icon: Building2,
      href: '/(auth)/union-login' as Href,
      accent: tokens.portalUnion,
      accentBg: tokens.statusSuccessBg,
      recommended: false,
    },
    {
      id: 'help',
      title: t('role.helpBadge'),
      subtitle: t('role.helpSubtitle'),
      supportLine: `${t('role.helpHighlights.rights')} · ${t('role.helpHighlights.union')} · ${t('role.helpHighlights.guides')}`,
      actionLabel: t('role.helpEntry'),
      icon: CircleHelp,
      href: '/(worker)/rights' as Href,
      accent: tokens.accent,
      accentBg: tokens.accentSoft,
      recommended: false,
    },
  ];

  const safeTop = insets.top || 54;
  const safeBottom = Math.max(insets.bottom, 20);

  return (
    <View style={{ flex: 1, backgroundColor: tokens.background }}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: safeTop,
          paddingBottom: safeBottom,
          paddingHorizontal: 16,
          gap: 12,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ═══ Header ═══ */}
        <View
          style={{
            backgroundColor: tokens.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: tokens.border,
            paddingHorizontal: 20,
            paddingVertical: 16,
            gap: 14,
          }}
        >
          {/* Language toggle — top right */}
          <View style={{ flexDirection: rowDirection(), justifyContent: 'flex-end' }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('common.switchLanguage')}
              onPress={() => setLocale(locale === 'ur' ? 'en' : 'ur')}
              style={{
                minHeight: 32,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: tokens.border,
                backgroundColor: tokens.muted,
                paddingHorizontal: 10,
                flexDirection: rowDirection(),
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
              }}
            >
              <Globe size={13} color={tokens.mutedForeground} />
              <Text style={{ color: tokens.foreground, fontSize: 11, fontWeight: '800' }}>
                {locale === 'ur' ? 'EN' : 'اردو'}
              </Text>
            </Pressable>
          </View>

          {/* Centered branding */}
          <View style={{ alignItems: 'center', gap: 10 }}>
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: tokens.primary,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.2,
                shadowRadius: 10,
                elevation: 5,
              }}
            >
              <Image
                source={require('../../assets/images/puwf_logo.png')}
                resizeMode="contain"
                style={{ width: 76, height: 76 }}
              />
            </View>
            <View style={{ alignItems: 'center', gap: 2 }}>
              <Text
                style={{
                  color: tokens.foreground,
                  fontSize: 20,
                  letterSpacing: 0.3, ...directionalText('900'),
                }}
              >
                {t('app.name')}
              </Text>
              <Text
                style={{
                  color: tokens.mutedForeground,
                  fontSize: 12,
                  ...directionalText('600'),
                }}
              >
                {t('role.heading')}
              </Text>
            </View>
          </View>

          {/* Trust badge */}
          <View
            style={{
              flexDirection: rowDirection(),
              justifyContent: 'center',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <ShieldCheck size={12} color={tokens.portalUnion} />
            <Text
              style={{
                color: tokens.mutedForeground,
                fontSize: 10,
                ...directionalText('700'),
              }}
            >
              {t('role.trustLabel')}
            </Text>
          </View>
        </View>

        {/* ═══ Portal Cards ═══ */}
        <View style={{ gap: 10 }}>
          {portals.map((portal) => (
            <PortalCard
              key={portal.id}
              portal={portal}
              DirectionIcon={DirectionIcon}
            />
          ))}
        </View>

        {/* ═══ Footer ═══ */}
        <View style={{ alignItems: 'center', gap: 4, paddingVertical: 4, marginTop: 'auto' }}>
          <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 6 }}>
            <Image
              source={require('../../assets/images/fos_tree.png')}
              resizeMode="contain"
              style={{ width: 14, height: 14 }}
            />
            <Text
              style={{
                color: tokens.mutedForeground,
                fontSize: 10,
                ...directionalText('700'),
              }}
            >
              {t('role.coBrand')}
            </Text>
          </View>
          <Text
            style={{
              color: tokens.mutedForeground,
              fontSize: 9,
              opacity: 0.7, ...directionalText('600'),
            }}
          >
            {t('role.helpline')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

/* ─── Portal Card ─── */

function PortalCard({
  portal,
  DirectionIcon,
}: {
  portal: PortalEntry;
  DirectionIcon: ComponentType<{ size?: number; color?: string }>;
}) {
  const rtl = isRtlLanguage();
  const Icon = portal.icon;
  const { t } = useTranslation();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={portal.title}
      onPress={() => router.push(portal.href)}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      {/* Outer wrapper for Shadows */}
      <View
        style={{
          borderRadius: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.08,
          shadowRadius: 16,
          elevation: 6,
        }}
      >
        {/* Inner wrapper for Background, Borders, and Clipping */}
        <View
          style={{
            borderRadius: 20,
            backgroundColor: tokens.card,
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.03)',
            overflow: 'hidden',
          }}
        >
          {/* Accent strip (perfectly clipped by parent overflow: hidden) */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: 5,
              backgroundColor: portal.accent,
              ...(rtl ? { right: 0 } : { left: 0 }),
            }}
          />

          <View
            style={{
              paddingTop: 20,
              paddingBottom: 20,
              paddingLeft: rtl ? 20 : 24,
              paddingRight: rtl ? 24 : 20,
              justifyContent: 'center',
              gap: 16,
            }}
          >
            {/* Icon + Title row */}
            <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 14 }}>
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: portal.accentBg,
                  borderWidth: 1,
                  borderColor: 'rgba(0,0,0,0.03)',
                }}
              >
                <Icon size={26} color={portal.accent} />
              </View>

              <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
                <Text
                  style={{
                    color: tokens.foreground,
                    fontSize: 18,
                    lineHeight: 24, ...directionalText('900'),
                  }}
                  numberOfLines={1}
                >
                  {portal.title}
                </Text>
                <Text
                  style={{
                    color: tokens.mutedForeground,
                    fontSize: 13,
                    lineHeight: 18, ...directionalText('600'),
                  }}
                  numberOfLines={2}
                >
                  {portal.subtitle}
                </Text>
              </View>
            </View>

            {/* Feature row */}
            <View style={{ flexDirection: rowDirection(), alignItems: 'center', justifyContent: 'space-between', backgroundColor: tokens.muted, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 }}>
              <Text
                style={{
                  flex: 1,
                  color: tokens.mutedForeground,
                  fontSize: 11,
                  ...directionalText('700'),
                }}
                numberOfLines={1}
              >
                {portal.supportLine}
              </Text>

              {/* Arrow Pill */}
              <View style={{ backgroundColor: portal.accentBg, padding: 4, borderRadius: 100 }}>
                <DirectionIcon size={14} color={portal.accent} />
              </View>
            </View>
          </View>
        </View>

      </View>
    </Pressable>
  );
}
