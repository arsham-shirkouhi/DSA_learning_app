import { AppColors } from '@/constants/AppColors';
import React from 'react';
import { Dimensions, Image, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { GlobalText } from '../components/GlobalText';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_SIZE = Math.floor(SCREEN_WIDTH * 0.27); // balanced size
const CARD_MARGIN = Math.floor(SCREEN_WIDTH * 0.02); // balanced margin
const H_PADDING_LEFT = Math.floor(SCREEN_WIDTH * 0.04); // 4% left
const H_PADDING_RIGHT = Math.floor(SCREEN_WIDTH * 0.06); // 6% right
const AVATAR_SIZE = Math.floor(SCREEN_WIDTH * 0.12); // for user list
const RANK_WIDTH = Math.floor(SCREEN_WIDTH * 0.09);
const FONT_LARGE = Math.floor(SCREEN_WIDTH * 0.045);
const FONT_MEDIUM = Math.floor(SCREEN_WIDTH * 0.037);
const FONT_SMALL = Math.floor(SCREEN_WIDTH * 0.03);

const users = [
    {
        name: 'You',
        score: 1240,
        rank: 1,
        avatar: require('@/assets/images/mascot.png'),
        highlight: true,
    },
    {
        name: 'Seong',
        score: 1180,
        rank: 2,
        avatar: require('@/assets/images/topics/topic_banners/test_topic_image.png'),
        highlight: false,
    },
    {
        name: 'Ben',
        score: 1110,
        rank: 3,
        avatar: require('@/assets/images/react-logo.png'),
        highlight: false,
    },
    {
        name: 'Maya Patel',
        score: 954,
        rank: 4,
        avatar: require('@/assets/images/mascot.png'),
    },
    {
        name: 'Aiden Chen',
        score: 856,
        rank: 5,
        avatar: require('@/assets/images/mascot.png'),
    },
    {
        name: 'Sofia Rivera',
        score: 829,
        rank: 6,
        avatar: require('@/assets/images/mascot.png'),
    },
    {
        name: 'Jacob Hassan',
        score: 790,
        rank: 7,
        avatar: require('@/assets/images/mascot.png'),
    },
    {
        name: 'Elijah Das',
        score: 753,
        rank: 8,
        avatar: require('@/assets/images/mascot.png'),
    },
    {
        name: 'Layla Wong',
        score: 693,
        rank: 9,
        avatar: require('@/assets/images/mascot.png'),
    },
    {
        name: 'Daniel Morales',
        score: 667,
        rank: 10,
        avatar: require('@/assets/images/mascot.png'),
    },
    {
        name: 'Hana Yusuf',
        score: 650,
        rank: 11,
        avatar: require('@/assets/images/mascot.png'),
    },
    {
        name: 'Priya Singh',
        score: 640,
        rank: 12,
        avatar: require('@/assets/images/mascot.png'),
    },
    {
        name: 'Lucas Kim',
        score: 630,
        rank: 13,
        avatar: require('@/assets/images/mascot.png'),
    },
    {
        name: 'Olivia Brown',
        score: 620,
        rank: 14,
        avatar: require('@/assets/images/mascot.png'),
    },
    {
        name: 'Noah Wilson',
        score: 610,
        rank: 15,
        avatar: require('@/assets/images/mascot.png'),
    },
    {
        name: 'Emma Garcia',
        score: 600,
        rank: 16,
        avatar: require('@/assets/images/mascot.png'),
    },
    {
        name: 'William Lee',
        score: 590,
        rank: 17,
        avatar: require('@/assets/images/mascot.png'),
    },
    {
        name: 'Chloe Martin',
        score: 580,
        rank: 18,
        avatar: require('@/assets/images/mascot.png'),
    },
    {
        name: 'James Clark',
        score: 570,
        rank: 19,
        avatar: require('@/assets/images/mascot.png'),
    },
    {
        name: 'Sophia Turner',
        score: 560,
        rank: 20,
        avatar: require('@/assets/images/mascot.png'),
    },
];

function getInitials(name: string) {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase();
}

export default function LeaderBoardScreen() {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: AppColors.background }}>
            {/* League Header */}
            <View style={styles.leagueHeader}>
                <View style={styles.leagueHeaderRow}>
                    <View style={{ flex: 1 }}>
                        <GlobalText variant="bold" style={styles.leagueTitle}>bronze league</GlobalText>
                        <GlobalText style={styles.leagueSubtitle}>top 15 advance to the next league</GlobalText>
                    </View>
                    <View style={styles.trophyContainer}>
                        <Image
                            source={require('@/assets/icons/leaderboard_icon.png')}
                            style={styles.trophyIcon}
                            resizeMode="contain"
                        />
                    </View>
                </View>
            </View>

            {/* Top 3 Users */}
            <View style={[styles.topThreeRow, { marginBottom: 12, justifyContent: 'center' }]}>
                {users.slice(0, 3).map((user) => (
                    <View key={user.rank} style={[styles.topUserCol, { width: CARD_SIZE, marginHorizontal: CARD_MARGIN }]}>
                        <View style={[styles.topUserImageBorderWrapper, { width: CARD_SIZE, height: CARD_SIZE, borderRadius: CARD_SIZE * 0.12 }]}>
                            <Image
                                source={user.avatar}
                                style={[styles.topUserImage, { borderRadius: CARD_SIZE * 0.12 }]}
                                resizeMode="cover"
                            />
                            <View style={[styles.topUserGradient, { borderBottomLeftRadius: CARD_SIZE * 0.12, borderBottomRightRadius: CARD_SIZE * 0.12, height: CARD_SIZE * 0.22 }]} />
                            <View style={[styles.topUserNameContainer, { paddingLeft: CARD_SIZE * 0.08, bottom: CARD_SIZE * 0.03 }]}>
                                <GlobalText variant="bold" style={[styles.topUserNameNew, { fontSize: FONT_LARGE * 0.8 }]}>{user.name}</GlobalText>
                            </View>
                        </View>
                        <View style={[styles.topUserScoreRowNewOuter, { width: CARD_SIZE, marginTop: 6 }]}>
                            <Image
                                source={require('@/assets/icons/points_icon.png')}
                                style={[styles.pointsIconNew, { width: FONT_LARGE * 0.8, height: FONT_LARGE * 0.8 }]}
                            />
                            <GlobalText variant="bold" style={[styles.topUserScoreNew, { fontSize: FONT_LARGE * 0.8 }]}>{(user.score / 1000).toFixed(2).replace(/\.00$/, '')}k</GlobalText>
                            <View style={[styles.rankBadgeNew, { minWidth: FONT_LARGE * 0.8, paddingHorizontal: FONT_SMALL * 0.7 }]}>
                                <GlobalText variant="bold" style={[styles.rankBadgeTextNew, { fontSize: FONT_LARGE * 0.8 }]}>{user.rank}</GlobalText>
                            </View>
                        </View>
                    </View>
                ))}
            </View>

            {/* User List (Scrollable) */}
            <ScrollView contentContainerStyle={styles.userList}>
                {users.slice(3).map((user, idx) => (
                    <View key={user.rank} style={[styles.userRowNew, { paddingLeft: H_PADDING_LEFT * 0.85, paddingRight: H_PADDING_RIGHT * 0.85 }]}>
                        <GlobalText variant="bold" style={[styles.userRankNew, { width: RANK_WIDTH * 0.85, fontSize: FONT_LARGE * 0.85 }]}>{user.rank}</GlobalText>
                        <View style={[styles.userAvatarWrapperNew, { width: AVATAR_SIZE * 0.85, height: AVATAR_SIZE * 0.85, borderRadius: AVATAR_SIZE * 0.19 }]}>
                            <Image
                                source={user.avatar || require('@/assets/images/mascot.png')}
                                style={[styles.userAvatarNew, { borderRadius: AVATAR_SIZE * 0.19 }]}
                                resizeMode="cover"
                            />
                        </View>
                        <GlobalText variant="bold" style={[styles.userNameNew, { fontSize: FONT_MEDIUM * 0.95 }]}>{user.name}</GlobalText>
                        <View style={styles.userScoreRowNew}>
                            <Image
                                source={require('@/assets/icons/points_icon.png')}
                                style={[styles.userPointsIconNew, { width: FONT_MEDIUM * 0.95, height: FONT_MEDIUM * 0.95 }]}
                            />
                            <GlobalText variant="bold" style={[styles.userScoreNew, { fontSize: FONT_MEDIUM * 0.95 }]}>{user.score}</GlobalText>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        alignItems: 'center',
        paddingBottom: 40,
        backgroundColor: AppColors.background,
    },
    leagueHeader: {
        width: '100%',
        alignItems: 'flex-start',
        paddingHorizontal: H_PADDING_LEFT,
        marginTop: 18,
        marginBottom: 10,
    },
    leagueHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'space-between',
    },
    leagueTitle: {
        fontSize: FONT_LARGE,
        color: AppColors.textPrimary,
        marginBottom: 0,
        textTransform: 'lowercase',
    },
    leagueSubtitle: {
        color: AppColors.textSecondary,
        fontSize: FONT_SMALL,
        marginTop: 2,
        marginBottom: 0,
    },
    trophyContainer: {
        width: FONT_LARGE * 2.2,
        height: FONT_LARGE * 2.2,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#232A36',
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
    },
    trophyIcon: {
        width: FONT_LARGE * 1.3,
        height: FONT_LARGE * 1.3,
        tintColor: AppColors.green,
    },
    topThreeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        alignSelf: 'center',
        marginTop: 10,
    },
    topUserCol: {
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    topUserImageBorderWrapper: {
        borderWidth: 3,
        borderColor: '#232A36',
        overflow: 'hidden',
        backgroundColor: AppColors.borderColor,
        marginBottom: 0,
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        position: 'relative',
    },
    topUserImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    topUserGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(12,17,23,0.85)',
    },
    topUserNameContainer: {
        position: 'absolute',
        left: 0,
        zIndex: 2,
    },
    topUserNameNew: {
        color: AppColors.textPrimary,
        fontWeight: 'bold',
    },
    topUserScoreRowNewOuter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 0,
    },
    pointsIconNew: {
        tintColor: AppColors.blue,
        marginRight: 4,
    },
    topUserScoreNew: {
        color: AppColors.textPrimary,
        fontWeight: 'bold',
        marginRight: 10,
    },
    rankBadgeNew: {
        backgroundColor: 'rgba(12,17,23,0.9)',
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#232A36',
        marginLeft: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rankBadgeTextNew: {
        color: AppColors.textPrimary,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    userList: {
        width: '100%',
        marginTop: 1,
        paddingHorizontal: 0,
    },
    userRowNew: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: AppColors.cardBackground,
        borderBottomWidth: 1,
        borderBottomColor: AppColors.borderColor,
        paddingVertical: 8,
        marginBottom: 0,
        width: '100%',
    },
    userRankNew: {
        color: AppColors.textPrimary,
        fontWeight: 'bold',
        textAlign: 'center',
        marginRight: 6,
    },
    userAvatarWrapperNew: {
        borderWidth: 2,
        borderColor: AppColors.borderColor,
        overflow: 'hidden',
        marginRight: 12,
    },
    userAvatarNew: {
        width: '100%',
        height: '100%',
    },
    userNameNew: {
        color: AppColors.textPrimary,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 8,
    },
    userScoreRowNew: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        minWidth: 70,
    },
    userPointsIconNew: {
        tintColor: AppColors.blue,
        marginRight: 4,
    },
    userScoreNew: {
        color: AppColors.blue,
        fontWeight: 'bold',
    },
}); 