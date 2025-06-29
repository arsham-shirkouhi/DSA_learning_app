import React, { useEffect, useRef } from 'react';
import { Animated, Image, ImageStyle, Platform } from 'react-native';

interface GlowingIconProps {
    source: any;
    color: string;
    style?: ImageStyle;
    tintColor?: string;
}

export default function GlowingIcon({ source, color, style, tintColor }: GlowingIconProps) {
    const glowAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, { toValue: 1, duration: 1000, useNativeDriver: false }),
                Animated.timing(glowAnim, { toValue: 0, duration: 1000, useNativeDriver: false }),
            ])
        ).start();
    }, [glowAnim]);

    const animatedStyle = {
        shadowColor: color,
        shadowOpacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.6] }),
        shadowRadius: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [4, 10] }),
        shadowOffset: { width: 0, height: 0 },
        ...(Platform.OS === 'android'
            ? {
                backgroundColor: color,
                opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.1, 0.3] }),
                borderRadius: 20,
            }
            : {}),
    };

    return (
        <Animated.View style={[animatedStyle, { justifyContent: 'center', alignItems: 'center' }]}>
            <Image source={source} style={[style as ImageStyle || {}, tintColor ? { tintColor } : {}]} />
        </Animated.View>
    );
} 