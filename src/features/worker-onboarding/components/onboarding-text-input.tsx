import { Text, TextInput, View } from 'react-native';
import { textAlign, writingDirection } from '@/theme/layout';
import { tokens } from '@/theme/tokens';

export function OnboardingTextInput({
  value,
  placeholder,
  error,
  keyboardType = 'default',
  onChangeText,
}: {
  value: string;
  placeholder: string;
  error?: string;
  keyboardType?: 'default' | 'number-pad' | 'phone-pad';
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={{ gap: 8 }}>
      <TextInput
        value={value}
        accessibilityLabel={placeholder}
        placeholder={placeholder}
        placeholderTextColor={tokens.mutedForeground}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        style={{
          minHeight: 56,
          borderWidth: 1,
          borderColor: error ? tokens.statusError : tokens.border,
          backgroundColor: tokens.card,
          borderRadius: 14,
          paddingHorizontal: 14,
          color: tokens.foreground,
          fontSize: 16,
          fontWeight: '700',
          textAlign: textAlign(),
          writingDirection: writingDirection(),
        }}
      />
      {error ? <Text style={{ color: tokens.statusError, fontSize: 12, fontWeight: '800', textAlign: textAlign(), writingDirection: writingDirection() }}>{error}</Text> : null}
    </View>
  );
}
