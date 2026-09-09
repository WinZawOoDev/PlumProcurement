import { Pressable, Text } from 'react-native'
import React from 'react'
import { IPrice } from '../../types/database'
import { useStyles } from '../../styles'

interface PriceCardProps extends Omit<IPrice, 'id'> {
    onPress?: () => void
}

function PriceCardInner({ price, unit, onPress }: PriceCardProps) {

    const styles = useStyles()

    return (
        <Pressable
            style={({ pressed }) => [styles.priceCardMinimal, pressed && styles.priceCardPressed]}
            onPress={onPress}
            accessible
            accessibilityRole="button"
            accessibilityLabel={`${unit}, ${price.toFixed(2)} dollars`}
        >
            <Text style={styles.priceCardUnitText} numberOfLines={1}>{unit}</Text>
            <Text style={styles.priceCardPriceValue}>
                {price.toFixed(2)}<Text style={styles.priceCardCurrencySymbol}> $</Text>
            </Text>
        </Pressable>
    )
}
export default React.memo(PriceCardInner)
