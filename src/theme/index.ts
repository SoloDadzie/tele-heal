import { colors } from './colors';
import { typography } from './typography';
import { shadows } from './shadows';

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  full: 999,
} as const;

export const theme = {
  colors,
  typography,
  shadows,
  spacing,
  borderRadius,
} as const;

export type Theme = typeof theme;

export { colors, typography, shadows };
