import React from 'react'
import ReactTestRenderer, { act } from 'react-test-renderer'
import { FlatList } from 'react-native'
import { ThemeProvider } from '@rneui/themed'
import PurchaseDetails from '../screens/purchasing/PurchaseDetails'
import { SecondaryButton } from '../components/buttons/Button'
import { SearchBar } from '../components/SearchBar'
import { SearchIconButton } from '../components/SearchIconButton'
import { purchaseService } from '../services/purchaseService'
import { A11Y_LABELS, PAGINATION_CONFIG, UI_TEXT } from '../constants'
import { IPurchaseDetail } from '../types/database'
import { makeAppTheme } from '../theme'
import { shareOrSaveCsv } from '../utils/csvExport'

jest.mock('../services/purchaseService', () => ({
    purchaseService: {
        getPurchasesPage: jest.fn(),
        getPurchasesSummary: jest.fn(),
        editPurchase: jest.fn(),
    },
}))
jest.mock('../utils/csvExport', () => ({
    shareOrSaveCsv: jest.fn(),
}))
const mockNavigate = jest.fn()
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({ navigate: mockNavigate }),
    useFocusEffect: () => {},
}))

const page1: IPurchaseDetail[] = [
    {
        id: 20,
        seller_id: 2,
        total: 10,
        seller_name: 'U Ba',
        has_payment: 0,
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
        has_payment: 0,
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
    ;(purchaseService.getPurchasesSummary as jest.Mock).mockResolvedValue({ count: 1, total: 10 })
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
        expect(purchaseService.getPurchasesSummary).toHaveBeenCalledWith({ query: undefined })
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

    // CSV export disabled — the button is commented out in PurchaseDetails.
    test('does not render the CSV export button while export is disabled', async () => {
        ;(purchaseService.getPurchasesPage as jest.Mock).mockResolvedValue({ items: page1, nextCursor: null })

        const root = await renderScreen()
        await act(async () => {
            await flush()
        })

        expect(root.root.findAllByType(SecondaryButton)).toHaveLength(0)
        expect(shareOrSaveCsv).not.toHaveBeenCalled()
    })

    test('shows the empty state without a CSV export button', async () => {
        ;(purchaseService.getPurchasesPage as jest.Mock).mockResolvedValue({ items: [], nextCursor: null })

        const root = await renderScreen()

        expect(root.root.findAllByType(SecondaryButton)).toHaveLength(0)
        expect(textContent(root)).toContain(UI_TEXT.EMPTY_PURCHASE_LIST)
    })

    test('locks purchases referenced by a payment', async () => {
        ;(purchaseService.getPurchasesPage as jest.Mock).mockResolvedValue({
            items: [{ ...page1[0], has_payment: 1 }],
            nextCursor: null,
        })

        const root = await renderScreen()

        expect(root.root.findAllByProps({ accessibilityLabel: A11Y_LABELS.LOCKED_PURCHASE }).length).toBeGreaterThan(0)
        expect(root.root.findAllByProps({ accessibilityLabel: A11Y_LABELS.EDIT_PURCHASE })).toHaveLength(0)
    })

    test('keeps the edit action when no payment references the purchase', async () => {
        ;(purchaseService.getPurchasesPage as jest.Mock).mockResolvedValue({ items: page1, nextCursor: null })

        const root = await renderScreen()

        expect(root.root.findAllByProps({ accessibilityLabel: A11Y_LABELS.EDIT_PURCHASE }).length).toBeGreaterThan(0)
    })

    test('summary reflects all matching purchases, not just the loaded page', async () => {
        ;(purchaseService.getPurchasesPage as jest.Mock).mockResolvedValue({ items: page1, nextCursor: 20 })
        ;(purchaseService.getPurchasesSummary as jest.Mock).mockResolvedValue({ count: 57, total: 570 })

        const root = await renderScreen()

        const text = textContent(root)
        expect(text).toContain('57')
        expect(text).toContain('570.00$')
    })

    test('searching re-queries the server and shows the result count', async () => {
        ;(purchaseService.getPurchasesPage as jest.Mock).mockResolvedValue({ items: page1, nextCursor: null })

        const root = await renderScreen()

        await act(async () => {
            root.root.findByType(SearchIconButton).props.onPress()
            await flush()
        })

        await act(async () => {
            root.root.findByType(SearchBar).props.onChangeText('U Ba')
            await flush()
        })

        expect(purchaseService.getPurchasesPage).toHaveBeenLastCalledWith({
            limit: PAGINATION_CONFIG.PURCHASE_PAGE_SIZE,
            cursor: undefined,
            query: 'U Ba',
        })
        expect(purchaseService.getPurchasesSummary).toHaveBeenLastCalledWith({ query: 'U Ba' })
        expect(textContent(root)).toContain('1 of 1')
    })

    test('discards a stale in-flight response (race guard)', async () => {
        let resolveFirst!: (value: { items: IPurchaseDetail[]; nextCursor: number | null }) => void
        const firstResponse = new Promise<{ items: IPurchaseDetail[]; nextCursor: number | null }>(
            (resolve) => {
                resolveFirst = resolve
            }
        )
        ;(purchaseService.getPurchasesSummary as jest.Mock).mockResolvedValue({ count: 6, total: 66 })
        ;(purchaseService.getPurchasesPage as jest.Mock)
            .mockReturnValueOnce(firstResponse) // initial mount load (stays pending)
            .mockResolvedValueOnce({ items: page2, nextCursor: null }) // newer load wins

        const root = await renderScreen()

        // Kick off a newer load while the initial one is still in flight.
        await act(async () => {
            root.root.findByType(SearchIconButton).props.onPress()
            await flush()
        })

        // The stale initial load resolves last — it must be ignored.
        await act(async () => {
            resolveFirst({ items: page1, nextCursor: null })
            await flush()
        })

        const text = textContent(root)
        expect(text).toContain('2.00$') // page2 committed
        expect(text).not.toContain('10.00$') // stale page1 discarded
    })
})
