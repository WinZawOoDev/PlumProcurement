import { View, Text } from 'react-native'
import React from 'react'
import { Badge, Card, useTheme } from '@rneui/themed'
import { IPrice } from '../../database'


export default function PriceCard({ price, unit, category, isAvailable }: Omit<IPrice, 'id'>) {

    const { theme } = useTheme()

    return (
        <Card containerStyle={{
            width: '100%',
            borderRadius: 8,
            borderWidth: 0,
            marginHorizontal: 'auto',
            shadowColor: 'transparent',
            elevation: 0,
            shadowOpacity: 0,
            backgroundColor: theme.colors.white
        }}>
            <Card.Title
                style={{
                    letterSpacing: 0.5,
                    alignSelf: 'flex-start',
                    textAlign: 'left',
                    fontWeight: 'bold',
                    color: theme.colors.primary,
                    fontSize: 16,
                    fontFamily: 'Manrope',
                    textTransform: 'capitalize'
                }}
            >
                #{category}
            </Card.Title>
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ marginBottom: 10, fontWeight: 'thin', fontSize: 13, lineHeight: 17, fontFamily: 'Inter', color: theme.colors.tertiary }}>
                    Price
                </Text>
                <Text style={{ marginBottom: 10, fontWeight: 'bold', fontSize: 15, lineHeight: 17, fontFamily: 'Inter' }}>
                    {price}
                    <Text style={{ fontWeight: '700' }}> $</Text>
                </Text>
            </View>
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ marginBottom: 10, fontWeight: 'thin', fontSize: 13, lineHeight: 17, fontFamily: 'Inter', color: theme.colors.tertiary }}>
                    Unit
                </Text>
                <Text style={{ marginBottom: 10, fontWeight: 'bold', fontSize: 15, lineHeight: 17, fontFamily: 'Inter' }}>
                    {unit}
                </Text>
            </View>
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ marginBottom: 10, fontWeight: 'thin', fontSize: 13, lineHeight: 17, fontFamily: 'Inter', color: theme.colors.tertiary }}>
                    Category
                </Text>
                <Text style={{ marginBottom: 10, fontWeight: 'condensed', fontSize: 14, lineHeight: 17, fontFamily: 'Inter' }}>
                    {category}
                </Text>
            </View>
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ marginBottom: 10, fontWeight: 'thin', fontSize: 13, lineHeight: 17, fontFamily: 'Inter', color: theme.colors.tertiary }}>
                    Status
                </Text>
                <Badge
                    value={isAvailable ? 'Available' : 'Unavailable'}
                    badgeStyle={{ backgroundColor: theme.colors.neutral }}
                    textStyle={{ fontSize: 12, fontWeight: 'thin', color: theme.colors.black, fontFamily: 'Inter' }}
                />
            </View>
        </Card>
    )
}
