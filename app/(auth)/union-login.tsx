import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, ArrowRight, Building2, IdCard, LockKeyhole, LogIn, ShieldCheck } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSessionStore } from '@/stores/session-store';
import { directionalText, isRtlLanguage, rowDirection, textAlign, writingDirection } from '@/theme/layout';
import { tokens } from '@/theme/tokens';

export default function UnionLoginScreen() {
  const { t } = useTranslation();
  const { signInUnionAdmin } = useSessionStore();
  const insets = useSafeAreaInsets();
  const rtl = isRtlLanguage();
  const BackIcon = rtl ? ArrowRight : ArrowLeft;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: tokens.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false} showsVerticalScrollIndicator={false}>
        {/* ═══ Hero Header (Sovereign Green) ═══ */}
        <View
          style={{
            backgroundColor: tokens.primary,
            paddingTop: Math.max(insets.top, 20) + 20,
            paddingBottom: 80, // Extra padding to let the card overlap
            paddingHorizontal: 24,
            borderBottomLeftRadius: 36,
            borderBottomRightRadius: 36,
          }}
        >
          {/* Top Bar: Back Button & Trust */}
          <View style={{ flexDirection: rowDirection(), justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={() => router.back()}
              style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}
            >
              <BackIcon size={20} color={tokens.primaryForeground} />
            </Pressable>
            <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 }}>
              <Building2 size={14} color={tokens.primaryForeground} />
              <Text style={{ color: tokens.primaryForeground, fontSize: 11, ...directionalText('700') }}>{t('auth.welcome')}</Text>
            </View>
          </View>

          {/* Branding & Titles */}
          <View style={{ alignItems: 'center', gap: 16 }}>
            <View
              style={{
                width: 76,
                height: 76,
                backgroundColor: tokens.primaryForeground,
                borderRadius: 22,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.25,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <Image source={require('../../assets/images/puwf_logo.png')} style={{ width: 50, height: 50 }} resizeMode="contain" />
            </View>
            <View style={{ alignItems: 'center', gap: 6 }}>
              <Text style={{ color: tokens.primaryForeground, fontSize: 22, ...directionalText('900') }}>
                {t('auth.unionLogin')}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 22, textAlign: 'center', paddingHorizontal: 10, ...directionalText('500') }}>
                {t('auth.subtitle')}
              </Text>
            </View>
          </View>
        </View>

        {/* ═══ Overlapping Login Card ═══ */}
        <View style={{ flex: 1, paddingHorizontal: 24, marginTop: -40, paddingBottom: insets.bottom + 24 }}>
          <View
            style={{
              backgroundColor: tokens.card,
              borderRadius: 24,
              padding: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.08,
              shadowRadius: 24,
              elevation: 10,
              borderWidth: 1,
              borderColor: 'rgba(0,0,0,0.05)',
              gap: 20,
            }}
          >
            {/* CNIC Input */}
            <View style={{ gap: 8 }}>
              <Text style={{ color: tokens.foreground, fontSize: 13, ...directionalText('700') }}>{t('auth.cnic')}</Text>
              <View style={{ flexDirection: rowDirection(), alignItems: 'center', backgroundColor: tokens.muted, borderRadius: 12, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: 'transparent' }}>
                <IdCard size={20} color={tokens.mutedForeground} />
                <TextInput
                  accessibilityLabel={t('auth.cnic')}
                  placeholder={t('auth.cnicPlaceholder')}
                  placeholderTextColor={tokens.mutedForeground}
                  autoCapitalize="none"
                  keyboardType="number-pad"
                  maxLength={13}
                  style={{ flex: 1, height: '100%', color: tokens.foreground, fontSize: 15, paddingHorizontal: 12, textAlign: textAlign(), writingDirection: writingDirection(), fontFamily: directionalText('600').fontFamily }}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={{ gap: 8 }}>
              <Text style={{ color: tokens.foreground, fontSize: 13, ...directionalText('700') }}>{t('auth.password')}</Text>
              <View style={{ flexDirection: rowDirection(), alignItems: 'center', backgroundColor: tokens.muted, borderRadius: 12, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: 'transparent' }}>
                <LockKeyhole size={20} color={tokens.mutedForeground} />
                <TextInput
                  accessibilityLabel={t('auth.password')}
                  placeholder={t('auth.passwordPlaceholder')}
                  placeholderTextColor={tokens.mutedForeground}
                  secureTextEntry
                  style={{ flex: 1, height: '100%', color: tokens.foreground, fontSize: 15, paddingHorizontal: 12, textAlign: textAlign(), writingDirection: writingDirection(), fontFamily: directionalText('600').fontFamily }}
                />
              </View>
            </View>

            {/* Login Button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('auth.signIn')}
              onPress={() => {
                signInUnionAdmin();
                router.replace('/(union-admin)/dashboard');
              }}
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.98 : 1 }],
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <View
                style={{
                  marginTop: 8,
                  height: 58,
                  backgroundColor: tokens.primary,
                  borderRadius: 14,
                  flexDirection: rowDirection(),
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <LogIn size={20} color={tokens.primaryForeground} />
                <Text style={{ color: tokens.primaryForeground, fontSize: 16, ...directionalText('900') }}>
                  {t('auth.signIn')}
                </Text>
              </View>
            </Pressable>

            {/* Forgot Password */}
            <Pressable accessibilityRole="button" style={{ alignItems: 'center', marginTop: 4 }}>
              <Text style={{ color: tokens.mutedForeground, fontSize: 13, ...directionalText('600') }}>{t('auth.forgotPassword')}</Text>
            </Pressable>
          </View>

          {/* ═══ Security Footer ═══ */}
          <View style={{ marginTop: 'auto', paddingTop: 40, alignItems: 'center', gap: 8 }}>
            <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={14} color={tokens.statusSuccess} />
              <Text style={{ color: tokens.mutedForeground, fontSize: 11, ...directionalText('700') }}>{t('auth.securityBadge')}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
