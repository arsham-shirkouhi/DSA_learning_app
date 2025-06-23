import { AppColors } from '@/constants/AppColors';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getUserStats } from '../../app/firebase/userData';

export default function TopBar() {
    const insets = useSafeAreaInsets();
    const [userData, setUserData] = useState<{ points: number; streaks: number; level: number } | null>(null);

    useEffect(() => {
        loadUserData();
    }, []);

    async function loadUserData() {
        const data = await getUserStats();
        if (data) {
            setUserData(data);
            console.log('Points:', data.points);
            console.log('Streaks:', data.streaks);
            console.log('Level:', data.level);
        }
    }



    return (
        <View style={[styles.container, { paddingTop: insets.top, height: insets.top + 120 }]}>
            {/* <Text style={styles.title}>My Top Bar</Text> */}

            <View style={styles.badgeRow}>
                {/* First one: just text */}
                <View style={styles.badge}>
                    <Text style={[styles.badgeLabel, { color: AppColors.textPrimary }]}>java</Text>
                </View>

                {/* Second one: icon + text */}
                <View style={styles.badge}>
                    <Image
                        source={require('@/assets/icons/streak_icon.png')}
                        style={[styles.badgeIcon, { tintColor: '#FF5F4A' }]}
                    />
                    <Text style={[styles.badgeLabel, { color: '#FF5F4A' }]}>{userData?.streaks || 0}</Text>
                </View>

                <View style={styles.badge}>
                    <Image
                        source={require('@/assets/icons/points_icon.png')}
                        style={[styles.badgeIcon, { tintColor: '#339AFF' }]}
                    />
                    <Text style={[styles.badgeLabel, { color: '#339AFF', fontSize: 16 }]}>
                        {userData?.points && userData.points >= 1000
                            ? `${Math.round(userData.points / 1000)}k`
                            : userData?.points || 0}
                    </Text>

                </View>

                <View style={styles.badge}>
                    <Image
                        source={require('@/assets/icons/level_icon.png')}
                        style={[styles.badgeIcon, { tintColor: '#C5FF3D' }]}
                    />
                    <Text style={[styles.badgeLabel, { color: '#C5FF3D' }]}>{userData?.level || 0}</Text>
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

        // justifyContent: 'center',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: AppColors.borderColor,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 20,
        marginHorizontal: 8,
        width: 95,
        height: 45,
    },
    badgeIcon: {
        width: 28,
        height: 28,
        marginRight: 6,
    },
    badgeLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 100,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
