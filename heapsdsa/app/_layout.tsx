import * as Font from 'expo-font';
import { Stack } from 'expo-router';
import React, { ReactNode, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

/**
 * Font loading component that shows a loading state while fonts are being loaded
 */
function FontLoader({ children }: { children: ReactNode }) {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'JetBrainsMono': require('../assets/fonts/JetBrainsMono-Regular.ttf'),
          'JetBrainsMono-Bold': require('../assets/fonts/JetBrainsMono-Bold.ttf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts:', error);
        setFontsLoaded(true); // Continue without custom fonts if loading fails
      }
    }

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <Text style={{ color: '#fff', fontFamily: 'System' }}>Loading...</Text>
      </View>
    );
  }

  return <>{children}</>;
}

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
        // User is signed in, show the main app or onboarding
        <>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(onboarding)" />
        </>
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
    <FontLoader>
      <ThemeProvider>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </ThemeProvider>
    </FontLoader>
  )
}

export function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}