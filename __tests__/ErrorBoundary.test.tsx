import React from 'react'
import { Text } from 'react-native'
import ReactTestRenderer, { act } from 'react-test-renderer'
import { ErrorBoundary } from '../components/ErrorBoundary'

function Bomb(): never {
    throw new Error('boom')
}

test('renders children when no error occurs', () => {
    let renderer!: ReactTestRenderer.ReactTestRenderer
    act(() => {
        renderer = ReactTestRenderer.create(
            <ErrorBoundary>
                <Text>ok</Text>
            </ErrorBoundary>
        )
    })
    expect(renderer.root.findByProps({ children: 'ok' })).toBeTruthy()
})

test('renders fallback UI when a child throws', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    let renderer!: ReactTestRenderer.ReactTestRenderer
    act(() => {
        renderer = ReactTestRenderer.create(
            <ErrorBoundary>
                <Bomb />
            </ErrorBoundary>
        )
    })
    expect(renderer.root.findByProps({ children: 'Something went wrong' })).toBeTruthy()
    spy.mockRestore()
})
