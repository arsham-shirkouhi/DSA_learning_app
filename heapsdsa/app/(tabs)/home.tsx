import { AppColors } from '@/constants/AppColors'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useAuth } from '../context/AuthContext'

export default function HomeScreen() {
    const { user } = useAuth()

    // The root layout protects this route, so a user should always exist.
    // This check is a safeguard.
    if (!user) {
        return null
    }

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Welcome to DSA Learning</Text>
                <Text style={styles.subtitle}>Master Data Structures & Algorithms</Text>

                <View style={styles.userInfo}>
                    <Text style={styles.label}>Signed in as:</Text>
                    <Text style={styles.email}>{user.email}</Text>
                    {!user.emailVerified && (
                        <Text style={styles.warning}>(Email not verified)</Text>
                    )}
                </View>

                <View style={styles.features}>
                    <Text style={styles.featureTitle}>What you can do:</Text>
                    <Text style={styles.feature}>• Practice DSA problems</Text>
                    <Text style={styles.feature}>• Track your progress</Text>
                    <Text style={styles.feature}>• Compete on leaderboards</Text>
                    <Text style={styles.feature}>• Learn from detailed explanations</Text>
                </View>

                <Text style={styles.note}>
                    Use the tabs below to navigate between different sections of the app.
                </Text>
            </View>
        </View>
    )
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
        shadowColor: AppColors.cardShadow,
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
    userInfo: {
        marginBottom: 25,
        alignItems: 'center',
    },
    label: {
        fontSize: 14,
        color: AppColors.textSecondary,
        marginBottom: 5,
    },
    email: {
        fontSize: 16,
        fontWeight: '600',
        color: AppColors.textPrimary,
    },
    warning: {
        color: AppColors.warning,
        fontSize: 14,
        marginTop: 5,
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
        color: AppColors.textTertiary,
        textAlign: 'center',
        fontStyle: 'italic',
    },
}) 