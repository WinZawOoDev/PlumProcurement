import React from 'react'
import { View, type StyleProp, type ViewStyle } from 'react-native'
import { useStyles } from '../styles'
import { useOrientation } from '../hooks/useOrientation'

interface ResponsiveContainerProps {
    children: React.ReactNode
    style?: StyleProp<ViewStyle>
    testID?: string
}

/**
 * Centers screen content and caps its width so portrait phones stay
 * full-bleed while landscape/tablet layouts don't stretch edge-to-edge.
 * Must sit inside the full-bleed screen (SafeAreaView) as the flex:1 child.
 */
export function ResponsiveContainer({ children, style, testID }: ResponsiveContainerProps) {
    const styles = useStyles()
    const { isLandscape } = useOrientation()
    return (
        <View
            testID={testID}
            style={[
                styles.responsiveContent,
                isLandscape && styles.responsiveContentLandscape,
                style,
            ]}
        >
            {children}
        </View>
    )
}

export default ResponsiveContainer
