import { useSignIn } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import React from 'react'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return

    setError('') // Clear any previous errors

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailAddress)) {
      setError('Please enter a valid email address')
      return
    }

    if (!password) {
      setError('Please enter your password')
      return
    }

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      })

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId })
        router.replace('/')
      } else {
        setError('Sign in failed. Please try again.')
        console.error(JSON.stringify(signInAttempt, null, 2))
      }
    } catch (err: any) {
      if (err.errors && err.errors.length > 0) {
        const clerkError = err.errors[0]
        if (clerkError.code === 'form_identifier_not_found') {
          setError('No account found with this email')
        } else if (clerkError.code === 'form_password_incorrect') {
          setError('Incorrect password')
        } else {
          setError(clerkError.message || 'An error occurred during sign in')
        }
      } else {
        setError('An unexpected error occurred')
      }
      console.error(JSON.stringify(err, null, 2))
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Sign in</Text>
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
        value={password}
        placeholder="Enter password"
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
        onPress={onSignInPress}
        style={{ backgroundColor: '#000', padding: 15, marginBottom: 15, borderRadius: 5 }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>Sign in</Text>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 5 }}>
        <Text>Don't have an account?</Text>
        <Link href="/sign-up">
          <Text style={{ color: '#000', textDecorationLine: 'underline' }}>Sign up</Text>
        </Link>
      </View>
    </View>
  )
}