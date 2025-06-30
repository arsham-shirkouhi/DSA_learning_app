import { AppColors } from '@/constants/AppColors'
import { Link, useRouter } from 'expo-router'
import React, { useCallback, useMemo, useState } from 'react'
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native'
import { GlobalText } from './components/GlobalText'
import { GlobalTextInput } from './components/GlobalTextInput'
import { signUpWithEmail } from './utils/auth'

export default function SignUpScreen() {
    const router = useRouter()
    const [emailAddress, setEmailAddress] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [verificationSent, setVerificationSent] = useState(false)

    // Memoize email validation to prevent re-computation
    const isEmailValid = useMemo(() => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(emailAddress)
    }, [emailAddress])

    // Memoize password validation
    const isPasswordValid = useMemo(() => {
        return password.length >= 6
    }, [password])

    const isConfirmPasswordValid = useMemo(() => {
        return password === confirmPassword && confirmPassword.length > 0
    }, [password, confirmPassword])

    // Handle the submission of the sign-up form
    const onSignUpPress = useCallback(async () => {
        if (loading) return

        setError('')

        if (!isEmailValid) {
            setError('Please enter a valid email address')
            return
        }

        if (!isPasswordValid) {
            setError('Password must be at least 6 characters long')
            return
        }

        if (!isConfirmPasswordValid) {
            setError('Passwords do not match')
            return
        }

        setLoading(true)

        try {
            const userCredential = await signUpWithEmail(emailAddress, password)
            setVerificationSent(true)
            setError('Account created! Please check your email to verify your account before signing in.')
        } catch (err: any) {
            console.error(err)
            switch (err.code) {
                case 'auth/email-already-in-use':
                    setError('An account with this email already exists')
                    break
                case 'auth/invalid-email':
                    setError('Invalid email address')
                    break
                case 'auth/weak-password':
                    setError('Password is too weak. Please choose a stronger password.')
                    break
                default:
                    setError('An error occurred during sign up')
            }
        } finally {
            setLoading(false)
        }
    }, [loading, isEmailValid, isPasswordValid, isConfirmPasswordValid, emailAddress, password])

    if (verificationSent) {
        return (
            <View style={styles.container}>
                <View style={styles.card}>
                    <GlobalText style={styles.title}>Account Created!</GlobalText>
                    <GlobalText style={styles.subtitle}>
                        Please verify your email address
                    </GlobalText>
                    <GlobalText style={styles.successText}>
                        We've sent a verification email to {emailAddress}. Please check your inbox and click the verification link.
                    </GlobalText>
                    <TouchableOpacity
                        onPress={() => {
                            setVerificationSent(false)
                            setError('')
                            router.replace('/')
                        }}
                        style={styles.button}
                    >
                        <GlobalText style={styles.buttonText}>Back to Sign In</GlobalText>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <GlobalText style={styles.title}>Create Account</GlobalText>
                <GlobalText style={styles.subtitle}>Sign up to get started</GlobalText>

                <GlobalTextInput
                    autoCapitalize="none"
                    value={emailAddress}
                    placeholder="Email address"
                    onChangeText={setEmailAddress}
                    style={styles.input}
                    keyboardType="email-address"
                />
                <GlobalTextInput
                    value={password}
                    placeholder="Password (min 6 characters)"
                    secureTextEntry
                    onChangeText={setPassword}
                    style={styles.input}
                />
                <GlobalTextInput
                    value={confirmPassword}
                    placeholder="Confirm password"
                    secureTextEntry
                    onChangeText={setConfirmPassword}
                    style={styles.input}
                />

                <TouchableOpacity
                    onPress={onSignUpPress}
                    disabled={loading}
                    style={[styles.button, loading && styles.buttonDisabled]}
                >
                    {loading ? (
                        <ActivityIndicator color={"#fff"} />
                    ) : (
                        <GlobalText style={styles.buttonText}>Create Account</GlobalText>
                    )}
                </TouchableOpacity>

                {error ? (
                    <GlobalText style={styles.errorText}>{error}</GlobalText>
                ) : null}

                <Link href="/" asChild>
                    <TouchableOpacity style={styles.linkButton}>
                        <GlobalText style={styles.linkText}>
                            Already have an account? Sign in
                        </GlobalText>
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
        backgroundColor: "#fff",
    },
    buttonText: {
        color: "#fff",
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