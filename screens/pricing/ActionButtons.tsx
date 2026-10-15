import { View } from 'react-native'
import React from 'react'
import { useTheme } from '@rneui/themed'
import Ionicons from '@react-native-vector-icons/ionicons'
import { IconButton } from '../../components/buttons/Button'
import { ROUTES, DIMENSIONS } from '../../constants'
import { useLocalizedConstants } from '../../hooks/useLocalizedConstants'
import { ParamListBase, useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useStyles } from '../../styles'
import { SearchIconButton } from '../../components/SearchIconButton'

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
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>()
    const { UI_TEXT, A11Y_LABELS } = useLocalizedConstants()

    return (
        <View style={styles.actionButtonsRow}>
            <IconButton
                small
                title={UI_TEXT.ADD_NEW_PRICE}
                icon={<Ionicons name="add-sharp" size={DIMENSIONS.ICON_SIZE_SMALL} color="white" />}
                variant="primary"
                onPress={() => navigation.navigate(ROUTES.CREATE_PRICE)}
                accessibilityLabel={UI_TEXT.ADD_NEW_PRICE}
            />
            <SearchIconButton
                active={searchActive}
                onPress={onSearchPress}
                accessibilityLabel={A11Y_LABELS.TOGGLE_SEARCH}
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
                        size={DIMENSIONS.ICON_SIZE_MEDIUM}
                        color={sortActive ? theme.colors.primary : theme.colors.grey4}
                    />
                }
                variant="ghost"
                onPress={onSortPress}
                accessibilityLabel={UI_TEXT.SORT_PRICES}
                accessibilityState={{ selected: sortActive }}
            />
        </View>
    )
}
