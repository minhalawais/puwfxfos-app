import type { ComponentType } from 'react';
import { Pressable } from 'react-native';
import { tokens } from '@/theme/tokens';

type IconType = ComponentType<{ size?: number; color?: string }>;

export function IconButton({
  icon: Icon,
  label,
  onPress,
  color = tokens.foreground,
}: {
  icon: IconType;
  label: string;
  onPress: () => void;
  color?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={onPress}
      style={{
        width: 44,
        height: 44,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: tokens.border,
        backgroundColor: tokens.card,
      }}
    >
      <Icon size={19} color={color} />
    </Pressable>
  );
}
