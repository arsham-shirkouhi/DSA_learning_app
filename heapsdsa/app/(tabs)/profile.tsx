import { AppColors } from '@/constants/AppColors';
import React from 'react';
import { Dimensions, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedButton from '../components/AnimatedButton';
import { GlobalText } from '../components/GlobalText';
import GlowingIcon from '../components/GlowingIcon';


const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.92, 440);

export default function ProfileScreen() {
    // Hardcoded values for now
    const user = {
        name: 'Arsham',
        handle: '@gumpointer132',
        joinDate: 'joined april 2020',
        language: 'Java',
        following: 231,
        followers: 262,
        streak: 133,
        xp: 13593,
        league: 'Bronze',
        level: 31,
        accuracy: '84%',
        solved: 1343,
        timeSpent: '213hrs',
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: AppColors.navbar }}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Mascot Banner */}
                <View style={[styles.mascotBanner, { width: CARD_WIDTH }]}>
                    <Image source={require('@/assets/images/testavatar.png')} style={styles.mascotImage} />
                </View>

                {/* Profile Info Card */}
                <View style={[styles.profileInfoCard, { width: CARD_WIDTH, paddingHorizontal: 0 }]}>
                    <View style={styles.profileInfoHeaderRow}>
                        <View style={styles.profileInfoHeaderText}>
                            <GlobalText variant="bold" style={styles.nameInfo}>{user.name}</GlobalText>
                            <GlobalText style={styles.handleInfo}>
                                <Text style={styles.handleInfoText}>{user.handle}</Text>
                                <Text style={styles.joinDateInfo}>• {user.joinDate}</Text>
                            </GlobalText>
                        </View>
                        <AnimatedButton
                            icon={require('@/assets/icons/edit_icon.png')}
                            backgroundColor={AppColors.cardBackground}
                            borderColor={'#232A36'}
                            borderWidth={2}
                            borderRadius={8}
                            height={45}
                            width={45}
                            iconColor="#1EA7FF"
                            style={{ justifyContent: 'center', alignItems: 'center' }}
                            onPress={() => { }}
                        >
                            {null}
                        </AnimatedButton>
                    </View>
                    <View style={[styles.statsRowInfo, { width: '100%' }]}>
                        <View style={[styles.statBoxInfo, { marginLeft: 0 }]}>
                            <GlobalText variant="bold" style={styles.statValueInfo}>{user.language}</GlobalText>
                            <GlobalText style={styles.statLabelInfo}>Languages</GlobalText>
                        </View>
                        <View style={styles.statBoxInfo}>
                            <GlobalText variant="bold" style={styles.statValueInfo}>{user.following}</GlobalText>
                            <GlobalText style={styles.statLabelInfo}>Following</GlobalText>
                        </View>
                        <View style={[styles.statBoxInfo, { marginRight: 0 }]}>
                            <GlobalText variant="bold" style={styles.statValueInfo}>{user.followers}</GlobalText>
                            <GlobalText style={styles.statLabelInfo}>Followers</GlobalText>
                        </View>
                    </View>
                    <View style={styles.addFriendsRowInfo}>
                        <AnimatedButton
                            icon={require('@/assets/icons/addfriend_icon.png')}
                            backgroundColor={AppColors.cardBackground}
                            borderColor={'#232A36'}
                            borderWidth={2}
                            borderRadius={8}
                            height={45}
                            width={CARD_WIDTH / 2 - 6}
                            iconColor="#339AFF"
                            textStyle={{ color: '#9BBCDA', fontWeight: 'bold' }}
                            style={{ marginLeft: 0, marginRight: 5, justifyContent: 'center' }}
                            onPress={() => { }}
                        >
                            Add Friends
                        </AnimatedButton>
                        <AnimatedButton
                            icon={require('@/assets/icons/share_icon.png')}
                            backgroundColor={AppColors.cardBackground}
                            borderColor={'#232A36'}
                            borderWidth={2}
                            borderRadius={8}
                            height={45}
                            width={CARD_WIDTH / 2 - 6}
                            iconColor="#339AFF"
                            textStyle={{ color: '#9BBCDA', fontWeight: 'bold' }}
                            style={{ marginRight: 0, justifyContent: 'center' }}
                            onPress={() => { }}
                        >
                            Share
                        </AnimatedButton>
                    </View>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Overview Section */}
                <GlobalText variant="bold" style={styles.sectionTitle}>Overview</GlobalText>
                <View style={styles.overviewGrid}>
                    <View style={styles.overviewRowCustom}>
                        <View style={[styles.overviewBoxCustom, { marginLeft: 0, backgroundColor: 'rgba(255,82,44,0.12)', borderColor: AppColors.red }]}> {/* Streak */}
                            <View style={styles.overviewContentRow}>
                                <View style={styles.overviewTextCol}>
                                    <GlobalText variant="bold" style={[styles.overviewValueCustom, { color: AppColors.red }]}>{user.streak}</GlobalText>
                                    <GlobalText style={styles.overviewLabelCustom}>Streak</GlobalText>
                                </View>
                                <GlowingIcon source={require('@/assets/icons/streak_icon.png')} color={AppColors.red} style={styles.overviewIconCustom} tintColor={AppColors.red} />
                            </View>
                        </View>
                        <View style={[styles.overviewBoxCustom, { marginRight: 0, backgroundColor: 'rgba(0,148,251,0.12)', borderColor: AppColors.blue }]}> {/* XP */}
                            <View style={styles.overviewContentRow}>
                                <View style={styles.overviewTextCol}>
                                    <GlobalText variant="bold" style={[styles.overviewValueCustom, { color: AppColors.blue }]}>{user.xp}</GlobalText>
                                    <GlobalText style={styles.overviewLabelCustom}>Total XP</GlobalText>
                                </View>
                                <GlowingIcon source={require('@/assets/icons/points_icon.png')} color={AppColors.blue} style={styles.overviewIconCustom} tintColor={AppColors.blue} />
                            </View>
                        </View>
                    </View>
                    <View style={styles.overviewRowCustom}>
                        <View style={[styles.overviewBoxCustom, { marginLeft: 0, backgroundColor: 'rgba(192,110,255,0.12)', borderColor: AppColors.purple }]}> {/* League */}
                            <View style={styles.overviewContentRow}>
                                <View style={styles.overviewTextCol}>
                                    <GlobalText variant="bold" style={[styles.overviewValueCustom, { color: AppColors.purple }]}>{user.league}</GlobalText>
                                    <GlobalText style={styles.overviewLabelCustom}>League</GlobalText>
                                </View>
                                <GlowingIcon source={require('@/assets/icons/filled_league_icon.png')} color={AppColors.purple} style={styles.overviewIconCustom} tintColor={AppColors.purple} />
                            </View>
                        </View>
                        <View style={[styles.overviewBoxCustom, { marginRight: 0, backgroundColor: 'rgba(206,249,82,0.12)', borderColor: AppColors.green }]}> {/* Level */}
                            <View style={styles.overviewContentRow}>
                                <View style={styles.overviewTextCol}>
                                    <GlobalText variant="bold" style={[styles.overviewValueCustom, { color: AppColors.green }]}>{user.level}</GlobalText>
                                    <GlobalText style={styles.overviewLabelCustom}>Level</GlobalText>
                                </View>
                                <GlowingIcon source={require('@/assets/icons/level_icon.png')} color={AppColors.green} style={styles.overviewIconCustom} tintColor={AppColors.green} />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Personal Stats Section */}
                <GlobalText variant="bold" style={styles.sectionTitle}>Personal Stats</GlobalText>
                <View style={styles.statsRowSection}>
                    <View style={[styles.statBox2, { marginLeft: 0 }]}> {/* Accuracy */}
                        <GlobalText variant="bold" style={[styles.statValue2, { color: AppColors.blue, textAlign: 'left' }]}>{user.accuracy}</GlobalText>
                        <GlobalText style={[styles.statLabel2, { textAlign: 'left' }]}>Accuracy</GlobalText>
                    </View>
                    <View style={styles.statBox2}> {/* Solved */}
                        <GlobalText variant="bold" style={[styles.statValue2, { color: AppColors.blue, textAlign: 'left' }]}>{user.solved}</GlobalText>
                        <GlobalText style={[styles.statLabel2, { textAlign: 'left' }]}>Solved</GlobalText>
                    </View>
                    <View style={[styles.statBox2, { marginRight: 0 }]}> {/* Time Spent */}
                        <GlobalText variant="bold" style={[styles.statValue2, { color: AppColors.blue, textAlign: 'left' }]}>{user.timeSpent}</GlobalText>
                        <GlobalText style={[styles.statLabel2, { textAlign: 'left' }]}>Time Spent</GlobalText>
                    </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: AppColors.cardBackground }]}>
                    <GlobalText variant="bold" style={styles.logoutText}>Logout</GlobalText>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        alignItems: 'center',
        padding: 0,
        paddingBottom: 40,
    },
    mascotBanner: {
        backgroundColor: AppColors.primary,
        borderRadius: 10,
        alignSelf: 'center',
        marginTop: 16,
        paddingVertical: 24,
        position: 'relative',
        height: 150,
        borderColor: AppColors.borderColor,
        borderWidth: 2,
        marginBottom: 10,
        // paddingHorizontal: 0,
    },
    mascotImage: {
        width: '125%',
        height: '125%',
        resizeMode: 'contain',
        position: 'absolute',
        bottom: 0,
        alignSelf: 'center',
    },
    profileInfoCard: {
        alignSelf: 'center',
        paddingHorizontal: 0,
        // paddingTop: 18,
        // paddingBottom: 18,
        // marginBottom: 24,
    },
    profileInfoHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 5,
    },
    profileInfoHeaderText: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        flex: 1,
    },
    nameInfo: {
        fontSize: 22,
        color: AppColors.textPrimary,
        textAlign: 'left',
    },

    editIconInfo: {
        width: 22,
        height: 22,
        tintColor: '#1EA7FF',
    },
    handleInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        textAlign: 'left',
    },
    handleInfoText: {
        color: '#339AFF',
        fontSize: 15,
    },
    joinDateInfo: {
        color: '#778B9D',
        fontSize: 13,
    },
    statsRowInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 10,
    },
    statBoxInfo: {
        flex: 1,
        backgroundColor: AppColors.cardBackground,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#232A36',
        marginHorizontal: 4,
        paddingVertical: 8,
        paddingHorizontal: 10,
        justifyContent: 'center',
    },
    statValueInfo: {
        fontSize: 18,
        color: AppColors.textPrimary,
        textAlign: 'left',
    },
    statLabelInfo: {
        fontSize: 14,
        color: AppColors.textSecondary,
        textAlign: 'left',
    },
    addFriendsRowInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 2,
    },
    addFriendsBtnInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#232A36',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 0,
        backgroundColor: AppColors.cardBackground,
        justifyContent: 'center',
        minWidth: 140,
    },
    addFriendsIconInfo: {
        width: 18,
        height: 18,
        marginRight: 6,
        tintColor: '#fff',
    },
    addFriendsTextInfo: {
        color: '#fff',
        fontSize: 15,
    },
    shareBtnInfo: {
        // backgroundColor: '#181F26',
        // borderRadius: 8,
        // padding: 10,
        // alignItems: 'center',
        // justifyContent: 'center',
        // borderWidth: 2,
        // borderColor: '#232A36',
        // marginLeft: 8,
    },
    shareIconInfo: {
        // width: 18,
        // height: 18,
        // tintColor: '#339AFF',
    },
    divider: {
        width: '92%',
        // height: 2,
        // backgroundColor: '#181F26',
        // borderRadius: 2,
        marginVertical: 10,
        alignSelf: 'center',
    },
    sectionTitle: {
        fontSize: 21,
        color: AppColors.textPrimary,
        alignSelf: 'flex-start',
        marginTop: 0,
        marginBottom: 8,
        marginLeft: '4%',
    },
    overviewGrid: {
        width: '92%',
        maxWidth: 420,
        alignSelf: 'center',
    },
    overviewRowCustom: {
        flexDirection: 'row',
        width: '100%',
        marginBottom: 12,
    },
    overviewBoxCustom: {
        flex: 1,
        backgroundColor: AppColors.cardBackground,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#232A36',
        marginHorizontal: 6,
        paddingVertical: 10,
        paddingLeft: 15,
        paddingRight: 10,
        justifyContent: 'center',
    },
    overviewContentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    overviewTextCol: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        flex: 1,
    },
    overviewValueCustom: {
        fontSize: 18,
        fontWeight: 'bold',
        // marginBottom: 2,
        color: AppColors.textPrimary,
    },
    overviewLabelCustom: {
        fontSize: 14,
        color: AppColors.textSecondary,
    },
    overviewIconCustom: {
        width: 42,
        height: 42,
        paddingLeft: 0,
        resizeMode: 'contain',
    },
    statBox2: {
        flex: 1,
        alignItems: 'flex-start',
        backgroundColor: 'rgba(0,148,251,0.12)',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: AppColors.blue,
        marginHorizontal: 4,
        paddingVertical: 8,
        paddingHorizontal: 10,
        justifyContent: 'center',
    },
    statValue2: {
        fontSize: 18,
        fontWeight: 'bold',
        color: AppColors.blue,
        textAlign: 'left',
    },
    statLabel2: {
        fontSize: 14,
        color: AppColors.textSecondary,
        textAlign: 'left',
    },
    logoutBtn: {
        marginTop: 30,
        width: '92%',
        maxWidth: 420,
        alignSelf: 'center',
        backgroundColor: AppColors.cardBackground,
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    logoutText: {
        color: '#fff',
        fontSize: 15,
    },
    statsRowSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '92%',
        maxWidth: 420,
        alignSelf: 'center',
        marginTop: 10,
        marginBottom: 10,
        // paddingHorizontal removed for alignment
    },
}); 