import { ReactNode, createContext, useContext, useEffect, useState } from 'react';

const COLOR_SCHEME_KEY = 'color_scheme';

const getStoredScheme = (): 'light' | 'dark' | null => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(COLOR_SCHEME_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  }
  return null;
};

const setStoredScheme = (scheme: 'light' | 'dark' | null) => {
  if (typeof window !== 'undefined') {
    if (scheme === null) {
      localStorage.removeItem(COLOR_SCHEME_KEY);
    } else {
      localStorage.setItem(COLOR_SCHEME_KEY, scheme);
    }
  }
};

type ColorSchemeContextType = {
  colorScheme: 'light' | 'dark';
  manualScheme: 'light' | 'dark' | null;
  isLoading: boolean;
  setColorScheme: (scheme: 'light' | 'dark' | null) => void;
};

const ColorSchemeContext = createContext<ColorSchemeContextType | undefined>(undefined);

export const ColorSchemeProvider = ({ children }: { children: ReactNode }) => {
  const [manualScheme, setManualScheme] = useState<'light' | 'dark' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [systemScheme, setSystemScheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = getStoredScheme();
    setManualScheme(stored);
    
    // Detect system dark mode preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemScheme(mediaQuery.matches ? 'dark' : 'light');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemScheme(e.matches ? 'dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    setIsLoading(false);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const setColorScheme = (scheme: 'light' | 'dark' | null) => {
    setStoredScheme(scheme);
    setManualScheme(scheme);
  };

  let colorScheme: 'light' | 'dark' = 'light';
  if (!isLoading) {
    if (manualScheme) {
      colorScheme = manualScheme;
    } else {
      colorScheme = systemScheme;
    }
  }

  return (
    <ColorSchemeContext.Provider
      value={{ colorScheme, manualScheme, isLoading, setColorScheme }}
    >
      {children}
    </ColorSchemeContext.Provider>
  );
};

export const useColorScheme = () => {
  const context = useContext(ColorSchemeContext);
  if (!context) {
    throw new Error('useColorScheme must be used within a ColorSchemeProvider');
  }
  return context.colorScheme;
};

export const useColorSchemeManager = () => {
  const context = useContext(ColorSchemeContext);
  if (!context) {
    throw new Error('useColorSchemeManager must be used within a ColorSchemeProvider');
  }
  return {
    manualScheme: context.manualScheme,
    isLoading: context.isLoading,
    setColorScheme: context.setColorScheme
  };
};
