import React from 'react'
import ReactTestRenderer, { act } from 'react-test-renderer'
import { FlatList } from 'react-native'
import { ThemeProvider } from '@rneui/themed'
import PurchaseDetails from '../screens/purchasing/PurchaseDetails'
import { SecondaryButton } from '../components/buttons/Button'
import { purchaseService } from '../services/purchaseService'
import { paymentService } from '../services/paymentService'
import { A11Y_LABELS, PAGINATION_CONFIG, UI_TEXT } from '../constants'
import { IPurchaseDetail } from '../types/database'
import { makeAppTheme } from '../theme'
import { shareOrSaveCsv } from '../utils/csvExport'

jest.mock('../services/purchaseService', () => ({
    purchaseService: {
        getPurchasesPage: jest.fn(),
        editPurchase: jest.fn(),
    },
}))
jest.mock('../services/paymentService', () => ({
    paymentService: {
        getPaidSellerIds: jest.fn(),
    },
}))
jest.mock('../utils/csvExport', () => ({
    shareOrSaveCsv: jest.fn(),
}))
const mockNavigate = jest.fn()
jest.mock('@react-navigation/native', () => {
    const actual = jest.requireActual('@react-navigation/native')
    const ReactModule = require('react')
    return {
        ...actual,
        useNavigation: () => ({ navigate: mockNavigate }),
        useFocusEffect: (callback: () => void) => ReactModule.useEffect(callback, [callback]),
    }
})

const page1: IPurchaseDetail[] = [
    {
        id: 20,
        seller_id: 2,
        total: 10,
        seller_name: 'U Ba',
        items: [
            {
                id: 201,
                purchase_id: 20,
                price_id: 1,
                category: 'fruit',
                unit: 'CUP',
                unit_price: 5,
                quantity: 2,
                line_total: 10,
            },
        ],
    },
]
const page2: IPurchaseDetail[] = [
    {
        id: 10,
        seller_id: null,
        total: 2,
        seller_name: null,
        items: [
            {
                id: 101,
                purchase_id: 10,
                price_id: 1,
                category: 'seed',
                unit: 'CUP',
                unit_price: 2,
                quantity: 1,
                line_total: 2,
            },
        ],
    },
]

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
                <PurchaseDetails />
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

beforeEach(() => {
    jest.clearAllMocks()
    ;(shareOrSaveCsv as jest.Mock).mockResolvedValue('shared')
    ;(paymentService.getPaidSellerIds as jest.Mock).mockResolvedValue([])
})

describe('PurchaseDetails screen', () => {
    test('loads the first page without a cursor and renders summary + rows', async () => {
        ;(purchaseService.getPurchasesPage as jest.Mock).mockResolvedValue({ items: page1, nextCursor: null })

        const root = await renderScreen()

        expect(purchaseService.getPurchasesPage).toHaveBeenCalledWith({
            limit: PAGINATION_CONFIG.PURCHASE_PAGE_SIZE,
            cursor: undefined,
            query: undefined,
        })
        const text = textContent(root)
        expect(text).toContain(UI_TEXT.PURCHASE_HISTORY_TITLE)
        expect(text).toContain(`1 ${UI_TEXT.ITEMS.toLowerCase()}`)
        expect(text).toContain('10.00$')
        expect(text).toContain('U Ba')
    })

    test('load-more continues from the previous page cursor', async () => {
        ;(purchaseService.getPurchasesPage as jest.Mock)
            .mockResolvedValueOnce({ items: page1, nextCursor: 20 })
            .mockResolvedValueOnce({ items: page2, nextCursor: null })

        const root = await renderScreen()
        expect(textContent(root)).not.toContain('2.00$')

        const list = root.root.findAllByType(FlatList)[0]
        await act(async () => {
            list.props.onEndReached()
            await flush()
        })

        expect(purchaseService.getPurchasesPage).toHaveBeenLastCalledWith({
            limit: PAGINATION_CONFIG.PURCHASE_PAGE_SIZE,
            cursor: 20,
            query: undefined,
        })
        expect(textContent(root)).toContain('2.00$')
    })

    test('exports the loaded purchases as CSV', async () => {
        ;(purchaseService.getPurchasesPage as jest.Mock).mockResolvedValue({ items: page1, nextCursor: null })

        const root = await renderScreen()
        await act(async () => {
            root.root.findByType(SecondaryButton).props.onPress()
            await flush()
        })

        expect(shareOrSaveCsv).toHaveBeenCalledWith(
            expect.stringContaining('fruit'),
            expect.any(String),
            expect.stringContaining(UI_TEXT.EXPORT_CSV)
        )
    })

    test('export button is disabled when the list is empty', async () => {
        ;(purchaseService.getPurchasesPage as jest.Mock).mockResolvedValue({ items: [], nextCursor: null })

        const root = await renderScreen()

        expect(root.root.findByType(SecondaryButton).props.disabled).toBe(true)
        expect(textContent(root)).toContain(UI_TEXT.EMPTY_PURCHASE_LIST)
    })

    test('locks purchases whose seller has recorded payments', async () => {
        ;(purchaseService.getPurchasesPage as jest.Mock).mockResolvedValue({ items: page1, nextCursor: null })
        ;(paymentService.getPaidSellerIds as jest.Mock).mockResolvedValue([2])

        const root = await renderScreen()

        expect(root.root.findAllByProps({ accessibilityLabel: A11Y_LABELS.LOCKED_PURCHASE }).length).toBeGreaterThan(0)
        expect(root.root.findAllByProps({ accessibilityLabel: A11Y_LABELS.EDIT_PURCHASE })).toHaveLength(0)
    })

    test('keeps the edit action when the seller has no payments', async () => {
        ;(purchaseService.getPurchasesPage as jest.Mock).mockResolvedValue({ items: page1, nextCursor: null })
        ;(paymentService.getPaidSellerIds as jest.Mock).mockResolvedValue([])

        const root = await renderScreen()

        expect(root.root.findAllByProps({ accessibilityLabel: A11Y_LABELS.EDIT_PURCHASE }).length).toBeGreaterThan(0)
    })
})
