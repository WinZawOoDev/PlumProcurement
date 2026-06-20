import { View } from 'react-native'
import React, { useState } from 'react'
import { Text } from '@rneui/base'
import { useStyles } from '../../styles'
import { PrimaryButton } from '../../components/buttons/Button'
import { UI_TEXT } from '../../constants'

export default function Purchase() {
    const [count, setCount] = useState(0)
    const styles = useStyles()

    return (
        <View style={styles.screenContainer}>
            <View style={styles.purchaseContainer}>
                <Text h4>{UI_TEXT.PLUM_COUNT_TITLE}</Text>
            </View>
            <View style={styles.plumCountDisplayContainer}>
                <View style={styles.plumCountCircle}>
                    <Text style={styles.plumCountText}>{count}</Text>
                </View>
            </View>
            <View style={styles.purchaseContainer}>
                <PrimaryButton
                    title={UI_TEXT.COUNT}
                    containerStyle={styles.countButtonContainer}
                    onPress={() => setCount(prev => prev + 1)}
                />
            </View>
        </View>
    )
}