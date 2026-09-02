import React from 'react'
import ReactTestRenderer, { act } from 'react-test-renderer'
import { Input } from '@rneui/themed'
import { ThemeProvider } from '@rneui/themed'
import CreatePrice from '../screens/pricing/CreatePrice'
import { PrimaryButton } from '../components/buttons/Button'
import { VALIDATION_MESSAGES } from '../constants'
import { makeAppTheme } from '../theme'

const addPrice = jest.fn()
const mockPopTo = jest.fn()

jest.mock('../context/PriceContext', () => ({
    usePrices: jest.fn(),
}))
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ navigate: jest.fn(), popTo: mockPopTo, goBack: jest.fn() }),
}))

import { usePrices } from '../context/PriceContext'
const mockUsePrices = usePrices as jest.Mock

const flush = async () => {
    for (let i = 0; i < 3; i++) {
        await new Promise<void>((resolve) => setTimeout(resolve, 0))
    }
}

const renderScreen = async () => {
    let root!: ReactTestRenderer.ReactTestRenderer
    await act(async () => {
        root = ReactTestRenderer.create(
            <ThemeProvider theme={makeAppTheme(false)}>
                <CreatePrice />
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
        prices: [],
        loading: false,
        refresh: jest.fn(),
        addPrice,
        editPrice: jest.fn(),
        removePrice: jest.fn(),
    })
    addPrice.mockResolvedValue(1)
})

describe('CreatePrice screen', () => {
    test('renders with category/unit defaults and a required price field', async () => {
        const root = await renderScreen()
        const text = textContent(root)
        expect(text).toContain('Price *')
        expect(text).toContain('Category *')
        expect(text).toContain('Unit *')
        // defaults applied (unit CUP is the first button group option)
        const buttonGroup = root.root.findAllByProps({ selectedIndex: 0 })
        expect(buttonGroup.length).toBeGreaterThan(0)
    })

    test('blocks submit without a price', async () => {
        const root = await renderScreen()
        await act(async () => {
            root.root.findByType(PrimaryButton).props.onPress()
            await flush()
        })

        expect(addPrice).not.toHaveBeenCalled()
        expect(textContent(root)).toContain(VALIDATION_MESSAGES.PRICE_REQUIRED)
    })

    test('saves with default category/unit and parsed price', async () => {
        const root = await renderScreen()
        await act(async () => {
            priceInput(root).props.onChangeText('12.50')
        })
        await act(async () => {
            root.root.findByType(PrimaryButton).props.onPress()
            await flush()
        })

        expect(addPrice).toHaveBeenCalledWith({
            category: 'fruit',
            price: 12.5,
            unit: 'CUP',
            is_available: false,
        })
        expect(mockPopTo).toHaveBeenCalledTimes(1)
    })
    test('rejects invalid price patterns', async () => {
        const root = await renderScreen()
        await act(async () => {
            priceInput(root).props.onChangeText('12.505')
        })
        await act(async () => {
            root.root.findByType(PrimaryButton).props.onPress()
            await flush()
        })

        expect(addPrice).not.toHaveBeenCalled()
        expect(textContent(root)).toContain(VALIDATION_MESSAGES.PRICE_INVALID)
    })
})
