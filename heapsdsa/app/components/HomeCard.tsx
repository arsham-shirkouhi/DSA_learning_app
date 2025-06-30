import { AppColors } from '@/constants/AppColors';
import React from 'react';
import { Dimensions, Image, ImageSourcePropType, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { GlobalText } from './GlobalText';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 15 * 3) / 2;
const DEFAULT_ICON_SIZE = Math.round(CARD_WIDTH * 0.5);

interface HomeCardProps {
    title: string;
    xp: string;
    xpIcon: ImageSourcePropType;
    bracesColor: string;
    bracesIcon: ImageSourcePropType;
    onPress?: () => void;
    style?: ViewStyle;
    iconSize?: number;
}

export default function HomeCard({ title, xp, xpIcon, bracesColor, bracesIcon, onPress, style, iconSize }: HomeCardProps) {
    const iconDim = iconSize ?? DEFAULT_ICON_SIZE;
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.card,
                style,
                {
                    shadowOffset: { width: 0, height: pressed ? 0 : 4 },
                    transform: [{ translateY: pressed ? 4 : 0 }],
                },
            ]}
        >
            <View style={styles.content}>
                <View style={styles.textCol}>
                    <GlobalText variant='bold' style={styles.title}>{title}</GlobalText>
                    <View style={styles.xpRow}>
                        <Image source={xpIcon} style={styles.xpIcon} />
                        <GlobalText style={styles.xpText}>{xp}</GlobalText>
                    </View>
                </View>
                <View style={styles.iconRow}>
                    <Image source={bracesIcon} style={[styles.bracesIcon, { tintColor: bracesColor, width: iconDim, height: iconDim }]} />
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: AppColors.cardBackground,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: AppColors.borderColor,
        paddingTop: 15,
        paddingLeft: 15,
        paddingRight: 0,
        paddingBottom: 0,
        width: CARD_WIDTH,
        minHeight: 150,
        justifyContent: 'flex-start',
        shadowColor: AppColors.borderColor,
        shadowOpacity: 1,
        shadowRadius: 0,
        shadowOffset: { width: 0, height: 4 },
        elevation: 10,
        position: 'relative',
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
    },
    textCol: {
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    title: {
        color: AppColors.textPrimary,
        fontSize: 18,
        fontFamily: 'JetBrainsMono',
        marginBottom: 2,
    },
    xpRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    xpIcon: {
        width: 16,
        height: 16,
        marginRight: 3,
        tintColor: '#339AFF',
    },
    xpText: {
        color: AppColors.textSecondary,
        fontSize: 15,
        fontFamily: 'JetBrainsMono',
        fontWeight: 'bold',
    },
    iconRow: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
    },
    bracesIcon: {
        resizeMode: 'contain',
    },
}); 