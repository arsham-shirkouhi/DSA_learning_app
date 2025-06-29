import { AppColors } from '@/constants/AppColors';
import { Tabs } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

export default function TabLayout() {
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
              <Image
                source={require('@/assets/icons/home_icon.png')}
                style={[
                  styles.tabIcon,
                  { tintColor: focused ? AppColors.tabActive : AppColors.tabInactive }
                ]}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="practice"
          options={{
            tabBarIcon: ({ focused }) => (
              <Image
                source={require('@/assets/icons/practice_icon.png')}
                style={[
                  styles.tabIcon,
                  { tintColor: focused ? AppColors.tabActive : AppColors.tabInactive }
                ]}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="leaderboard"
          options={{
            tabBarIcon: ({ focused }) => (
              <Image
                source={require('@/assets/icons/leaderboard_icon.png')}
                style={[
                  styles.tabIcon,
                  { tintColor: focused ? AppColors.tabActive : AppColors.tabInactive }
                ]}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ focused }) => (
              <Image
                source={require('@/assets/icons/profile_icon.png')}
                style={[
                  styles.tabIcon,
                  { tintColor: focused ? AppColors.tabActive : AppColors.tabInactive }
                ]}
              />
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
