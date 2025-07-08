import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, ViewStyle } from 'react-native';
import CustomTransition, { TransitionType } from './CustomTransition';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface TransitionWrapperProps {
    children: React.ReactNode;
    type?: TransitionType;
    duration?: number;
    delay?: number;
    style?: ViewStyle;
    onEnter?: () => void;
    onExit?: () => void;
    isVisible?: boolean;
}

export default function TransitionWrapper({
    children,
    type = 'fade',
    duration = 300,
    delay = 0,
    style,
    onEnter,
    onExit,
    isVisible = true,
}: TransitionWrapperProps) {
    const opacityAnim = useRef(new Animated.Value(isVisible ? 1 : 0)).current;
    const scaleAnim = useRef(new Animated.Value(isVisible ? 1 : 0.8)).current;
    const translateYAnim = useRef(new Animated.Value(isVisible ? 0 : 50)).current;

    useEffect(() => {
        if (isVisible) {
            // Enter animation
            Animated.parallel([
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration,
                    delay,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 100,
                    friction: 8,
                }),
                Animated.timing(translateYAnim, {
                    toValue: 0,
                    duration,
                    delay,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                onEnter?.();
            });
        } else {
            // Exit animation
            Animated.parallel([
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: duration * 0.7,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 0.8,
                    duration: duration * 0.7,
                    useNativeDriver: true,
                }),
                Animated.timing(translateYAnim, {
                    toValue: 50,
                    duration: duration * 0.7,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                onExit?.();
            });
        }
    }, [isVisible, opacityAnim, scaleAnim, translateYAnim, duration, delay, onEnter, onExit]);

    const getAnimatedStyle = (): any => {
        return {
            opacity: opacityAnim,
            transform: [
                { scale: scaleAnim },
                { translateY: translateYAnim },
            ],
        };
    };

    return (
        <Animated.View style={[getAnimatedStyle(), style]}>
            <CustomTransition type={type} duration={duration} delay={delay}>
                {children}
            </CustomTransition>
        </Animated.View>
    );
}

// Specialized transition wrappers for different use cases
export const FadeTransition = ({ children, ...props }: Omit<TransitionWrapperProps, 'type'>) => (
    <TransitionWrapper type="fade" {...props}>
        {children}
    </TransitionWrapper>
);

export const SlideTransition = ({ children, ...props }: Omit<TransitionWrapperProps, 'type'>) => (
    <TransitionWrapper type="slideFromRight" {...props}>
        {children}
    </TransitionWrapper>
);

export const ZoomTransition = ({ children, ...props }: Omit<TransitionWrapperProps, 'type'>) => (
    <TransitionWrapper type="zoomIn" {...props}>
        {children}
    </TransitionWrapper>
);

export const ParallaxTransition = ({ children, ...props }: Omit<TransitionWrapperProps, 'type'>) => (
    <TransitionWrapper type="parallax" {...props}>
        {children}
    </TransitionWrapper>
);

export const ScaleTransition = ({ children, ...props }: Omit<TransitionWrapperProps, 'type'>) => (
    <TransitionWrapper type="scale" {...props}>
        {children}
    </TransitionWrapper>
); 