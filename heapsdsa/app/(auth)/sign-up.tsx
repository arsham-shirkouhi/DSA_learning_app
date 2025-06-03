import { useSignUp } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import * as React from 'react'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [pendingVerification, setPendingVerification] = React.useState(false)
  const [code, setCode] = React.useState('')
  const [error, setError] = React.useState('')
  const [verificationAttempted, setVerificationAttempted] = React.useState(false)

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return

    setError('') // Clear any previous errors

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailAddress)) {
      setError('Please enter a valid email address')
      return
    }

    // Username validation
    if (!username || username.length < 3) {
      setError('Username must be at least 3 characters long')
      return
    }

    // Password validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        username,
        password,
      })

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true)
      setVerificationAttempted(false)
    } catch (err: any) {
      // Handle Clerk errors
      if (err.errors && err.errors.length > 0) {
        const clerkError = err.errors[0]
        if (clerkError.code === 'form_password_pwned') {
          setError('This password has been compromised. Please choose a stronger password.')
        } else if (clerkError.code === 'form_param_format_invalid') {
          setError('Please check your email format')
        } else if (clerkError.code === 'form_identifier_exists') {
          setError('An account with this email or username already exists')
        } else {
          setError(clerkError.message || 'An error occurred during sign up')
        }
      } else {
        setError('An unexpected error occurred')
      }
      console.error(JSON.stringify(err, null, 2))
    }
  }

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded || verificationAttempted) return

    setError('') // Clear any previous errors
    setVerificationAttempted(true)

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      })

      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId })
        router.replace('/')
      } else if (signUpAttempt.status === 'missing_requirements') {
        setError('Additional information is required. Please try signing up again.')
        setPendingVerification(false)
      } else {
        setError('Verification failed. Please try again.')
        setVerificationAttempted(false)
        console.error(JSON.stringify(signUpAttempt, null, 2))
      }
    } catch (err: any) {
      setVerificationAttempted(false)
      if (err.errors && err.errors.length > 0) {
        const clerkError = err.errors[0]
        if (clerkError.code === 'verification_already_verified') {
          // If already verified, try to complete the sign up
          try {
            const completeSignUp = await signUp.create({
              emailAddress,
              username,
              password,
            })
            if (completeSignUp.status === 'complete') {
              await setActive({ session: completeSignUp.createdSessionId })
              router.replace('/')
            } else {
              setError('Unable to complete sign up. Please try again.')
            }
          } catch (completeErr) {
            setError('Unable to complete sign up. Please try again.')
            console.error(JSON.stringify(completeErr, null, 2))
          }
        } else {
          setError(clerkError.message || 'Verification failed')
        }
      } else {
        setError('An error occurred during verification')
      }
      console.error(JSON.stringify(err, null, 2))
    }
  }

  if (pendingVerification) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
        <Text style={{ fontSize: 20, marginBottom: 20 }}>Verify your email</Text>
        {error ? (
          <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>
        ) : null}
        <TextInput
          value={code}
          placeholder="Enter your verification code"
          onChangeText={(code) => setCode(code)}
          style={{ borderWidth: 1, padding: 10, marginBottom: 20, borderRadius: 5 }}
        />
        <TouchableOpacity
          onPress={onVerifyPress}
          disabled={verificationAttempted}
          style={{
            backgroundColor: verificationAttempted ? '#666' : '#000',
            padding: 15,
            borderRadius: 5
          }}
        >
          <Text style={{ color: '#fff', textAlign: 'center' }}>
            {verificationAttempted ? 'Verifying...' : 'Verify'}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Sign up</Text>
      {error ? (
        <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>
      ) : null}
      <TextInput
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Enter email"
        onChangeText={(email) => setEmailAddress(email)}
        style={{
          borderWidth: 1,
          padding: 10,
          marginBottom: 15,
          borderRadius: 5,
          borderColor: error && error.includes('email') ? 'red' : '#000'
        }}
      />
      <TextInput
        autoCapitalize="none"
        value={username}
        placeholder="Choose a username"
        onChangeText={(username) => setUsername(username)}
        style={{
          borderWidth: 1,
          padding: 10,
          marginBottom: 15,
          borderRadius: 5,
          borderColor: error && error.includes('username') ? 'red' : '#000'
        }}
      />
      <TextInput
        value={password}
        placeholder="Enter password (min. 8 characters)"
        secureTextEntry={true}
        onChangeText={(password) => setPassword(password)}
        style={{
          borderWidth: 1,
          padding: 10,
          marginBottom: 20,
          borderRadius: 5,
          borderColor: error && error.includes('password') ? 'red' : '#000'
        }}
      />
      <TouchableOpacity
        onPress={onSignUpPress}
        style={{ backgroundColor: '#000', padding: 15, marginBottom: 15, borderRadius: 5 }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>Continue</Text>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 5 }}>
        <Text>Already have an account?</Text>
        <Link href="/sign-in">
          <Text style={{ color: '#000', textDecorationLine: 'underline' }}>Sign in</Text>
        </Link>
      </View>
    </View>
  )
}