import { AppColors } from '@/constants/AppColors';
import { Tabs } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

export default function TabLayout() {
  // Unique colors for each tab
  const tabColors = {
    home: AppColors.blue,
    practice: AppColors.green,
    leaderboard: AppColors.purple,
    profile: AppColors.red,
  };

  // Glow style for the active tab
  const getGlowStyle = (color: string): import('react-native').ViewStyle => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 16,
    elevation: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  });

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarActiveTintColor: AppColors.tabActive,
          tabBarInactiveTintColor: AppColors.tabInactive,
          tabBarStyle: {
            backgroundColor: AppColors.navbar,
            borderTopColor: AppColors.borderColor,
            borderTopWidth: 2,
            height: 90,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={focused ? (getGlowStyle(tabColors.home) as import('react-native').ViewStyle) : undefined}>
                <Image
                  source={require('@/assets/icons/home_icon.png')}
                  style={[
                    styles.tabIcon,
                    { tintColor: focused ? tabColors.home : AppColors.tabInactive }
                  ]}
                />
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="practice"
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={focused ? (getGlowStyle(tabColors.practice) as import('react-native').ViewStyle) : undefined}>
                <Image
                  source={require('@/assets/icons/practice_icon.png')}
                  style={[
                    styles.tabIcon,
                    { tintColor: focused ? tabColors.practice : AppColors.tabInactive }
                  ]}
                />
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="leaderboard"
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={focused ? (getGlowStyle(tabColors.leaderboard) as import('react-native').ViewStyle) : undefined}>
                <Image
                  source={require('@/assets/icons/leaderboard_icon.png')}
                  style={[
                    styles.tabIcon,
                    { tintColor: focused ? tabColors.leaderboard : AppColors.tabInactive }
                  ]}
                />
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={focused ? (getGlowStyle(tabColors.profile) as import('react-native').ViewStyle) : undefined}>
                <Image
                  source={require('@/assets/icons/profile_icon.png')}
                  style={[
                    styles.tabIcon,
                    { tintColor: focused ? tabColors.profile : AppColors.tabInactive }
                  ]}
                />
              </View>
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabIcon: {
    marginTop: 30,
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
});
