import type { ComponentType, ReactNode } from 'react';
import { Text, View } from 'react-native';
import { alignSelfStart, directionalText, rowDirection } from '@/theme/layout';
import { tokens } from '@/theme/tokens';
import { getUnionAdminTone, unionAdminTheme } from '@/theme/union-admin';

type MetricIcon = ComponentType<{ size?: number; color?: string }>;

const toneColor = {
  success: tokens.statusSuccess,
  warning: tokens.statusWarning,
  error: tokens.statusError,
  info: tokens.statusInfo,
  neutral: tokens.primary,
};

export function MetricCard({
  icon: Icon,
  label,
  value,
  tone,
  variant = 'default',
  children,
}: {
  icon: MetricIcon;
  label: string;
  value: string;
  tone: keyof typeof toneColor;
  variant?: 'default' | 'unionAdmin';
  children?: ReactNode;
}) {
  const isUnionAdmin = variant === 'unionAdmin';
  const adminTone = getUnionAdminTone(
    tone === 'success' ? 'green' : tone === 'error' ? 'red' : tone === 'warning' ? 'crimson' : tone === 'info' ? 'navy' : 'neutral',
  );
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isUnionAdmin ? '#ffffff' : tokens.card,
        borderColor: isUnionAdmin ? adminTone.border : tokens.border,
        borderWidth: 1,
        borderRadius: isUnionAdmin ? 20 : 10,
        padding: isUnionAdmin ? 14 : 12,
        gap: isUnionAdmin ? 4 : 8,
        minHeight: isUnionAdmin ? 112 : 100,
        shadowColor: isUnionAdmin ? unionAdminTheme.shadow : 'transparent',
        shadowOpacity: isUnionAdmin ? 0.06 : 0,
        shadowRadius: isUnionAdmin ? 12 : 0,
        shadowOffset: isUnionAdmin ? { width: 0, height: 6 } : undefined,
        elevation: isUnionAdmin ? 2 : 0,
      }}
    >
      <View
        style={{
          alignSelf: alignSelfStart(),
          width: isUnionAdmin ? 38 : undefined,
          height: isUnionAdmin ? 38 : undefined,
          borderRadius: isUnionAdmin ? 12 : undefined,
          backgroundColor: isUnionAdmin ? adminTone.soft : 'transparent',
          alignItems: isUnionAdmin ? 'center' : undefined,
          justifyContent: isUnionAdmin ? 'center' : undefined,
          marginBottom: isUnionAdmin ? 4 : 0,
        }}
      >
        <Icon size={20} color={isUnionAdmin ? adminTone.accent : toneColor[tone]} />
      </View>
      <Text style={{ color: isUnionAdmin ? unionAdminTheme.mutedText : tokens.mutedForeground, fontSize: 12, ...directionalText('700') }}>{label}</Text>
      <View style={{ flexDirection: rowDirection(), alignItems: 'baseline', gap: 8 }}>
        <Text style={{ color: isUnionAdmin ? unionAdminTheme.text : tokens.foreground, fontSize: isUnionAdmin ? 22 : 20, ...directionalText('900') }}>{value}</Text>
      </View>
      {children}
    </View>
  );
}
