import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const MIN_TOGGLE_INTERVAL_MS = 450;

const ThemeContext = createContext(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return [ctx.theme, ctx.toggleTheme];
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const lastToggleAtRef = useRef(0);

  const toggleTheme = useCallback(() => {
    const now = Date.now();
    if (now - lastToggleAtRef.current < MIN_TOGGLE_INTERVAL_MS) return;
    lastToggleAtRef.current = now;
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
