import React from 'react'
import ReactTestRenderer, { act } from 'react-test-renderer'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ThemeProvider } from '@rneui/themed'
import SellerPayments from '../screens/seller/SellerPayments'
import { paymentService } from '../services/paymentService'
import { MESSAGES, UI_TEXT } from '../constants'
import { makeAppTheme } from '../theme'

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
    useRoute: () => ({ params: { sellerId: 7 } }),
}))

jest.mock('../services/paymentService', () => ({
    paymentService: {
        getSellerPaymentStat: jest.fn(),
        getPaymentsPageBySeller: jest.fn(),
        removePayment: jest.fn(),
    },
}))

const stat = { seller_id: 7, seller_name: 'U Ba', total_owed: 30, total_paid: 10, balance: 20 }
const payments = [
    { id: 11, seller_id: 7, purchase_id: 1, amount: 10, method: 'cash', note: null, paid_at: '2026-09-01 10:00:00' },
]

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
                    <SellerPayments />
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
    ;(paymentService.getSellerPaymentStat as jest.Mock).mockResolvedValue(stat)
    ;(paymentService.getPaymentsPageBySeller as jest.Mock).mockResolvedValue({ items: payments, nextCursor: null })
    ;(paymentService.removePayment as jest.Mock).mockResolvedValue(undefined)
})

describe('SellerPayments', () => {
    test('renders the stat summary and the payment rows', async () => {
        const root = await renderScreen()
        const text = textContent(root)

        expect(paymentService.getPaymentsPageBySeller).toHaveBeenCalledWith(
            expect.objectContaining({ sellerId: 7 })
        )
        expect(text).toContain(UI_TEXT.OWED)
        expect(text).toContain(UI_TEXT.PAID)
        expect(text).toContain(UI_TEXT.BALANCE)
        expect(text).toContain('10.00')
    })

    test('shows a retry state when the first page fails', async () => {
        ;(paymentService.getPaymentsPageBySeller as jest.Mock).mockRejectedValue(new Error('db down'))

        const root = await renderScreen()
        const text = textContent(root)

        expect(text).toContain(UI_TEXT.RETRY)
        expect(text).toContain(MESSAGES.ERROR_GENERIC)
    })
})
