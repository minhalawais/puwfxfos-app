import { AlertTriangle, Inbox } from 'lucide-react-native';
import { ActivityIndicator, Text, View } from 'react-native';
import { directionalText, rowDirection } from '@/theme/layout';
import { tokens } from '@/theme/tokens';

export function DataState({
  loading,
  error,
  empty,
  loadingLabel,
  errorLabel,
  emptyLabel,
  children,
}: {
  loading?: boolean;
  error?: boolean;
  empty?: boolean;
  loadingLabel: string;
  errorLabel: string;
  emptyLabel: string;
  children: React.ReactNode;
}) {
  if (loading) {
    return (
      <View accessibilityRole="progressbar" accessibilityLabel={loadingLabel} accessibilityLiveRegion="polite" style={{ minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <ActivityIndicator color={tokens.primary} />
        <Text style={{ color: tokens.mutedForeground, ...directionalText('800') }}>{loadingLabel}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View accessibilityRole="alert" accessibilityLabel={errorLabel} accessibilityLiveRegion="assertive" style={{ minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16 }}>
        <AlertTriangle size={24} color={tokens.statusError} />
        <Text style={{ color: tokens.statusError, ...directionalText('900') }}>{errorLabel}</Text>
      </View>
    );
  }

  if (empty) {
    return (
      <View accessibilityRole="summary" accessibilityLabel={emptyLabel} style={{ minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16 }}>
        <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 8 }}>
          <Inbox size={22} color={tokens.mutedForeground} />
          <Text style={{ color: tokens.mutedForeground, ...directionalText('900') }}>{emptyLabel}</Text>
        </View>
      </View>
    );
  }

  return <>{children}</>;
}
