import { View, Text } from 'react-native'
import React from 'react'
import { Badge, Button, Card } from '@rneui/themed'
import { IPrice } from '../../database'
import { useStyles } from '../../styles'

export default function PriceCard({ price, unit, category, is_available }: Omit<IPrice, 'id'>) {

    const styles = useStyles()

    return (
        <Card containerStyle={styles.priceCardContainer}>
            <View style={styles.priceCardHeader}>
                <Card.Title style={styles.priceCardTitle}>
                    #{category}
                </Card.Title>
                <Button
                    buttonStyle={styles.priceCardEditButton}
                    title="Edit"
                    titleStyle={styles.priceCardEditButtonTitle}
                />
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
                    value={is_available ? 'Available' : 'Unavailable'}
                    badgeStyle={styles.priceCardBadgeStyle}
                    textStyle={styles.priceCardBadgeText}
                />
            </View>
        </Card>
    )
}
