import { router } from 'expo-router';
import { ArrowLeft, ArrowRight, Languages } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { IconButton } from '@/components/icon-button';
import { useLocaleStore } from '@/stores/locale-store';
import { directionalText, isRtlLanguage, rowDirection } from '@/theme/layout';
import { tokens } from '@/theme/tokens';

export function HeaderBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { t } = useTranslation();
  const { locale, setLocale } = useLocaleStore();
  const BackIcon = isRtlLanguage() ? ArrowRight : ArrowLeft;

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: tokens.border, backgroundColor: tokens.card, flexDirection: rowDirection(), alignItems: 'center', gap: 10 }}>
      <IconButton icon={BackIcon} label={t('common.back')} onPress={() => router.canGoBack() ? router.back() : router.replace('/(role-select)')} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: tokens.foreground, fontSize: 18, ...directionalText('900') }}>{title}</Text>
        {subtitle ? <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText() }}>{subtitle}</Text> : null}
      </View>
      <View style={{ 
        flexDirection: 'row', 
        backgroundColor: tokens.muted, 
        borderRadius: 24, 
        padding: 2,
        borderWidth: 1,
        borderColor: tokens.border,
        width: 90,
        height: 30,
      }}>
        <Pressable 
          onPress={() => setLocale('en')}
          style={{
            flex: 1,
            borderRadius: 20,
            backgroundColor: locale === 'en' ? tokens.card : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: locale === 'en' ? tokens.primary : 'transparent',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: locale === 'en' ? 2 : 0,
          }}
        >
          <Text style={{ fontSize: 10, fontWeight: '900', color: locale === 'en' ? tokens.primary : tokens.mutedForeground }}>EN</Text>
        </Pressable>
        <Pressable 
          onPress={() => setLocale('ur')}
          style={{
            flex: 1,
            borderRadius: 20,
            backgroundColor: locale === 'ur' ? tokens.card : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: locale === 'ur' ? tokens.primary : 'transparent',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: locale === 'ur' ? 2 : 0,
          }}
        >
          <Text style={{ fontSize: 10, fontWeight: '900', color: locale === 'ur' ? tokens.primary : tokens.mutedForeground, fontFamily: locale === 'ur' ? 'NotoSansArabic_700Bold' : undefined }}>اردو</Text>
        </Pressable>
      </View>
    </View>
  );
}
