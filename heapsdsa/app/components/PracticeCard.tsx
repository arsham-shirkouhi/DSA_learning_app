import { AppColors } from '@/constants/AppColors';
import React from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import GlowingIcon from './GlowingIcon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PracticeCardProps {
    title: string;
    subtitle: string;
    points: string;
    icon: any; // image source
    iconColor: string;
    onPress?: () => void;
}

export default function PracticeCard({ title, subtitle, points, icon, iconColor, onPress }: PracticeCardProps) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.card,
                {
                    shadowOffset: { width: 0, height: pressed ? 0 : 4 },
                    transform: [{ translateY: pressed ? 4 : 0 }],
                },
            ]}
        >
            <View style={styles.leftCol}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
                <View style={styles.pointsRow}>
                    <GlowingIcon
                        source={require('@/assets/icons/points_icon.png')}
                        color="#339AFF"
                        style={styles.pointsIcon}
                        tintColor="#339AFF"
                    />
                    <Text style={styles.pointsText}>{points}</Text>
                </View>
            </View>
            <View style={styles.rightCol}>
                <GlowingIcon source={icon} color={iconColor} style={styles.icon} tintColor={iconColor} />
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        width: '95%',
        maxWidth: 450,
        alignSelf: 'center',
        height: 110,
        backgroundColor: AppColors.cardBackground,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#232A36',
        paddingVertical: 15,
        paddingHorizontal: 15,
        marginVertical: 8,
        alignItems: 'center',
        shadowColor: '#232A36',
        shadowOpacity: 1,
        shadowRadius: 0,
        shadowOffset: { width: 0, height: 4 },
        elevation: 10,
    },
    leftCol: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
    },
    rightCol: {
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 16,
    },
    title: {
        color: AppColors.textPrimary,
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 2,
    },
    subtitle: {
        color: AppColors.textSecondary,
        fontSize: 14,
        marginBottom: 10,
    },
    pointsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    pointsIcon: {
        width: SCREEN_WIDTH * 0.055,
        height: SCREEN_WIDTH * 0.055,
        marginRight: 4,
        tintColor: '#339AFF',
    },
    pointsText: {
        color: AppColors.textPrimary,
        fontWeight: 'bold',
        fontSize: 18,
    },
    icon: {
        width: SCREEN_WIDTH * 0.17,
        height: SCREEN_WIDTH * 0.17,
        resizeMode: 'contain',
    },
}); 