import { AppColors } from '@/constants/AppColors';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth } from '../firebase';

export default function ProfileScreen() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            console.log('Profile: Logging out...');
            await signOut(auth);
            console.log('Profile: Firebase sign out successful');
            // Navigate to the main login page (not tabs)
            router.replace('/');
            console.log('Profile: Navigation to login page triggered');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Profile</Text>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: AppColors.background,
    },
    card: {
        backgroundColor: AppColors.cardBackground,
        padding: 30,
        borderRadius: 12,
        width: '100%',
        maxWidth: 400,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
        color: AppColors.textPrimary,
    },
    logoutButton: {
        backgroundColor: "#ff3b30",
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    logoutText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: '600',
    },
}); 