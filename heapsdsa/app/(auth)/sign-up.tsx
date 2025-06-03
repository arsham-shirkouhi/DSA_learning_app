import { Link, useRouter } from 'expo-router'
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth'
import React, { useCallback, useMemo, useState } from 'react'
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { auth } from '../firebase'

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

  // Handle the submission of the sign-up form
  const onSignUpPress = useCallback(async () => {
    if (loading) return

    setError('') // Clear any previous errors

    if (!isEmailValid) {
      setError('Please enter a valid email address')
      return
    }

    if (!password) {
      setError('Please enter a password')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, emailAddress, password)
      // Send verification email
      await sendEmailVerification(userCredential.user)
      setVerificationSent(true)
      setError('')
    } catch (err: any) {
      console.error(err)
      if (err.code === 'auth/email-already-in-use') {
        // Try to sign in to check if account is unverified
        try {
          const userCredential = await signInWithEmailAndPassword(auth, emailAddress, password)
          if (!userCredential.user.emailVerified) {
            // Account exists but is unverified
            await sendEmailVerification(userCredential.user)
            setVerificationSent(true)
            setError('This account exists but needs verification. We\'ve sent another verification email.')
          } else {
            setError('An account with this email already exists and is verified. Please sign in.')
          }
          await auth.signOut() // Sign out to maintain clean state
        } catch (signInErr: any) {
          setError('An account with this email exists. Please sign in or reset your password if forgotten.')
        }
      } else {
        switch (err.code) {
          case 'auth/invalid-email':
            setError('Invalid email address')
            break
          case 'auth/operation-not-allowed':
            setError('Email/password accounts are not enabled')
            break
          case 'auth/weak-password':
            setError('Password is too weak')
            break
          default:
            setError('An error occurred during sign up')
        }
      }
    } finally {
      setLoading(false)
    }
  }, [loading, isEmailValid, password, confirmPassword, emailAddress])

  if (verificationSent) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, marginBottom: 20, textAlign: 'center' }}>
          Please check your email to verify your account.
        </Text>
        <Text style={{ textAlign: 'center', marginBottom: 20 }}>
          Once verified, you can proceed to login.
        </Text>
        <Link href="/(auth)/sign-in" asChild>
          <Text style={{ color: '#000', textDecorationLine: 'underline', marginTop: 10 }}>
            Go to Login
          </Text>
        </Link>
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
      <TextInput
        value={confirmPassword}
        placeholder="Confirm Password..."
        secureTextEntry
        onChangeText={setConfirmPassword}
        style={{ width: '100%', padding: 8, marginVertical: 10, borderWidth: 1, borderRadius: 4 }}
      />
      <TouchableOpacity
        onPress={onSignUpPress}
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
          <Text style={{ color: '#fff', textAlign: 'center' }}>Sign up</Text>
        )}
      </TouchableOpacity>
      {error ? (
        <Text style={{ color: 'red', marginVertical: 10 }}>{error}</Text>
      ) : null}
      <Link href="/(auth)/sign-in" asChild>
        <Text style={{ color: '#000', textDecorationLine: 'underline', marginTop: 10 }}>
          Already have an account? Sign in
        </Text>
      </Link>
    </View>
  )
}