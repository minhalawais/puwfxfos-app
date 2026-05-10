import type { ComponentType } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { directionalText, isRtlLanguage, rowDirection } from '@/theme/layout';
import { tokens } from '@/theme/tokens';

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
  tone?: 'worker' | 'union';
}) {
  const DirectionIcon = isRtlLanguage() ? ArrowLeft : ArrowRight;
  const color = tone === 'union' ? tokens.portalUnion : tokens.portalWorker;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={() => router.push(href)}
      style={{
        minHeight: 76,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: tokens.border,
        backgroundColor: tokens.card,
        padding: 12,
        flexDirection: rowDirection(),
        alignItems: 'center',
        gap: 10,
      }}
    >
      <View style={{ width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: tokens.statusInfoBg }}>
        <Icon size={21} color={color} />
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={{ color: tokens.foreground, fontSize: 15, ...directionalText('900') }}>{title}</Text>
        <Text style={{ color: tokens.mutedForeground, fontSize: 12, lineHeight: 17, ...directionalText('700') }}>{subtitle}</Text>
      </View>
      <DirectionIcon size={18} color={tokens.mutedForeground} />
    </Pressable>
  );
}
