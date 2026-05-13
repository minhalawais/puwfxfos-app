export const unionAdminTheme = {
  navy: '#2E338C',
  green: '#03A64A',
  crimson: '#A6121F',
  red: '#F21D2F',
  light: '#F2F2F2',
  card: '#FFFFFF',
  text: '#18203F',
  mutedText: '#667085',
  border: 'rgba(46, 51, 140, 0.14)',
  softNavy: 'rgba(46, 51, 140, 0.08)',
  softGreen: 'rgba(3, 166, 74, 0.10)',
  softCrimson: 'rgba(166, 18, 31, 0.08)',
  softRed: 'rgba(242, 29, 47, 0.08)',
  shadow: 'rgba(46, 51, 140, 0.12)',
} as const;

export type UnionAdminTone = 'navy' | 'green' | 'crimson' | 'red' | 'neutral';

export function getUnionAdminTone(tone: UnionAdminTone) {
  switch (tone) {
    case 'green':
      return {
        accent: unionAdminTheme.green,
        soft: unionAdminTheme.softGreen,
        border: 'rgba(3, 166, 74, 0.18)',
      };
    case 'crimson':
      return {
        accent: unionAdminTheme.crimson,
        soft: unionAdminTheme.softCrimson,
        border: 'rgba(166, 18, 31, 0.18)',
      };
    case 'red':
      return {
        accent: unionAdminTheme.red,
        soft: unionAdminTheme.softRed,
        border: 'rgba(242, 29, 47, 0.18)',
      };
    case 'neutral':
      return {
        accent: unionAdminTheme.mutedText,
        soft: 'rgba(102, 112, 133, 0.10)',
        border: 'rgba(102, 112, 133, 0.18)',
      };
    case 'navy':
    default:
      return {
        accent: unionAdminTheme.navy,
        soft: unionAdminTheme.softNavy,
        border: unionAdminTheme.border,
      };
  }
}
