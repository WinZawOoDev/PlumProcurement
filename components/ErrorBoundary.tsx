import React from 'react'
import { ErrorFallback } from './ErrorFallback'
import i18n from '../i18n'

interface ErrorBoundaryProps {
    children: React.ReactNode
    /** Drives the fallback palette; read at render so in-app theme changes apply. */
    isDarkMode?: boolean
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

    private handleRetry = () => {
        this.setState({ hasError: false, message: '' })
    }

    render() {
        if (this.state.hasError) {
            return (
                <ErrorFallback
                    message={this.state.message || i18n.t('messages.ERROR_GENERIC')}
                    isDarkMode={this.props.isDarkMode ?? false}
                    onRetry={this.handleRetry}
                />
            )
        }
        return this.props.children
    }
}
