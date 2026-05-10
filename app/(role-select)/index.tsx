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
import { Image, Pressable, Text, View } from 'react-native';
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
      <View
        style={{
          flex: 1,
          paddingTop: safeTop,
          paddingBottom: safeBottom,
          paddingHorizontal: 16,
          gap: 12,
        }}
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
          <View style={{ alignItems: 'center', gap: 8 }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: tokens.muted,
              }}
            >
              <Image
                source={require('../../assets/images/puwf_logo.png')}
                resizeMode="contain"
                style={{ width: 38, height: 38 }}
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

        {/* ═══ Portal Cards — flex-distributed ═══ */}
        <View style={{ flex: 1, gap: 10 }}>
          {portals.map((portal) => (
            <PortalCard
              key={portal.id}
              portal={portal}
              DirectionIcon={DirectionIcon}
            />
          ))}
        </View>

        {/* ═══ Footer ═══ */}
        <View style={{ alignItems: 'center', gap: 4, paddingVertical: 4 }}>
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
      </View>
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

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={portal.title}
      onPress={() => router.push(portal.href)}
      style={{
        flex: 1,
        borderRadius: 14,
        backgroundColor: tokens.card,
        borderWidth: 1,
        borderColor: portal.recommended ? portal.accent : tokens.border,
        overflow: 'hidden',
      }}
    >
      {/* Accent strip */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: 4,
          backgroundColor: portal.accent,
          ...(rtl ? { right: 0 } : { left: 0 }),
        }}
      />

      <View
        style={{
          flex: 1,
          paddingVertical: 14,
          paddingLeft: rtl ? 16 : 20,
          paddingRight: rtl ? 20 : 16,
          justifyContent: 'center',
          gap: 10,
        }}
      >
        {/* Icon + Title row */}
        <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 12 }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: portal.accentBg,
            }}
          >
            <Icon size={22} color={portal.accent} />
          </View>

          <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
            <Text
              style={{
                color: tokens.foreground,
                fontSize: 16,
                lineHeight: 22, ...directionalText('900'),
              }}
              numberOfLines={1}
            >
              {portal.title}
            </Text>
            <Text
              style={{
                color: tokens.mutedForeground,
                fontSize: 12,
                lineHeight: 17, ...directionalText('600'),
              }}
              numberOfLines={1}
            >
              {portal.subtitle}
            </Text>
          </View>

          <DirectionIcon size={16} color={tokens.mutedForeground} />
        </View>

        {/* Feature + action row */}
        <View style={{ flexDirection: rowDirection(), alignItems: 'center', justifyContent: 'space-between' }}>
          <Text
            style={{
              color: tokens.mutedForeground,
              fontSize: 11,
              ...directionalText('700'),
            }}
            numberOfLines={1}
          >
            {portal.supportLine}
          </Text>

          {portal.recommended ? <View /> : null}
        </View>
      </View>
    </Pressable>
  );
}
