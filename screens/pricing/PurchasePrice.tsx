import { RefreshControl, View, Text, FlatList } from 'react-native'
import React, { useEffect } from 'react'
import { useStyles } from '../../styles'
import { useTheme } from '@rneui/themed'
import { SafeAreaView } from 'react-native-safe-area-context'
import PriceCard from './PriceCard'
import ActionButtons from './ActionButtons'
import { usePrices } from '../../context/PriceContext'
import EditPrice from './EditPrice'
import { SAFE_AREA, UI_TEXT } from '../../constants'

export default function PurchasePrices() {
    const styles = useStyles()
    const { theme } = useTheme()
    const { prices, loading, refresh } = usePrices()

    useEffect(() => {
        refresh()
    }, [refresh])

    return (
        <SafeAreaView
            edges={SAFE_AREA.EDGES}
            style={{ ...styles.screenContainer, height: '100%' }}
        >
            <View style={styles.priceListContainer}>
                <TitleAndDescription />
                <ActionButtons />
                <FlatList
                    data={prices}
                    keyExtractor={(item) => item.id.toString()}
                    refreshing={loading}
                    initialScrollIndex={0}
                    renderItem={({ item }) => <PriceCard {...item} />}
                    ListEmptyComponent={<EmptyPriceList />}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={10}
                    updateCellsBatchingPeriod={50}
                    initialNumToRender={10}
                    windowSize={10}
                    refreshControl={
                        <RefreshControl
                            refreshing={loading}
                            onRefresh={refresh}
                            colors={[theme.colors.primary]}
                        />
                    }
                    style={styles.priceListFlatList}
                />
                <EditPrice />
            </View>
        </SafeAreaView>
    )
}

function EmptyPriceList() {
    const styles = useStyles()

    return (
        <View style={styles.emptyPriceListContainer}>
            <Text style={{ alignSelf: 'center' }}>{UI_TEXT.PLUM_COUNT_TITLE}</Text>
        </View>
    )
}

function TitleAndDescription() {
    const styles = useStyles()
    return (
        <View style={styles.titleDescription}>
            <Text style={styles.titleText}>{UI_TEXT.PRICE_MANAGEMENT}</Text>
            <Text style={styles.descriptionText}>
                {UI_TEXT.PRICE_DESCRIPTION}
            </Text>
        </View>
    )
}