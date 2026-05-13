import { Text, View } from 'react-native';
import { directionalText } from '@/theme/layout';
import { tokens } from '@/theme/tokens';
import { unionAdminTheme } from '@/theme/union-admin';

export function SectionCard({ title, children, variant = 'default' }: { title?: string; children: React.ReactNode; variant?: 'default' | 'unionAdmin' }) {
  const isUnionAdmin = variant === 'unionAdmin';
  return (
    <View
      style={{
        backgroundColor: isUnionAdmin ? '#ffffff' : tokens.card,
        borderColor: isUnionAdmin ? unionAdminTheme.border : tokens.border,
        borderWidth: 1,
        borderRadius: isUnionAdmin ? 22 : 10,
        padding: isUnionAdmin ? 16 : 14,
        gap: 10,
        shadowColor: isUnionAdmin ? unionAdminTheme.shadow : 'transparent',
        shadowOpacity: isUnionAdmin ? 0.08 : 0,
        shadowRadius: isUnionAdmin ? 16 : 0,
        shadowOffset: isUnionAdmin ? { width: 0, height: 8 } : undefined,
        elevation: isUnionAdmin ? 2 : 0,
      }}
    >
      {title ? <Text style={{ color: isUnionAdmin ? unionAdminTheme.text : tokens.foreground, fontSize: 16, ...directionalText('900') }}>{title}</Text> : null}
      {children}
    </View>
  );
}
