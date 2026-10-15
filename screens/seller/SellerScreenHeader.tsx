import React from 'react'
import { Text as RNText, View } from 'react-native'
import Ionicons from '@react-native-vector-icons/ionicons'
import { useTheme } from '@rneui/themed'
import { useStyles } from '../../styles'
import { useLocalizedConstants } from '../../hooks/useLocalizedConstants'
import { IconButton } from '../../components/buttons/Button'

interface SellerScreenHeaderProps {
    title: string
    onBack: () => void
}

/** Back row shared by the seller detail, payment history and purchase history screens. */
export function SellerScreenHeader({ title, onBack }: SellerScreenHeaderProps) {
    const styles = useStyles()
    const { theme } = useTheme()
    const { A11Y_LABELS } = useLocalizedConstants()
    return (
        <View style={styles.sellerDetailsBackRow}>
            <IconButton
                icon={<Ionicons name="arrow-back" size={22} color={theme.colors.primary} />}
                variant="ghost"
                onPress={onBack}
                accessibilityLabel={A11Y_LABELS.GO_BACK}
            />
            <RNText style={styles.sellerDetailsBackTitle}>{title}</RNText>
        </View>
    )
}
