import { router } from 'expo-router';
import { ArrowLeft, ArrowRight, Languages } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { IconButton } from '@/components/icon-button';
import { useLocaleStore } from '@/stores/locale-store';
import { directionalText, isRtlLanguage, rowDirection } from '@/theme/layout';
import { tokens } from '@/theme/tokens';

export function HeaderBar({ title, subtitle, variant = 'default' }: { title: string; subtitle?: string; variant?: 'default' | 'unionAdmin' }) {
  const { t } = useTranslation();
  const { locale, setLocale } = useLocaleStore();
  const BackIcon = isRtlLanguage() ? ArrowRight : ArrowLeft;
  const backgroundColor = tokens.card;
  const borderColor = tokens.border;
  const titleColor = tokens.foreground;
  const subtitleColor = tokens.mutedForeground;
  const switchBackground = tokens.muted;
  const switchBorder = tokens.border;
  const activeSwitchBg = tokens.card;
  const activeSwitchFg = tokens.primary;
  const inactiveSwitchFg = tokens.mutedForeground;

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: borderColor, backgroundColor, flexDirection: rowDirection(), alignItems: 'center', gap: 10 }}>
      <IconButton icon={BackIcon} label={t('common.back')} color={tokens.foreground} variant="default" onPress={() => router.canGoBack() ? router.back() : router.replace('/(role-select)')} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: titleColor, fontSize: 18, ...directionalText('900') }}>{title}</Text>
        {subtitle ? <Text style={{ color: subtitleColor, fontSize: 12, ...directionalText() }}>{subtitle}</Text> : null}
      </View>
      <View style={{ 
        flexDirection: 'row', 
        backgroundColor: switchBackground, 
        borderRadius: 24, 
        padding: 2,
        borderWidth: 1,
        borderColor: switchBorder,
        width: 90,
        height: 30,
      }}>
        <Pressable 
          onPress={() => setLocale('en')}
          style={{
            flex: 1,
            borderRadius: 20,
            backgroundColor: locale === 'en' ? activeSwitchBg : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: locale === 'en' ? tokens.primary : 'transparent',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: locale === 'en' ? 2 : 0,
          }}
        >
          <Text style={{ fontSize: 10, fontWeight: '900', color: locale === 'en' ? activeSwitchFg : inactiveSwitchFg }}>EN</Text>
        </Pressable>
        <Pressable 
          onPress={() => setLocale('ur')}
          style={{
            flex: 1,
            borderRadius: 20,
            backgroundColor: locale === 'ur' ? activeSwitchBg : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: locale === 'ur' ? tokens.primary : 'transparent',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: locale === 'ur' ? 2 : 0,
          }}
        >
          <Text style={{ fontSize: 10, fontWeight: '900', color: locale === 'ur' ? activeSwitchFg : inactiveSwitchFg, fontFamily: locale === 'ur' ? 'NotoSansArabic_700Bold' : undefined }}>اردو</Text>
        </Pressable>
      </View>
    </View>
  );
}
