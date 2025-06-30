import { AppColors } from '@/constants/AppColors';
import { Link, Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GlobalText } from './components/GlobalText';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <GlobalText style={styles.title}>This screen does not exist.</GlobalText>
        <Link href="/" style={styles.link}>
          <GlobalText style={styles.linkText}>Go to home screen!</GlobalText>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: AppColors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.textPrimary,
    textAlign: 'center',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    color: AppColors.link,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
