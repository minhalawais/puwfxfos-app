import { router } from 'expo-router';
import { LockKeyhole, LogIn, Mail } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, TextInput, View } from 'react-native';
import { AppShell } from '@/components/app-shell';
import { HeaderBar } from '@/components/header-bar';
import { useSessionStore } from '@/stores/session-store';
import { directionalText, rowDirection, textAlign, writingDirection } from '@/theme/layout';
import { tokens } from '@/theme/tokens';

export default function UnionLoginScreen() {
  const { t } = useTranslation();
  const { signInUnionAdmin } = useSessionStore();

  return (
    <AppShell>
      <HeaderBar title={t('auth.unionLogin')} />
      <View style={{ padding: 20, gap: 16 }}>
        <View style={{ backgroundColor: tokens.card, borderColor: tokens.border, borderWidth: 1, borderRadius: 10, padding: 16, gap: 14 }}>
          <Text style={{ color: tokens.foreground, fontSize: 20, ...directionalText('900') }}>{t('auth.welcome')}</Text>
          <View style={{ gap: 8 }}>
            <Text style={{ color: tokens.mutedForeground, ...directionalText('700') }}>{t('auth.email')}</Text>
            <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 8, borderWidth: 1, borderColor: tokens.border, borderRadius: 8, paddingHorizontal: 12 }}>
              <Mail size={18} color={tokens.mutedForeground} />
              <TextInput accessibilityLabel={t('auth.email')} placeholder={t('auth.emailPlaceholder')} placeholderTextColor={tokens.mutedForeground} style={{ flex: 1, minHeight: 46, color: tokens.foreground, textAlign: textAlign(), writingDirection: writingDirection() }} />
            </View>
          </View>
          <View style={{ gap: 8 }}>
            <Text style={{ color: tokens.mutedForeground, ...directionalText('700') }}>{t('auth.password')}</Text>
            <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 8, borderWidth: 1, borderColor: tokens.border, borderRadius: 8, paddingHorizontal: 12 }}>
              <LockKeyhole size={18} color={tokens.mutedForeground} />
              <TextInput accessibilityLabel={t('auth.password')} placeholder={t('auth.passwordPlaceholder')} placeholderTextColor={tokens.mutedForeground} secureTextEntry style={{ flex: 1, minHeight: 46, color: tokens.foreground, textAlign: textAlign(), writingDirection: writingDirection() }} />
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('auth.signIn')}
            onPress={() => {
              signInUnionAdmin();
              router.replace('/(union-admin)/dashboard');
            }}
            style={{ minHeight: 50, backgroundColor: tokens.primary, borderRadius: 8, paddingVertical: 14, alignItems: 'center', flexDirection: rowDirection(), justifyContent: 'center', gap: 8 }}
          >
            <LogIn size={18} color={tokens.primaryForeground} />
            <Text style={{ color: tokens.primaryForeground, ...directionalText('900') }}>{t('auth.signIn')}</Text>
          </Pressable>
        </View>
      </View>
    </AppShell>
  );
}
