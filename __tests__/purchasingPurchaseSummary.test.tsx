import React from 'react'
import ReactTestRenderer, { act } from 'react-test-renderer'
import { Text as RNText } from 'react-native'
import { ThemeProvider } from '@rneui/themed'
import PurchaseSummary from '../screens/purchasing/PurchaseSummary'
import { StatCell } from '../components/StatCell'
import { MoneyText } from '../components/MoneyText'
import { UI_TEXT } from '../constants'
import { IPurchaseDetail } from '../types/database'
import { makeAppTheme } from '../theme'

let mockRouteParams: { purchase?: IPurchaseDetail } = {}
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useRoute: () => ({ params: mockRouteParams }),
}))

const purchase: IPurchaseDetail = {
    id: 7,
    seller_id: 2,
    total: 25,
    seller_name: 'U Ba',
    has_payment: 0,
    created_at: '2026-10-01T10:00:00.000Z',
    items: [
        {
            id: 71,
            purchase_id: 7,
            price_id: 1,
            category: 'fruit',
            unit: 'CUP',
            unit_price: 5,
            quantity: 2,
            line_total: 10,
        },
        {
            id: 72,
            purchase_id: 7,
            price_id: 2,
            category: 'seed',
            unit: 'CUP',
            unit_price: 5,
            quantity: 3,
            line_total: 15,
        },
    ],
}

const renderScreen = async () => {
    let root!: ReactTestRenderer.ReactTestRenderer
    await act(async () => {
        root = ReactTestRenderer.create(
            <ThemeProvider theme={makeAppTheme(false)}>
                <PurchaseSummary />
            </ThemeProvider>
        )
    })
    return root
}

const textContent = (root: ReactTestRenderer.ReactTestRenderer) =>
    root.root
        .findAllByType(RNText)
        .map((t) => (Array.isArray(t.props.children) ? t.props.children.join('') : String(t.props.children)))
        .join(' ')

beforeEach(() => {
    mockRouteParams = { purchase }
})

describe('PurchaseSummary screen', () => {
    test('renders the item count and total through the shared StatCell', async () => {
        const root = await renderScreen()

        const cells = root.root.findAllByType(StatCell)
        expect(cells).toHaveLength(2)

        expect(cells[0].props.label).toBe(UI_TEXT.TOTAL_ITEMS)
        expect(cells[0].props.value).toBe('2')
        expect(cells[0].props.icon).toBe('list-outline')

        expect(cells[1].props.label).toBe(UI_TEXT.TOTAL_AMOUNT)
        expect(cells[1].props.icon).toBe('cash-outline')
        expect(root.root.findAllByType(MoneyText).some((m) => m.props.amount === 25)).toBe(true)
    })

    test('shows the seller name, the purchase date and each line item', async () => {
        const root = await renderScreen()

        const text = textContent(root)
        expect(text).toContain('U Ba')
        expect(text).toContain(UI_TEXT.PURCHASE_SUMMARY_TITLE)
        expect(text).toContain(UI_TEXT.ITEMS)
        expect(root.root.findAllByType(MoneyText).some((m) => m.props.amount === 15)).toBe(true)
    })

    test('falls back to the empty state when no purchase is passed', async () => {
        mockRouteParams = {}

        const root = await renderScreen()

        expect(root.root.findAllByType(StatCell)).toHaveLength(0)
        expect(textContent(root)).toContain(UI_TEXT.EMPTY_PURCHASE_LIST)
    })
})
