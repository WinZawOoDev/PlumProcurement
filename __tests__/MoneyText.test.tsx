import React from 'react'
import ReactTestRenderer, { act } from 'react-test-renderer'
import { StyleSheet, Text as RNText } from 'react-native'
import { MoneyText } from '../components/MoneyText'

const renderMoney = async (props: React.ComponentProps<typeof MoneyText>) => {
    let root!: ReactTestRenderer.ReactTestRenderer
    await act(async () => {
        root = ReactTestRenderer.create(<MoneyText {...props} />)
    })
    return root
}

describe('MoneyText', () => {
    test('renders the value and currency as separate nodes', async () => {
        const root = await renderMoney({ amount: 10, valueStyle: { fontSize: 20 } })

        const texts = root.root.findAllByType(RNText)
        expect(texts).toHaveLength(2)
        // Numeric value keeps the caller's style.
        expect(texts[0].props.children[0]).toBe('10.00')
        // Currency is a distinct node with a leading space.
        const currencyChildren = texts[1].props.children as unknown[]
        expect(currencyChildren.join('')).toContain('$')
    })

    test('currency defaults to a smaller, de-emphasized style', async () => {
        const root = await renderMoney({ amount: 10, valueStyle: { fontSize: 20 } })

        const texts = root.root.findAllByType(RNText)
        const currencyStyle = StyleSheet.flatten(texts[1].props.style)
        expect(currencyStyle.fontSize).toBeLessThan(20)
        expect(currencyStyle.fontWeight).toBe('400')
    })

    test('currency style can be overridden per call site', async () => {
        const root = await renderMoney({
            amount: 10,
            valueStyle: { fontSize: 20 },
            currencyStyle: { fontSize: 9, opacity: 1 },
        })

        const texts = root.root.findAllByType(RNText)
        const currencyStyle = StyleSheet.flatten(texts[1].props.style)
        expect(currencyStyle.fontSize).toBe(9)
        expect(currencyStyle.opacity).toBe(1)
    })
})
