import i18next from 'i18next';
import type { TextStyle, ViewStyle } from 'react-native';

export function isRtlLanguage() {
  return i18next.language?.startsWith('ur');
}

export function rowDirection(): ViewStyle['flexDirection'] {
  return isRtlLanguage() ? 'row-reverse' : 'row';
}

export function textAlign(): TextStyle['textAlign'] {
  return isRtlLanguage() ? 'right' : 'left';
}

export function writingDirection(): TextStyle['writingDirection'] {
  return isRtlLanguage() ? 'rtl' : 'ltr';
}

export function layoutDirection(): ViewStyle['direction'] {
  // Keep flexbox physical layout deterministic; mirroring is handled by rowDirection().
  // Applying global RTL plus row-reverse can double-flip rows back to English order.
  return 'ltr';
}

export function alignSelfStart(): ViewStyle['alignSelf'] {
  return isRtlLanguage() ? 'flex-end' : 'flex-start';
}

export function getFontFamily(weight: '400' | '500' | '600' | '700' | '800' | '900' = '400', type: 'ui' | 'document' = 'ui'): string {
  if (isRtlLanguage()) {
    if (type === 'document') {
      return weight === '700' || weight === '800' || weight === '900' ? 'NotoNastaliqUrdu_700Bold' : 'NotoNastaliqUrdu_400Regular';
    }
    // Default UI is Noto Sans Arabic
    switch(weight) {
      case '900': return 'NotoSansArabic_900Black';
      case '700':
      case '800': return 'NotoSansArabic_700Bold';
      case '600': return 'NotoSansArabic_600SemiBold';
      case '500': return 'NotoSansArabic_500Medium';
      default: return 'NotoSansArabic_400Regular';
    }
  }
  
  // English default is Lexend
  switch(weight) {
    case '900': return 'Lexend_900Black';
    case '700':
    case '800': return 'Lexend_700Bold';
    case '600': return 'Lexend_600SemiBold';
    case '500': return 'Lexend_500Medium';
    default: return 'Lexend_400Regular';
  }
}

export function directionalText(weight: '400' | '500' | '600' | '700' | '800' | '900' = '400', type: 'ui' | 'document' = 'ui'): Pick<TextStyle, 'textAlign' | 'writingDirection' | 'fontFamily'> {
  return {
    textAlign: textAlign(),
    writingDirection: writingDirection(),
    fontFamily: getFontFamily(weight, type),
  };
}
