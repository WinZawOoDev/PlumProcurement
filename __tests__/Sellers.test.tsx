import React from 'react'
import ReactTestRenderer, { act } from 'react-test-renderer'
import { Alert, Text as RNText } from 'react-native'
import { ThemeProvider } from '@rneui/themed'
import Sellers from '../screens/seller/Sellers'
import { sellerService } from '../services/sellerService'
import { purchaseService } from '../services/purchaseService'
import { A11Y_LABELS, UI_TEXT } from '../constants'
import { ISeller, ISellerStat } from '../types/database'
import { makeAppTheme } from '../theme'
import { ROUTES } from '../constants'

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
        getSellers: jest.fn(),
        removeSeller: jest.fn(),
    },
}))
jest.mock('../services/purchaseService', () => ({
    purchaseService: {
        getSellerStats: jest.fn(),
        getPurchasesBySeller: jest.fn(),
    },
}))

const mockSellers: ISeller[] = [
    { id: 1, name: 'U Ba', phone: '09-123', address: null },
    { id: 2, name: 'Daw Mya', phone: null, address: 'Main Road' },
]

const mockStats: ISellerStat[] = [
    { seller_id: 1, purchase_count: 2, total_spent: 15 },
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
    ;(sellerService.getSellers as jest.Mock).mockResolvedValue(mockSellers)
    ;(purchaseService.getSellerStats as jest.Mock).mockResolvedValue(mockStats)
    ;(sellerService.removeSeller as jest.Mock).mockResolvedValue(undefined)
    ;(purchaseService.getPurchasesBySeller as jest.Mock).mockResolvedValue([])
})

describe('Sellers screen', () => {
    test('renders seller rows with SQL-aggregated stats', async () => {
        const root = await renderScreen()
        const text = textContent(root)
        expect(text).toContain('U Ba')
        expect(text).toContain('09-123')
        expect(text).toContain('Main Road')
        expect(text).toContain('2 purchases · 15.00$')
        expect(sellerService.getSellers).toHaveBeenCalledTimes(1)
        expect(purchaseService.getSellerStats).toHaveBeenCalledTimes(1)
    })

    test('confirm dialog guards the delete and reloads after success', async () => {
        const alertSpy = jest.spyOn(Alert, 'alert')
        const root = await renderScreen()

        // row delete icon → confirm dialog
        const deleteButton = root.root.findAllByProps({ accessibilityLabel: A11Y_LABELS.DELETE_SELLER })[0]
        await act(async () => {
            deleteButton.props.onPress()
        })
        expect(alertSpy).toHaveBeenCalledWith(
            UI_TEXT.DELETE_CONFIRM_TITLE,
            UI_TEXT.DELETE_SELLER_CONFIRM_MESSAGE,
            expect.any(Array)
        )
        expect(sellerService.removeSeller).not.toHaveBeenCalled()

        // confirming invokes the destructive action
        const destructive = alertSpy.mock.calls[0][2]!.find((b: any) => b.style === 'destructive')!
        await act(async () => {
            destructive.onPress?.()
        })

        expect(sellerService.removeSeller).toHaveBeenCalledWith(1)
        expect(sellerService.getSellers).toHaveBeenCalledTimes(2)
        alertSpy.mockRestore()
    })

    test('delete failure surfaces the database error message without reloading', async () => {
        const alertSpy = jest.spyOn(Alert, 'alert')
        ;(sellerService.removeSeller as jest.Mock).mockRejectedValue(
            new Error('Cannot delete this seller because purchases reference it.')
        )
        const root = await renderScreen()

        const deleteButton = root.root.findAllByProps({ accessibilityLabel: A11Y_LABELS.DELETE_SELLER })[0]
        await act(async () => {
            deleteButton.props.onPress()
        })
        const destructive = alertSpy.mock.calls[0][2]!.find((b: any) => b.style === 'destructive')!
        await act(async () => {
            destructive.onPress?.()
        })

        expect(sellerService.removeSeller).toHaveBeenCalledTimes(1)
        expect(sellerService.getSellers).toHaveBeenCalledTimes(1)
        alertSpy.mockRestore()
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
})
