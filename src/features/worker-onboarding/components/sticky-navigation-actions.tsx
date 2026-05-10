import { ArrowLeft, ArrowRight, Check } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { directionalText, isRtlLanguage, rowDirection } from '@/theme/layout';
import { tokens } from '@/theme/tokens';

export function StickyNavigationActions({
  backLabel,
  nextLabel,
  finish,
  disableBack,
  onBack,
  onNext,
}: {
  backLabel: string;
  nextLabel: string;
  finish: boolean;
  disableBack: boolean;
  onBack: () => void;
  onNext: () => void;
}) {
  const BackIcon = isRtlLanguage() ? ArrowRight : ArrowLeft;
  const EndIcon = finish ? Check : isRtlLanguage() ? ArrowLeft : ArrowRight;

  return (
    <View style={{ flexDirection: rowDirection(), gap: 10 }}>
      <Pressable
        accessibilityRole="button"
        disabled={disableBack}
        onPress={onBack}
        style={{
          opacity: disableBack ? 0.45 : 1,
          minHeight: 50,
          flex: 1,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: tokens.border,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: rowDirection(),
          gap: 8,
          backgroundColor: tokens.card,
        }}
      >
        <BackIcon size={18} color={tokens.foreground} />
        <Text style={{ color: tokens.foreground, fontSize: 14, ...directionalText('900') }}>{backLabel}</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={onNext}
        style={{
          minHeight: 50,
          flex: 1.2,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: rowDirection(),
          gap: 8,
          backgroundColor: tokens.primary,
        }}
      >
        <Text style={{ color: tokens.primaryForeground, fontSize: 14, ...directionalText('900') }}>{nextLabel}</Text>
        <EndIcon size={18} color={tokens.primaryForeground} />
      </Pressable>
    </View>
  );
}
