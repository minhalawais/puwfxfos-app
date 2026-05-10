import type { ComponentType } from 'react';
import { Text, View } from 'react-native';
import { alignSelfStart, directionalText } from '@/theme/layout';
import { tokens } from '@/theme/tokens';

type MetricIcon = ComponentType<{ size?: number; color?: string }>;

const toneColor = {
  success: tokens.statusSuccess,
  warning: tokens.statusWarning,
  error: tokens.statusError,
  info: tokens.statusInfo,
  neutral: tokens.primary,
};

export function MetricCard({ icon: Icon, label, value, tone }: { icon: MetricIcon; label: string; value: string; tone: keyof typeof toneColor }) {
  return (
    <View style={{ flex: 1, backgroundColor: tokens.card, borderColor: tokens.border, borderWidth: 1, borderRadius: 10, padding: 12, gap: 8, minHeight: 100 }}>
      <View style={{ alignSelf: alignSelfStart() }}>
        <Icon size={20} color={toneColor[tone]} />
      </View>
      <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText('700') }}>{label}</Text>
      <Text style={{ color: tokens.foreground, fontSize: 20, ...directionalText('900') }}>{value}</Text>
    </View>
  );
}
