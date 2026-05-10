import { ShieldCheck } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { alignSelfStart, rowDirection, textAlign } from '@/theme/layout';
import { tokens } from '@/theme/tokens';

export function QuestionCard({ title, description, source }: { title: string; description: string; source: string }) {
  return (
    <View style={{ backgroundColor: tokens.card, borderWidth: 1, borderColor: tokens.border, borderRadius: 18, padding: 18, gap: 12 }}>
      <Text style={{ color: tokens.foreground, fontSize: 25, fontWeight: '900', lineHeight: 36, textAlign: textAlign() }}>{title}</Text>
      <Text style={{ color: tokens.mutedForeground, fontSize: 14, fontWeight: '600', lineHeight: 22, textAlign: textAlign() }}>{description}</Text>
      <View style={{ flexDirection: rowDirection(), gap: 8, alignItems: 'center', backgroundColor: tokens.secondary, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 10, alignSelf: alignSelfStart() }}>
        <ShieldCheck size={15} color={tokens.primary} />
        <Text style={{ color: tokens.primary, fontSize: 11, fontWeight: '900', textAlign: textAlign() }}>{source}</Text>
      </View>
    </View>
  );
}
