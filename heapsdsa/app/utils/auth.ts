import { createUserWithEmailAndPassword, signOut as firebaseSignOut, sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from '../firebase';



export const signUpWithEmail = async (email: string, password: string) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        // Send verification email right after sign up
        if (userCredential.user) {
            await sendEmailVerification(userCredential.user)
            // Do NOT create user doc here. Only after verification.
        }
        return userCredential
    } catch (error: any) {
        console.error('Error signing up with email:', error)
        throw error
    }
}

export const signInWithEmail = async (email: string, password: string) => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password)
        const user = result.user

        if (!user.emailVerified) {
            throw new Error("Email not verified. Please check your inbox.")
        }

        const userRef = doc(db, "users", user.uid)
        const docSnap = await getDoc(userRef)

        if (!docSnap.exists()) {
            await setDoc(userRef, {
                email: user.email,
                username: '',
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
            })
        } else {
            await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true })
        }

        return result
    } catch (error: any) {
        console.error("Error signing in with email:", error)
        throw error
    }
}

export const signOut = async () => {
    try {
        console.log('Auth utils: Starting Firebase sign out...');
        console.log('Auth utils: Current user before sign out:', auth.currentUser?.email);

        if (!auth.currentUser) {
            console.log('Auth utils: No user currently signed in');
            return;
        }

        await firebaseSignOut(auth);
        console.log('Auth utils: Firebase sign out completed successfully');

        // Verify the user is actually signed out
        if (auth.currentUser) {
            console.log('Auth utils: Warning - User still appears to be signed in after sign out');
        } else {
            console.log('Auth utils: User successfully signed out');
        }
    } catch (error: any) {
        console.error('Auth utils: Error signing out:', error);
        throw error;
    }
}

export const sendVerificationEmail = async () => {
    const user = auth.currentUser
    if (user && !user.emailVerified) {
        try {
            await sendEmailVerification(user)
            return true
        } catch (error: any) {
            console.error('Error sending verification email:', error)
            throw error
        }
    }
    return false
}

export const isEmailVerified = () => {
    return auth.currentUser?.emailVerified ?? false
}

export default function AuthUtilsStub() { return null; }
