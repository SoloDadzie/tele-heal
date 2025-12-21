export const colors = {
  primary: {
    main: '#0D9488',      // Medical teal - professional, calming
    light: '#CCFBF1',     // Soft teal background
    dark: '#0F766E',      // Darker teal for emphasis
  },
  accent: {
    main: '#F59E0B',      // Warm amber - friendly, energetic
    light: '#FEF3C7',     // Soft amber background
    coral: '#FB923C',     // Coral accent for warmth
  },
  neutral: {
    darkest: '#1F2937',   // Deep slate for primary text
    dark: '#6B7280',      // Medium gray for secondary text
    medium: '#9CA3AF',    // Light gray for tertiary text
    light: '#F3F4F6',     // Very light gray for backgrounds
    lighter: '#F9FAFB',   // Almost white for subtle backgrounds
    white: '#FFFFFF',
  },
  semantic: {
    success: '#10B981',   // Medical green - positive, healthy
    successLight: '#D1FAE5',
    danger: '#EF4444',    // Clear red for errors
    dangerLight: '#FEE2E2',
    warning: '#F59E0B',   // Amber for warnings
    warningLight: '#FEF3C7',
    info: '#3B82F6',      // Blue for information
    infoLight: '#DBEAFE',
  },
  background: {
    main: '#FFFFFF',
    muted: '#F9FAFB',
    card: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
    placeholder: '#9CA3AF',
    link: '#0D9488',
  },
  border: {
    light: '#E5E7EB',
    medium: '#D1D5DB',
    dark: '#9CA3AF',
  },
} as const;

export type Colors = typeof colors;
