import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface CardItemProps {
    title: string;
    color: string;
}

export default function CardItem({ title, color }: CardItemProps) {
    return (
        <View style={[styles.card, { backgroundColor: color }]}>
            <Text style={styles.text}>{title}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        height: 380,
        width: innerWidth - 40,
        marginHorizontal: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 400,
        marginBottom: 50,
    },
    text: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
    },
});
