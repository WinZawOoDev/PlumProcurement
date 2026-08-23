import React from 'react'
import { Appearance, View, Text, StyleSheet } from 'react-native'
import { makeAppTheme } from '../theme'

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
            return (
                <View style={fallbackStyles.container}>
                    <Text style={fallbackStyles.title}>Something went wrong</Text>
                    <Text style={fallbackStyles.message}>{this.state.message}</Text>
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
})
