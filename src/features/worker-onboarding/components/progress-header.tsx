import { Text, View } from 'react-native';
import { tokens } from '@/theme/tokens';
import { rowDirection, textAlign, writingDirection } from '@/theme/layout';

export function ProgressHeader({ current, total, eyebrow, title }: { current: number; total: number; eyebrow: string; title: string }) {
  const progress = Math.max(8, (current / total) * 100);

  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: rowDirection(), alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ color: tokens.portalWorker, fontSize: 12, fontWeight: '900', textAlign: textAlign(), writingDirection: writingDirection() }}>{eyebrow}</Text>
        <Text style={{ color: tokens.mutedForeground, fontSize: 12, fontWeight: '900', writingDirection: 'ltr' }}>{current}/{total}</Text>
      </View>
      <View style={{ height: 8, borderRadius: 999, backgroundColor: tokens.border, overflow: 'hidden' }}>
        <View style={{ width: `${progress}%`, height: 8, borderRadius: 999, backgroundColor: tokens.portalWorker }} />
      </View>
      <Text style={{ color: tokens.foreground, fontSize: 13, fontWeight: '700', lineHeight: 20, textAlign: textAlign(), writingDirection: writingDirection() }}>{title}</Text>
    </View>
  );
}
