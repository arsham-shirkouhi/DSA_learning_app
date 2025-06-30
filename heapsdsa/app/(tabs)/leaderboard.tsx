import { AppColors } from '@/constants/AppColors';
import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { GlobalText } from '../components/GlobalText';

export default function LeaderBoardScreen() {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: AppColors.background }}>
            <View style={styles.container}>
                <View style={styles.card}>
                    <GlobalText style={styles.title}>Leaderboard</GlobalText>
                    <GlobalText style={styles.subtitle}>Coming Soon</GlobalText>

                    <View style={styles.features}>
                        <GlobalText style={styles.featureTitle}>What's coming:</GlobalText>
                        <GlobalText style={styles.feature}>• Global rankings</GlobalText>
                        <GlobalText style={styles.feature}>• Weekly competitions</GlobalText>
                        <GlobalText style={styles.feature}>• Achievement badges</GlobalText>
                        <GlobalText style={styles.feature}>• Performance analytics</GlobalText>
                        <GlobalText style={styles.feature}>• Friend challenges</GlobalText>
                    </View>

                    <GlobalText style={styles.note}>
                        Compete with other learners and track your progress.
                    </GlobalText>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: AppColors.background,
    },
    card: {
        backgroundColor: AppColors.cardBackground,
        padding: 30,
        borderRadius: 12,
        width: '100%',
        maxWidth: 400,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
        color: AppColors.textPrimary,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
        color: AppColors.textSecondary,
    },
    features: {
        marginBottom: 25,
    },
    featureTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
        color: AppColors.textPrimary,
    },
    feature: {
        fontSize: 14,
        color: AppColors.textSecondary,
        marginBottom: 5,
    },
    note: {
        fontSize: 12,
        color: AppColors.textTri,
        textAlign: 'center',
        fontStyle: 'italic',
    },
}); 