import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode, ThemePalette } from '../types';
import { themePalettes, lightRose } from '../theme/colors';

const THEME_STORAGE_KEY = '@wedding_planner_theme';

interface ThemeContextType {
    mode: ThemeMode;
    palette: ThemePalette;
    colors: typeof lightRose;
    setMode: (mode: ThemeMode) => void;
    setPalette: (palette: ThemePalette) => void;
    isDark: boolean;
    toggleTheme: () => void; // NEW: Toggle between light and dark
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [mode, setModeState] = useState<ThemeMode>('light');
    const [palette, setPaletteState] = useState<ThemePalette>('rose');

    useEffect(() => {
        loadThemeSettings();
    }, []);

    const loadThemeSettings = async () => {
        try {
            const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
            if (stored) {
                const { mode: storedMode, palette: storedPalette } = JSON.parse(stored);
                if (storedMode) setModeState(storedMode);
                if (storedPalette) setPaletteState(storedPalette);
            }
        } catch (e) {
            console.error('Failed to load theme settings', e);
        }
    };

    const saveThemeSettings = async (newMode: ThemeMode, newPalette: ThemePalette) => {
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({ mode: newMode, palette: newPalette }));
        } catch (e) {
            console.error('Failed to save theme settings', e);
        }
    };

    const setMode = (newMode: ThemeMode) => {
        setModeState(newMode);
        saveThemeSettings(newMode, palette);
    };

    const setPalette = (newPalette: ThemePalette) => {
        setPaletteState(newPalette);
        saveThemeSettings(mode, newPalette);
    };

    // NEW: Toggle between light and dark
    const toggleTheme = () => {
        const newMode = mode === 'dark' ? 'light' : 'dark';
        setMode(newMode);
    };

    // Determine if dark mode is active
    const isDark = mode === 'dark';

    // Get current colors based on mode and palette
    const themeColors = themePalettes[palette] || themePalettes.rose;
    const colors = isDark ? themeColors.dark : themeColors.light;

    return (
        <ThemeContext.Provider
            value={{
                mode,
                palette,
                colors,
                setMode,
                setPalette,
                isDark,
                toggleTheme, // NEW
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};
