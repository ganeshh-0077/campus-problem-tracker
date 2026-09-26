import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppTheme = 'galaxy' | 'light';

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('campus_theme') as AppTheme | null;
    return saved === 'light' ? 'light' : 'galaxy';
  });

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('campus_theme', newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === 'galaxy' ? 'light' : 'galaxy');
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'galaxy') {
      root.classList.add('dark');
      root.classList.remove('light');
      document.body.style.backgroundColor = '#050505';
      document.body.style.color = '#F5F5F5';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      document.body.style.backgroundColor = '#f8fafc';
      document.body.style.color = '#0f172a';
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
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
