import React from 'react';
import { Image, ImageSourcePropType, Pressable, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import { GlobalText } from './GlobalText';

interface AnimatedButtonProps {
    onPress?: () => void;
    children: React.ReactNode;
    backgroundColor?: string;
    shadowColor?: string;
    shadowOffsetHeight?: number;
    shadowOffsetWidth?: number;
    shadowRadius?: number;
    shadowOpacity?: number;
    elevation?: number;
    borderRadius?: number;
    paddingVertical?: number;
    paddingHorizontal?: number;
    width?: number;
    height?: number;
    icon?: ImageSourcePropType;
    iconColor?: string;
    fontSize?: number;
    style?: ViewStyle;
    textStyle?: TextStyle;
    borderColor?: string;
    borderWidth?: number;
}

export default function AnimatedButton({
    onPress,
    children,
    backgroundColor = '#1EA7FF',
    shadowColor = '#232A36',
    shadowOffsetHeight = 4,
    shadowOffsetWidth = 0,
    shadowRadius = 0,
    shadowOpacity = 1,
    elevation = 10,
    borderRadius = 8,
    paddingVertical = 8,
    paddingHorizontal = 16,
    width,
    height,
    icon,
    iconColor = '#fff',
    fontSize = 16,
    style,
    textStyle,
    borderColor,
    borderWidth,
}: AnimatedButtonProps) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                {
                    shadowColor,
                    shadowOpacity,
                    shadowRadius,
                    shadowOffset: { width: shadowOffsetWidth, height: pressed ? 0 : shadowOffsetHeight },
                    elevation,
                },
                style,
            ]}
        >
            {({ pressed }) => (
                <View
                    style={[
                        {
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius,
                            paddingVertical,
                            paddingHorizontal,
                            alignSelf: 'stretch',
                            backgroundColor,
                            transform: [{ translateY: pressed ? 4 : 0 }],
                            width,
                            height,
                            ...(borderColor !== undefined ? { borderColor } : {}),
                            ...(borderWidth !== undefined ? { borderWidth } : {}),
                        },
                        style,
                    ]}
                >
                    {icon && (
                        <Image
                            source={icon}
                            style={{
                                width: 20,
                                height: 20,
                                marginRight: children ? 6 : 0,
                                tintColor: iconColor
                            }}
                        />
                    )}
                    {children && <GlobalText style={[{ color: '#fff', fontWeight: 'bold', fontSize }, textStyle]}>{children}</GlobalText>}
                </View>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignSelf: 'flex-start',

    },
    text: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    icon: {
        width: 20,
        height: 20,
        marginRight: 6,
        tintColor: '#fff',
    },
}); 