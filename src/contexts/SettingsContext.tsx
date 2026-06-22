import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface SettingsContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  fontScale: number;
  setFontScale: (n: number) => void;
  increaseFont: () => void;
  decreaseFont: () => void;
  resetFont: () => void;
}

export const FONT_BOUNDS = { min: 90, max: 125, step: 5, default: 100 };

const clampFont = (n: number) => Math.min(FONT_BOUNDS.max, Math.max(FONT_BOUNDS.min, n));

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

/**
 * App-wide user preferences (theme + text size). Mounted at the root so the
 * chosen theme and font scale are applied on every page, regardless of which
 * route is active. Persisted to localStorage under the same keys the header
 * previously used, so existing preferences carry over.
 */
export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = window.localStorage.getItem('ergocare-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [fontScale, setFontScaleState] = useState<number>(() => {
    if (typeof window === 'undefined') return FONT_BOUNDS.default;
    const saved = window.localStorage.getItem('ergocare-font-scale');
    const parsed = saved ? Number(saved) : FONT_BOUNDS.default;
    return Number.isFinite(parsed) ? clampFont(parsed) : FONT_BOUNDS.default;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    window.localStorage.setItem('ergocare-theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const base = Math.round(16 * (fontScale / 100));
    root.style.setProperty('--base-font-size', `${base}px`);
    window.localStorage.setItem('ergocare-font-scale', String(fontScale));
  }, [fontScale]);

  const setFontScale = (n: number) => setFontScaleState(clampFont(n));
  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  const increaseFont = () => setFontScaleState((v) => clampFont(v + FONT_BOUNDS.step));
  const decreaseFont = () => setFontScaleState((v) => clampFont(v - FONT_BOUNDS.step));
  const resetFont = () => setFontScaleState(FONT_BOUNDS.default);

  return (
    <SettingsContext.Provider
      value={{ theme, setTheme, toggleTheme, fontScale, setFontScale, increaseFont, decreaseFont, resetFont }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
  return ctx;
};
