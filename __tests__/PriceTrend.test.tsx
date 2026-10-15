import React from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import { ThemeProvider } from '@rneui/themed'
import { makeAppTheme } from '../theme'
import { PriceTrend } from '../components/PriceTrend'
import { IPrice } from '../types/database'

const prices: IPrice[] = [
    { id: 1, price: 10, unit: 'CUP', category: 'fruit', created_at: '2026-08-27 10:00:00' },
    { id: 2, price: 20, unit: 'GALLON', category: 'seed', created_at: '2026-08-27 11:00:00' },
]

const renderTrend = (onSelect?: (price: IPrice) => void) =>
    render(
        <ThemeProvider theme={makeAppTheme(false)}>
            <PriceTrend prices={prices} onSelect={onSelect} />
        </ThemeProvider>
    )

test('renders the trend summary with the localized average', () => {
    const { getByText } = renderTrend()
    expect(getByText(/Price Trend \(2 items\)/)).toBeTruthy()
})

test('fires onSelect with the tapped price bar', () => {
    const onSelect = jest.fn()
    const { getAllByRole } = renderTrend(onSelect)
    const bars = getAllByRole('button')
    expect(bars).toHaveLength(2)
    fireEvent.press(bars[1])
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith(prices[1])
})

test('renders nothing for an empty price list', () => {
    const { toJSON } = render(
        <ThemeProvider theme={makeAppTheme(false)}>
            <PriceTrend prices={[]} />
        </ThemeProvider>
    )
    expect(toJSON()).toBeNull()
})
