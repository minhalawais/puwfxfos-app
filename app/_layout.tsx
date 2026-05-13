import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { I18nManager } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import '../global.css';
import '@/i18n';
import { useLocaleStore } from '@/stores/locale-store';
import { isRtlLanguage } from '@/theme/layout';
import { useFonts as useLexendFonts, Lexend_400Regular, Lexend_600SemiBold, Lexend_700Bold, Lexend_900Black } from '@expo-google-fonts/lexend';
import { useFonts as useNotoSansFonts, NotoSansArabic_400Regular, NotoSansArabic_600SemiBold, NotoSansArabic_700Bold, NotoSansArabic_900Black } from '@expo-google-fonts/noto-sans-arabic';
import { useFonts as useNotoNastaliqFonts, NotoNastaliqUrdu_400Regular, NotoNastaliqUrdu_700Bold } from '@expo-google-fonts/noto-nastaliq-urdu';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [client] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60_000, retry: 1, refetchOnReconnect: true },
      mutations: { retry: 0 },
    },
  }));
  const { locale } = useLocaleStore();

  const [lexendLoaded] = useLexendFonts({ Lexend_400Regular, Lexend_600SemiBold, Lexend_700Bold, Lexend_900Black });
  const [notoSansLoaded] = useNotoSansFonts({ NotoSansArabic_400Regular, NotoSansArabic_600SemiBold, NotoSansArabic_700Bold, NotoSansArabic_900Black });
  const [notoNastaliqLoaded] = useNotoNastaliqFonts({ NotoNastaliqUrdu_400Regular, NotoNastaliqUrdu_700Bold });

  const fontsLoaded = lexendLoaded && notoSansLoaded && notoNastaliqLoaded;

  useEffect(() => {
    if (I18nManager.isRTL) {
      I18nManager.allowRTL(false);
      I18nManager.forceRTL(false);
    }
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [locale, fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={client}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: isRtlLanguage() ? 'slide_from_left' : 'slide_from_right' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(role-select)/index" />
        <Stack.Screen name="(auth)/union-login" />
        <Stack.Screen name="(worker)" />
        <Stack.Screen name="(union-admin)" />
      </Stack>
    </QueryClientProvider>
  );
}
