import { UserCredential } from 'firebase/auth';

export function signUpWithEmail(email: string, password: string): Promise<UserCredential>
export function signInWithEmail(email: string, password: string): Promise<UserCredential>
export function signOut(): Promise<void>
export function sendVerificationEmail(): Promise<boolean>
export function isEmailVerified(): boolean 