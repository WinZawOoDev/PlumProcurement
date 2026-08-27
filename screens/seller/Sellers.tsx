import { Alert, FlatList, RefreshControl, Text as RNText, View } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Ionicons from '@react-native-vector-icons/ionicons'
import { useStyles } from '../../styles'
import { useTheme } from '@rneui/themed'
import { IconButton, PrimaryButton } from '../../components/buttons/Button'
import { UI_TEXT, MESSAGES, SAFE_AREA, DIMENSIONS, A11Y_LABELS } from '../../constants'
import { sellerService } from '../../services/sellerService'
import { DatabaseError, ISeller } from '../../database'
import SellerFormSheet from './SellerFormSheet'
import { SearchBar } from '../../components/SearchBar'
import { showSuccess, showError } from '../../utils/notifications'
import { useLoading } from '../../hooks/useAsync'
import { SellerRow } from './SellerRow'

export default function Sellers() {
    const styles = useStyles()
    const { theme } = useTheme()
    const [sellers, setSellers] = useState<ISeller[]>([])
    const { loading, withLoading } = useLoading(false)
    const [sheetVisible, setSheetVisible] = useState(false)
    const [editing, setEditing] = useState<ISeller | null>(null)
    const [searchVisible, setSearchVisible] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    const loadSellers = useCallback(async () => {
        await withLoading(async () => {
            try {
                setSellers(await sellerService.getSellers())
            } catch (error) {
                showError((error as Error)?.message ?? MESSAGES.ERROR_GENERIC)
            }
        })
    }, [withLoading])

    useEffect(() => {
        loadSellers()
    }, [loadSellers])

    const visibleSellers = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()
        if (!query) return sellers
        return sellers.filter(
            (s) =>
                s.name.toLowerCase().includes(query) ||
                (s.phone ?? '').toLowerCase().includes(query)
        )
    }, [sellers, searchQuery])

    const handleToggleSearch = () => {
        setSearchVisible((prev) => {
            if (prev) setSearchQuery('')
            return !prev
        })
    }

    const confirmDelete = (id: number) => {
        Alert.alert(
            UI_TEXT.DELETE_CONFIRM_TITLE,
            UI_TEXT.DELETE_SELLER_CONFIRM_MESSAGE,
            [
                { text: UI_TEXT.CANCEL, style: 'cancel' },
                {
                    text: UI_TEXT.DELETE,
                    style: 'destructive',
                    onPress: () => performDelete(id),
                },
            ]
        )
    }

    const performDelete = async (id: number) => {
        try {
            await sellerService.removeSeller(id)
            showSuccess(MESSAGES.SELLER_DELETE_SUCCESS)
            await loadSellers()
        } catch (error) {
            const message = error instanceof DatabaseError ? error.message : MESSAGES.ERROR_GENERIC
            showError(message)
        }
    }

    return (
        <SafeAreaView edges={SAFE_AREA.EDGES} style={styles.priceListScreen}>
            <View style={styles.priceListContainer}>
                <View style={styles.titleDescription}>
                    <RNText style={styles.titleText}>{UI_TEXT.SELLERS}</RNText>
                    <RNText style={styles.descriptionText}>{UI_TEXT.SELLERS_DESCRIPTION}</RNText>
                </View>

                <View style={styles.actionButtonsRow}>
                    <PrimaryButton
                        title={UI_TEXT.ADD_SELLER}
                        containerStyle={styles.addSellerButton}
                        onPress={() => {
                            setEditing(null)
                            setSheetVisible(true)
                        }}
                    />
                    <IconButton
                        icon={
                            <Ionicons
                                name={searchVisible ? 'search' : 'search-outline'}
                                size={DIMENSIONS.ICON_SIZE_LARGE}
                                color={searchVisible ? theme.colors.primary : theme.colors.tertiary}
                            />
                        }
                        variant="secondary"
                        onPress={handleToggleSearch}
                        accessibilityLabel={A11Y_LABELS.TOGGLE_SEARCH}
                    />
                </View>

                {searchVisible && (
                    <SearchBar
                        placeholder={UI_TEXT.SEARCH_SELLERS_PLACEHOLDER}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                )}

                <FlatList
                    data={visibleSellers}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <SellerRow
                            seller={item}
                            onEdit={() => {
                                setEditing(item)
                                setSheetVisible(true)
                            }}
                            onDelete={() => confirmDelete(item.id)}
                        />
                    )}
                    ListEmptyComponent={
                        <RNText style={styles.emptyPriceListText}>
                            {sellers.length > 0 ? UI_TEXT.NO_MATCHING_RESULTS : UI_TEXT.EMPTY_SELLER_LIST}
                        </RNText>
                    }
                    refreshControl={
                        <RefreshControl
                            refreshing={loading}
                            onRefresh={loadSellers}
                            colors={[theme.colors.primary]}
                        />
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
