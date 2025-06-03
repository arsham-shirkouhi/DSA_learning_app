import { Link } from 'expo-router'
import { User, onAuthStateChanged } from 'firebase/auth'
import React, { useEffect, useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { auth } from '../firebase'

export default function Page() {
  const [user, setUser] = useState<User | null>(null)

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

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      {user ? (
        <>
          <Text style={{ fontSize: 18, marginBottom: 20 }}>
            Hello {user.email}
          </Text>
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