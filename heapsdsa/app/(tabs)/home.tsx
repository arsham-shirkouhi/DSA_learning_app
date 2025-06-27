
import { AppColors } from '@/constants/AppColors';
import React, { useRef } from 'react';
import { Dimensions, FlatList, StyleSheet, View } from 'react-native';
import CardItem from '../components/CardItem';


const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ITEM_HEIGHT = 370;
const ITEM_SPACING = 40;

const SNAP_INTERVAL = ITEM_HEIGHT + ITEM_SPACING;

const DATA = [
    { id: '1', title: 'Arrays', color: '#FF5F4A' },
    { id: '2', title: 'Strings', color: '#339AFF' },
    { id: '3', title: 'Linked Lists', color: '#C5FF3D' },
    { id: '4', title: 'Stacks', color: '#8844FF' },
    { id: '5', title: 'Queues', color: '#22CCAA' },
    { id: '6', title: 'Binary Trees', color: '#22CCAA' },

    { id: '7', title: 'Binary Search Trees', color: '#22CCAA' },

    { id: '8', title: 'Graphs', color: '#22CCAA' },

    { id: '9', title: 'Heaps', color: '#22CCAA' },

    { id: '10', title: 'Tries', color: '#22CCAA' },

];

export default function SnapPage() {

    const flatListRef = useRef<FlatList>(null);

    const renderCard = ({ item }: { item: any }) => (
        <View style={{
            height: ITEM_HEIGHT,
            justifyContent: 'center',
            alignItems: 'center',
            marginVertical: ITEM_SPACING / 2
        }}>
            <CardItem title={item.title} color={item.color} />
        </View>
    );

    // const renderSeparator = () => <View style={{ height: ITEM_SPACING }} />;

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={DATA}
                keyExtractor={(item) => item.id}
                renderItem={renderCard}
                showsVerticalScrollIndicator={false}
                pagingEnabled
                decelerationRate="fast"
                snapToInterval={SNAP_INTERVAL}
                snapToAlignment="center"
                // ItemSeparatorComponent={renderSeparator}
                bounces={false}
                scrollEventThrottle={16}
                contentContainerStyle={{
                    paddingTop: (SCREEN_HEIGHT - ITEM_HEIGHT) / 2,
                    paddingBottom: (SCREEN_HEIGHT - ITEM_HEIGHT) / 2 + ITEM_SPACING / 2,
                }}
            />

            {/* <Image
                source={require('@/assets/images/gradient.png')}
                style={[styles.gradientImage, { top: 0 }]}
            />

            <View pointerEvents="none" style={[styles.gradientImage, { bottom: 0 }]}>
                <Image
                    source={require('@/assets/images/gradient.png')}
                    style={{ width: '100%', height: 150, transform: [{ scaleY: -1 }] }}
                    resizeMode="cover"
                />
            </View> */}

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppColors.background,

    },
    card: {
        height: 380,
        marginHorizontal: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: AppColors.textPrimary,
        fontSize: 28,
        fontWeight: 'bold',

    },

    gradientImage: {
        position: 'absolute',
        left: 0,
        right: 0,
        width: '100%',
        height: 150,
        zIndex: 10,
    }

});
