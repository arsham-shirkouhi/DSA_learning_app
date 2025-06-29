import { AppColors } from '@/constants/AppColors';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


interface CardItemProps {
    title: string;
    color: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CardItem({ title, color }: CardItemProps) {
    return (
        <View style={styles.card}>
            {/* Left: Image placeholder */}
            <View style={styles.imageContainer}>
                {/* Replace this View with an Image for real content */}
                <View style={styles.imagePlaceholder} />
            </View>
            {/* Right: Content */}
            <View style={styles.content}>
                <View style={styles.headerRow}>
                    <Text style={styles.title}>{'{'}{'}'} {title}</Text>
                    <View style={styles.pointsRow}>
                        <Image
                            source={require('@/assets/icons/points_icon.png')}
                            style={styles.pointsIcon}
                        />
                        <Text style={styles.pointsText}>+5k</Text>
                    </View>
                </View>
                <View style={styles.progressRow}>
                    <View style={styles.progressInfoCol}>
                        <Text style={styles.progressText}>2/15 <Text style={styles.progressTextBold}>Modules</Text></Text>
                        <View style={styles.progressBarBackground}>
                            <View style={styles.progressBarFill} />
                        </View>
                    </View>
                    <View style={styles.buttonsRow}>
                        <TouchableOpacity style={styles.iconButton}>
                            <Image source={require('@/assets/icons/info_icon.png')} style={styles.icon} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.arrowButton}>
                            <Image source={require('@/assets/icons/arrow_icon.png')} style={styles.arrowIcon} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        width: '95%',
        maxWidth: 450,
        alignSelf: 'center',
        backgroundColor: AppColors.cardBackground,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#232A36',
        padding: '3%',
        marginVertical: 12,
        marginHorizontal: 'auto',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
    },
    imageContainer: {
        width: '32%',
        aspectRatio: 1,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: 'transparent',
        marginRight: '4%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#D9D9D9',
        borderRadius: 12,
    },
    content: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        color: AppColors.textPrimary,
        fontSize: SCREEN_WIDTH * 0.045,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    pointsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pointsIcon: {
        width: SCREEN_WIDTH * 0.055,
        height: SCREEN_WIDTH * 0.055,
        marginRight: 2,
        tintColor: '#339AFF',
    },
    pointsText: {
        color: '#339AFF',
        fontWeight: 'bold',
        fontSize: SCREEN_WIDTH * 0.045,
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    progressInfoCol: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    progressText: {
        color: '#4DEB7E',
        fontSize: SCREEN_WIDTH * 0.045,
        fontFamily: 'monospace',
        fontWeight: 'bold',
        marginRight: 0,
        marginBottom: 4,
    },
    progressTextBold: {
        fontWeight: 'bold',
        fontSize: SCREEN_WIDTH * 0.025,
    },
    progressBarBackground: {
        width: '100%',
        height: SCREEN_WIDTH * 0.045,
        backgroundColor: '#232A36',
        borderRadius: 4,
        overflow: 'hidden',
        minWidth: 40,
        maxWidth: 120,
    },
    progressBarFill: {
        height: '100%',
        width: '18%', // 2/15 = 13%, but a bit more for visibility
        backgroundColor: '#4DEB7E',
        borderRadius: 4,
    },
    buttonsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
    },
    iconButton: {
        width: SCREEN_WIDTH * 0.10,
        height: SCREEN_WIDTH * 0.10,
        borderRadius: 8,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#232A36',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    icon: {
        width: SCREEN_WIDTH * 0.06,
        height: SCREEN_WIDTH * 0.06,
        tintColor: '#00AFFF',
    },
    arrowButton: {
        width: SCREEN_WIDTH * 0.13,
        height: SCREEN_WIDTH * 0.10,
        borderRadius: 10,
        backgroundColor: '#1EA7FF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#1EA7FF',
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    arrowIcon: {
        width: SCREEN_WIDTH * 0.07,
        height: SCREEN_WIDTH * 0.07,
        tintColor: '#fff',
    },
});
