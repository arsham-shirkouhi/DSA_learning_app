import React from 'react';
import { Text, TextProps } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ThemedTextProps extends TextProps {
    variant?: 'body' | 'heading' | 'button' | 'caption';
    children: React.ReactNode;
}

export const ThemedText: React.FC<ThemedTextProps> = ({
    variant = 'body',
    style,
    children,
    ...props
}) => {
    const { textStyles } = useTheme();

    return (
        <Text
            style={[textStyles[variant], style]}
            {...props}
        >
            {children}
        </Text>
    );
}; 