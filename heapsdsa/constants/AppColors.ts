// App Colors - Centralized color management
export const AppColors = {
    // Primary Colors
    primary: '#007AFF',
    primaryDark: '#0056CC',
    primaryLight: '#4DA3FF',

    // Secondary Colors
    secondary: '#34C759',
    secondaryDark: '#28A745',
    secondaryLight: '#6DDC87',

    // Background Colors
    background: '#0C1117',
    backgroundLight: '#ffffff',
    backgroundDark: '#e0e0e0',

    // Card Colors
    cardBackground: '#ffffff',
    cardShadow: '#000000',

    // Text Colors
    textPrimary: '#333333',
    textSecondary: '#666666',
    textTertiary: '#999999',
    textLight: '#ffffff',

    // Status Colors
    success: '#34c759',
    warning: '#ff9500',
    error: '#ff3b30',
    info: '#007AFF',

    // Button Colors
    buttonPrimary: '#007AFF',
    buttonSecondary: '#34C759',
    buttonDanger: '#ff3b30',
    buttonDisabled: '#cccccc',

    // Input Colors
    inputBackground: '#fafafa',
    inputBorder: '#dddddd',
    inputFocus: '#007AFF',

    // Tab Colors
    tabActive: '#3094FF',
    tabInactive: '#3B5164',

    // Navbar Colors
    navbar: '#090D11',

    // Border Colors
    border: '#dddddd',
    borderLight: '#eeeeee',
    borderDark: '#cccccc',

    // Shadow Colors
    shadow: '#000000',

    // Email Verification Colors
    emailVerified: '#34c759',
    emailUnverified: '#ff3b30',

    // Loading/Disabled Colors
    loading: '#cccccc',
    disabled: '#cccccc',

    // Link Colors
    link: '#007AFF',
    linkHover: '#0056CC',

    borderColor: '#181F26'
} as const;

// Type for color keys
export type AppColorKey = keyof typeof AppColors;

// Helper function to get color
export const getColor = (colorKey: AppColorKey): string => {
    return AppColors[colorKey];
};

// Export individual colors for direct import
export const {
    primary,
    secondary,
    background,
    backgroundLight,
    cardBackground,
    textPrimary,
    textSecondary,
    success,
    warning,
    error,
    buttonPrimary,
    buttonDanger,
    buttonDisabled,
    inputBackground,
    inputBorder,
    tabActive,
    navbar,
    border,
    shadow,
    emailVerified,
    emailUnverified,
    loading,
    link,
} = AppColors; 