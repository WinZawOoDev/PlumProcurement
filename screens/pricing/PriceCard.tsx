import { View, Text } from 'react-native'
import React from 'react'
import { useTheme } from '@rneui/themed'
import Ionicons from '@react-native-vector-icons/ionicons'
import { IPrice } from '../../database'
import { useStyles } from '../../styles'
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
        <View style={styles.priceCardMinimal}>
            <View style={[styles.priceCardAccent, { backgroundColor: accent }]} />
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: accent + '14', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={(CATEGORY_ICON[category] ?? 'pricetag-outline') as any} size={16} color={accent} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.priceCardTitle, { fontSize: 14 }]}>#{category}</Text>
                    <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: is_available ? theme.colors.success : theme.colors.grey3 }} />
                    <Text style={styles.priceCardDateText}>{created_at ? formatDate(created_at) : ''}</Text>
                </View>
                <Text style={[styles.priceCardValue, { marginBottom: 0, fontSize: 15, color: theme.colors.black }]}>
                    {price.toFixed(2)}<Text style={styles.priceCardCurrencySymbol}> $</Text>
                    <Text style={{ fontSize: 12, color: theme.colors.grey4, fontWeight: '400' }}>  ·  {unit}</Text>
                </Text>
            </View>
            <PriceCardActions onEdit={onEdit} onDelete={onDelete} />
        </View>
    )
}
export default React.memo(PriceCardInner)
