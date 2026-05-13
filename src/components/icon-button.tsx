import type { ComponentType } from 'react';
import { Pressable } from 'react-native';
import { tokens } from '@/theme/tokens';
import { unionAdminTheme } from '@/theme/union-admin';

type IconType = ComponentType<{ size?: number; color?: string }>;

export function IconButton({
  icon: Icon,
  label,
  onPress,
  color = tokens.foreground,
  variant = 'default',
}: {
  icon: IconType;
  label: string;
  onPress: () => void;
  color?: string;
  variant?: 'default' | 'unionAdmin';
}) {
  const isUnionAdmin = variant === 'unionAdmin';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={onPress}
      style={{
        width: 44,
        height: 44,
        borderRadius: isUnionAdmin ? 14 : 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: isUnionAdmin ? 'rgba(255,255,255,0.20)' : tokens.border,
        backgroundColor: isUnionAdmin ? 'rgba(255,255,255,0.10)' : tokens.card,
      }}
    >
      <Icon size={19} color={color} />
    </Pressable>
  );
}
