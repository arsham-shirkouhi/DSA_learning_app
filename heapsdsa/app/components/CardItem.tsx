import { AppColors } from '@/constants/AppColors';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';


interface CardItemProps {
    title: string;
    color: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CardItem({ title, color }: CardItemProps) {
    return (
        <View style={[styles.card, { backgroundColor: AppColors.cardBackground, borderColor: '#232A36' }]}>
            {/* {/* Top image placeholder */}
            <View style={styles.imageContainer}>
                <Image
                    source={require('@/assets/images/topics/test_topic_image.png')}
                    style={styles.image}
                    resizeMode="cover"
                />
            </View>
            <View style={styles.content}>
                <View style={styles.headerRow}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.points}>+5k</Text>
                </View>
                <View style={styles.moduleBox}>
                    <View style={styles.moduleRow}>
                        <Text style={styles.moduleTitle}>Module 1</Text>
                        <View style={styles.checkCircle} />
                    </View>
                    <Text style={styles.moduleSubtitle}>Traversal</Text>
                    <Text style={styles.expand}>Expand</Text>
                </View>
                <View style={styles.progressRow}>
                    <Text style={styles.progressText}>2/15 Modules</Text>
                </View>
                <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBarFill, { width: '13%' }]} />
                </View>
            </View>
        </View>
    );
}

const CARD_WIDTH = SCREEN_WIDTH - 40;

const styles = StyleSheet.create({
    card: {
        height: 380,
        width: SCREEN_WIDTH - 40,
        marginHorizontal: 20,
        borderRadius: 20,

        marginTop: 400,
        marginBottom: 50,
        borderWidth: 2,
        borderColor: AppColors.borderColor,
    },
    text: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
    },
    imageContainer: {
        width: 400,
        height: 180,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 0,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: AppColors.borderColor,
        backgroundColor: '#232A36',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    content: {
        padding: 16,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    title: {
        color: AppColors.textPrimary,
        fontSize: 22,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    points: {
        color: '#4DEB7E',
        fontWeight: 'bold',
        fontSize: 18,
    },
    moduleBox: {
        backgroundColor: '#232A36',
        borderRadius: 10,
        padding: 10,
        marginBottom: 8,
    },
    moduleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    moduleTitle: {
        color: AppColors.textPrimary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    checkCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#4DEB7E',
        alignItems: 'center',
        justifyContent: 'center',
    },
    moduleSubtitle: {
        color: AppColors.textSecondary,
        fontSize: 14,
        marginTop: 2,
    },
    expand: {
        color: AppColors.textTri,
        fontSize: 13,
        marginTop: 4,
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    progressText: {
        color: '#4DEB7E',
        fontSize: 14,
        fontFamily: 'monospace',
    },
    progressBarBackground: {
        width: '100%',
        height: 8,
        backgroundColor: '#232A36',
        borderRadius: 4,
        overflow: 'hidden',
        marginTop: 2,
        marginBottom: 2,
    },
    progressBarFill: {
        height: 8,
        backgroundColor: '#4DEB7E',
        borderRadius: 4,
    },
});
