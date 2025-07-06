import { AppColors } from '@/constants/AppColors';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import AnimatedButton from '../components/AnimatedButton';
import { GlobalText } from '../components/GlobalText';
import { GlobalTextInput } from '../components/GlobalTextInput';
import { useOnboarding } from '../context/OnboardingContext';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.92, 440);

export default function ProfileOnboardingScreen() {
    const [displayName, setDisplayName] = useState('');
    const [username, setUsername] = useState('');
    const [errors, setErrors] = useState<{ displayName?: string; username?: string }>({});
    const router = useRouter();
    const { updateOnboardingData } = useOnboarding();


    const validateForm = () => {
        const newErrors: { displayName?: string; username?: string } = {};

        if (!displayName.trim()) {
            newErrors.displayName = 'Display name is required';
        } else if (displayName.trim().length < 2) {
            newErrors.displayName = 'Display name must be at least 2 characters';
        }

        if (!username.trim()) {
            newErrors.username = 'Username is required';
        } else if (username.trim().length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
            newErrors.username = 'Username can only contain letters, numbers, and underscores';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateForm()) {
            updateOnboardingData({
                displayName: displayName.trim(),
                username: username.trim(),
            });
            router.push('/(onboarding)/frequency');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Header */}
                <View style={styles.header}>
                    <GlobalText variant="bold" style={styles.title}>
                        Let's get to know you
                    </GlobalText>
                    <GlobalText style={styles.subtitle}>
                        Set up your profile to get started
                    </GlobalText>
                </View>

                {/* Form */}
                <View style={[styles.formCard, { width: CARD_WIDTH }]}>
                    <View style={styles.inputGroup}>
                        <GlobalText style={styles.label}>Display Name</GlobalText>
                        <GlobalTextInput
                            value={displayName}
                            onChangeText={setDisplayName}
                            placeholder="Enter your display name"
                            style={[styles.input, errors.displayName && styles.inputError]}
                        />
                        {errors.displayName && (
                            <GlobalText style={styles.errorText}>{errors.displayName}</GlobalText>
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <GlobalText style={styles.label}>Username</GlobalText>
                        <GlobalTextInput
                            value={username}
                            onChangeText={setUsername}
                            placeholder="Enter your username"
                            style={[styles.input, errors.username && styles.inputError]}
                        />
                        {errors.username && (
                            <GlobalText style={styles.errorText}>{errors.username}</GlobalText>
                        )}
                    </View>
                </View>

                {/* Next Button */}
                <View style={styles.buttonContainer}>
                    <AnimatedButton
                        backgroundColor={AppColors.primary}
                        borderRadius={12}
                        height={56}
                        width={CARD_WIDTH}
                        onPress={handleNext}
                    >
                        <GlobalText variant="bold" style={styles.buttonText}>
                            Continue
                        </GlobalText>
                    </AnimatedButton>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppColors.navbar,
    },
    scrollContainer: {
        flexGrow: 1,
        alignItems: 'center',
        paddingVertical: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 28,
        color: AppColors.textPrimary,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: AppColors.textSecondary,
        textAlign: 'center',
    },
    formCard: {
        backgroundColor: AppColors.cardBackground,
        borderRadius: 16,
        padding: 24,
        borderWidth: 2,
        borderColor: AppColors.borderColor,
        marginBottom: 40,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        color: AppColors.textPrimary,
        marginBottom: 8,
        fontWeight: '600',
    },
    input: {
        backgroundColor: AppColors.navbar,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: AppColors.textPrimary,
        borderWidth: 2,
        borderColor: AppColors.borderColor,
    },
    inputError: {
        borderColor: AppColors.red,
    },
    errorText: {
        color: AppColors.red,
        fontSize: 14,
        marginTop: 4,
    },
    buttonContainer: {
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
    },
}); 