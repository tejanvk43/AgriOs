export const COLORS = {
    primary: '#16a34a', // Green 600 - Main Brand Color
    secondary: '#dcfce7', // Green 100 - Accents/Backgrounds
    background: '#f8fafc', // Slate 50 - Main Background
    card: '#ffffff', // White - Card Background
    text: '#1e293b', // Slate 800 - Primary Text
    textLight: '#64748b', // Slate 500 - Secondary Text
    white: '#ffffff',
    error: '#ef4444', // Red 500
    accent: '#eab308', // Yellow 500 - Warnings/Highlights
    success: '#22c55e', // Green 500
    glassBorder: 'rgba(255, 255, 255, 0.2)',
    glassBg: 'rgba(255, 255, 255, 0.1)',
};

export const SIZES = {
    base: 8,
    small: 12,
    font: 14,
    medium: 16,
    large: 18,
    extraLarge: 24,
    radius: 12,
    padding: 24,
};

export const SHADOWS = {
    light: {
        shadowColor: COLORS.primary,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 2,
    },
    medium: {
        shadowColor: COLORS.primary,
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.25,
        shadowRadius: 5.84,
        elevation: 5,
    },
};
