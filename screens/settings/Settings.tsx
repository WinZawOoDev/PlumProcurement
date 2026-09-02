import React from 'react'
import { View } from 'react-native'
import { Text } from '@rneui/themed'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useStyles } from '../../styles'
import { SAFE_AREA, THEME_MODES, ThemeMode, UI_TEXT } from '../../constants'
import { useThemeMode } from '../../context/ThemeModeContext'
import { SectionHeader } from '../../components/SectionHeader'
import { SelectPicker } from '../../components/SelectPicker'

const THEME_MODE_LABELS: Record<ThemeMode, string> = {
    system: UI_TEXT.THEME_MODE_SYSTEM,
    light: UI_TEXT.THEME_MODE_LIGHT,
    dark: UI_TEXT.THEME_MODE_DARK,
}

export default function Settings() {
    const styles = useStyles()
    const { mode, setMode } = useThemeMode()

    return (
        <SafeAreaView edges={SAFE_AREA.EDGES} style={styles.priceListScreen}>
            <View style={styles.priceListContainer}>
                <SectionHeader icon="settings-outline" title={UI_TEXT.SETTINGS} description={UI_TEXT.SETTINGS_DESCRIPTION} />

                <View style={styles.settingsCard}>
                    <View style={styles.settingsRow}>
                        <Text style={styles.settingsLabel}>{UI_TEXT.THEME}</Text>
                    </View>
                    <View style={styles.settingsPickerWrapper}>
                        <SelectPicker
                            label={UI_TEXT.THEME}
                            selectedValue={mode}
                            onValueChange={(value) => setMode(value as ThemeMode)}
                            items={THEME_MODES.map((m) => ({ label: THEME_MODE_LABELS[m], value: m }))}
                        />
                    </View>
                </View>
            </View>
        </SafeAreaView>
    )
}
