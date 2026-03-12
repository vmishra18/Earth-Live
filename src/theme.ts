import type { ColorSchemeName } from 'react-native';
import type { MapType } from 'react-native-maps';

export const colors = {
  sky: '#5ba5ff',
  mint: '#4fe0c3',
  sun: '#ffbc5c',
  coral: '#ff6d6d',
};

export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 36,
  xxxl: 56,
};

export const radii = {
  sm: 14,
  md: 18,
  lg: 24,
  xl: 30,
  pill: 999,
};

export const typeScale = {
  display: 28,
  section: 22,
  title: 17,
  body: 14,
  meta: 12,
  label: 11,
  micro: 10,
  metric: 24,
};

export const shadows = {
  card: {
    shadowColor: '#020712',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.18,
    shadowRadius: 30,
    elevation: 12,
  },
};

export type AppAppearanceMode = 'system' | 'dark' | 'light';
export type ResolvedAppearance = 'dark' | 'light';

export type AppThemePalette = {
  appearanceMode: AppAppearanceMode;
  resolvedAppearance: ResolvedAppearance;
  background: string;
  surface: string;
  surfaceSoft: string;
  surfaceMuted: string;
  surfaceRaised: string;
  surfaceInset: string;
  surfaceOverlay: string;
  border: string;
  text: string;
  subtleText: string;
  accent: string;
  accentSoft: string;
  accentMuted: string;
  success: string;
  warning: string;
  danger: string;
  glowPrimary: string;
  glowSecondary: string;
  mapType: MapType;
  globeShell: string;
  gridLine: string;
  navBackground: string;
  navActiveBackground: string;
  inputBackground: string;
  commandBackground: string;
  commandBorder: string;
};

const darkTheme: Omit<AppThemePalette, 'appearanceMode'> = {
  resolvedAppearance: 'dark',
  background: '#07111f',
  surface: 'rgba(13, 27, 47, 0.92)',
  surfaceSoft: 'rgba(10, 22, 39, 0.82)',
  surfaceMuted: 'rgba(21, 48, 79, 0.85)',
  surfaceRaised: '#15304f',
  surfaceInset: 'rgba(8, 19, 34, 0.96)',
  surfaceOverlay: 'rgba(2, 7, 18, 0.72)',
  border: 'rgba(145, 199, 255, 0.12)',
  text: '#eef6ff',
  subtleText: '#94abc6',
  accent: colors.sky,
  accentSoft: 'rgba(91, 165, 255, 0.18)',
  accentMuted: 'rgba(91, 165, 255, 0.12)',
  success: colors.mint,
  warning: colors.sun,
  danger: colors.coral,
  glowPrimary: 'rgba(79, 224, 195, 0.16)',
  glowSecondary: 'rgba(91, 165, 255, 0.15)',
  mapType: 'mutedStandard',
  globeShell: '#0f2238',
  gridLine: 'rgba(145, 199, 255, 0.16)',
  navBackground: 'rgba(7, 17, 31, 0.96)',
  navActiveBackground: 'rgba(255, 255, 255, 0.08)',
  inputBackground: 'rgba(13, 27, 47, 0.92)',
  commandBackground: 'rgba(255, 109, 109, 0.12)',
  commandBorder: 'rgba(255, 109, 109, 0.25)',
};

const lightTheme: Omit<AppThemePalette, 'appearanceMode'> = {
  resolvedAppearance: 'light',
  background: '#f4f8fc',
  surface: 'rgba(255, 255, 255, 0.96)',
  surfaceSoft: 'rgba(249, 251, 255, 0.82)',
  surfaceMuted: '#e8f0fb',
  surfaceRaised: '#d9e6f7',
  surfaceInset: '#edf3fb',
  surfaceOverlay: 'rgba(16, 25, 40, 0.2)',
  border: 'rgba(73, 100, 138, 0.16)',
  text: '#102033',
  subtleText: '#5f7694',
  accent: '#2f72d6',
  accentSoft: 'rgba(47, 114, 214, 0.14)',
  accentMuted: 'rgba(47, 114, 214, 0.08)',
  success: '#109174',
  warning: '#c48217',
  danger: '#d9534f',
  glowPrimary: 'rgba(47, 114, 214, 0.12)',
  glowSecondary: 'rgba(79, 224, 195, 0.1)',
  mapType: 'standard',
  globeShell: '#edf4ff',
  gridLine: 'rgba(73, 100, 138, 0.14)',
  navBackground: 'rgba(255, 255, 255, 0.94)',
  navActiveBackground: 'rgba(16, 32, 51, 0.06)',
  inputBackground: 'rgba(255, 255, 255, 0.96)',
  commandBackground: 'rgba(255, 109, 109, 0.1)',
  commandBorder: 'rgba(217, 83, 79, 0.2)',
};

export function resolveAppTheme(
  appearanceMode: AppAppearanceMode,
  systemScheme: ColorSchemeName
): AppThemePalette {
  const normalizedMode: AppAppearanceMode =
    appearanceMode === 'dark' || appearanceMode === 'light' || appearanceMode === 'system'
      ? appearanceMode
      : 'system';
  const resolvedAppearance: ResolvedAppearance =
    normalizedMode === 'system' ? (systemScheme === 'light' ? 'light' : 'dark') : normalizedMode;
  const base = resolvedAppearance === 'light' ? lightTheme : darkTheme;

  return {
    appearanceMode: normalizedMode,
    ...base,
  };
}

export const defaultTheme = resolveAppTheme('dark', 'dark');
