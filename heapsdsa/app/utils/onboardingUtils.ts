// Simple onboarding utilities without AsyncStorage dependency
// You can install @react-native-async-storage/async-storage later if needed

export const onboardingUtils = {
    async markOnboardingCompleted(userId: string): Promise<void> {
        try {
            // For now, we'll rely on Firebase to track onboarding status
            // This can be enhanced with AsyncStorage later
            console.log('Onboarding marked as completed for user:', userId);
        } catch (error) {
            console.error('Error marking onboarding as completed:', error);
        }
    },

    async isOnboardingCompleted(userId: string): Promise<boolean> {
        try {
            // For now, we'll rely on Firebase to track onboarding status
            // This can be enhanced with AsyncStorage later
            return false; // Default to false, let Firebase handle the real check
        } catch (error) {
            console.error('Error checking onboarding status:', error);
            return false;
        }
    },

    async clearOnboardingStatus(userId: string): Promise<void> {
        try {
            console.log('Onboarding status cleared for user:', userId);
        } catch (error) {
            console.error('Error clearing onboarding status:', error);
        }
    },
}; 