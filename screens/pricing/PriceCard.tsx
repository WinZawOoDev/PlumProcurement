import { View, Text } from 'react-native'
import React from 'react'
import { Badge, Button, Card } from '@rneui/themed'
import { IPrice } from '../../database'
import { useStyles } from '../../styles'
import { UI_TEXT, A11Y_LABELS } from '../../constants'

interface PriceCardProps extends Omit<IPrice, 'id'> {
    onEdit?: () => void
    onDelete?: () => void
}

export default function PriceCard({ price, unit, category, is_available, onEdit, onDelete }: PriceCardProps) {

    const styles = useStyles()

    return (
        <Card containerStyle={styles.priceCardContainer}>
            <View style={styles.priceCardHeader}>
                <Card.Title style={styles.priceCardTitle}>
                    #{category}
                </Card.Title>
                <View style={styles.priceCardActionsRow}>
                    <Button
                        buttonStyle={styles.priceCardEditButton}
                        title="Edit"
                        titleStyle={styles.priceCardEditButtonTitle}
                        onPress={onEdit}
                        accessibilityLabel={A11Y_LABELS.EDIT_PRICE}
                    />
                    <Button
                        buttonStyle={styles.priceCardDeleteButton}
                        icon={{
                            name: 'trash-outline',
                            type: 'ionicon',
                            color: 'white',
                            size: 16,
                        }}
                        onPress={onDelete}
                        accessibilityLabel={A11Y_LABELS.DELETE_PRICE}
                    />
                </View>
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
