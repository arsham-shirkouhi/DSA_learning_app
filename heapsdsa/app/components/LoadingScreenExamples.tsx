import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { GlobalText } from './GlobalText';
import LoadingScreen from './LoadingScreen';

// Example component showing different ways to use LoadingScreen
export default function LoadingScreenExamples() {
    const [loadingType, setLoadingType] = useState<string | null>(null);

    const simulateLoading = (type: string) => {
        setLoadingType(type);
        setTimeout(() => setLoadingType(null), 3000); // Simulate 3 second loading
    };

    // Show different loading screens based on type
    if (loadingType) {
        const messages = {
            'auth': 'Authenticating...',
            'data': 'Loading data...',
            'save': 'Saving changes...',
            'upload': 'Uploading file...',
            'simple': 'Please wait...'
        };

        return (
            <LoadingScreen
                message={messages[loadingType as keyof typeof messages] || 'Loading...'}
                showTerminal={loadingType !== 'simple'}
            />
        );
    }

    return (
        <View style={styles.container}>
            <GlobalText style={styles.title}>LoadingScreen Examples</GlobalText>

            <TouchableOpacity
                style={styles.button}
                onPress={() => simulateLoading('auth')}
            >
                <GlobalText style={styles.buttonText}>Authentication Loading</GlobalText>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => simulateLoading('data')}
            >
                <GlobalText style={styles.buttonText}>Data Loading</GlobalText>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => simulateLoading('save')}
            >
                <GlobalText style={styles.buttonText}>Saving Loading</GlobalText>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => simulateLoading('upload')}
            >
                <GlobalText style={styles.buttonText}>Upload Loading</GlobalText>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => simulateLoading('simple')}
            >
                <GlobalText style={styles.buttonText}>Simple Loading (No Terminal)</GlobalText>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 10,
        marginVertical: 8,
        width: '100%',
        maxWidth: 300,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
    },
}); 