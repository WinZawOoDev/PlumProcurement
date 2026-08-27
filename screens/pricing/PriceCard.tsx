import { View, Text } from 'react-native'
import React from 'react'
import { Badge, Card } from '@rneui/themed'
import { IPrice } from '../../database'
import { useStyles } from '../../styles'
import { UI_TEXT } from '../../constants'
import { formatDate } from '../../utils'
import { PriceCardActions } from './PriceCardActions'

interface PriceCardProps extends Omit<IPrice, 'id'> {
    onEdit?: () => void
    onDelete?: () => void
}

export default function PriceCard({ price, unit, category, is_available, created_at, onEdit, onDelete }: PriceCardProps) {

    const styles = useStyles()

    return (
        <Card containerStyle={styles.priceCardContainer}>
            <View style={styles.priceCardHeader}>
                <Card.Title style={styles.priceCardTitle}>
                    #{category}
                </Card.Title>
                {created_at && (
                    <Text style={styles.priceCardDateText}>{formatDate(created_at)}</Text>
                )}
                <PriceCardActions onEdit={onEdit} onDelete={onDelete} />
            </View>
            <View style={styles.priceCardRow}>
                <Text style={styles.priceCardLabel}>
                    Price
                </Text>
                <Text style={styles.priceCardValue}>
                    {price}
                    <Text style={styles.priceCardCurrencySymbol}> $</Text>
                </Text>
            </View>
            <View style={styles.priceCardRow}>
                <Text style={styles.priceCardLabel}>
                    Unit
                </Text>
                <Text style={styles.priceCardValue}>
                    {unit}
                </Text>
            </View>
            <View style={styles.priceCardRow}>
                <Text style={styles.priceCardLabel}>
                    Category
                </Text>
                <Text style={styles.priceCardCategoryValue}>
                    {category}
                </Text>
            </View>
            <View style={styles.priceCardRow}>
                <Text style={styles.priceCardLabel}>
                    Status
                </Text>
                <Badge
                    value={is_available ? UI_TEXT.AVAILABLE_STATUS : UI_TEXT.UNAVAILABLE_STATUS}
                    badgeStyle={styles.priceCardBadgeStyle}
                    textStyle={styles.priceCardBadgeText}
                />
            </View>
        </Card>
    )
}
