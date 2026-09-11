import React from 'react'
import { Pressable, ScrollView, Text as RNText, View } from 'react-native'
import { useTheme } from '@rneui/themed'
import { SafeAreaView } from 'react-native-safe-area-context'
import Ionicons from '@react-native-vector-icons/ionicons'
import { useStyles } from '../../styles'
import { LANGUAGES, Language, SAFE_AREA, THEME_MODES, ThemeMode } from '../../constants'
import { useThemeMode } from '../../context/ThemeModeContext'
import { useLanguage } from '../../context/LanguageContext'
import { useLocalizedConstants } from '../../hooks/useLocalizedConstants'
import { SectionHeader } from '../../components/SectionHeader'
import { lightHaptic } from '../../utils/haptics'

const THEME_MODE_ICONS: Record<ThemeMode, string> = {
    system: 'phone-portrait-outline',
    light: 'sunny-outline',
    dark: 'moon-outline',
}

const LANGUAGE_ICONS: Record<Language, string> = {
    en: 'globe-outline',
    my: 'language-outline',
}

function SettingsSectionHeader({ icon, title, description }: { icon: string; title: string; description: string }) {
    const styles = useStyles()
    const { theme } = useTheme()
    return (
        <View style={styles.settingsSectionHeaderRow}>
            <View style={styles.settingsSectionIconCircle}>
                <Ionicons name={icon as any} size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.settingsSectionTextBlock}>
                <RNText style={styles.settingsSectionTitle}>{title}</RNText>
                <RNText style={styles.settingsSectionDescription}>{description}</RNText>
            </View>
        </View>
    )
}

function ThemeModeTile({ mode, selected, onPress }: { mode: ThemeMode; selected: boolean; onPress: () => void }) {
    const styles = useStyles()
    const { theme } = useTheme()
    const { UI_TEXT, A11Y_LABELS: a11y } = useLocalizedConstants()

    const labels: Record<ThemeMode, string> = {
        system: UI_TEXT.THEME_MODE_SYSTEM,
        light: UI_TEXT.THEME_MODE_LIGHT,
        dark: UI_TEXT.THEME_MODE_DARK,
    }
    const hints: Record<ThemeMode, string> = {
        system: UI_TEXT.THEME_MODE_SYSTEM_HINT,
        light: UI_TEXT.THEME_MODE_LIGHT_HINT,
        dark: UI_TEXT.THEME_MODE_DARK_HINT,
    }

    return (
        <Pressable
            onPress={onPress}
            hitSlop={4}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={`${a11y.SELECT_THEME_MODE}: ${labels[mode]}`}
            style={({ pressed }) => [
                styles.settingsThemeOption,
                selected && styles.settingsThemeOptionSelected,
                pressed && styles.settingsThemeOptionPressed,
            ]}
        >
            <View
                style={[
                    styles.settingsThemeOptionIconCircle,
                    selected && styles.settingsThemeOptionIconCircleSelected,
                ]}
            >
                <Ionicons
                    name={THEME_MODE_ICONS[mode] as any}
                    size={18}
                    color={selected ? theme.colors.white : theme.colors.primary}
                />
            </View>
            <RNText
                style={[
                    styles.settingsThemeOptionLabel,
                    selected && styles.settingsThemeOptionLabelSelected,
                ]}
            >
                {labels[mode]}
            </RNText>
            <RNText style={styles.settingsThemeOptionHint}>{hints[mode]}</RNText>
        </Pressable>
    )
}

function AppearanceSection({ mode, onSelect }: { mode: ThemeMode; onSelect: (mode: ThemeMode) => void }) {
    const styles = useStyles()
    const { UI_TEXT } = useLocalizedConstants()
    return (
        <View style={styles.settingsSectionCard}>
            <SettingsSectionHeader
                icon="contrast-outline"
                title={UI_TEXT.APPEARANCE}
                description={UI_TEXT.APPEARANCE_DESCRIPTION}
            />
            <View style={styles.settingsThemeOptionsRow}>
                {THEME_MODES.map((m) => (
                    <ThemeModeTile key={m} mode={m} selected={mode === m} onPress={() => onSelect(m)} />
                ))}
            </View>
        </View>
    )
}

function LanguageTile({ language, selected, onPress }: { language: Language; selected: boolean; onPress: () => void }) {
    const styles = useStyles()
    const { theme } = useTheme()
    const { UI_TEXT } = useLocalizedConstants()

    const labels: Record<Language, string> = {
        en: UI_TEXT.LANGUAGE_EN,
        my: UI_TEXT.LANGUAGE_MY,
    }
    const hints: Record<Language, string> = {
        en: UI_TEXT.LANGUAGE_EN_HINT,
        my: UI_TEXT.LANGUAGE_MY_HINT,
    }

    return (
        <Pressable
            onPress={onPress}
            hitSlop={4}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={labels[language]}
            style={({ pressed }) => [
                styles.settingsThemeOption,
                selected && styles.settingsThemeOptionSelected,
                pressed && styles.settingsThemeOptionPressed,
            ]}
        >
            <View
                style={[
                    styles.settingsThemeOptionIconCircle,
                    selected && styles.settingsThemeOptionIconCircleSelected,
                ]}
            >
                <Ionicons
                    name={LANGUAGE_ICONS[language] as any}
                    size={18}
                    color={selected ? theme.colors.white : theme.colors.primary}
                />
            </View>
            <RNText
                style={[
                    styles.settingsThemeOptionLabel,
                    selected && styles.settingsThemeOptionLabelSelected,
                ]}
            >
                {labels[language]}
            </RNText>
            <RNText style={styles.settingsThemeOptionHint}>{hints[language]}</RNText>
        </Pressable>
    )
}

function LanguageSection({ language, onSelect }: { language: Language; onSelect: (language: Language) => void }) {
    const styles = useStyles()
    const { UI_TEXT } = useLocalizedConstants()
    return (
        <View style={styles.settingsSectionCard}>
            <SettingsSectionHeader
                icon="language-outline"
                title={UI_TEXT.LANGUAGE}
                description={UI_TEXT.LANGUAGE_DESCRIPTION}
            />
            <View style={styles.settingsThemeOptionsRow}>
                {LANGUAGES.map((l) => (
                    <LanguageTile key={l} language={l} selected={language === l} onPress={() => onSelect(l)} />
                ))}
            </View>
        </View>
    )
}

function ThemePreviewSection({ mode }: { mode: ThemeMode }) {
    const styles = useStyles()
    const { theme } = useTheme()
    const { UI_TEXT } = useLocalizedConstants()

    const labels: Record<ThemeMode, string> = {
        system: UI_TEXT.THEME_MODE_SYSTEM,
        light: UI_TEXT.THEME_MODE_LIGHT,
        dark: UI_TEXT.THEME_MODE_DARK,
    }

    return (
        <View style={styles.settingsSectionCard}>
            <SettingsSectionHeader
                icon="eye-outline"
                title={UI_TEXT.THEME_PREVIEW_TITLE}
                description={UI_TEXT.THEME_PREVIEW_DESCRIPTION}
            />
            <View style={styles.settingsPreviewRow}>
                <View style={styles.settingsPreviewDot}>
                    <Ionicons name="pricetag-outline" size={20} color={theme.colors.white} />
                </View>
                <View style={styles.settingsPreviewTextBlock}>
                    <View style={[styles.settingsPreviewBar, styles.settingsPreviewBarWide]} />
                    <View style={[styles.settingsPreviewBar, styles.settingsPreviewBarNarrow]} />
                </View>
                <View style={styles.settingsPreviewPill}>
                    <RNText style={[styles.settingsThemeOptionLabel, styles.settingsThemeOptionLabelSelected]}>
                        {labels[mode]}
                    </RNText>
                </View>
            </View>
        </View>
    )
}

function DataStorageSection() {
    const styles = useStyles()
    const { UI_TEXT } = useLocalizedConstants()
    return (
        <View style={styles.settingsSectionCard}>
            <SettingsSectionHeader
                icon="server-outline"
                title={UI_TEXT.DATA_STORAGE}
                description={UI_TEXT.DATA_STORAGE_DESCRIPTION}
            />
        </View>
    )
}

function AboutSection() {
    const styles = useStyles()
    const { UI_TEXT } = useLocalizedConstants()
    return (
        <View style={styles.settingsSectionCard}>
            <SettingsSectionHeader
                icon="information-circle-outline"
                title={UI_TEXT.ABOUT}
                description={UI_TEXT.APP_TAGLINE}
            />
            <View style={styles.settingsAboutNameRow}>
                <RNText style={styles.settingsAppName}>{UI_TEXT.APP_NAME}</RNText>
                <View style={styles.settingsVersionPill}>
                    <RNText style={styles.settingsVersionText}>{UI_TEXT.APP_VERSION}</RNText>
                </View>
            </View>
        </View>
    )
}

export default function Settings() {
    const styles = useStyles()
    const { mode, setMode } = useThemeMode()
    const { language, setLanguage } = useLanguage()
    const { UI_TEXT } = useLocalizedConstants()

    const handleSelectMode = (next: ThemeMode) => {
        if (next === mode) return
        lightHaptic()
        setMode(next)
    }

    const handleSelectLanguage = (next: Language) => {
        if (next === language) return
        lightHaptic()
        setLanguage(next)
    }

    return (
        <SafeAreaView edges={SAFE_AREA.EDGES} style={styles.priceListScreen}>
            <View style={[styles.priceListContainer, styles.fillContainer]}>
                <SectionHeader icon="settings-outline" title={UI_TEXT.SETTINGS} description={UI_TEXT.SETTINGS_DESCRIPTION} />

                <ScrollView
                    style={styles.fillContainer}
                    contentContainerStyle={styles.settingsScrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <LanguageSection language={language} onSelect={handleSelectLanguage} />
                    <AppearanceSection mode={mode} onSelect={handleSelectMode} />
                    <ThemePreviewSection mode={mode} />
                    <DataStorageSection />
                    <AboutSection />

                    <RNText style={styles.settingsFooterNote}>{UI_TEXT.SETTINGS_FOOTER_NOTE}</RNText>
                </ScrollView>
            </View>
        </SafeAreaView>
    )
}
