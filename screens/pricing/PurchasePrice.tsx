import { RefreshControl, View, Text, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useStyles } from '../../styles'
import { useTheme } from '@rneui/themed'
import { SafeAreaView } from 'react-native-safe-area-context'
import PriceCard from './PriceCard'
import ActionButtons from './ActionButtons'
import { IPrice } from '../../database'
import { priceService } from '../../services/priceService'
import { useRoute } from '@react-navigation/native'
import EditPrice from './EditPrice'
import { SAFE_AREA, UI_TEXT } from '../../constants'

export default function PurchasePrices() {
    const styles = useStyles()
    const { theme } = useTheme()
    const route = useRoute()

    const [price, setPrice] = useState<{ list: IPrice[], isLoading: boolean }>({ list: [], isLoading: false })

    async function getPrices() {
        setPrice(prev => ({ ...prev, isLoading: true }))
        try {
            const data = await priceService.getPrices()
            setPrice({ list: data, isLoading: false })
        } catch (error) {
            console.error('Failed to fetch prices:', error)
            setPrice({ list: [], isLoading: false })
        }
    }

    useEffect(() => {
        getPrices()
    }, [])

    useEffect(() => {
        //@ts-expect-error
        const isRefresh = route.params?.refresh
        if (isRefresh) {
            getPrices()
        }
    }, [route.params])

    return (
        <SafeAreaView
            edges={SAFE_AREA.EDGES}
            style={{ ...styles.screenContainer, height: '100%' }}
        >
            <View style={styles.priceListContainer}>
                <TitleAndDescription />
                <ActionButtons />
                <FlatList
                    data={price.list}
                    keyExtractor={(item) => item.id.toString()}
                    refreshing={price.isLoading}
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
                            refreshing={price.isLoading}
                            onRefresh={getPrices}
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