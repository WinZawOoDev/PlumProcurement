import React from 'react'
import { Text as RNText, View } from 'react-native'
import { Text } from '@rneui/themed'
import { useTheme } from '@rneui/themed'
import Ionicons from '@react-native-vector-icons/ionicons'
import FontAwesomeIcon from '@react-native-vector-icons/fontawesome-free-solid'
import { useStyles } from '../styles'
import { IPrice } from '../types/database'
import { formatDate } from '../utils'
import { useLocalizedConstants } from '../hooks/useLocalizedConstants'
import { PrimaryButton, SecondaryButton } from './buttons/Button'
import { DetailSheet } from './DetailSheet'

interface PriceDetailSheetProps {
    visible: boolean
    price: IPrice | null
    onClose: () => void
    onEdit?: (price: IPrice) => void
    onDelete?: (id: number) => void
}

export function PriceDetailSheet({ visible, price, onClose, onEdit, onDelete }: PriceDetailSheetProps) {
    const styles = useStyles()
    const { theme } = useTheme()
    const { UI_TEXT, UNITS, CURRENCY } = useLocalizedConstants()
    if (!price) return null
    return (
        <DetailSheet visible={visible} onClose={onClose}>
            <Text style={styles.bottomSheetTitle}>{UI_TEXT.PRICE_DETAIL}</Text>

            <View style={styles.priceDetailHero}>
                <View style={styles.priceDetailCategoryChip}>
                    <RNText style={styles.priceDetailCategoryText} numberOfLines={1}>{price.category}</RNText>
                </View>
                <RNText style={styles.priceDetailPrice}>
                    {price.price.toFixed(2)}<Text style={styles.priceDetailCurrency}> {CURRENCY}</Text>
                    <RNText style={styles.priceDetailUnit}>  / {UNITS[price.unit] ?? price.unit}</RNText>
                </RNText>
            </View>

            <View style={styles.priceDetailDivider} />

            <View style={styles.priceDetailMetaRow}>
                <Ionicons name="calendar-outline" size={14} color={theme.colors.grey4} />
                <RNText style={styles.priceDetailMetaText}>{UI_TEXT.CREATED} {formatDate(price.created_at)}</RNText>
            </View>

            {(onEdit || onDelete) && (
                <View style={styles.priceDetailActions}>
                    {onEdit && (
                        <PrimaryButton
                            title={UI_TEXT.EDIT}
                            icon={<FontAwesomeIcon name="edit" size={15} color="white" />}
                            iconContainerStyle={styles.priceDetailButtonIcon}
                            buttonStyle={styles.priceDetailCompactButton}
                            titleStyle={styles.priceDetailCompactTitle}
                            containerStyle={styles.priceDetailAction}
                            onPress={() => onEdit(price)}
                        />
                    )}
                    {onDelete && (
                        <SecondaryButton
                            title={UI_TEXT.DELETE}
                            icon={<Ionicons name="trash-outline" size={15} color={theme.colors.error} />}
                            iconContainerStyle={styles.priceDetailButtonIcon}
                            buttonStyle={styles.priceDetailCompactButton}
                            titleStyle={[styles.priceDetailCompactTitle, { color: theme.colors.error }]}
                            containerStyle={styles.priceDetailAction}
                            onPress={() => onDelete(price.id)}
                        />
                    )}
                </View>
            )}
        </DetailSheet>
    )
}
