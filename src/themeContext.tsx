import React, { createContext, useContext } from 'react';
import { defaultTheme, type AppThemePalette } from './theme';

export const AppThemeContext = createContext<AppThemePalette>(defaultTheme);

export function useAppTheme() {
  return useContext(AppThemeContext);
}
