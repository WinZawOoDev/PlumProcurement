import { View } from 'react-native'
import React from 'react'
import { useTheme } from '@rneui/themed'
import Ionicons from '@react-native-vector-icons/ionicons'
import { IconButton } from '../../components/buttons/Button'
import { UI_TEXT, ROUTES, DIMENSIONS } from '../../constants'
import { useNavigation } from '@react-navigation/native'
import { useStyles } from '../../styles'

interface ActionButtonsProps {
    searchActive?: boolean
    onSearchPress?: () => void
    sortActive?: boolean
    sortDirection?: 'asc' | 'desc'
    onSortPress?: () => void
}

export default function ActionButtons({
    searchActive = false,
    onSearchPress,
    sortActive = false,
    sortDirection,
    onSortPress,
}: ActionButtonsProps) {
    const styles = useStyles()
    const { theme } = useTheme()
    const navigation = useNavigation()

    return (
        <View style={styles.actionButtonsRow}>
            <IconButton
                title={UI_TEXT.ADD_NEW_PRICE}
                icon={<Ionicons name="add-sharp" size={DIMENSIONS.ICON_SIZE_SMALL} color="white" />}
                variant="primary"
                //@ts-expect-error
                onPress={() => navigation.navigate(ROUTES.CREATE_PRICE)}
            />
            <IconButton
                icon={
                    <Ionicons
                        name={searchActive ? 'search' : 'search-outline'}
                        size={DIMENSIONS.ICON_SIZE_SMALL}
                        color={searchActive ? theme.colors.primary : theme.colors.grey4}
                    />
                }
                variant="ghost"
                onPress={onSearchPress}
            />
            <IconButton
                icon={
                    <Ionicons
                        name={
                            !sortActive
                                ? 'funnel-outline'
                                : sortDirection === 'asc'
                                    ? 'arrow-up'
                                    : 'arrow-down'
                        }
                        size={DIMENSIONS.ICON_SIZE_SMALL}
                        color={sortActive ? theme.colors.primary : theme.colors.grey4}
                    />
                }
                variant="ghost"
                onPress={onSortPress}
            />
        </View>
    )
}
