import { useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

const KEY = 'hisheb-theme';

function getInitial(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem(KEY) as Theme | null;
  if (stored === 'dark' || stored === 'light') return stored;
  return 'dark';
}

function apply(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getInitial);

  useEffect(() => {
    apply(theme);
    localStorage.setItem(KEY, theme);
  }, [theme]);

  return {
    theme,
    isDark: theme === 'dark',
    setTheme: setThemeState,
    toggle: () => setThemeState((t) => (t === 'dark' ? 'light' : 'dark')),
  };
}

// Initialize on module load to avoid flash
if (typeof window !== 'undefined') {
  apply(getInitial());
}
