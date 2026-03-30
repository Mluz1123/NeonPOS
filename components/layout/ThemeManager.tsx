'use client';

import { useEffect } from 'react';

interface ThemeManagerProps {
  themeMode?: 'light' | 'dark' | 'system';
  primaryColor?: string;
}

export function ThemeManager({ themeMode = 'light', primaryColor = '#9EFF00' }: ThemeManagerProps) {
  useEffect(() => {
    const root = document.documentElement;

    // Apply Theme Mode
    let activeTheme = themeMode;
    if (themeMode === 'system') {
      activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    root.setAttribute('data-theme', activeTheme);
    
    // Apply Colors
    if (primaryColor) {
      root.style.setProperty('--primary', primaryColor);
      
      // Calculate a darker version for hover (simple darkening)
      const darkenColor = (hex: string, amount: number) => {
        let col = hex.replace('#', '');
        let r = parseInt(col.substring(0, 2), 16);
        let g = parseInt(col.substring(2, 4), 16);
        let b = parseInt(col.substring(4, 6), 16);
        
        r = Math.max(0, Math.min(255, r - amount));
        g = Math.max(0, Math.min(255, g - amount));
        b = Math.max(0, Math.min(255, b - amount));
        
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
      };
      
      root.style.setProperty('--primary-dark', darkenColor(primaryColor, 30));
    }
  }, [themeMode, primaryColor]);

  return null;
}
