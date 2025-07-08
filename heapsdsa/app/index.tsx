import { AppColors } from '@/constants/AppColors'
import { Link, router } from 'expo-router'
import { getAuth, reload } from 'firebase/auth'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, ImageBackground, StyleSheet, TouchableOpacity, View } from 'react-native'
import AnimatedButton from './components/AnimatedButton'
import { GlobalText } from './components/GlobalText'
import { GlobalTextInput } from './components/GlobalTextInput'
import { FadeIn, ZoomIn } from './components/ScreenEntrance'
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
                                        <GlobalText style={styles.terminalTitle}>login.exe</GlobalText>
                                    </View>
                                    <View style={styles.terminalContent}>
                                        <FadeIn duration={200} delay={300}>
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
                                        </FadeIn>
                                    </View>
                                </View>
                            </ZoomIn>
                        </View>
                    </FadeIn>
                </ImageBackground>
            </View>
        )
    }

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
                                    <GlobalText style={styles.terminalTitle}>login.exe</GlobalText>
                                </View>
                                <View style={styles.terminalContent}>
                                    <FadeIn duration={200} delay={300}>
                                        <View style={styles.card}>
                                            <FadeIn duration={200} delay={350}>
                                                <View style={styles.headerSection}>
                                                    <GlobalText style={styles.title}>Welcome Back</GlobalText>
                                                    <GlobalText style={styles.subtitle}>Sign in to continue your DSA journey</GlobalText>
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
                                                            placeholder="Enter your password"
                                                            secureTextEntry
                                                            onChangeText={setPassword}
                                                            style={styles.input}
                                                            placeholderTextColor="#666666"
                                                        />
                                                    </View>
                                                </FadeIn>

                                                {error ? (
                                                    <FadeIn duration={200} delay={500}>
                                                        <View style={styles.errorContainer}>
                                                            <GlobalText style={styles.errorText}>{error}</GlobalText>
                                                        </View>
                                                    </FadeIn>
                                                ) : null}

                                                <FadeIn duration={200} delay={550}>
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
                                                </FadeIn>
                                            </View>

                                            <FadeIn duration={200} delay={600}>
                                                <View style={styles.footerSection}>
                                                    <Link href="/sign-up" asChild>
                                                        <TouchableOpacity style={styles.linkButton}>
                                                            <GlobalText style={styles.linkText}>
                                                                Don't have an account? <GlobalText style={styles.linkTextBold}>Sign up</GlobalText>
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
    )
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
    successContainer: {
        backgroundColor: 'rgba(76, 235, 126, 0.1)',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#4DEB7E',
    },
    successText: {
        color: '#4DEB7E',
        fontSize: 14,
        textAlign: 'center',
    },
    infoContainer: {
        backgroundColor: 'rgba(51, 154, 255, 0.1)',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: AppColors.blue,
    },
    infoText: {
        color: AppColors.blue,
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
    secondaryButton: {
        backgroundColor: AppColors.navbar,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: AppColors.borderColor,
        marginTop: 16,
    },
    secondaryButtonText: {
        color: AppColors.textPrimary,
        fontSize: 16,
        fontWeight: '600',
    },
    contentSection: {
        marginBottom: 24,
    },
}); 