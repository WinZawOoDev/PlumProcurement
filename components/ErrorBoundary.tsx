import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { theme } from '../theme'

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
        backgroundColor: theme.lightColors?.background ?? '#F8F9FA',
        padding: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.lightColors?.primary ?? '#4E2A47',
        marginBottom: 8,
    },
    message: {
        fontSize: 14,
        color: '#1C1C1E',
        textAlign: 'center',
    },
})
