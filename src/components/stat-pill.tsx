import { Text, View } from 'react-native';
import { directionalText } from '@/theme/layout';
import { tokens } from '@/theme/tokens';

export function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ backgroundColor: tokens.card, borderWidth: 1, borderColor: tokens.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 }}>
      <Text style={{ color: tokens.primary, ...directionalText('900') }}>{value} <Text style={{ color: tokens.mutedForeground, fontWeight: '700' }}>{label}</Text></Text>
    </View>
  );
}
