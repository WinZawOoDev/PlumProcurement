import React from 'react'
import ReactTestRenderer, { act } from 'react-test-renderer'
import { Input } from '@rneui/themed'
import { ThemeProvider } from '@rneui/themed'
import EditPrice from '../screens/pricing/EditPrice'
import { PrimaryButton } from '../components/buttons/Button'
import { VALIDATION_MESSAGES } from '../constants'
import { IPrice } from '../types/database'
import { makeAppTheme } from '../theme'

const editPrice = jest.fn()
const onClose = jest.fn()

jest.mock('../context/PriceContext', () => ({
    usePrices: jest.fn(),
}))

import { usePrices } from '../context/PriceContext'
const mockUsePrices = usePrices as jest.Mock

const mockPrice: IPrice = {
    id: 7,
    price: 10,
    unit: 'CUP',
    category: 'fruit',
    is_available: true,
}

const flush = async () => {
    for (let i = 0; i < 3; i++) {
        await new Promise<void>((resolve) => setTimeout(resolve, 0))
    }
}

const renderSheet = async () => {
    let root!: ReactTestRenderer.ReactTestRenderer
    await act(async () => {
        root = ReactTestRenderer.create(
            <ThemeProvider theme={makeAppTheme(false)}>
                <EditPrice visible={true} price={mockPrice} onClose={onClose} />
            </ThemeProvider>
        )
        await flush()
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

const priceInput = (root: ReactTestRenderer.ReactTestRenderer) => root.root.findByType(Input)

beforeEach(() => {
    jest.clearAllMocks()
    mockUsePrices.mockReturnValue({
        prices: [mockPrice],
        loading: false,
        refresh: jest.fn(),
        addPrice: jest.fn(),
        editPrice,
        removePrice: jest.fn(),
    })
    editPrice.mockResolvedValue(undefined)
})

describe('EditPrice sheet', () => {
    test('pre-fills the form from the selected price', async () => {
        const root = await renderSheet()
        expect(priceInput(root).props.value).toBe('10')
        expect(textContent(root)).toContain('Edit Price')
    })

    test('saves the updated price and closes', async () => {
        const root = await renderSheet()
        await act(async () => {
            priceInput(root).props.onChangeText('15')
        })
        await act(async () => {
            root.root.findByType(PrimaryButton).props.onPress()
            await flush()
        })

        expect(editPrice).toHaveBeenCalledWith(7, {
            price: 15,
            category: 'fruit',
            unit: 'CUP',
            is_available: true,
        })
        expect(onClose).toHaveBeenCalledTimes(1)
    })

    test('blocks submit for an invalid price pattern', async () => {
        const root = await renderSheet()
        await act(async () => {
            priceInput(root).props.onChangeText('abc')
        })
        await act(async () => {
            root.root.findByType(PrimaryButton).props.onPress()
            await flush()
        })

        expect(editPrice).not.toHaveBeenCalled()
        expect(onClose).not.toHaveBeenCalled()
        expect(textContent(root)).toContain(VALIDATION_MESSAGES.PRICE_INVALID)
    })
})
