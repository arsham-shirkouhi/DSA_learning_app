import React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';

interface GlobalTextInputProps extends TextInputProps {
    children?: React.ReactNode;
}

export const GlobalTextInput: React.FC<GlobalTextInputProps> = ({
    style,
    children,
    ...props
}) => {
    return (
        <TextInput
            style={[styles.textInput, style]}
            placeholderTextColor="#666"
            {...props}
        >
            {children}
        </TextInput>
    );
};

const styles = StyleSheet.create({
    textInput: {
        fontFamily: 'JetBrainsMono',
    },
}); 