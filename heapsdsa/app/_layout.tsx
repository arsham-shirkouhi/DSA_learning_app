import { Stack } from 'expo-router';
import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';

/**
 * This is the main navigation component. It decides which screen to show
 * based on the authentication state provided by the `useAuth` hook.
 */
function RootLayoutNav() {
  const { isAuthenticated, user } = useAuth()

  console.log('RootLayoutNav: isAuthenticated =', isAuthenticated);
  console.log('RootLayoutNav: user =', user?.email);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        // User is signed in, show the main app.
        <Stack.Screen name="(tabs)" />
      ) : (
        // User is not signed in, show the login page as the main entry point
        <>
          <Stack.Screen name="index" />
          <Stack.Screen name="sign-up" />
        </>
      )}
    </Stack>
  )
}

/**
 * This is the root layout component. Its primary job is to wrap the entire
 * app in the `AuthProvider` so that all components can access the auth state.
 */
export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  )
}