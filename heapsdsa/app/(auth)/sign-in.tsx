import { Link, useRouter } from 'expo-router'
import { sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth'
import React, { useCallback, useMemo, useState } from 'react'
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { auth } from '../firebase'

// Log Firebase initialization status
console.log('Firebase Auth initialized:', auth ? 'Yes' : 'No')

export default function SignInScreen() {
  const router = useRouter()
  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)

  const resendVerificationEmail = async () => {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser)
        setVerificationSent(true)
        setError('Verification email sent! Please check your inbox.')
      }
    } catch (err) {
      setError('Failed to send verification email. Please try again.')
    }
  }

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
      const userCredential = await signInWithEmailAndPassword(auth, emailAddress, password)

      if (!userCredential.user.emailVerified) {
        setNeedsVerification(true)
        await sendEmailVerification(userCredential.user)
        setVerificationSent(true)
        setError('Please verify your email before signing in. We\'ve sent a new verification email.')
        await auth.signOut() // Sign out unverified users
        return
      }

      router.replace('/')
    } catch (err: any) {
      console.error(err)
      switch (err.code) {
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
    } finally {
      setLoading(false)
    }
  }, [loading, isEmailValid, password, emailAddress, router])

  if (needsVerification) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, marginBottom: 20, textAlign: 'center' }}>
          Please verify your email address
        </Text>
        {verificationSent ? (
          <Text style={{ color: 'green', textAlign: 'center', marginBottom: 20 }}>
            Verification email sent! Please check your inbox.
          </Text>
        ) : (
          <Text style={{ textAlign: 'center', marginBottom: 20 }}>
            You need to verify your email before you can sign in.
          </Text>
        )}
        {!verificationSent && (
          <TouchableOpacity
            onPress={resendVerificationEmail}
            style={{ backgroundColor: '#4CAF50', padding: 10, borderRadius: 5, marginBottom: 20 }}
          >
            <Text style={{ color: '#fff' }}>Resend Verification Email</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => {
          setNeedsVerification(false)
          setVerificationSent(false)
          setError('')
        }}>
          <Text style={{ color: '#000', textDecorationLine: 'underline', marginTop: 10 }}>
            Back to Sign In
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <TextInput
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Email..."
        onChangeText={setEmailAddress}
        style={{ width: '100%', padding: 8, marginVertical: 10, borderWidth: 1, borderRadius: 4 }}
      />
      <TextInput
        value={password}
        placeholder="Password..."
        secureTextEntry
        onChangeText={setPassword}
        style={{ width: '100%', padding: 8, marginVertical: 10, borderWidth: 1, borderRadius: 4 }}
      />
      <TouchableOpacity
        onPress={onSignInPress}
        disabled={loading}
        style={{
          width: '100%',
          backgroundColor: loading ? '#666' : '#000',
          padding: 10,
          borderRadius: 5,
          marginVertical: 10,
        }}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: '#fff', textAlign: 'center' }}>Sign in</Text>
        )}
      </TouchableOpacity>
      {error ? (
        <Text style={{ color: 'red', marginVertical: 10 }}>{error}</Text>
      ) : null}
      <Link href="/(auth)/sign-up" asChild>
        <Text style={{ color: '#000', textDecorationLine: 'underline', marginTop: 10 }}>
          Don't have an account? Sign up
        </Text>
      </Link>
    </View>
  )
}