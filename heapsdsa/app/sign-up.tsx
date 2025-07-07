import { AppColors } from '@/constants/AppColors'
import { Link, useRouter } from 'expo-router'
import { getAuth, reload } from 'firebase/auth'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, ImageBackground, StyleSheet, TouchableOpacity, View } from 'react-native'
import AnimatedButton from './components/AnimatedButton'
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
    const pollingRef = useRef<number | null>(null)

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
            router.replace({ pathname: '/(auth)/verify-email', params: { email: emailAddress } })
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
    }, [loading, isEmailValid, isPasswordValid, isConfirmPasswordValid, emailAddress, password, router])

    // Poll for email verification after account creation
    useEffect(() => {
        const auth = getAuth()
        pollingRef.current = setInterval(async () => {
            if (auth.currentUser) {
                await reload(auth.currentUser)
                if (auth.currentUser.emailVerified) {
                    clearInterval(pollingRef.current as number)
                    pollingRef.current = null
                    // Let AuthContext handle navigation
                    router.replace('/')
                }
            }
        }, 3000)
        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current)
            }
        }
    }, [router])

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('../assets/images/pattern_background.png')}
                style={styles.glowLayer1}
                resizeMode="cover"
            />
            <ImageBackground
                source={require('../assets/images/pattern_background.png')}
                style={styles.glowLayer2}
                resizeMode="cover"
            />
            <ImageBackground
                source={require('../assets/images/pattern_background.png')}
                style={styles.backgroundImage}
                resizeMode="cover"
            >
                <View style={styles.terminalWindow}>
                    <View style={styles.terminalHeader}>
                        <View style={styles.terminalButtons}>
                            <View style={styles.closeButton} />
                            <View style={styles.minimizeButton} />
                            <View style={styles.fullscreenButton} />
                        </View>
                        <GlobalText style={styles.terminalTitle}>signup.exe</GlobalText>
                    </View>
                    <View style={styles.terminalContent}>
                        <View style={styles.card}>
                            <View style={styles.headerSection}>
                                <GlobalText style={styles.title}>Create Account</GlobalText>
                                <GlobalText style={styles.subtitle}>Join us to start your DSA learning journey</GlobalText>
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
                                        placeholder="Enter password (min 6 characters)"
                                        secureTextEntry
                                        onChangeText={setPassword}
                                        style={styles.input}
                                        placeholderTextColor="#666666"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <GlobalText style={styles.inputLabel}>Confirm Password</GlobalText>
                                    <GlobalTextInput
                                        value={confirmPassword}
                                        placeholder="Confirm your password"
                                        secureTextEntry
                                        onChangeText={setConfirmPassword}
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
                                    onPress={loading ? undefined : onSignUpPress}
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
                                        "Create Account"
                                    )}
                                </AnimatedButton>
                            </View>

                            <View style={styles.footerSection}>
                                <Link href="/" asChild>
                                    <TouchableOpacity style={styles.linkButton}>
                                        <GlobalText style={styles.linkText}>
                                            Already have an account? <GlobalText style={styles.linkTextBold}>Sign in</GlobalText>
                                        </GlobalText>
                                    </TouchableOpacity>
                                </Link>
                            </View>
                        </View>
                    </View>
                </View>
            </ImageBackground>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    glowLayer1: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.2,
    },
    glowLayer2: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1,
    },
    backgroundImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 1,
    },
    terminalWindow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        padding: 20,
    },
    terminalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    terminalButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    closeButton: {
        width: 20,
        height: 20,
        backgroundColor: 'red',
        borderRadius: 5,
        marginRight: 5,
    },
    minimizeButton: {
        width: 20,
        height: 20,
        backgroundColor: 'yellow',
        borderRadius: 5,
        marginRight: 5,
    },
    fullscreenButton: {
        width: 20,
        height: 20,
        backgroundColor: 'green',
        borderRadius: 5,
    },
    terminalTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    terminalContent: {
        flex: 1,
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