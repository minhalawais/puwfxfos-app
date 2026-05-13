import { Tabs } from 'expo-router';
import { Banknote, FileCheck2, Home, Menu, Users } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { tokens } from '@/theme/tokens';
import { unionAdminTheme } from '@/theme/union-admin';

export default function UnionAdminTabs() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: unionAdminTheme.navy,
        tabBarInactiveTintColor: unionAdminTheme.mutedText,
        tabBarStyle: {
          backgroundColor: unionAdminTheme.card,
          borderTopColor: unionAdminTheme.border,
          height: 74,
          paddingBottom: 10,
          paddingTop: 8,
          shadowColor: unionAdminTheme.shadow,
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
          elevation: 10,
        },
        tabBarActiveBackgroundColor: 'rgba(46, 51, 140, 0.08)',
        tabBarIconStyle: { marginTop: 2 },
        tabBarItemStyle: { minHeight: 58, marginHorizontal: 4, marginVertical: 3, borderRadius: 14 },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '800' },
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: t('tabs.home'), tabBarAccessibilityLabel: t('tabs.home'), tabBarIcon: ({ color }) => <Home size={20} color={color} /> }} />
      <Tabs.Screen name="members" options={{ title: t('union.members'), tabBarAccessibilityLabel: t('union.members'), tabBarIcon: ({ color }) => <Users size={20} color={color} /> }} />
      <Tabs.Screen name="finance" options={{ title: t('union.finance'), tabBarAccessibilityLabel: t('union.finance'), tabBarIcon: ({ color }) => <Banknote size={20} color={color} /> }} />
      <Tabs.Screen name="annual-return" options={{ title: t('union.return'), tabBarAccessibilityLabel: t('union.return'), tabBarIcon: ({ color }) => <FileCheck2 size={20} color={color} /> }} />
      <Tabs.Screen name="more" options={{ title: t('tabs.more'), tabBarAccessibilityLabel: t('tabs.more'), tabBarIcon: ({ color }) => <Menu size={20} color={color} /> }} />
      <Tabs.Screen name="office-bearers" options={{ href: null }} />
      <Tabs.Screen name="elections" options={{ href: null }} />
      <Tabs.Screen name="cba" options={{ href: null }} />
      <Tabs.Screen name="grievances-legal" options={{ href: null }} />
      <Tabs.Screen name="documents-compliance" options={{ href: null }} />
    </Tabs>
  );
}
