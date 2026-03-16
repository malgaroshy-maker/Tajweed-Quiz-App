'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeColor = 'al-qalam' | 'al-kaaba' | 'al-lail';

interface ThemeColorContextType {
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
}

const ThemeColorContext = createContext<ThemeColorContextType | undefined>(undefined);

export function ThemeColorProvider({ children }: { children: React.ReactNode }) {
  const [themeColor, setThemeColorState] = useState<ThemeColor>('al-qalam');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme-color') as ThemeColor;
    if (saved && ['al-qalam', 'al-kaaba', 'al-lail'].includes(saved)) {
      setThemeColorState(saved);
      document.documentElement.setAttribute('data-theme', saved);
    } else {
      document.documentElement.setAttribute('data-theme', 'al-qalam');
    }
    setMounted(true);
  }, []);

  const setThemeColor = (color: ThemeColor) => {
    setThemeColorState(color);
    localStorage.setItem('theme-color', color);
    document.documentElement.setAttribute('data-theme', color);
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeColorContext.Provider value={{ themeColor, setThemeColor }}>
      {children}
    </ThemeColorContext.Provider>
  );
}

export function useThemeColor() {
  const context = useContext(ThemeColorContext);
  if (!context) {
    throw new Error('useThemeColor must be used within a ThemeColorProvider');
  }
  return context;
}
