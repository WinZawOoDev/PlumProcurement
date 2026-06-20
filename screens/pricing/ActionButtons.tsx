import { View } from 'react-native'
import React from 'react'
import { useStyles } from '../../styles'
import { useTheme } from '@rneui/themed'
import Ionicons from '@react-native-vector-icons/ionicons'
import { useNavigation } from '@react-navigation/native'
import { IconButton } from '../../components/buttons/Button'
import { UI_TEXT, ROUTES, DIMENSIONS } from '../../constants'

export default function ActionButtons() {
    const styles = useStyles()
    const { theme } = useTheme()
    const navigation = useNavigation()

    return (
        <View style={styles.actionButtonsRow}>
            <IconButton
                title={UI_TEXT.ADD_NEW_PRICE}
                icon={<Ionicons name="add-sharp" size={DIMENSIONS.ICON_SIZE_MEDIUM} color="white" />}
                variant="primary"
                //@ts-expect-error
                onPress={() => navigation.navigate(ROUTES.CREATE_PRICE)}
            />
            <IconButton
                icon={<Ionicons name="search-outline" size={DIMENSIONS.ICON_SIZE_LARGE} color={theme.colors.tertiary} />}
                variant="secondary"
            />
        </View>
    )
}