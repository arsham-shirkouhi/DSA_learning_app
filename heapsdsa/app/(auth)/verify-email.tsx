import { AppColors } from '@/constants/AppColors';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getAuth, reload } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import AnimatedButton from '../components/AnimatedButton';
import { GlobalText } from '../components/GlobalText';
import { db } from '../firebase';

export default function VerifyEmailScreen() {
    const router = useRouter();
    const { email } = useLocalSearchParams<{ email: string }>();
    const [error, setError] = useState('');
    const [checking, setChecking] = useState(false);

    const handleCheckVerified = async () => {
        setError('');
        setChecking(true);
        try {
            const auth = getAuth();
            if (auth.currentUser) {
                await reload(auth.currentUser);
                if (auth.currentUser.emailVerified) {
                    // Create user doc in Firestore if it doesn't exist
                    const userRef = doc(db, 'users', auth.currentUser.uid);
                    const userSnap = await getDoc(userRef);
                    if (!userSnap.exists()) {
                        await setDoc(userRef, {
                            email: auth.currentUser.email,
                            username: '',
                            displayName: '',
                            level: 1,
                            xp: 0,
                            currentStreak: 0,
                            longestStreak: 0,
                            numberOfBadges: 0,
                            lastLogin: serverTimestamp(),
                            settings: {
                                darkMode: false,
                                notifications: true,
                            },
                            longestCorrectStreak: 0,
                            currentGoal: 'Solve 5 questions a day',
                            totalQuestionsAnswered: 0,
                            weeklyActivity: {},
                            accuracy: 0,
                            isOnboardingCompleted: false,
                            createdAt: serverTimestamp(),
                            updatedAt: serverTimestamp(),
                        }, { merge: true });
                    }
                    router.replace('/(onboarding)/profile');
                    return;
                }
            }
            setError('Account not verified yet. Please check your email and click the verification link.');
        } catch (e) {
            setError('Error checking verification status.');
        } finally {
            setChecking(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <GlobalText style={styles.title}>Verify Your Email</GlobalText>
                <View style={{ marginBottom: 24 }}>
                    <GlobalText style={styles.subtitle}>
                        We've sent a verification email to <GlobalText style={{ fontWeight: 'bold' }}>{email}</GlobalText>.
                    </GlobalText>
                    <GlobalText style={styles.subtitle}>
                        Please check your inbox and click the verification link. Then come back here and click the button below.
                    </GlobalText>
                </View>
                {error ? <GlobalText style={styles.error}>{error}</GlobalText> : null}
                <AnimatedButton
                    backgroundColor={AppColors.primary}
                    borderRadius={12}
                    height={56}
                    width={260}
                    onPress={checking ? undefined : handleCheckVerified}
                    style={{ marginTop: 24 }}
                >
                    <GlobalText variant="bold" style={{ color: '#fff', fontSize: 18 }}>
                        I've Verified My Account
                    </GlobalText>
                </AnimatedButton>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: AppColors.background,
        padding: 20,
    },
    card: {
        backgroundColor: AppColors.cardBackground,
        padding: 32,
        borderRadius: 16,
        width: '100%',
        maxWidth: 420,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: AppColors.borderColor,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: AppColors.textPrimary,
        marginBottom: 16,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: AppColors.textSecondary,
        textAlign: 'center',
        marginBottom: 0,
    },
    error: {
        color: AppColors.red,
        fontSize: 15,
        marginBottom: 12,
        textAlign: 'center',
    },
}); 