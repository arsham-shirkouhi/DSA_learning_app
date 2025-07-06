import { AppColors } from '@/constants/AppColors';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';

export default function HapticTab(props: BottomTabBarButtonProps) {
  const { children, onPress, accessibilityState } = props;
  const focused = accessibilityState?.selected || false;

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const colorAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    if (focused) {
      // Animate in when focused
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(colorAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      // Animate out when not focused
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.7,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(colorAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [focused, scaleAnim, opacityAnim, colorAnim]);

  const handlePress = (event: any) => {
    // Simple press animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: focused ? 1.1 : 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
    ]).start();

    // Call the original onPress to handle navigation
    if (onPress) {
      onPress(event);
    }
  };

  const glowStyle = focused ? {
    shadowColor: AppColors.tabActive,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 16,
    elevation: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  } : undefined;

  // Smooth color interpolation
  const iconColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [AppColors.tabInactive, AppColors.tabActive],
  });

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <Animated.View
        style={[
          glowStyle,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 0,
    marginTop: 20,
  },
});
