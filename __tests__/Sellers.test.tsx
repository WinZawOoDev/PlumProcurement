import React from 'react'
import ReactTestRenderer, { act } from 'react-test-renderer'
import { FlatList, Text as RNText } from 'react-native'
import { ThemeProvider } from '@rneui/themed'
import Sellers from '../screens/seller/Sellers'
import { sellerService } from '../services/sellerService'
import { A11Y_LABELS, PAGINATION_CONFIG, ROUTES } from '../constants'
import { ISellerWithStats } from '../types/database'
import { makeAppTheme } from '../theme'

const mockNavigate = jest.fn()
jest.mock('@react-navigation/native', () => {
    const actual = jest.requireActual('@react-navigation/native')
    return {
        ...actual,
        useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
    }
})

jest.mock('../services/sellerService', () => ({
    sellerService: {
        getSellersPage: jest.fn(),
        getSellerCount: jest.fn(),
        removeSeller: jest.fn(),
    },
}))

const mockSellers: ISellerWithStats[] = [
    { id: 1, name: 'U Ba', phone: '09-123', address: null, purchase_count: 2, total_spent: 15, balance: 10 },
    { id: 2, name: 'Daw Mya', phone: null, address: 'Main Road', purchase_count: 0, total_spent: 0, balance: 0 },
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
                <Sellers />
            </ThemeProvider>
        )
        await flush()
    })
    return root
}

const textContent = (root: ReactTestRenderer.ReactTestRenderer) => {
    return root.root
        .findAllByType(RNText)
        .map((t) => (Array.isArray(t.props.children) ? t.props.children.join('') : String(t.props.children)))
        .join(' ')
}

// React.memo components are not matchable via findAllByType; locate the row's
// outer Pressable by walking up from the seller name text.
const findRowPressable = (root: ReactTestRenderer.ReactTestRenderer, name: string) => {
    const join = (children: unknown) =>
        Array.isArray(children) ? children.join('') : String(children)
    const nameText = root.root
        .findAllByType(RNText)
        .find((t) => join(t.props.children) === name)!
    let inst: ReactTestRenderer.ReactTestInstance | null = nameText
    while (inst) {
        if (inst.props.onPress) return inst
        inst = inst.parent
    }
    return null
}

beforeEach(() => {
    jest.clearAllMocks()
    mockNavigate.mockClear()
    ;(sellerService.getSellersPage as jest.Mock).mockResolvedValue({ items: mockSellers, nextCursor: null })
    ;(sellerService.getSellerCount as jest.Mock).mockResolvedValue(mockSellers.length)
    ;(sellerService.removeSeller as jest.Mock).mockResolvedValue(undefined)
})

describe('Sellers screen', () => {
    test('renders seller rows with stats and balance from the page query', async () => {
        const root = await renderScreen()
        const text = textContent(root)
        expect(text).toContain('U Ba')
        expect(text).toContain('09-123')
        expect(text).toContain('Main Road')
        expect(text).toContain('2 · 15.00$')
        expect(text).toContain('10.00$')
        expect(sellerService.getSellersPage).toHaveBeenCalledWith({
            limit: PAGINATION_CONFIG.SELLER_PAGE_SIZE,
            cursor: undefined,
            query: undefined,
        })
        expect(sellerService.getSellerCount).toHaveBeenCalledWith(undefined)
    })

    test('row shows edit action', async () => {
        const root = await renderScreen()
        const editButtons = root.root.findAllByProps({ accessibilityLabel: A11Y_LABELS.EDIT_SELLER })
        expect(editButtons.length).toBeGreaterThan(0)
        expect(editButtons[0].props.accessibilityLabel).toBe(A11Y_LABELS.EDIT_SELLER)
    })

    test('navigates to seller details on row press', async () => {
        const root = await renderScreen()
        const row = findRowPressable(root, 'U Ba')!
        expect(row).not.toBeNull()
        await act(async () => {
            row.props.onPress()
        })
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SELLER_DETAILS, { sellerId: 1 })
    })

    test('load-more continues from the previous page cursor', async () => {
        const page2: ISellerWithStats[] = [
            { id: 3, name: 'U Hla', phone: null, address: null, purchase_count: 1, total_spent: 5, balance: 5 },
        ]
        ;(sellerService.getSellersPage as jest.Mock)
            .mockResolvedValueOnce({ items: mockSellers, nextCursor: { name: 'Daw Mya', id: 2 } })
            .mockResolvedValueOnce({ items: page2, nextCursor: null })

        const root = await renderScreen()
        expect(textContent(root)).not.toContain('U Hla')

        const list = root.root.findAllByType(FlatList)[0]
        await act(async () => {
            list.props.onEndReached()
            await flush()
        })

        expect(sellerService.getSellersPage).toHaveBeenLastCalledWith({
            limit: PAGINATION_CONFIG.SELLER_PAGE_SIZE,
            cursor: { name: 'Daw Mya', id: 2 },
            query: undefined,
        })
        expect(textContent(root)).toContain('U Hla')
    })
})
