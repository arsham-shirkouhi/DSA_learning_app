import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, ViewStyle } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export type EntranceType =
    | 'fadeIn'
    | 'slideUp'
    | 'slideDown'
    | 'slideLeft'
    | 'slideRight'
    | 'zoomIn'
    | 'scaleIn'
    | 'bounceIn'
    | 'flipIn'
    | 'staggered';

interface ScreenEntranceProps {
    children: React.ReactNode;
    type?: EntranceType;
    duration?: number;
    delay?: number;
    style?: ViewStyle;
    onAnimationComplete?: () => void;
    staggerDelay?: number;
    staggerIndex?: number;
}

export default function ScreenEntrance({
    children,
    type = 'fadeIn',
    duration = 600,
    delay = 0,
    style,
    onAnimationComplete,
    staggerDelay = 100,
    staggerIndex = 0,
}: ScreenEntranceProps) {
    const animatedValue = useRef(new Animated.Value(0)).current;
    const scaleValue = useRef(new Animated.Value(0.8)).current;
    const translateYValue = useRef(new Animated.Value(-100)).current;
    const translateXValue = useRef(new Animated.Value(screenWidth)).current;
    const rotateValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const totalDelay = delay + (staggerIndex * staggerDelay);

        const getAnimation = () => {
            switch (type) {
                case 'fadeIn':
                    return Animated.timing(animatedValue, {
                        toValue: 1,
                        duration,
                        delay: totalDelay,
                        useNativeDriver: true,
                    });

                case 'slideUp':
                    return Animated.parallel([
                        Animated.timing(animatedValue, {
                            toValue: 1,
                            duration,
                            delay: totalDelay,
                            useNativeDriver: true,
                        }),
                        Animated.timing(translateYValue, {
                            toValue: 0,
                            duration,
                            delay: totalDelay,
                            useNativeDriver: true,
                        }),
                    ]);

                case 'slideDown':
                    return Animated.parallel([
                        Animated.timing(animatedValue, {
                            toValue: 1,
                            duration,
                            delay: totalDelay,
                            useNativeDriver: true,
                        }),
                        Animated.timing(translateYValue, {
                            toValue: 0,
                            duration,
                            delay: totalDelay,
                            useNativeDriver: true,
                        }),
                    ]);

                case 'slideLeft':
                    return Animated.parallel([
                        Animated.timing(animatedValue, {
                            toValue: 1,
                            duration,
                            delay: totalDelay,
                            useNativeDriver: true,
                        }),
                        Animated.timing(translateXValue, {
                            toValue: 0,
                            duration,
                            delay: totalDelay,
                            useNativeDriver: true,
                        }),
                    ]);

                case 'slideRight':
                    return Animated.parallel([
                        Animated.timing(animatedValue, {
                            toValue: 1,
                            duration,
                            delay: totalDelay,
                            useNativeDriver: true,
                        }),
                        Animated.timing(translateXValue, {
                            toValue: 0,
                            duration,
                            delay: totalDelay,
                            useNativeDriver: true,
                        }),
                    ]);

                case 'zoomIn':
                    return Animated.parallel([
                        Animated.timing(animatedValue, {
                            toValue: 1,
                            duration,
                            delay: totalDelay,
                            useNativeDriver: true,
                        }),
                        Animated.spring(scaleValue, {
                            toValue: 1,
                            useNativeDriver: true,
                            tension: 100,
                            friction: 8,
                        }),
                    ]);

                case 'scaleIn':
                    return Animated.spring(scaleValue, {
                        toValue: 1,
                        useNativeDriver: true,
                        tension: 100,
                        friction: 8,
                    });

                case 'bounceIn':
                    return Animated.sequence([
                        Animated.timing(scaleValue, {
                            toValue: 1.2,
                            duration: duration * 0.6,
                            delay: totalDelay,
                            useNativeDriver: true,
                        }),
                        Animated.spring(scaleValue, {
                            toValue: 1,
                            useNativeDriver: true,
                            tension: 200,
                            friction: 5,
                        }),
                    ]);

                case 'flipIn':
                    return Animated.parallel([
                        Animated.timing(animatedValue, {
                            toValue: 1,
                            duration,
                            delay: totalDelay,
                            useNativeDriver: true,
                        }),
                        Animated.timing(rotateValue, {
                            toValue: 1,
                            duration,
                            delay: totalDelay,
                            useNativeDriver: true,
                        }),
                    ]);

                case 'staggered':
                    return Animated.parallel([
                        Animated.timing(animatedValue, {
                            toValue: 1,
                            duration,
                            delay: totalDelay,
                            useNativeDriver: true,
                        }),
                        Animated.timing(translateYValue, {
                            toValue: 0,
                            duration,
                            delay: totalDelay,
                            useNativeDriver: true,
                        }),
                        Animated.spring(scaleValue, {
                            toValue: 1,
                            useNativeDriver: true,
                            tension: 100,
                            friction: 8,
                        }),
                    ]);

                default:
                    return Animated.timing(animatedValue, {
                        toValue: 1,
                        duration,
                        delay: totalDelay,
                        useNativeDriver: true,
                    });
            }
        };

        const animation = getAnimation();
        animation.start(() => {
            onAnimationComplete?.();
        });

        return () => animation.stop();
    }, [animatedValue, scaleValue, translateYValue, translateXValue, rotateValue, type, duration, delay, staggerDelay, staggerIndex, onAnimationComplete]);

    const getAnimatedStyle = (): any => {
        switch (type) {
            case 'fadeIn':
                return {
                    opacity: animatedValue,
                };

            case 'slideUp':
                return {
                    opacity: animatedValue,
                    transform: [{ translateY: translateYValue }],
                };

            case 'slideDown':
                return {
                    opacity: animatedValue,
                    transform: [{ translateY: translateYValue }],
                };

            case 'slideLeft':
                return {
                    opacity: animatedValue,
                    transform: [{ translateX: translateXValue }],
                };

            case 'slideRight':
                return {
                    opacity: animatedValue,
                    transform: [{ translateX: translateXValue }],
                };

            case 'zoomIn':
                return {
                    opacity: animatedValue,
                    transform: [{ scale: scaleValue }],
                };

            case 'scaleIn':
                return {
                    transform: [{ scale: scaleValue }],
                };

            case 'bounceIn':
                return {
                    transform: [{ scale: scaleValue }],
                };

            case 'flipIn':
                return {
                    opacity: animatedValue,
                    transform: [
                        {
                            rotateY: rotateValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['90deg', '0deg'],
                            }),
                        },
                    ],
                };

            case 'staggered':
                return {
                    opacity: animatedValue,
                    transform: [
                        { translateY: translateYValue },
                        { scale: scaleValue },
                    ],
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

// Specialized entrance components for common use cases
export const FadeIn = ({ children, ...props }: Omit<ScreenEntranceProps, 'type'>) => (
    <ScreenEntrance type="fadeIn" {...props}>
        {children}
    </ScreenEntrance>
);

export const SlideUp = ({ children, ...props }: Omit<ScreenEntranceProps, 'type'>) => (
    <ScreenEntrance type="slideUp" {...props}>
        {children}
    </ScreenEntrance>
);

export const SlideDown = ({ children, ...props }: Omit<ScreenEntranceProps, 'type'>) => (
    <ScreenEntrance type="slideDown" {...props}>
        {children}
    </ScreenEntrance>
);

export const ZoomIn = ({ children, ...props }: Omit<ScreenEntranceProps, 'type'>) => (
    <ScreenEntrance type="zoomIn" {...props}>
        {children}
    </ScreenEntrance>
);

export const BounceIn = ({ children, ...props }: Omit<ScreenEntranceProps, 'type'>) => (
    <ScreenEntrance type="bounceIn" {...props}>
        {children}
    </ScreenEntrance>
);

export const StaggeredIn = ({ children, ...props }: Omit<ScreenEntranceProps, 'type'>) => (
    <ScreenEntrance type="staggered" {...props}>
        {children}
    </ScreenEntrance>
); 