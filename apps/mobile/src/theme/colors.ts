// Premium athletic look per architecture-plan.md §I: deep charcoal/near-black + white
// as the primary surfaces, energetic lime as the single accent (used sparingly — CTAs,
// progress fills, confidence-high badges — not decoration), soft neutral gray for
// secondary text/borders. Deliberately no secondary "brand" color and minimal gradients.
export const colors = {
  background: '#FFFFFF',
  surface: '#F6F7F8',
  surfaceAlt: '#EEEFF1',
  border: '#E3E5E8',

  charcoal: '#14161A',
  charcoalSoft: '#2A2D33',

  textPrimary: '#14161A',
  textSecondary: '#6C7280',
  textTertiary: '#9AA0AC',
  textOnCharcoal: '#FFFFFF',
  textOnAccent: '#14161A',

  accent: '#C6FF3D',
  accentPressed: '#AEE62E',
  accentSoft: '#EEFFC7',

  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',

  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(20, 22, 26, 0.55)',

  macro: {
    protein: '#3B82F6',
    carbs: '#F59E0B',
    fat: '#EC4899',
    fiber: '#22C55E',
    water: '#38BDF8',
  },

  confidence: {
    high: '#22C55E',
    medium: '#F59E0B',
    low: '#EF4444',
  },
} as const;

export type AppColors = typeof colors;
