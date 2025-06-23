import { useRouter } from 'expo-router';
import { onAuthStateChanged, User } from 'firebase/auth';
import React from 'react';
import { auth } from '../firebase';

// Define the shape of the context data
interface AuthContextData {
    user: User | null;
    isAuthenticated: boolean;
    signOut: () => void;
}

// Create the context with a default undefined value
const AuthContext = React.createContext<AuthContextData | undefined>(undefined);

/**
 * A provider component that wraps the app and makes auth state available to any
 * child component that calls `useAuth()`.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = React.useState<User | null>(null);
    const router = useRouter();

    React.useEffect(() => {
        // Listen for changes in authentication state
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log('Auth state changed:', currentUser ? 'User logged in' : 'User logged out');
            setUser(currentUser);

            // Navigate based on authentication state
            if (currentUser && currentUser.emailVerified) {
                // User is authenticated and email is verified, navigate to tabs
                console.log('Navigating to tabs');
                router.replace('/(tabs)/home');
            } else {
                // User is not authenticated or email not verified, navigate to login
                console.log('Navigating to login');
                router.replace('/');
            }
        });
        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [router]);

    const signOut = async () => {
        try {
            console.log('AuthContext: Signing out...');
            // Force immediate state change
            setUser(null);
            // Force navigation to login
            router.replace('/');
        } catch (e) {
            console.error("Sign out error", e);
            // Force navigation to login if there's an error
            setUser(null);
            router.replace('/');
        }
    };

    // Determine if the user is authenticated, including email verification
    const isAuthenticated = !!user && user.emailVerified;

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * A custom hook to consume the AuthContext.
 * This makes it easy for any component to access auth state and functions.
 */
export function useAuth() {
    const context = React.useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
} 