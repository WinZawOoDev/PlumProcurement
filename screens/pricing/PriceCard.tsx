import { View, Text } from 'react-native'
import React from 'react'
import { useTheme } from '@rneui/themed'
import Ionicons from '@react-native-vector-icons/ionicons'
import { IPrice } from '../../types/database'
import { useStyles } from '../../styles'
import { formatDate } from '../../utils'
import { PriceCardActions } from './PriceCardActions'

interface PriceCardProps extends Omit<IPrice, 'id'> {
    onEdit?: () => void
    onDelete?: () => void
}

const CATEGORY_ACCENT: Record<string, string> = {
    fruit: '#E76F51',
    seed: '#E9C46A',
}
const CATEGORY_ICON: Record<string, string> = {
    fruit: 'nutrition-outline',
    seed: 'leaf-outline',
}

function PriceCardInner({ price, unit, category, is_available, created_at, onEdit, onDelete }: PriceCardProps) {

    const styles = useStyles()
    const { theme } = useTheme()
    const accent = CATEGORY_ACCENT[category] ?? theme.colors.primary

    const accentBarStyle = { backgroundColor: accent, opacity: 0.9 } as const
    const iconCircleStyle = { backgroundColor: accent + '12' } as const
    const statusDotStyle = { backgroundColor: is_available ? theme.colors.success : theme.colors.grey3 } as const

    return (
        <View style={styles.priceCardMinimal}>
            <View style={[styles.priceCardAccent, accentBarStyle]} />
            <View style={[styles.priceCardIconCircle, iconCircleStyle]}>
                <Ionicons name={(CATEGORY_ICON[category] ?? 'pricetag-outline') as any} size={15} color={accent} />
            </View>
            <View style={styles.priceCardInfo}>
                <View style={styles.priceCardHeaderRow}>
                    <Text style={[styles.priceCardTitle, styles.priceCardTitleSmall]}>#{category}</Text>
                    <View style={[styles.priceCardStatusDot, statusDotStyle]} />
                    <Text style={[styles.priceCardDateText, styles.priceCardDateTextSmall]}>{created_at ? formatDate(created_at) : ''}</Text>
                </View>
                <Text style={[styles.priceCardValue, styles.priceCardValueLarge]}>
                    {price.toFixed(2)}<Text style={[styles.priceCardCurrencySymbol, styles.priceCardCurrencySymbolLarge]}> $</Text>
                    <Text style={styles.priceCardUnitText}>   ·   {unit}</Text>
                </Text>
            </View>
            <PriceCardActions onEdit={onEdit} onDelete={onDelete} />
        </View>
    )
}
export default React.memo(PriceCardInner)
