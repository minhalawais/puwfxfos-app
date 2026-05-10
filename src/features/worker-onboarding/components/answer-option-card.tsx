import { CheckCircle2 } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { rowDirection, textAlign, writingDirection } from '@/theme/layout';
import { tokens } from '@/theme/tokens';

export function AnswerOptionCard({
  title,
  description,
  selected,
  onPress,
}: {
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{
        minHeight: 72,
        borderWidth: 1,
        borderColor: selected ? tokens.portalWorker : tokens.border,
        backgroundColor: selected ? tokens.statusInfoBg : tokens.card,
        borderRadius: 14,
        padding: 14,
        flexDirection: rowDirection(),
        gap: 12,
        alignItems: 'center',
      }}
    >
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={{ color: tokens.foreground, fontSize: 15, fontWeight: '900', lineHeight: 22, textAlign: textAlign(), writingDirection: writingDirection() }}>{title}</Text>
        <Text style={{ color: tokens.mutedForeground, fontSize: 12, fontWeight: '600', lineHeight: 18, textAlign: textAlign(), writingDirection: writingDirection() }}>{description}</Text>
      </View>
      <CheckCircle2 size={22} color={selected ? tokens.portalWorker : tokens.border} />
    </Pressable>
  );
}
