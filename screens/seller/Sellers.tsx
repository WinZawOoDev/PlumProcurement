import { FlatList, Text as RNText, ToastAndroid, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { Button } from '@rneui/themed'
import { SafeAreaView } from 'react-native-safe-area-context'
import Ionicons from '@react-native-vector-icons/ionicons'
import { useStyles } from '../../styles'
import { useTheme } from '@rneui/themed'
import { PrimaryButton } from '../../components/buttons/Button'
import { UI_TEXT, MESSAGES, SAFE_AREA, DIMENSIONS } from '../../constants'
import { sellerService } from '../../services/sellerService'
import { DatabaseError, ISeller } from '../../database'
import SellerFormSheet from './SellerFormSheet'

export default function Sellers() {
    const styles = useStyles()
    const { theme } = useTheme()
    const [sellers, setSellers] = useState<ISeller[]>([])
    const [sheetVisible, setSheetVisible] = useState(false)
    const [editing, setEditing] = useState<ISeller | null>(null)

    const loadSellers = useCallback(async () => {
        try {
            setSellers(await sellerService.getSellers())
        } catch (error) {
            console.error('Failed to fetch sellers:', error)
        }
    }, [])

    useEffect(() => {
        loadSellers()
    }, [loadSellers])

    const handleDelete = async (id: number) => {
        try {
            await sellerService.removeSeller(id)
            ToastAndroid.show(MESSAGES.SELLER_DELETE_SUCCESS, ToastAndroid.SHORT)
            await loadSellers()
        } catch (error) {
            const message = error instanceof DatabaseError ? error.message : MESSAGES.ERROR_GENERIC
            ToastAndroid.show(message, ToastAndroid.LONG)
        }
    }

    return (
        <SafeAreaView edges={SAFE_AREA.EDGES} style={styles.priceListScreen}>
            <View style={styles.priceListContainer}>
                <View style={styles.titleDescription}>
                    <RNText style={styles.titleText}>{UI_TEXT.SELLERS}</RNText>
                    <RNText style={styles.descriptionText}>{UI_TEXT.SELLERS_DESCRIPTION}</RNText>
                </View>

                <PrimaryButton
                    title={UI_TEXT.ADD_SELLER}
                    containerStyle={styles.addSellerButton}
                    onPress={() => {
                        setEditing(null)
                        setSheetVisible(true)
                    }}
                />

                <FlatList
                    data={sellers}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.purchaseItemRow}>
                            <View style={styles.sellerInfo}>
                                <RNText style={styles.sellerNameText}>{item.name}</RNText>
                                {!!item.phone && (
                                    <RNText style={styles.sellerPhoneText}>{item.phone}</RNText>
                                )}
                            </View>
                            <View style={styles.priceCardActionsRow}>
                                <Button
                                    buttonStyle={styles.rowIconButton}
                                    icon={
                                        <Ionicons
                                            name="pencil-outline"
                                            size={DIMENSIONS.ICON_SIZE_SMALL}
                                            color={theme.colors.primary}
                                        />
                                    }
                                    onPress={() => {
                                        setEditing(item)
                                        setSheetVisible(true)
                                    }}
                                />
                                <Button
                                    buttonStyle={[styles.rowIconButton, styles.rowIconDeleteButton]}
                                    icon={
                                        <Ionicons
                                            name="trash-outline"
                                            size={DIMENSIONS.ICON_SIZE_SMALL}
                                            color="white"
                                        />
                                    }
                                    onPress={() => handleDelete(item.id)}
                                />
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={
                        <RNText style={styles.emptyPriceListText}>{UI_TEXT.EMPTY_SELLER_LIST}</RNText>
                    }
                />
            </View>

            <SellerFormSheet
                visible={sheetVisible}
                seller={editing}
                onClose={() => setSheetVisible(false)}
                onSaved={loadSellers}
            />
        </SafeAreaView>
    )
}
