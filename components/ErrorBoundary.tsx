import React from 'react'
import { Appearance, View, Text, StyleSheet } from 'react-native'
import { makeAppTheme } from '../theme'
import i18n from '../i18n'
import { MYANMAR_FONT_FAMILY, MYANMAR_FONT_FAMILY_BOLD } from '../styles/fonts'

const isDark = Appearance.getColorScheme() === 'dark'
const appTheme = makeAppTheme(isDark)
const palette = (isDark ? appTheme.darkColors : appTheme.lightColors) ?? {}

interface ErrorBoundaryProps {
    children: React.ReactNode
}

interface ErrorBoundaryState {
    hasError: boolean
    message: string
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { hasError: false, message: '' }

    static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
        return {
            hasError: true,
            message: error instanceof Error ? error.message : String(error),
        }
    }

    componentDidCatch(error: unknown) {
        console.error('Unhandled error caught by ErrorBoundary:', error)
    }

    render() {
        if (this.state.hasError) {
            const isMyanmar = i18n.language === 'my'
            return (
                <View style={fallbackStyles.container}>
                    <Text style={[fallbackStyles.title, isMyanmar && fallbackStyles.myanmarBold]}>{i18n.t('uiText.SOMETHING_WENT_WRONG')}</Text>
                    <Text style={[fallbackStyles.message, isMyanmar && fallbackStyles.myanmar]}>{this.state.message}</Text>
                </View>
            )
        }
        return this.props.children
    }
}

const fallbackStyles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: palette.background ?? '#121212',
        padding: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: palette.primary ?? '#D8A7CA',
        marginBottom: 8,
    },
    message: {
        fontSize: 14,
        color: palette.black ?? '#ECECEC',
        textAlign: 'center',
    },
    myanmar: {
        fontFamily: MYANMAR_FONT_FAMILY,
    },
    myanmarBold: {
        fontFamily: MYANMAR_FONT_FAMILY_BOLD,
    },
})
