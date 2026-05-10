import { router } from 'expo-router';
import { ArrowLeft, ArrowRight, Languages } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
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
      <IconButton icon={Languages} label={t('common.switchLanguage')} onPress={() => setLocale(locale === 'ur' ? 'en' : 'ur')} color={tokens.primary} />
    </View>
  );
}
