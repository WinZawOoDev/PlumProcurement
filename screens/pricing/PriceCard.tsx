import { Pressable, Text } from 'react-native'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { IPrice } from '../../types/database'
import { useStyles } from '../../styles'

interface PriceCardProps extends Omit<IPrice, 'id'> {
    onPress?: () => void
}

function PriceCardInner({ price, unit, onPress }: PriceCardProps) {

    const styles = useStyles()
    const { t } = useTranslation()

    return (
        <Pressable
            style={({ pressed }) => [styles.priceCardMinimal, pressed && styles.priceCardPressed]}
            onPress={onPress}
            accessible
            accessibilityRole="button"
            accessibilityLabel={t('a11y.PRICE_CARD', { unit, price: price.toFixed(2) })}
        >
            <Text style={styles.priceCardUnitText} numberOfLines={1}>{unit}</Text>
            <Text style={styles.priceCardPriceValue}>
                {price.toFixed(2)}<Text style={styles.priceCardCurrencySymbol}> $</Text>
            </Text>
        </Pressable>
    )
}
export default React.memo(PriceCardInner)
