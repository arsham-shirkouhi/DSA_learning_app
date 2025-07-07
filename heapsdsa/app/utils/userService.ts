import { User, getAuth } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface UserProfile {
    displayName?: string;
    username?: string;
    currentGoal?: string;
    isOnboardingCompleted?: boolean;
    email?: string;
    level?: number;
    xp?: number;
    currentStreak?: number;
    longestStreak?: number;
    numberOfBadges?: number;
    lastLogin?: any;
    settings?: any;
    longestCorrectStreak?: number;
    totalQuestionsAnswered?: number;
    weeklyActivity?: any;
    accuracy?: number;
    createdAt?: any;
    updatedAt?: any;
    [key: string]: any;
}

export const userService = {
    // Get the current logged-in user's profile
    async getCurrentUserProfile(): Promise<UserProfile | null> {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return null;
        return await this.getUserProfile(user.uid);
    },

    // Get any user's profile by UID
    async getUserProfile(uid: string): Promise<UserProfile | null> {
        try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                return userDoc.data() as UserProfile;
            }
            return null;
        } catch (error) {
            console.error('Error getting user profile:', error);
            throw error;
        }
    },

    // Create a user profile (used after verification)
    async createUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
        try {
            await setDoc(doc(db, 'users', uid), {
                ...data,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            }, { merge: true });
        } catch (error) {
            console.error('Error creating user profile:', error);
            throw error;
        }
    },

    // Update a user profile (merge fields)
    async updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
        try {
            await setDoc(doc(db, 'users', uid), {
                ...data,
                updatedAt: serverTimestamp(),
            }, { merge: true });
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    },

    // Save onboarding data (for onboarding flow)
    async saveOnboardingData(user: User, onboardingData: {
        displayName: string;
        username: string;
        practiceFrequency: number;
    }): Promise<void> {
        try {
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);
            const currentGoal = `Practice ${onboardingData.practiceFrequency} times a week`;
            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    email: user.email,
                    displayName: onboardingData.displayName,
                    username: onboardingData.username,
                    currentGoal,
                    isOnboardingCompleted: true,
                    level: 1,
                    xp: 0,
                    currentStreak: 0,
                    longestStreak: 0,
                    numberOfBadges: 0,
                    lastLogin: new Date(),
                    settings: {
                        darkMode: false,
                        notifications: true,
                    },
                    longestCorrectStreak: 0,
                    totalQuestionsAnswered: 0,
                    weeklyActivity: {},
                    accuracy: 0,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }, { merge: true });
            } else {
                await setDoc(userRef, {
                    displayName: onboardingData.displayName,
                    username: onboardingData.username,
                    currentGoal,
                    isOnboardingCompleted: true,
                    updatedAt: new Date(),
                }, { merge: true });
            }
            console.log('Onboarding data saved/updated successfully');
        } catch (error) {
            console.error('Error saving onboarding data:', error);
            throw error;
        }
    },

    async checkOnboardingStatus(userId: string): Promise<boolean> {
        try {
            const profile = await this.getUserProfile(userId);
            return profile?.isOnboardingCompleted || false;
        } catch (error) {
            console.error('Error checking onboarding status:', error);
            return false;
        }
    },
};

export default userService; 