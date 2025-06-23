import { AppColors } from '@/constants/AppColors';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TopBar() {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top, height: insets.top + 60 }]}>
            <Text style={styles.title}>My Top Bar</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: AppColors.navbar,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: AppColors.borderColor,
    },
    title: {
        color: AppColors.textPrimary,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
