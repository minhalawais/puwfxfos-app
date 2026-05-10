import { Text, View } from 'react-native';
import { directionalText } from '@/theme/layout';
import { tokens } from '@/theme/tokens';

export function SectionCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <View style={{ backgroundColor: tokens.card, borderColor: tokens.border, borderWidth: 1, borderRadius: 10, padding: 14, gap: 10 }}>
      {title ? <Text style={{ color: tokens.foreground, fontSize: 16, ...directionalText('900') }}>{title}</Text> : null}
      {children}
    </View>
  );
}
