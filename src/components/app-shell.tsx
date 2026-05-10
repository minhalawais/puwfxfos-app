import { SafeAreaView } from 'react-native-safe-area-context';
import { layoutDirection } from '@/theme/layout';
import { tokens } from '@/theme/tokens';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.background, direction: layoutDirection() }}>
      {children}
    </SafeAreaView>
  );
}
