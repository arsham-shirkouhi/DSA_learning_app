import { AppColors } from '@/constants/AppColors'
import { Link } from 'expo-router'
import React, { useCallback, useMemo, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { signInWithEmail } from './utils/auth'

export default function LoginScreen() {
    const [emailAddress, setEmailAddress] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [needsVerification, setNeedsVerification] = useState(false)
    const [verificationSent, setVerificationSent] = useState(false)

    // Memoize email validation to prevent re-computation
    const isEmailValid = useMemo(() => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(emailAddress)
    }, [emailAddress])

    // Handle the submission of the sign-in form
    const onSignInPress = useCallback(async () => {
        if (loading) return

        setError('') // Clear any previous errors
        setNeedsVerification(false)
        setVerificationSent(false)

        if (!isEmailValid) {
            setError('Please enter a valid email address')
            return
        }

        if (!password) {
            setError('Please enter your password')
            return
        }

        setLoading(true)

        try {
            const userCredential = await signInWithEmail(emailAddress, password)
            // AuthContext will automatically handle navigation to tabs
        } catch (err: any) {
            console.error(err)
            if (err.message && err.message.includes('Email not verified')) {
                setNeedsVerification(true)
                setError('Please verify your email before signing in. We\'ve sent a new verification email.')
                setVerificationSent(true)
            } else {
                switch (err.code) {
                    case 'auth/invalid-credential':
                        setError('Invalid email or password. Please try again.')
                        break;
                    case 'auth/invalid-email':
                        setError('Invalid email address')
                        break
                    case 'auth/user-disabled':
                        setError('This account has been disabled')
                        break
                    case 'auth/user-not-found':
                        setError('No account found with this email')
                        break
                    case 'auth/wrong-password':
                        setError('Incorrect password')
                        break
                    default:
                        setError('An error occurred during sign in')
                }
            }
        } finally {
            setLoading(false)
        }
    }, [loading, isEmailValid, password, emailAddress])

    if (needsVerification) {
        return (
            <View style={styles.container}>
                <View style={styles.card}>
                    <Text style={styles.title}>Email Verification Required</Text>
                    <Text style={styles.subtitle}>
                        Please verify your email address
                    </Text>
                    {verificationSent ? (
                        <Text style={styles.successText}>
                            Verification email sent! Please check your inbox.
                        </Text>
                    ) : (
                        <Text style={styles.text}>
                            You need to verify your email before you can sign in.
                        </Text>
                    )}
                    <TouchableOpacity
                        onPress={() => {
                            setNeedsVerification(false)
                            setVerificationSent(false)
                            setError('')
                        }}
                        style={styles.linkButton}
                    >
                        <Text style={styles.linkText}>Back to Sign In</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to continue</Text>

                <TextInput
                    autoCapitalize="none"
                    value={emailAddress}
                    placeholder="Email address"
                    onChangeText={setEmailAddress}
                    style={styles.input}
                    keyboardType="email-address"
                />
                <TextInput
                    value={password}
                    placeholder="Password"
                    secureTextEntry
                    onChangeText={setPassword}
                    style={styles.input}
                />

                <TouchableOpacity
                    onPress={onSignInPress}
                    disabled={loading}
                    style={[styles.button, loading && styles.buttonDisabled]}
                >
                    {loading ? (
                        <ActivityIndicator color={AppColors.textLight} />
                    ) : (
                        <Text style={styles.buttonText}>Sign In</Text>
                    )}
                </TouchableOpacity>

                {error ? (
                    <Text style={styles.errorText}>{error}</Text>
                ) : null}

                <Link href="/sign-up" asChild>
                    <TouchableOpacity style={styles.linkButton}>
                        <Text style={styles.linkText}>
                            Don't have an account? Sign up
                        </Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </View>
    )
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
        shadowColor: AppColors.cardShadow,
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
        marginBottom: 8,
        color: AppColors.textPrimary,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
        color: AppColors.textSecondary,
    },
    input: {
        width: '100%',
        padding: 15,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: AppColors.inputBorder,
        borderRadius: 8,
        fontSize: 16,
        backgroundColor: AppColors.inputBackground,
    },
    button: {
        width: '100%',
        backgroundColor: AppColors.buttonPrimary,
        padding: 15,
        borderRadius: 8,
        marginVertical: 15,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: AppColors.buttonDisabled,
    },
    buttonText: {
        color: AppColors.textLight,
        fontSize: 16,
        fontWeight: '600',
    },
    errorText: {
        color: AppColors.error,
        textAlign: 'center',
        marginVertical: 10,
        fontSize: 14,
    },
    successText: {
        color: AppColors.success,
        textAlign: 'center',
        marginVertical: 10,
        fontSize: 14,
    },
    text: {
        textAlign: 'center',
        marginVertical: 10,
        fontSize: 14,
        color: AppColors.textSecondary,
    },
    linkButton: {
        marginTop: 15,
        alignItems: 'center',
    },
    linkText: {
        color: AppColors.link,
        fontSize: 14,
        textDecorationLine: 'underline',
    },
}) 