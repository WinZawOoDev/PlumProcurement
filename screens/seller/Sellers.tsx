import { View, Text } from 'react-native'
import React from 'react'
import { useStyles } from '../../styles'
import { UI_TEXT } from '../../constants'

export default function Sellers() {
    const styles = useStyles()

    return (
        <View style={styles.sellersContainer}>
            <Text>{UI_TEXT.SELLERS}</Text>
        </View>
    )
}