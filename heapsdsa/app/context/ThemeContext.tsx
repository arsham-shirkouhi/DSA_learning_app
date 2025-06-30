import React, { createContext, ReactNode, useContext } from 'react';
import { TextStyle } from 'react-native';

interface ThemeContextType {
    fonts: {
        regular: string;
        bold: string;
    };
    textStyles: {
        body: TextStyle;
        heading: TextStyle;
        button: TextStyle;
        caption: TextStyle;
    };
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
    const theme: ThemeContextType = {
        fonts: {
            regular: 'JetBrainsMono',
            bold: 'JetBrainsMono-Bold',
        },
        textStyles: {
            body: {
                fontFamily: 'JetBrainsMono',
                fontSize: 16,
                color: '#FFFFFF',
            },
            heading: {
                fontFamily: 'JetBrainsMono',
                fontSize: 24,
                fontWeight: 'bold' as any,
                color: '#FFFFFF',
            },
            button: {
                fontFamily: 'JetBrainsMono',
                fontSize: 16,
                fontWeight: 'bold' as any,
                color: '#FFFFFF',
            },
            caption: {
                fontFamily: 'JetBrainsMono',
                fontSize: 14,
                color: '#CCCCCC',
            },
        },
    };

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
}; 