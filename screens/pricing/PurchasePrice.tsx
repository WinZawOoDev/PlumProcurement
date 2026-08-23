import { RefreshControl, View, Text, FlatList, ToastAndroid } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useStyles } from '../../styles'
import { useTheme } from '@rneui/themed'
import { SafeAreaView } from 'react-native-safe-area-context'
import PriceCard from './PriceCard'
import ActionButtons from './ActionButtons'
import { usePrices } from '../../context/PriceContext'
import EditPrice from './EditPrice'
import { SAFE_AREA, UI_TEXT, MESSAGES } from '../../constants'
import { IPrice } from '../../database'

export default function PurchasePrices() {
    const styles = useStyles()
    const { theme } = useTheme()
    const { prices, loading, refresh, removePrice } = usePrices()
    const [editing, setEditing] = useState<IPrice | null>(null)

    useEffect(() => {
        refresh()
    }, [refresh])

    const handleDelete = async (id: number) => {
        try {
            await removePrice(id)
            ToastAndroid.show(MESSAGES.PRICE_DELETE_SUCCESS, ToastAndroid.SHORT)
        } catch {
            ToastAndroid.show(MESSAGES.ERROR_GENERIC, ToastAndroid.LONG)
        }
    }

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
                    renderItem={({ item }) => (
                        <PriceCard
                            {...item}
                            onEdit={() => setEditing(item)}
                            onDelete={() => handleDelete(item.id)}
                        />
                    )}
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
                <EditPrice
                    visible={!!editing}
                    price={editing}
                    onClose={() => setEditing(null)}
                />
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