import React from 'react'
import ReactTestRenderer, { act } from 'react-test-renderer'
import { Alert } from 'react-native'
import { ThemeProvider } from '@rneui/themed'
import EditPurchase from '../screens/purchasing/EditPurchase'
import { PrimaryButton } from '../components/buttons/Button'
import { purchaseService } from '../services/purchaseService'
import { A11Y_LABELS, UI_TEXT, CATEGORY_LABELS } from '../constants'
import { IPurchaseDetail } from '../types/database'
import { makeAppTheme } from '../theme'

jest.mock('../services/purchaseService', () => ({
    purchaseService: { editPurchase: jest.fn() },
}))

const mockGoBack = jest.fn()
const mockDispatch = jest.fn()
const mockUnsubscribe = jest.fn()
const mockAddListener = jest.fn((_event: string, _listener: (event: unknown) => void) => mockUnsubscribe)
const mockNavigation = { goBack: mockGoBack, dispatch: mockDispatch, addListener: mockAddListener }

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => mockNavigation,
    useRoute: () => ({ params: { purchase: mockPurchase } }),
}))

const mockPurchase: IPurchaseDetail = {
    id: 3,
    seller_id: 2,
    total: 10,
    seller_name: 'U Ba',
    items: [
        {
            id: 31,
            purchase_id: 3,
            price_id: 1,
            category: 'fruit',
            unit: 'CUP',
            unit_price: 5,
            quantity: 2,
            line_total: 10,
        },
    ],
}

const renderScreen = async () => {
    let root!: ReactTestRenderer.ReactTestRenderer
    await act(async () => {
        root = ReactTestRenderer.create(
            <ThemeProvider theme={makeAppTheme(false)}>
                <EditPurchase />
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

const findIncrease = (root: ReactTestRenderer.ReactTestRenderer) =>
    root.root.findAllByProps({
        accessibilityLabel: `${A11Y_LABELS.INCREASE_QUANTITY} ${CATEGORY_LABELS.fruit}`,
    })[0]

beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(Alert, 'alert').mockImplementation(() => {})
    ;(purchaseService.editPurchase as jest.Mock).mockResolvedValue(undefined)
})

describe('EditPurchase screen', () => {
    test('shows item info, seller name and the pre-filled total', async () => {
        const root = await renderScreen()
        const text = textContent(root)
        expect(text).toContain(UI_TEXT.EDIT_PURCHASE)
        expect(text).toContain(CATEGORY_LABELS.fruit)
        expect(text).toContain('U Ba')
        expect(text).toContain('10.00$')
    })

    test('recomputes the total preview from the quantity counter', async () => {
        const root = await renderScreen()
        await act(async () => {
            findIncrease(root).props.onPress()
        })
        expect(textContent(root)).toContain('15.00$')
    })

    test('saves updated item quantities and goes back', async () => {
        const root = await renderScreen()
        await act(async () => {
            findIncrease(root).props.onPress()
        })
        await act(async () => {
            root.root.findByType(PrimaryButton).props.onPress()
        })

        expect(purchaseService.editPurchase).toHaveBeenCalledWith(3, {
            items: [
                {
                    price_id: 1,
                    category: 'fruit',
                    unit: 'CUP',
                    unit_price: 5,
                    quantity: 3,
                },
            ],
        })
        expect(mockGoBack).toHaveBeenCalledTimes(1)
    })

    test('warns before discarding unsaved quantity changes', async () => {
        const root = await renderScreen()
        await act(async () => {
            findIncrease(root).props.onPress()
        })

        const beforeRemoveCall = mockAddListener.mock.calls.find(([event]) => event === 'beforeRemove')
        expect(beforeRemoveCall).toBeDefined()
        const beforeRemove = beforeRemoveCall![1]
        const event = { preventDefault: jest.fn(), data: { action: {} } }
        await act(async () => {
            beforeRemove(event)
        })

        expect(event.preventDefault).toHaveBeenCalledTimes(1)
        expect(Alert.alert).toHaveBeenCalledWith(
            UI_TEXT.DISCARD_CHANGES_TITLE,
            UI_TEXT.DISCARD_CHANGES_MESSAGE,
            expect.any(Array)
        )
    })
})
