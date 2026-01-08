// Tema Renk Paletleri

// Light Theme - Rose (Default)
export const lightRose = {
    // Primary Colors
    rose: '#D08A8A', // Warmer, more vibrant dried rose (pembe-kırmızı çalar)
    blush: '#F8EEED', // Soft warm blush
    dustyRose: '#B87070', // Deeper rose-red accent

    // Neutrals
    ivory: '#FFFEF9',
    charcoal: '#3D3D3D',
    lightGray: '#F7F4F4',
    gray: '#757575',

    // Semantic Colors
    sage: '#8FA87A', // Slightly more saturated sage
    coral: '#D87A70', // More vibrant coral
    error: '#D32F2F',

    // Background & Surface
    background: '#FBF2F1', // Slightly warmer, more rosy background
    surface: '#FFFCFB', // Very subtle warm white for cards
    cardBorder: '#DFCACA', // Stronger, more visible rose border

    // Text
    textPrimary: '#3D3D3D',
    textSecondary: '#6E6E6E',
    textLight: '#8C8C8C',
    textOnPrimary: '#FFFFFF',
};

// Dark Theme - Rose
export const darkRose = {
    // Primary Colors
    rose: '#D6A8A6', // Lighter dried rose for dark mode
    blush: '#2E2A2B',
    dustyRose: '#BFA09E',

    // Neutrals
    ivory: '#1E1E1E',
    charcoal: '#E8E8E8',
    lightGray: '#2A2627',
    gray: '#808080',

    // Semantic Colors
    sage: '#7A8F6A',
    coral: '#D4877E',
    error: '#D45757',

    // Background & Surface
    background: '#121212',
    surface: '#1E1E1E',
    cardBorder: '#333333',

    // Text
    textPrimary: '#E8E8E8',
    textSecondary: '#A0A0A0',
    textLight: '#6E6E6E',
    textOnPrimary: '#FFFFFF',
};

// Light Theme - Blue (Now Dried Rose variation)
export const lightBlue = {
    ...lightRose,
    rose: '#D6A8A6', // Slightly lighter rose
};

// Light Theme - Gold (Now Warm Rose)
export const lightGold = {
    ...lightRose,
    rose: '#D8B4A6', // Beige rose
};

// Light Theme - Sage (Now Muted Rose)
export const lightSage = {
    ...lightRose,
    rose: '#BFA09E', // Brownish rose
};

// Light Theme - Lavender (Now Dusty Rose)
export const lightLavender = {
    ...lightRose,
    rose: '#C4A4A4', // Mauve rose
};

// Default export for backward compatibility
export const colors = lightRose;

// Kategori Renkleri
export const categoryColors = [
    '#D08A8A', // Vibrant Rose (ana renk)
    '#8FA87A', // Richer Sage
    '#D87A70', // Vibrant Coral
    '#D4A896', // Warm Terracotta
    '#B87070', // Deep Rose-Red
    '#DAC4A0', // Golden Beige
    '#C09090', // Mauve Rose
    '#CDA86A', // Rich Gold
];

// Theme palettes mapping
export const themePalettes = {
    rose: { light: lightRose, dark: darkRose },
    blue: { light: lightBlue, dark: darkRose }, // Can add darkBlue later
    gold: { light: lightGold, dark: darkRose },
    sage: { light: lightSage, dark: darkRose },
    lavender: { light: lightLavender, dark: darkRose },
};
