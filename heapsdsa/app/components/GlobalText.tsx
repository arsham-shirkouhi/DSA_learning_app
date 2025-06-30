import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';

interface GlobalTextProps extends TextProps {
    variant?: 'regular' | 'bold';
    children: React.ReactNode;
}

export const GlobalText: React.FC<GlobalTextProps> = ({
    variant = 'regular',
    style,
    children,
    ...props
}) => {
    const textStyle = variant === 'bold' ? styles.textBold : styles.textRegular;

    return (
        <Text
            style={[textStyle, style]}
            {...props}
        >
            {children}
        </Text>
    );
};

const styles = StyleSheet.create({
    textRegular: {
        fontFamily: 'JetBrainsMono',
    },
    textBold: {
        fontFamily: 'JetBrainsMono-Bold',
    },
}); 