import React from 'react'
import ReactTestRenderer, { act } from 'react-test-renderer'
import { ThemeProvider } from '@rneui/themed'
import { PriceDetailSheet } from '../components/PriceDetailSheet'
import { PrimaryButton, SecondaryButton } from '../components/buttons/Button'
import { makeAppTheme } from '../theme'
import { IPrice } from '../types/database'

const price: IPrice = {
    id: 4,
    price: 12.5,
    unit: 'CUP',
    category: 'fruit',
    created_at: '2026-09-01 10:00:00',
}

const renderSheet = async (props?: Partial<React.ComponentProps<typeof PriceDetailSheet>>) => {
    let root!: ReactTestRenderer.ReactTestRenderer
    await act(async () => {
        root = ReactTestRenderer.create(
            <ThemeProvider theme={makeAppTheme(false)}>
                <PriceDetailSheet
                    visible
                    price={price}
                    onClose={jest.fn()}
                    {...props}
                />
            </ThemeProvider>
        )
    })
    return root
}

const textContent = (root: ReactTestRenderer.ReactTestRenderer) => {
    const { Text: RNText } = require('react-native')
    return root.root
        .findAllByType(RNText)
        .map((t) => (Array.isArray(t.props.children) ? t.props.children.join('') : String(t.props.children)))
        .join(' ')
}

describe('PriceDetailSheet', () => {
    test('renders the price hero with localized unit and currency', async () => {
        const root = await renderSheet()
        const text = textContent(root)

        expect(text).toContain('12.50')
        expect(text).toContain('Fruit')
    })

    test('renders nothing without a price', async () => {
        const root = await renderSheet({ price: null })
        expect(root.toJSON()).toBeNull()
    })

    test('edit and delete actions call back with the price', async () => {
        const onEdit = jest.fn()
        const onDelete = jest.fn()
        const root = await renderSheet({ onEdit, onDelete })

        await act(async () => {
            root.root.findByType(PrimaryButton).props.onPress()
        })
        expect(onEdit).toHaveBeenCalledWith(price)

        await act(async () => {
            root.root.findByType(SecondaryButton).props.onPress()
        })
        expect(onDelete).toHaveBeenCalledWith(price.id)
    })

    test('hides actions when no callbacks are given', async () => {
        const root = await renderSheet({ onEdit: undefined, onDelete: undefined })
        expect(root.root.findAllByType(PrimaryButton)).toHaveLength(0)
        expect(root.root.findAllByType(SecondaryButton)).toHaveLength(0)
    })
})
