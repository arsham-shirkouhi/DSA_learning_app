import { AppColors } from '@/constants/AppColors';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlobalText } from '../../app/components/GlobalText';
import { userService } from '../../app/utils/userService';

function GlowingIcon({ source, color, style }: { source: any; color: string; style?: any }) {
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
        shadowOpacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }),
        shadowRadius: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [6, 16] }),
        shadowOffset: { width: 0, height: 0 },
        ...(
            Platform.OS === 'android'
                ? {
                    backgroundColor: color,
                    opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.5] }),
                    borderRadius: 20,
                }
                : {}
        ),
    };

    return (
        <Animated.View style={[animatedStyle, { justifyContent: 'center', alignItems: 'center' }]}>
            <Image source={source} style={style} />
        </Animated.View>
    );
}

export function TopBar() {
    const insets = useSafeAreaInsets();
    const userDataRef = useRef<{ points: number; streaks: number; level: number }>({ points: 0, streaks: 0, level: 0 });
    const [, forceUpdate] = useState(0); // dummy state to force re-render

    useEffect(() => {
        const fetchUserData = async () => {
            const data = await userService.getCurrentUserProfile();
            userDataRef.current = {
                points: data?.xp || 0,
                streaks: data?.currentStreak || 0,
                level: data?.level || 0,
            };
            forceUpdate(n => n + 1);
        };
        fetchUserData();
    }, []);

    const userData = userDataRef.current;

    return (
        <View style={[styles.container, { paddingTop: insets.top, height: insets.top + 65 }]}>
            {/* <Text style={styles.title}>My Top Bar</Text> */}

            <View style={styles.badgeRow}>
                {/* First one: just text */}

                <View style={[styles.badge, { backgroundColor: 'rgba(26, 15, 42, 0.5)', borderWidth: 2, borderColor: '#8A4DB8' }]}>
                    <GlowingIcon
                        source={require('@/assets/icons/coding_icon.png')}
                        color={'#C06EFF'}
                        style={[styles.badgeIcon, { tintColor: '#C06EFF' }]}
                    />
                    <GlobalText variant='bold' style={[styles.badgeLabel, { color: '#C06EFF', paddingLeft: 0, marginLeft: -5, }]}>Java</GlobalText>
                </View>

                {/* Second one: icon + text */}
                <View style={[styles.badge, { backgroundColor: 'rgba(42, 21, 16, 0.5)', borderWidth: 2, borderColor: '#CC4C3A' }]}>
                    <GlowingIcon
                        source={require('@/assets/icons/streak_icon.png')}
                        color={'#FF5F4A'}
                        style={[styles.badgeIcon, { tintColor: '#FF5F4A' }]}
                    />
                    <GlobalText variant='bold' style={[styles.badgeLabel, { color: '#FF5F4A' }]}>{userData.streaks}</GlobalText>
                </View>

                <View style={[styles.badge, { backgroundColor: 'rgba(15, 26, 42, 0.5)', borderWidth: 2, borderColor: '#2678CC' }]}>
                    <GlowingIcon
                        source={require('@/assets/icons/points_icon.png')}
                        color={'#339AFF'}
                        style={[styles.badgeIcon, { tintColor: '#339AFF' }]}
                    />
                    <GlobalText variant='bold' style={[styles.badgeLabel, { color: '#339AFF', fontSize: 16 }]}>
                        {userData.points >= 1000 ? `${Math.round(userData.points / 1000)}k` : userData.points}
                    </GlobalText>

                </View>

                <View style={[styles.badge, { backgroundColor: 'rgba(26, 42, 15, 0.5)', borderWidth: 2, borderColor: '#9ECC31' }]}>
                    <GlowingIcon
                        source={require('@/assets/icons/level_icon.png')}
                        color={'#C5FF3D'}
                        style={[styles.badgeIcon, { tintColor: '#C5FF3D' }]}
                    />
                    <GlobalText variant='bold' style={[styles.badgeLabel, { color: '#C5FF3D' }]}>{userData.level}</GlobalText>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: AppColors.navbar,
        justifyContent: 'flex-end',  // 👈 anchor content toward bottom
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: AppColors.borderColor,
        paddingBottom: 15,  // 👈 adjust this to get your perfect bottom spacing
        marginBottom: 0,

    },
    title: {
        color: AppColors.textPrimary,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    badgeRow: {
        flexDirection: 'row',
        marginBottom: 0,  // 👈 here you control your bottom spacing
        marginLeft: 15,
        marginRight: 15,

        // justifyContent: 'center',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        // borderWidth: 2,
        borderColor: AppColors.borderColor,
        borderRadius: 10,
        paddingHorizontal: 6,
        // paddingVertical: 20,
        marginHorizontal: 12,
        width: 85,
        height: 40,
    },
    badgeIcon: {
        width: 28,
        height: 28,
        marginRight: 8,
    },
    badgeLabel: {
        width: 100,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
