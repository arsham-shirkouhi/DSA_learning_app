import { AppColors } from '@/constants/AppColors';
import { useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import { Dimensions, Image, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import AnimatedButton from '../components/AnimatedButton';
import { GlobalText } from '../components/GlobalText';
import PracticeCard from '../components/PracticeCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function darkenHexColor(hex: string, amount = 0.2) {
    hex = hex.replace('#', '');
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    r = Math.max(0, Math.floor(r * (1 - amount)));
    g = Math.max(0, Math.floor(g * (1 - amount)));
    b = Math.max(0, Math.floor(b * (1 - amount)));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export default function PracticePage() {
    const [topCardColor, setTopCardColor] = useState('#1EA7FF');
    const [safeAreaColor, setSafeAreaColor] = useState('#1EA7FF');

    const iconColors = ['#1EA7FF', '#4DEB7E', '#B97AFF', '#FF6A3D'];

    const getDarkerBackground = (color: string) => {
        switch (color) {
            case '#1EA7FF': return 'rgba(15, 26, 42, 0.5)'; // Blue
            case '#4DEB7E': return 'rgba(15, 42, 26, 0.5)'; // Green
            case '#B97AFF': return 'rgba(42, 15, 42, 0.5)'; // Purple
            case '#FF6A3D': return 'rgba(42, 26, 15, 0.5)'; // Orange
            default: return 'rgba(26, 26, 26, 0.5)';
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            const randomIndex = Math.floor(Math.random() * iconColors.length);
            const randomColor = iconColors[randomIndex];
            setTopCardColor(randomColor);
            setSafeAreaColor(randomColor);
        }, [])
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: safeAreaColor }}>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
                {/* Top Card */}
                <View style={[styles.topCard, { borderColor: topCardColor, backgroundColor: getDarkerBackground(topCardColor) }]}>
                    <View style={{ flex: 1, justifyContent: 'space-between' }}>
                        <View>
                            <GlobalText style={styles.topTitle}>Practice Makes Perfect!</GlobalText>
                            <GlobalText style={styles.topSubtitle}>Practice questions that might be tough</GlobalText>
                        </View>
                        <View style={styles.topCardBottomRow}>
                            <AnimatedButton
                                icon={require('@/assets/icons/points_icon.png')}
                                backgroundColor={topCardColor}
                                shadowColor={darkenHexColor(topCardColor, 0.25)}
                                shadowOffsetHeight={4}
                                shadowRadius={0}
                                shadowOpacity={1}
                                elevation={10}
                                borderRadius={8}
                                paddingVertical={8}
                                paddingHorizontal={16}
                                iconColor="#fff"
                                fontSize={16}
                                width={155}
                                height={40}
                                style={{ marginTop: 0 }}
                            >
                                +20 Start
                            </AnimatedButton>
                        </View>
                    </View>
                    <Image
                        source={require('@/assets/images/mascot.png')}
                        style={styles.topImage}
                    />
                </View>

                {/* Section Title */}
                <GlobalText style={styles.sectionTitle}>Practice</GlobalText>

                {/* Practice Modes */}
                <PracticeCard
                    title="Zen Mode"
                    subtitle="Practice without concern!"
                    points="+20"
                    icon={require('@/assets/icons/zenmode_icon.png')}
                    iconColor="#1EA7FF"
                />
                <PracticeCard
                    title="Mistakes"
                    subtitle="Go over things you got wrong!"
                    points="+20"
                    icon={require('@/assets/icons/mistakes_icon.png')}
                    iconColor="#4DEB7E"
                />
                <PracticeCard
                    title="Time Attack"
                    subtitle="Questions under a time limit"
                    points="+20"
                    icon={require('@/assets/icons/timed_icon.png')}
                    iconColor="#B97AFF"
                />
                <PracticeCard
                    title="Sudden Death"
                    subtitle="Get one question wrong its over!"
                    points="+20"
                    icon={require('@/assets/icons/suddendeath_icon.png')}
                    iconColor="#FF6A3D"
                />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 18,
        paddingBottom: 32,
        backgroundColor: AppColors.background,
    },
    topCard: {
        backgroundColor: AppColors.cardBackground,
        borderRadius: 10,
        borderWidth: 2,
        padding: 10,
        marginBottom: 18,
        width: '95%',
        maxWidth: 450,
        height: 180,
        alignSelf: 'center',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
    },
    topCardBottomRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginBottom: 10,
        marginLeft: 10,
    },
    topTitle: {
        color: AppColors.textPrimary,
        fontWeight: 'bold',
        fontSize: 18,
        marginTop: 10,
        marginLeft: 10,
        marginBottom: 2,
    },
    topSubtitle: {
        color: AppColors.textSecondary,
        fontSize: 14,
        marginBottom: 0,
        marginLeft: 10,
    },
    topImage: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
        position: 'absolute',
        bottom: 0,
        right: 20,
        marginBottom: 0,
        paddingBottom: 0,
    },
    sectionTitle: {
        color: AppColors.textPrimary,
        fontWeight: 'bold',
        fontSize: SCREEN_WIDTH * 0.045,
        marginLeft: '5%',
        marginBottom: 6,
        marginTop: 2,
        letterSpacing: 1,
    },
    icon: {
        width: 24,
        height: 24,
    },
}); 