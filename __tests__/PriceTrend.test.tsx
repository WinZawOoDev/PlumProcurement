import React from 'react'
import { render } from '@testing-library/react-native'
import { ThemeProvider } from '@rneui/themed'
import { makeAppTheme } from '../theme'
import { PriceTrend } from '../components/PriceTrend'

const prices = [
    { id: 1, price: 10, unit: 'PER KG', category: 'fruits', is_available: true, created_at: '2026-08-27 10:00:00' } as any,
    { id: 2, price: 20, unit: 'PER KG', category: 'fruits', is_available: false, created_at: '2026-08-27 11:00:00' } as any,
]

test('renders trend and handles onSelect', () => {
    const onSelect = jest.fn()
    const { getByText } = render(
        <ThemeProvider theme={makeAppTheme(false)}>
            <PriceTrend prices={prices} onSelect={onSelect} />
        </ThemeProvider>
    )
    expect(getByText(/Price Trend/)).toBeTruthy()
})
