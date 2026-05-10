import { LockKeyhole } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { rowDirection, textAlign, writingDirection } from '@/theme/layout';
import { tokens } from '@/theme/tokens';

export function PrivacyNote({ text }: { text: string }) {
  return (
    <View style={{ flexDirection: rowDirection(), gap: 10, alignItems: 'flex-start', borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.muted, borderRadius: 14, padding: 12 }}>
      <LockKeyhole size={18} color={tokens.primary} />
      <Text style={{ flex: 1, color: tokens.mutedForeground, fontSize: 12, fontWeight: '700', lineHeight: 19, textAlign: textAlign(), writingDirection: writingDirection() }}>{text}</Text>
    </View>
  );
}
