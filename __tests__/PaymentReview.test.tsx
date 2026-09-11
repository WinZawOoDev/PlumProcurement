import React from 'react'
import ReactTestRenderer, { act } from 'react-test-renderer'
import { ThemeProvider } from '@rneui/themed'
import PaymentReview from '../screens/seller/PaymentReview'
import { PrimaryButton } from '../components/buttons/Button'
import { paymentService } from '../services/paymentService'
import { purchaseService } from '../services/purchaseService'
import { ROUTES, UI_TEXT } from '../constants'
import { makeAppTheme } from '../theme'

jest.mock('../services/paymentService', () => ({
    paymentService: { recordPayment: jest.fn() },
}))
jest.mock('../services/purchaseService', () => ({
    purchaseService: { getUnpaidPurchasesBySeller: jest.fn() },
}))

const mockGoBack = jest.fn()
const mockPopTo = jest.fn()
const mockParams = {
    sellerId: 2,
    sellerName: 'U Ba',
    balance: 120,
    amount: 50,
    method: 'cash',
    note: 'advance',
}

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ goBack: mockGoBack, popTo: mockPopTo }),
    useRoute: () => ({ params: mockParams }),
}))

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
                <PaymentReview />
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
    ;(paymentService.recordPayment as jest.Mock).mockResolvedValue(1)
    ;(purchaseService.getUnpaidPurchasesBySeller as jest.Mock).mockResolvedValue([
        { id: 11, seller_id: 2, total: 60, created_at: '2026-09-01', items: [] },
    ])
})

describe('PaymentReview screen', () => {
    test('renders the slip with amount, method, note and resulting balance', async () => {
        const root = await renderScreen()
        const text = textContent(root)
        expect(text).toContain(UI_TEXT.PAYMENT_REVIEW_TITLE)
        expect(text).toContain('50.00')
        expect(text).toContain('U Ba')
        expect(text).toContain('Cash')
        expect(text).toContain('advance')
        expect(text).toContain('120.00$')
        expect(text).toContain('70.00$')
        expect(text).toContain(UI_TEXT.PAYMENT_FOR_PURCHASES)
        expect(text).toContain('2026-09-01')
        expect(text).toContain('60.00$')
    })

    test('processes the payment and returns to the seller details', async () => {
        const root = await renderScreen()
        await act(async () => {
            root.root.findByType(PrimaryButton).props.onPress()
            await flush()
        })

        expect(paymentService.recordPayment).toHaveBeenCalledWith({
            seller_id: 2,
            purchase_id: null,
            amount: 50,
            method: 'cash',
            note: 'advance',
        })
        expect(mockPopTo).toHaveBeenCalledWith(ROUTES.SELLER_DETAILS)
    })
})
