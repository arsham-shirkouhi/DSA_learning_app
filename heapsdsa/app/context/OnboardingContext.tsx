import { useRouter } from 'expo-router';
import React from 'react';
import { userService } from '../utils/userService';
import { useAuth } from './AuthContext';

interface OnboardingData {
    displayName: string;
    username: string;
    practiceFrequency: number; // times per week
    isCompleted: boolean;
}

interface OnboardingContextData {
    onboardingData: OnboardingData;
    updateOnboardingData: (data: Partial<OnboardingData>) => void;
    completeOnboarding: () => void;
    isOnboarding: boolean;
}

const OnboardingContext = React.createContext<OnboardingContextData | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
    const [onboardingData, setOnboardingData] = React.useState<OnboardingData>({
        displayName: '',
        username: '',
        practiceFrequency: 3,
        isCompleted: false,
    });
    const [isOnboarding, setIsOnboarding] = React.useState(false);
    const router = useRouter();
    const { user } = useAuth();

    const updateOnboardingData = (data: Partial<OnboardingData>) => {
        setOnboardingData(prev => ({ ...prev, ...data }));
    };

    const completeOnboarding = async () => {
        try {
            if (!user) {
                throw new Error('No user found');
            }

            // Save onboarding data to Firebase only
            await userService.saveOnboardingData(user, {
                displayName: onboardingData.displayName,
                username: onboardingData.username,
                practiceFrequency: onboardingData.practiceFrequency,
            });

            // Mark onboarding as completed in state
            setOnboardingData(prev => ({ ...prev, isCompleted: true }));
            setIsOnboarding(false);

            // Navigate to main app
            router.replace('/(tabs)/home');
        } catch (error) {
            console.error('Error completing onboarding:', error);
        }
    };

    const startOnboarding = () => {
        setIsOnboarding(true);
        router.replace('/(onboarding)/profile');
    };

    return (
        <OnboardingContext.Provider value={{
            onboardingData,
            updateOnboardingData,
            completeOnboarding,
            isOnboarding,
        }}>
            {children}
        </OnboardingContext.Provider>
    );
}

export function useOnboarding() {
    const context = React.useContext(OnboardingContext);
    if (context === undefined) {
        throw new Error('useOnboarding must be used within an OnboardingProvider');
    }
    return context;
} 