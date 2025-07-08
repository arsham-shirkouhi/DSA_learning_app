import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, ViewStyle } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export type TransitionType =
    | 'fade'
    | 'slideFromRight'
    | 'slideFromLeft'
    | 'slideFromBottom'
    | 'slideFromTop'
    | 'zoomIn'
    | 'zoomOut'
    | 'scale'
    | 'flip'
    | 'parallax';

interface CustomTransitionProps {
    children: React.ReactNode;
    type: TransitionType;
    duration?: number;
    delay?: number;
    style?: ViewStyle;
    onAnimationComplete?: () => void;
}

export default function CustomTransition({
    children,
    type,
    duration = 300,
    delay = 0,
    style,
    onAnimationComplete,
}: CustomTransitionProps) {
    const animatedValue = useRef(new Animated.Value(0)).current;
    const scaleValue = useRef(new Animated.Value(0.8)).current;
    const rotateValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.timing(animatedValue, {
            toValue: 1,
            duration,
            delay,
            useNativeDriver: true,
        });

        animation.start(() => {
            onAnimationComplete?.();
        });

        return () => animation.stop();
    }, [animatedValue, duration, delay, onAnimationComplete]);

    const getAnimatedStyle = (): any => {
        switch (type) {
            case 'fade':
                return {
                    opacity: animatedValue,
                };

            case 'slideFromRight':
                return {
                    transform: [
                        {
                            translateX: animatedValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: [screenWidth, 0],
                            }),
                        },
                    ],
                };

            case 'slideFromLeft':
                return {
                    transform: [
                        {
                            translateX: animatedValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-screenWidth, 0],
                            }),
                        },
                    ],
                };

            case 'slideFromBottom':
                return {
                    transform: [
                        {
                            translateY: animatedValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: [screenHeight, 0],
                            }),
                        },
                    ],
                };

            case 'slideFromTop':
                return {
                    transform: [
                        {
                            translateY: animatedValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-screenHeight, 0],
                            }),
                        },
                    ],
                };

            case 'zoomIn':
                return {
                    transform: [
                        {
                            scale: animatedValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.3, 1],
                            }),
                        },
                    ],
                    opacity: animatedValue,
                };

            case 'zoomOut':
                return {
                    transform: [
                        {
                            scale: animatedValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: [1.5, 1],
                            }),
                        },
                    ],
                    opacity: animatedValue,
                };

            case 'scale':
                return {
                    transform: [
                        {
                            scale: animatedValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.8, 1],
                            }),
                        },
                    ],
                };

            case 'flip':
                return {
                    transform: [
                        {
                            rotateY: animatedValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['90deg', '0deg'],
                            }),
                        },
                    ],
                };

            case 'parallax':
                return {
                    transform: [
                        {
                            translateX: animatedValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: [screenWidth * 0.3, 0],
                            }),
                        },
                        {
                            scale: animatedValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.9, 1],
                            }),
                        },
                    ],
                    opacity: animatedValue,
                };

            default:
                return {
                    opacity: animatedValue,
                };
        }
    };

    return (
        <Animated.View style={[getAnimatedStyle(), style]}>
            {children}
        </Animated.View>
    );
}

// Hook for creating custom transitions
export const useCustomTransition = (type: TransitionType, duration = 300) => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    const startAnimation = (callback?: () => void) => {
        Animated.timing(animatedValue, {
            toValue: 1,
            duration,
            useNativeDriver: true,
        }).start(callback);
    };

    const reverseAnimation = (callback?: () => void) => {
        Animated.timing(animatedValue, {
            toValue: 0,
            duration,
            useNativeDriver: true,
        }).start(callback);
    };

    return {
        animatedValue,
        startAnimation,
        reverseAnimation,
    };
}; 