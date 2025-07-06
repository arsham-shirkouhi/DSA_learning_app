import { Stack } from 'expo-router';
import { OnboardingProvider } from '../context/OnboardingContext';

export default function OnboardingLayout() {
    return (
        <OnboardingProvider>
            <Stack
                screenOptions={{
                    headerShown: false,
                    gestureEnabled: false,
                }}
            >
                <Stack.Screen name="profile" />
                <Stack.Screen name="frequency" />
            </Stack>
        </OnboardingProvider>
    );
} 