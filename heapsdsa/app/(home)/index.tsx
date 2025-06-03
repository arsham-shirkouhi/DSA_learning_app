import { Link } from 'expo-router'
import { User, onAuthStateChanged, sendEmailVerification } from 'firebase/auth'
import React, { useEffect, useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { auth } from '../firebase'

export default function Page() {
  const [user, setUser] = useState<User | null>(null)
  const [verificationEmailSent, setVerificationEmailSent] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
    })

    return () => unsubscribe()
  }, [])

  const handleSignOut = async () => {
    try {
      await auth.signOut()
    } catch (err) {
      console.error(err)
    }
  }

  const handleResendVerification = async () => {
    try {
      if (user && !user.emailVerified) {
        await sendEmailVerification(user)
        setVerificationEmailSent(true)
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      {user ? (
        <>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>
            Hello {user.email}
          </Text>
          {!user.emailVerified && (
            <View style={{ marginBottom: 20, alignItems: 'center' }}>
              <Text style={{ color: 'red', marginBottom: 10 }}>
                Your email is not verified
              </Text>
              {verificationEmailSent ? (
                <Text style={{ color: 'green' }}>
                  Verification email sent! Please check your inbox.
                </Text>
              ) : (
                <TouchableOpacity
                  onPress={handleResendVerification}
                  style={{ backgroundColor: '#4CAF50', padding: 10, borderRadius: 5, marginBottom: 10 }}
                >
                  <Text style={{ color: '#fff' }}>Resend Verification Email</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          <TouchableOpacity
            onPress={handleSignOut}
            style={{ backgroundColor: '#000', padding: 10, borderRadius: 5 }}
          >
            <Text style={{ color: '#fff', textAlign: 'center' }}>Sign out</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={{ gap: 10 }}>
          <Link href="/(auth)/sign-in" asChild>
            <Text style={{ color: '#000', textDecorationLine: 'underline', fontSize: 16 }}>
              Sign in
            </Text>
          </Link>
          <Link href="/(auth)/sign-up" asChild>
            <Text style={{ color: '#000', textDecorationLine: 'underline', fontSize: 16 }}>
              Sign up
            </Text>
          </Link>
        </View>
      )}
    </View>
  )
}