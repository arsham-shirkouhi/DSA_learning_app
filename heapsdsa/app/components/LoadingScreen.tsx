import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { GlobalText } from './GlobalText';

interface LoadingScreenProps {
    message?: string;
    progress?: number;
    showTerminal?: boolean;
    isAuthLoading?: boolean;
}

function darkenHexColor(hex: string, amount = 0.3) {
    hex = hex.replace('#', '');
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    r = Math.max(0, Math.floor(r * (1 - amount)));
    g = Math.max(0, Math.floor(g * (1 - amount)));
    b = Math.max(0, Math.floor(b * (1 - amount)));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export default function LoadingScreen({
    message = "Loading",
    progress = 0,
    showTerminal = true,
    isAuthLoading = false
}: LoadingScreenProps) {
    const [progressPercentage, setProgressPercentage] = useState(progress);
    const [dots, setDots] = useState('');
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const progressAnim = useRef(new Animated.Value(progress / 100)).current;
    const indicatorAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Smooth fade in animation
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true
        }).start();

        // Smooth indicator animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(indicatorAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true
                }),
                Animated.timing(indicatorAnim, {
                    toValue: 0,
                    duration: 1500,
                    useNativeDriver: true
                }),
            ])
        ).start();

        // Animated dots
        const dotsInterval = setInterval(() => {
            setDots(prev => {
                if (prev === '...') return '';
                return prev + '.';
            });
        }, 400);

        // Update progress when prop changes
        if (progress > 0) {
            setProgressPercentage(progress);
            Animated.timing(progressAnim, {
                toValue: progress / 100,
                duration: 800,
                useNativeDriver: false
            }).start();
        } else {
            // Simple progress for non-auth loading
            Animated.timing(progressAnim, {
                toValue: 1,
                duration: 4000,
                useNativeDriver: false
            }).start();

            // Update percentage for simple loading
            const interval = setInterval(() => {
                setProgressPercentage(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + 1;
                });
            }, 40);
        }

        return () => clearInterval(dotsInterval);
    }, [fadeAnim, progressAnim, indicatorAnim, isAuthLoading, progress]);

    const currentMessage = progress > 0 ? message : message;

    return (
        <View style={styles.container}>
            {/* Main loading content - fully centered */}
            <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
                {/* Modern loading indicator */}
                <View style={styles.loadingIndicator}>
                    <View style={styles.indicatorContainer}>
                        <Animated.View style={[styles.indicatorLine, { opacity: indicatorAnim }]} />
                        <Animated.View style={[styles.indicatorLine, { opacity: indicatorAnim }]} />
                        <Animated.View style={[styles.indicatorLine, { opacity: indicatorAnim }]} />
                        <Animated.View style={[styles.indicatorLine, { opacity: indicatorAnim }]} />
                        <Animated.View style={[styles.indicatorLine, { opacity: indicatorAnim }]} />
                    </View>
                </View>

                {/* Loading message with animated dots */}
                <View style={styles.messageContainer}>
                    <GlobalText style={styles.loadingTitle}>
                        {currentMessage}{dots}
                    </GlobalText>
                </View>

                {/* Progress bar - left to right only */}
                <View style={styles.progressContainer}>
                    <Animated.View
                        style={[
                            styles.progressBar,
                            {
                                width: progressAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0%', '100%'],
                                }),
                            }
                        ]}
                    />
                </View>

                {/* Progress percentage */}
                <View style={styles.percentageContainer}>
                    <GlobalText style={styles.percentageText}>
                        {progressPercentage}%
                    </GlobalText>
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000', // Darker background
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainContent: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
    },
    loadingIndicator: {
        width: 200,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    indicatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    indicatorLine: {
        width: 4,
        height: 40,
        backgroundColor: '#1EA7FF',
        borderRadius: 2,
    },
    messageContainer: {
        marginBottom: 30,
        alignItems: 'center',
    },
    loadingTitle: {
        fontSize: 18,
        color: '#ffffff',
        textAlign: 'center',
        fontWeight: '600',
    },
    progressContainer: {
        width: 300,
        height: 6,
        backgroundColor: '#1a1a1a',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 20,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#1EA7FF',
        borderRadius: 3,
    },
    percentageContainer: {
        alignItems: 'center',
    },
    percentageText: {
        fontSize: 16,
        color: '#666666',
        fontWeight: '500',
    },
}); 