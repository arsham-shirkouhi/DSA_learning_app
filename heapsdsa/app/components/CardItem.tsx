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
        <View style={[styles.card, { backgroundColor: AppColors.cardBackground, borderColor: '#232A36' }]}>
            {/* {/* Top image placeholder */}
            <View style={styles.imageContainer}>
                <Image
                    source={require('@/assets/images/topics/topic_banners/test_topic_image.png')}
                    style={styles.image}
                    resizeMode="cover"
                />
            </View>
            <View style={styles.content}>
                <View style={styles.headerRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image
                            source={require('@/assets/images/topics/topic_icons/arrays_icon.png')}
                            style={{ width: 24, height: 24, marginRight: 4 }}
                        />
                        <Text style={styles.title}>{title}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image
                            source={require('@/assets/icons/points_icon.png')}
                            style={{ width: 24, height: 24, marginRight: 2 }}
                        />
                        <Text style={styles.points}>+5k</Text>
                    </View>
                </View>
                <View style={styles.moduleBox}>
                    <View style={styles.moduleRow}>
                        <Text>
                            <Text style={styles.moduleTitlePrimary}>Module 1 - </Text>
                            <Text style={styles.moduleTitleSecondary}>Traversal</Text>
                        </Text>
                        {/* <Text style={styles.moduleSubtitle}></Text> */}

                        <Image
                            source={require('@/assets/icons/check_icon.png')}
                            style={{
                                width: 24,
                                height: 24,
                                tintColor: AppColors.successColor,
                                marginLeft: 8,
                            }}
                        />
                    </View>
                    {/* <Text style={styles.expand}>Expand</Text> */}
                </View>
                <View style={styles.progressHeaderRow}>
                    <View style={styles.progressInfoCol}>
                        <Text style={styles.progressText}>
                            2/15 <Text style={{ fontWeight: 'bold' }}>Modules</Text>
                        </Text>
                        <View style={styles.progressBarBackground}>
                            <View style={[styles.progressBarFill, { width: '13%' }]} />
                        </View>
                    </View>
                    <View style={styles.progressButtonsRow}>
                        <TouchableOpacity style={styles.iconButton}>
                            <Image source={require('@/assets/icons/info_icon.png')} style={styles.icon} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.iconButton, styles.blueButton]}>
                            <Image source={require('@/assets/icons/arrow_icon.png')} style={styles.primaryIcon} />
                        </TouchableOpacity>
                    </View>

                </View>

            </View>
        </View>
    );
}

const CARD_WIDTH = SCREEN_WIDTH - 40;

const styles = StyleSheet.create({
    card: {
        height: 380,
        width: SCREEN_WIDTH - 40,
        marginHorizontal: 20,
        borderRadius: 20,

        marginTop: 400,
        marginBottom: 50,
        borderWidth: 2,
        borderColor: AppColors.borderColor,
    },
    text: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
    },
    imageContainer: {
        width: 400,
        height: 180,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: AppColors.borderColor,
        backgroundColor: '#232A36',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    content: {
        padding: 16,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    title: {
        color: AppColors.textPrimary,
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    points: {
        color: AppColors.textPrimary,
        fontWeight: 'bold',
        fontSize: 18,
    },
    moduleBox: {
        backgroundColor: AppColors.background,
        borderWidth: 2,
        borderColor: AppColors.borderColor,
        borderRadius: 10,
        padding: 10,
        marginBottom: 8,
    },
    moduleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 35,
    },
    moduleTitlePrimary: {
        color: AppColors.textPrimary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    moduleTitleSecondary: {
        color: AppColors.textSecondary,
        fontWeight: 'normal',
        fontSize: 16,
    },
    checkCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#4DEB7E',
        alignItems: 'center',
        justifyContent: 'center',
    },
    moduleSubtitle: {
        color: AppColors.textSecondary,
        fontSize: 14,
        marginTop: 2,
    },
    expand: {
        color: AppColors.textTri,
        fontSize: 13,
        marginTop: 4,
    },
    progressHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 2,
        marginLeft: 5
    },
    progressButtonsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        width: 45,
        height: 45,
        borderRadius: 8,
        backgroundColor: AppColors.buttonSecondary,
        borderWidth: 2,
        borderColor: AppColors.borderColor,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 0,
    },
    blueButton: {
        borderWidth: 0,
        marginLeft: 10,

        backgroundColor: AppColors.buttonPrimary,
    },
    icon: {
        width: 24,
        height: 24,
        tintColor: '#00AFFF',
    },

    primaryIcon: {
        width: 24,
        height: 24,
        tintColor: '#fff',
    },
    progressText: {
        color: '#4DEB7E',
        fontSize: 16,
        fontFamily: 'monospace',
        fontWeight: 'bold',
        marginBottom: 5,
    },
    progressBarBackground: {
        width: '100%',
        height: 15,
        backgroundColor: '#232A36',
        borderRadius: 4,
        overflow: 'hidden',
        marginTop: 3,
    },
    progressBarFill: {
        height: 15,
        backgroundColor: '#4DEB7E',
        borderRadius: 4,
    },
    progressInfoCol: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        width: 280,
        marginTop: 5,
    },
});
