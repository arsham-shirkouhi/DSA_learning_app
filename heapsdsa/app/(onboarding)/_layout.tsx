import { Stack } from 'expo-router';
import { transitionPresets } from '../config/transitions';
import { OnboardingProvider } from '../context/OnboardingContext';

export default function OnboardingLayout() {
    return (
        <OnboardingProvider>
            <Stack
                screenOptions={{
                    headerShown: false,
                    gestureEnabled: false,
                    ...transitionPresets.onboarding,
                }}
            >
                <Stack.Screen
                    name="profile"
                    options={{
                        ...transitionPresets.parallax,
                    }}
                />
                <Stack.Screen
                    name="frequency"
                    options={{
                        ...transitionPresets.parallax,
                    }}
                />
            </Stack>
        </OnboardingProvider>
    );
} 