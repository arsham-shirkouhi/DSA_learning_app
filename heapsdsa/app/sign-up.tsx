import { AppColors } from '@/constants/AppColors'
import { Link, useRouter } from 'expo-router'
import { getAuth, reload } from 'firebase/auth'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, ImageBackground, StyleSheet, TouchableOpacity, View } from 'react-native'
import AnimatedButton from './components/AnimatedButton'
import { GlobalText } from './components/GlobalText'
import { GlobalTextInput } from './components/GlobalTextInput'
import { FadeIn, ZoomIn } from './components/ScreenEntrance'
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
                style={styles.backgroundImage}
                resizeMode="cover"
            >
                <FadeIn duration={300} delay={0}>
                    <View style={styles.glowLayer1} />
                </FadeIn>
                <FadeIn duration={300} delay={50}>
                    <View style={styles.glowLayer2} />
                </FadeIn>
                <FadeIn duration={300} delay={100}>
                    <View style={styles.contentContainer}>
                        <ZoomIn duration={300} delay={200}>
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
                                    <FadeIn duration={200} delay={300}>
                                        <View style={styles.card}>
                                            <FadeIn duration={200} delay={350}>
                                                <View style={styles.headerSection}>
                                                    <GlobalText style={styles.title}>Create Account</GlobalText>
                                                    <GlobalText style={styles.subtitle}>Join us to start your DSA learning journey</GlobalText>
                                                </View>
                                            </FadeIn>

                                            <View style={styles.formSection}>
                                                <FadeIn duration={200} delay={400}>
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
                                                </FadeIn>

                                                <FadeIn duration={200} delay={450}>
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
                                                </FadeIn>

                                                <FadeIn duration={200} delay={500}>
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
                                                </FadeIn>

                                                {error ? (
                                                    <FadeIn duration={200} delay={550}>
                                                        <View style={styles.errorContainer}>
                                                            <GlobalText style={styles.errorText}>{error}</GlobalText>
                                                        </View>
                                                    </FadeIn>
                                                ) : null}

                                                <FadeIn duration={200} delay={600}>
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
                                                </FadeIn>
                                            </View>

                                            <FadeIn duration={200} delay={650}>
                                                <View style={styles.footerSection}>
                                                    <Link href="/" asChild>
                                                        <TouchableOpacity style={styles.linkButton}>
                                                            <GlobalText style={styles.linkText}>
                                                                Already have an account? <GlobalText style={styles.linkTextBold}>Sign in</GlobalText>
                                                            </GlobalText>
                                                        </TouchableOpacity>
                                                    </Link>
                                                </View>
                                            </FadeIn>
                                        </View>
                                    </FadeIn>
                                </View>
                            </View>
                        </ZoomIn>
                    </View>
                </FadeIn>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppColors.navbar,
    },
    backgroundImage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    glowLayer1: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    glowLayer2: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    terminalWindow: {
        backgroundColor: AppColors.cardBackground,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: AppColors.borderColor,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
    },
    terminalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: AppColors.borderColor,
        backgroundColor: AppColors.navbar,
        borderTopLeftRadius: 14,
        borderTopRightRadius: 14,
    },
    terminalButtons: {
        flexDirection: 'row',
        marginRight: 12,
    },
    closeButton: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#FF5F56',
        marginRight: 8,
    },
    minimizeButton: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#FFBD2E',
        marginRight: 8,
    },
    fullscreenButton: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#27C93F',
    },
    terminalTitle: {
        color: AppColors.textSecondary,
        fontSize: 14,
        fontFamily: 'JetBrainsMono',
    },
    terminalContent: {
        padding: 24,
    },
    card: {
        backgroundColor: 'transparent',
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: AppColors.textPrimary,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: AppColors.textSecondary,
        textAlign: 'center',
    },
    formSection: {
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        color: AppColors.textPrimary,
        marginBottom: 8,
        fontWeight: '600',
    },
    input: {
        backgroundColor: AppColors.navbar,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: AppColors.textPrimary,
        borderWidth: 2,
        borderColor: AppColors.borderColor,
    },
    errorContainer: {
        backgroundColor: 'rgba(255, 82, 44, 0.1)',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: AppColors.red,
    },
    errorText: {
        color: AppColors.red,
        fontSize: 14,
        textAlign: 'center',
    },
    animatedButton: {
        marginTop: 8,
    },
    animatedButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footerSection: {
        alignItems: 'center',
    },
    linkButton: {
        paddingVertical: 8,
    },
    linkText: {
        color: AppColors.textSecondary,
        fontSize: 16,
        textAlign: 'center',
    },
    linkTextBold: {
        color: AppColors.blue,
        fontWeight: 'bold',
    },
}); 