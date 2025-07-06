import { AppColors } from '@/constants/AppColors'
import { Link, router } from 'expo-router'
import { getAuth, reload } from 'firebase/auth'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native'
import AnimatedButton from './components/AnimatedButton'
import { GlobalText } from './components/GlobalText'
import { GlobalTextInput } from './components/GlobalTextInput'
import { signInWithEmail } from './utils/auth'

export default function LoginScreen() {
    const [emailAddress, setEmailAddress] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [needsVerification, setNeedsVerification] = useState(false)
    const [verificationSent, setVerificationSent] = useState(false)
    const pollingRef = useRef<number | null>(null)

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
            router.replace('/(tabs)/home')
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

    // Poll for email verification if user needs to verify
    useEffect(() => {
        if (!needsVerification) return
        const auth = getAuth()
        pollingRef.current = setInterval(async () => {
            if (auth.currentUser) {
                await reload(auth.currentUser)
                if (auth.currentUser.emailVerified) {
                    clearInterval(pollingRef.current as number)
                    pollingRef.current = null
                    // Let AuthContext handle navigation
                    window.location.reload()
                }
            }
        }, 3000)
        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current)
            }
        }
    }, [needsVerification])

    if (needsVerification) {
        return (
            <View style={styles.container}>
                <View style={styles.card}>
                    <View style={styles.headerSection}>
                        <GlobalText style={styles.title}>Email Verification Required</GlobalText>
                        <GlobalText style={styles.subtitle}>
                            Please verify your email address to continue
                        </GlobalText>
                    </View>

                    <View style={styles.contentSection}>
                        {verificationSent ? (
                            <View style={styles.successContainer}>
                                <GlobalText style={styles.successText}>
                                    ✓ Verification email sent! Please check your inbox and click the verification link.
                                </GlobalText>
                            </View>
                        ) : (
                            <View style={styles.infoContainer}>
                                <GlobalText style={styles.infoText}>
                                    You need to verify your email before you can sign in. Please check your inbox for the verification email.
                                </GlobalText>
                            </View>
                        )}
                    </View>

                    <TouchableOpacity
                        onPress={() => {
                            setNeedsVerification(false)
                            setVerificationSent(false)
                            setError('')
                        }}
                        style={styles.secondaryButton}
                    >
                        <GlobalText style={styles.secondaryButtonText}>Back to Sign In</GlobalText>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <View style={styles.headerSection}>
                    <GlobalText style={styles.title}>Welcome Back</GlobalText>
                    <GlobalText style={styles.subtitle}>Sign in to continue your DSA journey</GlobalText>
                </View>

                <View style={styles.formSection}>
                    <View style={styles.inputGroup}>
                        <GlobalText style={styles.inputLabel}>Email Address</GlobalText>
                        <GlobalTextInput
                            autoCapitalize="none"
                            value={emailAddress}
                            placeholder="Enter your email"
                            onChangeText={setEmailAddress}
                            style={styles.input}
                            keyboardType="email-address"
                            placeholderTextColor="#666666"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <GlobalText style={styles.inputLabel}>Password</GlobalText>
                        <GlobalTextInput
                            value={password}
                            placeholder="Enter your password"
                            secureTextEntry
                            onChangeText={setPassword}
                            style={styles.input}
                            placeholderTextColor="#666666"
                        />
                    </View>

                    {error ? (
                        <View style={styles.errorContainer}>
                            <GlobalText style={styles.errorText}>{error}</GlobalText>
                        </View>
                    ) : null}

                    <AnimatedButton
                        onPress={loading ? undefined : onSignInPress}
                        backgroundColor={AppColors.buttonPrimary}
                        shadowColor="#1a4a8a"
                        borderRadius={12}
                        paddingVertical={16}
                        style={styles.animatedButton}
                        textStyle={styles.animatedButtonText}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            "Sign In"
                        )}
                    </AnimatedButton>
                </View>

                <View style={styles.footerSection}>
                    <Link href="/sign-up" asChild>
                        <TouchableOpacity style={styles.linkButton}>
                            <GlobalText style={styles.linkText}>
                                Don't have an account? <GlobalText style={styles.linkTextBold}>Sign up</GlobalText>
                            </GlobalText>
                        </TouchableOpacity>
                    </Link>
                </View>
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
        padding: 32,
        borderRadius: 16,
        width: '100%',
        maxWidth: 420,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        borderWidth: 1,
        borderColor: AppColors.borderColor,
    },
    headerSection: {
        marginBottom: 32,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
        color: AppColors.textPrimary,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        color: AppColors.textSecondary,
        lineHeight: 22,
    },
    formSection: {
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: AppColors.textPrimary,
        marginBottom: 8,
    },
    input: {
        width: '100%',
        padding: 16,
        borderWidth: 1.5,
        borderColor: AppColors.borderColor,
        borderRadius: 12,
        fontSize: 16,
        backgroundColor: AppColors.inputBackground,
        color: '#333333',
    },
    errorContainer: {
        backgroundColor: 'rgba(255, 82, 44, 0.1)',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 82, 44, 0.2)',
    },
    errorText: {
        color: AppColors.red,
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 20,
    },
    animatedButton: {
        marginTop: 8,
    },
    animatedButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        width: '100%',
        backgroundColor: 'transparent',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: AppColors.borderColor,
    },
    secondaryButtonText: {
        color: AppColors.textPrimary,
        fontSize: 16,
        fontWeight: '600',
    },
    contentSection: {
        marginBottom: 24,
    },
    successContainer: {
        backgroundColor: 'rgba(52, 199, 89, 0.1)',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(52, 199, 89, 0.2)',
    },
    successText: {
        color: AppColors.success,
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 20,
    },
    infoContainer: {
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0, 122, 255, 0.2)',
    },
    infoText: {
        color: AppColors.info,
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 20,
    },
    footerSection: {
        alignItems: 'center',
    },
    linkButton: {
        paddingVertical: 8,
    },
    linkText: {
        color: AppColors.textPrimary,
        fontSize: 14,
        textAlign: 'center',
    },
    linkTextBold: {
        color: AppColors.link,
        fontWeight: '600',
    },
}) 