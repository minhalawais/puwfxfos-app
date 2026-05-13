import { Tabs } from 'expo-router';
import { CreditCard, Home, IdCard, Menu, Siren } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { tokens } from '@/theme/tokens';

export default function WorkerTabs() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tokens.primary,
        tabBarInactiveTintColor: tokens.mutedForeground,
        tabBarStyle: { backgroundColor: tokens.card, borderTopColor: tokens.border, height: 66, paddingBottom: 8, paddingTop: 6 },
        tabBarItemStyle: { minHeight: 54 },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '800' },
      }}
    >
      <Tabs.Screen name="onboarding" options={{ href: null }} />
      <Tabs.Screen name="dashboard" options={{ title: t('tabs.home'), tabBarAccessibilityLabel: t('tabs.home'), tabBarIcon: ({ color }) => <Home size={20} color={color} /> }} />
      <Tabs.Screen name="digital-id" options={{ title: t('tabs.id'), tabBarAccessibilityLabel: t('tabs.id'), tabBarIcon: ({ color }) => <IdCard size={20} color={color} /> }} />
      <Tabs.Screen name="dues" options={{ title: t('tabs.dues'), tabBarAccessibilityLabel: t('tabs.dues'), tabBarIcon: ({ color }) => <CreditCard size={20} color={color} /> }} />
      <Tabs.Screen name="grievances" options={{ title: t('tabs.grievance'), tabBarAccessibilityLabel: t('tabs.grievance'), tabBarIcon: ({ color }) => <Siren size={20} color={color} /> }} />
      <Tabs.Screen name="more" options={{ title: t('tabs.more'), tabBarAccessibilityLabel: t('tabs.more'), tabBarIcon: ({ color }) => <Menu size={20} color={color} /> }} />
      <Tabs.Screen name="redirecting" options={{ href: null }} />
      <Tabs.Screen name="voting" options={{ href: null }} />
      <Tabs.Screen name="rights" options={{ href: null }} />
      <Tabs.Screen name="my-union" options={{ href: null }} />
      <Tabs.Screen name="notifications/index" options={{ href: null }} />
      <Tabs.Screen name="notifications/[slug]" options={{ href: null }} />
    </Tabs>
  );
}
