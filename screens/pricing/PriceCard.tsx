import { View, Text } from 'react-native'
import React from 'react'
import { Badge, Card, useTheme } from '@rneui/themed'
import Ionicons from '@react-native-vector-icons/ionicons'
import { IPrice } from '../../database'
import { useStyles } from '../../styles'
import { UI_TEXT } from '../../constants'
import { formatDate } from '../../utils'
import { PriceCardActions } from './PriceCardActions'

interface PriceCardProps extends Omit<IPrice, 'id'> {
    onEdit?: () => void
    onDelete?: () => void
}

const CATEGORY_ACCENT: Record<string, string> = {
    grains: '#E9C46A',
    fruits: '#E76F51',
    vegetables: '#2A9D8F',
    dairy: '#F4A261',
    meat: '#9C6644',
}
const CATEGORY_ICON: Record<string, string> = {
    grains: 'leaf-outline',
    fruits: 'nutrition-outline',
    vegetables: 'leaf',
    dairy: 'water-outline',
    meat: 'restaurant-outline',
}

function PriceCardInner({ price, unit, category, is_available, created_at, onEdit, onDelete }: PriceCardProps) {

    const styles = useStyles()
    const { theme } = useTheme()
    const accent = CATEGORY_ACCENT[category] ?? theme.colors.primary

    return (
        <Card containerStyle={styles.priceCardContainer}>
            <View style={[styles.priceCardAccent, { backgroundColor: accent }]} />
            <View style={styles.priceCardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: accent + '22', alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name={(CATEGORY_ICON[category] ?? 'pricetag-outline') as any} size={16} color={accent} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Card.Title style={[styles.priceCardTitle, { marginBottom: 0 }]}>#{category}</Card.Title>
                        {created_at ? <Text style={styles.priceCardDateText}>{formatDate(created_at)}</Text> : null}
                    </View>
                </View>
                <PriceCardActions onEdit={onEdit} onDelete={onDelete} />
            </View>
            <View style={[styles.priceCardRow, { marginTop: 8 }]}>
                <Text style={styles.priceCardLabel}>Price</Text>
                <Text style={[styles.priceCardValue, { fontSize: 18, color: theme.colors.primary }]}>
                    {price.toFixed(2)}
                    <Text style={styles.priceCardCurrencySymbol}> $</Text>
                    <Text style={{ fontSize: 11, color: theme.colors.grey4 }}> / {unit}</Text>
                </Text>
            </View>
            <View style={styles.priceCardRow}>
                <Text style={styles.priceCardLabel}>Status</Text>
                <Badge
                    value={is_available ? UI_TEXT.AVAILABLE_STATUS : UI_TEXT.UNAVAILABLE_STATUS}
                    badgeStyle={[styles.priceCardBadgeStyle, { backgroundColor: is_available ? theme.colors.success + '18' : theme.colors.grey1, borderWidth: 1, borderColor: is_available ? theme.colors.success + '40' : theme.colors.grey2 }]}
                    textStyle={[styles.priceCardBadgeText, { color: is_available ? theme.colors.success : theme.colors.grey4, fontWeight: '600' }]}
                />
            </View>
        </Card>
    )
}
export default React.memo(PriceCardInner)
