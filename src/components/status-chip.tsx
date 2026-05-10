import { Text, View } from 'react-native';
import { alignSelfStart, directionalText } from '@/theme/layout';
import { tokens } from '@/theme/tokens';

const toneMap = {
  success: { bg: tokens.statusSuccessBg, fg: tokens.statusSuccess },
  warning: { bg: tokens.statusWarningBg, fg: tokens.statusWarning },
  error: { bg: tokens.statusErrorBg, fg: tokens.statusError },
  info: { bg: tokens.statusInfoBg, fg: tokens.statusInfo },
  neutral: { bg: tokens.statusNeutralBg, fg: tokens.statusNeutral },
};

export function StatusChip({ tone, label }: { tone: keyof typeof toneMap; label: string }) {
  const colors = toneMap[tone];
  return (
    <View style={{ backgroundColor: colors.bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, alignSelf: alignSelfStart() }}>
      <Text style={{ color: colors.fg, fontSize: 11, ...directionalText('900') }}>{label}</Text>
    </View>
  );
}
