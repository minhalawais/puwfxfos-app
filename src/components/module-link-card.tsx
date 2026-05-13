import type { ComponentType } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { directionalText, isRtlLanguage, rowDirection } from '@/theme/layout';
import { tokens } from '@/theme/tokens';
import { getUnionAdminTone, unionAdminTheme } from '@/theme/union-admin';

type IconType = ComponentType<{ size?: number; color?: string }>;

export function ModuleLinkCard({
  icon: Icon,
  title,
  subtitle,
  href,
  tone = 'worker',
}: {
  icon: IconType;
  title: string;
  subtitle: string;
  href: Href;
  tone?: 'worker' | 'union' | 'unionAdmin';
}) {
  const DirectionIcon = isRtlLanguage() ? ArrowLeft : ArrowRight;
  const color = tone === 'union' ? tokens.portalUnion : tone === 'unionAdmin' ? unionAdminTheme.navy : tokens.portalWorker;
  const adminTone = getUnionAdminTone('navy');
  const isUnionAdmin = tone === 'unionAdmin';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={() => router.push(href)}
      style={{
        minHeight: 76,
        borderRadius: isUnionAdmin ? 20 : 14,
        borderWidth: 1,
        borderColor: isUnionAdmin ? adminTone.border : tokens.border,
        backgroundColor: tokens.card,
        padding: isUnionAdmin ? 14 : 12,
        flexDirection: rowDirection(),
        alignItems: 'center',
        gap: 10,
        shadowColor: isUnionAdmin ? unionAdminTheme.shadow : 'transparent',
        shadowOpacity: isUnionAdmin ? 0.06 : 0,
        shadowRadius: isUnionAdmin ? 12 : 0,
        shadowOffset: isUnionAdmin ? { width: 0, height: 6 } : undefined,
        elevation: isUnionAdmin ? 2 : 0,
      }}
    >
      <View style={{ width: isUnionAdmin ? 48 : 44, height: isUnionAdmin ? 48 : 44, borderRadius: isUnionAdmin ? 16 : 14, alignItems: 'center', justifyContent: 'center', backgroundColor: isUnionAdmin ? adminTone.soft : tokens.statusInfoBg, borderWidth: isUnionAdmin ? 1 : 0, borderColor: isUnionAdmin ? adminTone.border : 'transparent' }}>
        <Icon size={21} color={color} />
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={{ color: isUnionAdmin ? unionAdminTheme.text : tokens.foreground, fontSize: 15, ...directionalText('900') }}>{title}</Text>
        <Text style={{ color: isUnionAdmin ? unionAdminTheme.mutedText : tokens.mutedForeground, fontSize: 12, lineHeight: 17, ...directionalText('700') }}>{subtitle}</Text>
      </View>
      <DirectionIcon size={18} color={isUnionAdmin ? unionAdminTheme.navy : tokens.mutedForeground} />
    </Pressable>
  );
}
