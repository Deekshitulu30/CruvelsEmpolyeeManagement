export const colors = {
  background: '#f8f9fa',
  surface: '#f8f9fa',
  surfaceBright: '#f8f9fa',
  surfaceDim: '#d9dadb',
  surfaceVariant: '#e1e3e4',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f3f4f5',
  surfaceContainer: '#edeeef',
  surfaceContainerHigh: '#e7e8e9',
  surfaceContainerHighest: '#e1e3e4',
  onSurface: '#191c1d',
  onSurfaceVariant: '#464555',
  onBackground: '#191c1d',
  inverseSurface: '#2e3132',
  inverseOnSurface: '#f0f1f2',

  primary: '#3525cd',
  primaryHover: '#4d44e3',
  primaryContainer: '#4f46e5',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#dad7ff',
  primaryFixed: '#e2dfff',
  primaryFixedDim: '#c3c0ff',
  onPrimaryFixed: '#0f0069',
  onPrimaryFixedVariant: '#3323cc',
  inversePrimary: '#c3c0ff',

  secondary: '#575e70',
  secondaryContainer: '#d9dff5',
  onSecondary: '#ffffff',
  onSecondaryContainer: '#5c6274',
  secondaryFixed: '#dce2f7',
  secondaryFixedDim: '#c0c6db',
  onSecondaryFixed: '#141b2b',
  onSecondaryFixedVariant: '#404758',

  tertiary: '#414855',
  tertiaryContainer: '#59606e',
  onTertiary: '#ffffff',
  onTertiaryContainer: '#d4dbeb',
  tertiaryFixed: '#dce2f3',
  tertiaryFixedDim: '#c0c7d6',
  onTertiaryFixed: '#151c27',
  onTertiaryFixedVariant: '#404754',

  outline: '#777587',
  outlineVariant: '#c7c4d8',

  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onError: '#ffffff',
  onErrorContainer: '#93000a',

  statusActiveBg: '#ecfdf5',
  statusActiveText: '#065f46',
  statusActiveBorder: '#a7f3d0',

  statusPresentBg: '#e6f4ea',
  statusPresentText: '#137333',
  statusPresentBorder: 'rgba(19, 115, 51, 0.2)',

  statusLeaveBg: '#fef2f2',
  statusLeaveText: '#991b1b',
  statusLeaveBorder: '#fecaca',

  statusPendingBg: '#fffbeb',
  statusPendingText: '#92400e',
  statusPendingBorder: '#fde68a'
} as const;

export const borderRadius = {
  DEFAULT: '0.25rem',
  lg: '0.5rem',
  xl: '0.75rem',
  full: '9999px'
} as const;

export const spacing = {
  containerMax: '1280px',
  base: '8px',
  marginDesktop: '32px',
  gutter: '24px',
  marginMobile: '16px'
} as const;

export const fontFamily = {
  body: 'Inter, sans-serif',
  headline: 'Geist, sans-serif',
  mono: 'Geist, monospace'
} as const;

export const fontSize = {
  bodySm: { size: '14px', lineHeight: '20px', fontWeight: '400' },
  displayHeroMobile: { size: '48px', lineHeight: '56px', letterSpacing: '-0.03em', fontWeight: '700' },
  monoData: { size: '14px', lineHeight: '20px', fontWeight: '400' },
  bodyMd: { size: '16px', lineHeight: '24px', fontWeight: '400' },
  headlineSection: { size: '24px', lineHeight: '32px', letterSpacing: '-0.01em', fontWeight: '600' },
  headlinePage: { size: '36px', lineHeight: '44px', letterSpacing: '-0.02em', fontWeight: '600' },
  bodyLg: { size: '18px', lineHeight: '28px', fontWeight: '400' },
  displayHero: { size: '72px', lineHeight: '80px', letterSpacing: '-0.04em', fontWeight: '700' },
  labelCaps: { size: '12px', lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '600' }
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  table: '0px 4px 6px -1px rgba(0, 0, 0, 0.02)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
} as const;

export const motion = {
  durationFast: '150ms',
  durationNormal: '200ms',
  durationSlow: '300ms',
  easingStandard: 'cubic-bezier(0.16, 1, 0.3, 1)'
} as const;

