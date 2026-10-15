import React from 'react'
import ReactTestRenderer, { act } from 'react-test-renderer'
import { Alert } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ThemeProvider } from '@rneui/themed'
import SellerDetails from '../screens/seller/SellerDetails'
import { sellerService } from '../services/sellerService'
import { purchaseService } from '../services/purchaseService'
import { paymentService } from '../services/paymentService'
import { MESSAGES, UI_TEXT } from '../constants'
import { makeAppTheme } from '../theme'

const mockGoBack = jest.fn()
const mockNavigate = jest.fn()

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
    useRoute: () => ({ params: { sellerId: 7 } }),
    useFocusEffect: () => {},
}))

jest.mock('../services/sellerService', () => ({
    sellerService: {
        getSellerById: jest.fn(),
        getSellerStatById: jest.fn(),
        getSellerBalanceById: jest.fn(),
        removeSeller: jest.fn(),
    },
}))
jest.mock('../services/purchaseService', () => ({
    purchaseService: { getRecentPurchasesBySeller: jest.fn() },
}))
jest.mock('../services/paymentService', () => ({
    paymentService: { getRecentPaymentsBySeller: jest.fn() },
}))

const seller = { id: 7, name: 'U Ba', phone: '09-1', address: 'Main' }

const flush = async () => {
    for (let i = 0; i < 5; i++) {
        await new Promise<void>((resolve) => setTimeout(resolve, 0))
    }
}

const initialMetrics = {
    frame: { x: 0, y: 0, width: 0, height: 0 },
    insets: { top: 0, left: 0, right: 0, bottom: 0 },
}

const renderScreen = async () => {
    let root!: ReactTestRenderer.ReactTestRenderer
    await act(async () => {
        root = ReactTestRenderer.create(
            <SafeAreaProvider initialMetrics={initialMetrics}>
                <ThemeProvider theme={makeAppTheme(false)}>
                    <SellerDetails />
                </ThemeProvider>
            </SafeAreaProvider>
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
    ;(sellerService.getSellerById as jest.Mock).mockResolvedValue(seller)
    ;(sellerService.getSellerStatById as jest.Mock).mockResolvedValue({
        seller_id: 7,
        seller_name: 'U Ba',
        purchase_count: 2,
        total_owed: 30,
        total_paid: 10,
        balance: 20,
    })
    ;(sellerService.getSellerBalanceById as jest.Mock).mockResolvedValue({
        seller_id: 7,
        seller_name: 'U Ba',
        total_owed: 30,
        total_paid: 10,
        balance: 20,
    })
    ;(purchaseService.getRecentPurchasesBySeller as jest.Mock).mockResolvedValue([])
    ;(paymentService.getRecentPaymentsBySeller as jest.Mock).mockResolvedValue([])
    ;(sellerService.removeSeller as jest.Mock).mockResolvedValue(undefined)
})

describe('SellerDetails', () => {
    test('loads the seller with single-seller stats (no full-table scan)', async () => {
        const root = await renderScreen()
        const text = textContent(root)

        expect(text).toContain('U Ba')
        expect(sellerService.getSellerStatById).toHaveBeenCalledWith(7)
        expect(sellerService.getSellerBalanceById).toHaveBeenCalledWith(7)
        // The record-payment button uses the localized label.
        expect(text).toContain(UI_TEXT.RECORD_PAYMENT)
    })

    test('shows a retry state (never zeros) when the load fails', async () => {
        ;(sellerService.getSellerById as jest.Mock).mockRejectedValue(new Error('db down'))

        const root = await renderScreen()
        const text = textContent(root)

        // No zero-balance fiction and no endless skeleton.
        expect(text).not.toContain('U Ba')
        expect(text).toContain(UI_TEXT.RETRY)
        expect(text).toContain(MESSAGES.ERROR_GENERIC)
    })

    test('retry re-runs the load', async () => {
        ;(sellerService.getSellerById as jest.Mock)
            .mockRejectedValueOnce(new Error('db down'))
            .mockResolvedValue(seller)

        const root = await renderScreen()
        expect(textContent(root)).toContain(UI_TEXT.RETRY)

        const retry = root.root.findAllByProps({ title: UI_TEXT.RETRY })[0]
        await act(async () => {
            retry.props.onPress()
            await flush()
        })
        expect(textContent(root)).toContain('U Ba')
    })

    test('delete flow removes the seller and goes back', async () => {
        const root = await renderScreen()

        let alertArgs: unknown[] = []
        const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation((...args: unknown[]) => {
            alertArgs = args
        })
        // findAllByType(Pressable) misses RN pressables across the module
        // boundary; match by props instead (same approach as Sellers.test).
        const deleteButton = root.root
            .findAll((inst) => inst.props?.accessibilityLabel === 'Delete seller')
            .find((inst) => typeof inst.props?.onPress === 'function')
        expect(deleteButton).toBeDefined()
        await act(async () => {
            deleteButton!.props.onPress()
        })

        // Confirm the destructive action.
        const buttons = alertArgs[2] as Array<{ text: string; style?: string; onPress?: () => void }>
        const destructive = buttons.find((b) => b.style === 'destructive' || b.text !== 'Cancel')
        await act(async () => {
            await destructive!.onPress?.()
            await flush()
        })

        expect(sellerService.removeSeller).toHaveBeenCalledWith(7)
        expect(mockGoBack).toHaveBeenCalled()
        alertSpy.mockRestore()
    })
})
