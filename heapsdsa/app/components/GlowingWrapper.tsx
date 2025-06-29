import React, { useEffect, useRef } from 'react';
import { Animated, Platform, ViewStyle } from 'react-native';

interface GlowingWrapperProps {
    color: string;
    children: React.ReactNode;
    style?: ViewStyle | ViewStyle[];
}

const GlowingWrapper = ({ color, children, style }: GlowingWrapperProps) => {
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
        shadowOpacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.7] }),
        shadowRadius: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [8, 18] }),
        shadowOffset: { width: 0, height: 0 },
        ...(
            Platform.OS === 'android'
                ? {
                    backgroundColor: color,
                    opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.1, 0.25] }),
                    borderRadius: 12,
                }
                : {}
        ),
    };

    return (
        <Animated.View style={[animatedStyle, style]}>
            {children}
        </Animated.View>
    );
};

export default GlowingWrapper; 