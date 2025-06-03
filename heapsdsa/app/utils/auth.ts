import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'

export const signUpWithEmail = async (email: string, password: string) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        // Send verification email right after sign up
        if (userCredential.user) {
            await sendEmailVerification(userCredential.user)
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
        return result
    } catch (error: any) {
        console.error('Error signing in with email:', error)
        throw error
    }
}

export const signOut = async () => {
    try {
        await auth.signOut()
    } catch (error: any) {
        console.error('Error signing out:', error)
        throw error
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