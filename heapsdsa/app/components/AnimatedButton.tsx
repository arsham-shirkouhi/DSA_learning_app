import React, { useRef } from 'react';
import { Animated, Image, ImageSourcePropType, Pressable, StyleSheet, TextStyle, ViewStyle } from 'react-native';
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
}: AnimatedButtonProps) {
    const translateY = useRef(new Animated.Value(0)).current;

    const handlePressIn = () => {
        Animated.timing(translateY, {
            toValue: 4,
            duration: 80,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.timing(translateY, {
            toValue: 0,
            duration: 80,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Pressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
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
            <Animated.View
                style={[
                    {
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderRadius,
                        paddingVertical,
                        paddingHorizontal,
                        alignSelf: 'flex-start',
                        backgroundColor,
                        transform: [{ translateY }],
                        width,
                        height,
                    },
                ]}
            >
                {icon && <Image source={icon} style={{ width: 20, height: 20, marginRight: 6, tintColor: iconColor }} />}
                <GlobalText style={[{ color: '#fff', fontWeight: 'bold', fontSize }, textStyle]}>{children}</GlobalText>
            </Animated.View>
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