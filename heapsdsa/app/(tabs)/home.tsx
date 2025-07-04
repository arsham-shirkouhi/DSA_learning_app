import { AppColors } from '@/constants/AppColors';
import React from 'react';
import { Dimensions, FlatList, Image, StyleSheet, View } from 'react-native';
import { TopBar } from '../../components/ui/TopBar';
import { GlobalText } from '../components/GlobalText';
import HomeCard from '../components/HomeCard';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 10;
const CARD_WIDTH = (width - CARD_MARGIN * 3) / 2;

const DEFAULT_ICON_SIZE = Math.round(CARD_WIDTH * 0.32);

const DATA = [
    {
        title: 'Array',
        bracesColor: '#FF5F4A',
        bracesIcon: require('@/assets/icons/topic_icons/array_icon.png'),
        xp: '+5k',
        xpIcon: require('@/assets/icons/points_icon.png'),
    },
    {
        title: 'Linked List',
        bracesColor: '#4DEB7E',
        bracesIcon: require('@/assets/icons/topic_icons/linkedlist_icon.png'),
        xp: '+5k',
        xpIcon: require('@/assets/icons/points_icon.png'),
    },
    {
        title: 'Stack',
        bracesColor: '#C5FF3D',
        bracesIcon: require('@/assets/icons/topic_icons/stack_icon.png'),
        xp: '+5k',
        xpIcon: require('@/assets/icons/points_icon.png'),
    },
    {
        title: 'Queue',
        bracesColor: '#339AFF',
        bracesIcon: require('@/assets/icons/topic_icons/queue_icon.png'),
        xp: '+5k',
        xpIcon: require('@/assets/icons/points_icon.png'),
    },
    {
        title: 'Heap',
        bracesColor: '#FF5F4A',
        bracesIcon: require('@/assets/icons/topic_icons/heap_icon.png'),
        xp: '+5k',
        xpIcon: require('@/assets/icons/points_icon.png'),
    },
    {
        title: 'Hashing',
        bracesColor: '#FF5F4A',
        bracesIcon: require('@/assets/icons/topic_icons/hashing_icon.png'),
        xp: '+5k',
        xpIcon: require('@/assets/icons/points_icon.png'),
    },
    {
        title: 'Trees',
        bracesColor: '#C5FF3D',
        bracesIcon: require('@/assets/icons/topic_icons/trees_icon.png'),
        xp: '+5k',
        xpIcon: require('@/assets/icons/points_icon.png'),
    },
    {
        title: 'Graphs',
        bracesColor: '#FF5F4A',
        bracesIcon: require('@/assets/icons/topic_icons/graphs_icon.png'),
        xp: '+5k',
        xpIcon: require('@/assets/icons/points_icon.png'),
    },
    {
        title: 'String',
        bracesColor: '#4DEB7E',
        bracesIcon: require('@/assets/icons/topic_icons/string_icon.png'),
        xp: '+5k',
        xpIcon: require('@/assets/icons/points_icon.png'),
    },
    {
        title: 'Sorting',
        bracesColor: '#339AFF',
        bracesIcon: require('@/assets/icons/topic_icons/sorting_icon.png'),
        xp: '+5k',
        xpIcon: require('@/assets/icons/points_icon.png'),
    },
    {
        title: 'Search',
        bracesColor: '#C5FF3D',
        bracesIcon: require('@/assets/icons/topic_icons/search_icon.png'),
        xp: '+5k',
        xpIcon: require('@/assets/icons/points_icon.png'),
    },
    {
        title: 'Theory',
        bracesColor: '#FF5F4A',
        bracesIcon: require('@/assets/icons/topic_icons/theory_icon.png'),
        xp: '+5k',
        xpIcon: require('@/assets/icons/points_icon.png'),
    },
];

export default function HomePage() {
    // You can replace these with dynamic values from context or props
    const userName = 'Arsham';
    const xpToday = 1300;

    return (
        <View style={styles.container}>
            <TopBar />
            <View style={styles.headerCard}>
                <View style={{ flex: 1 }}>
                    <GlobalText style={styles.headerText}>
                        Welcome back, <GlobalText style={styles.headerName}>{userName}!</GlobalText>
                    </GlobalText>
                    <GlobalText style={styles.headerSubText}>
                        XP gained today: {xpToday}XP
                    </GlobalText>
                </View>
                <Image source={require('@/assets/images/testavatar.png')} style={styles.avatar} />
            </View>
            {/* Grid of Cards */}
            <FlatList
                data={DATA}
                keyExtractor={(item) => item.title}
                numColumns={2}
                renderItem={({ item, index }) => {
                    const isLeft = index % 2 === 0;
                    const cardStyle = {
                        marginRight: isLeft ? 15 : 0,
                        marginBottom: 15,
                    };
                    return (
                        <HomeCard
                            title={item.title}
                            xp={item.xp}
                            xpIcon={item.xpIcon}
                            bracesColor={item.bracesColor}
                            bracesIcon={item.bracesIcon}
                            style={cardStyle}
                        />
                    );
                }}
                contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppColors.navbar,
        paddingTop: 0,
    },
    headerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0D233B',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#2678CC',
        margin: 12,
        marginTop: 18,
        padding: 16,
        minHeight: 70,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
    },
    headerText: {
        color: AppColors.textPrimary,
        fontSize: 20,
        fontFamily: 'JetBrainsMono',
        marginBottom: 2,
    },
    headerName: {
        color: '#339AFF',
        fontFamily: 'JetBrainsMono',
    },
    headerSubText: {
        color: AppColors.textSecondary,
        fontSize: 14,
        fontFamily: 'JetBrainsMono',
        marginTop: 2,
    },
    avatar: {
        width: 54,
        height: 54,
        resizeMode: 'contain',
        marginLeft: 10,
    },
    grid: {
        paddingBottom: 24,
        paddingHorizontal: 0,
    },
});
