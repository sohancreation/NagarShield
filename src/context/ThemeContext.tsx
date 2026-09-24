/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'night';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  cycleTheme: () => void;
  isLight: boolean;
  isDark: boolean;
  isNight: boolean;
  nightVisionHud: boolean;
  toggleNightVisionHud: () => void;
}

const THEME_STORAGE_KEY = 'nagarshield_theme_mode';
const NIGHT_HUD_STORAGE_KEY = 'nagarshield_night_hud';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode;
      if (saved === 'light' || saved === 'dark' || saved === 'night') {
        return saved;
      }
      return 'light';
    } catch {
      return 'light';
    }
  });

  const [nightVisionHud, setNightVisionHud] = useState<boolean>(() => {
    try {
      return localStorage.getItem(NIGHT_HUD_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Apply theme attributes to document element
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    
    // Manage class names for tailwind dark mode compatibility
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('night');
      root.classList.remove('light');
    } else if (theme === 'night') {
      root.classList.add('dark');
      root.classList.add('night');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.remove('night');
      root.classList.add('light');
    }

    if (theme === 'night' && nightVisionHud) {
      root.classList.add('night-hud-active');
    } else {
      root.classList.remove('night-hud-active');
    }

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {
      console.warn('Could not persist theme to localStorage', e);
    }
  }, [theme, nightVisionHud]);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
  };

  const cycleTheme = () => {
    setThemeState((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'night';
      return 'light';
    });
  };

  const toggleNightVisionHud = () => {
    setNightVisionHud((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(NIGHT_HUD_STORAGE_KEY, String(next));
      } catch (e) {
        console.warn('Could not persist night hud to localStorage', e);
      }
      return next;
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        cycleTheme,
        isLight: theme === 'light',
        isDark: theme === 'dark',
        isNight: theme === 'night',
        nightVisionHud,
        toggleNightVisionHud,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
