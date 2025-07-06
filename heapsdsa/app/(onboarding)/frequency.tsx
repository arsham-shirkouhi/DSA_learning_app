import { AppColors } from '@/constants/AppColors';
import React, { useState } from 'react';
import { Dimensions, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import AnimatedButton from '../components/AnimatedButton';
import { GlobalText } from '../components/GlobalText';
import { useOnboarding } from '../context/OnboardingContext';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.92, 440);

const frequencyOptions = [
    { value: 1, label: '1 time', description: 'Once a week' },
    { value: 2, label: '2 times', description: 'Twice a week' },
    { value: 3, label: '3 times', description: 'Three times a week' },
    { value: 5, label: '5 times', description: 'Five times a week' },
    { value: 7, label: '7 times', description: 'Every day' },
];

export default function FrequencyOnboardingScreen() {
    const [selectedFrequency, setSelectedFrequency] = useState(3);
    const { updateOnboardingData, completeOnboarding } = useOnboarding();

    const handleFrequencySelect = (frequency: number) => {
        setSelectedFrequency(frequency);
    };

    const handleComplete = () => {
        updateOnboardingData({ practiceFrequency: selectedFrequency });
        completeOnboarding();
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Header */}
                <View style={styles.header}>
                    <GlobalText variant="bold" style={styles.title}>
                        How often do you want to practice?
                    </GlobalText>
                    <GlobalText style={styles.subtitle}>
                        Choose your practice frequency to set up your learning schedule
                    </GlobalText>
                </View>

                {/* Frequency Options */}
                <View style={[styles.optionsCard, { width: CARD_WIDTH }]}>
                    {frequencyOptions.map((option) => (
                        <TouchableOpacity
                            key={option.value}
                            style={[
                                styles.optionItem,
                                selectedFrequency === option.value && styles.selectedOption,
                            ]}
                            onPress={() => handleFrequencySelect(option.value)}
                        >
                            <View style={styles.optionContent}>
                                <GlobalText
                                    variant="bold"
                                    style={[
                                        styles.optionLabel,
                                        selectedFrequency === option.value && styles.selectedOptionText,
                                    ]}
                                >
                                    {option.label}
                                </GlobalText>
                                <GlobalText
                                    style={[
                                        styles.optionDescription,
                                        selectedFrequency === option.value && styles.selectedOptionDescription,
                                    ]}
                                >
                                    {option.description}
                                </GlobalText>
                            </View>
                            {selectedFrequency === option.value && (
                                <View style={styles.checkmark}>
                                    <GlobalText style={styles.checkmarkText}>✓</GlobalText>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Complete Button */}
                <View style={styles.buttonContainer}>
                    <AnimatedButton
                        backgroundColor={AppColors.primary}
                        borderRadius={12}
                        height={56}
                        width={CARD_WIDTH}
                        onPress={handleComplete}
                    >
                        <GlobalText variant="bold" style={styles.buttonText}>
                            Get Started
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
    optionsCard: {
        backgroundColor: AppColors.cardBackground,
        borderRadius: 16,
        padding: 16,
        borderWidth: 2,
        borderColor: AppColors.borderColor,
        marginBottom: 40,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: AppColors.navbar,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedOption: {
        backgroundColor: 'rgba(30, 167, 255, 0.1)',
        borderColor: AppColors.primary,
    },
    optionContent: {
        flex: 1,
    },
    optionLabel: {
        fontSize: 18,
        color: AppColors.textPrimary,
        marginBottom: 4,
    },
    selectedOptionText: {
        color: AppColors.primary,
    },
    optionDescription: {
        fontSize: 14,
        color: AppColors.textSecondary,
    },
    selectedOptionDescription: {
        color: AppColors.primary,
    },
    checkmark: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: AppColors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkmarkText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    buttonContainer: {
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
    },
}); 