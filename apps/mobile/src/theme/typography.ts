import { TextStyle } from 'react-native';
import { colors } from './colors';

export const typography: Record<string, TextStyle> = {
  display: { fontSize: 34, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.5 },
  h1: { fontSize: 26, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.3 },
  h2: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  h3: { fontSize: 17, fontWeight: '600', color: colors.textPrimary },
  body: { fontSize: 15, fontWeight: '400', color: colors.textPrimary },
  bodyMedium: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  caption: { fontSize: 13, fontWeight: '400', color: colors.textSecondary },
  captionMedium: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  tiny: { fontSize: 11, fontWeight: '600', color: colors.textTertiary, letterSpacing: 0.4 },
};
