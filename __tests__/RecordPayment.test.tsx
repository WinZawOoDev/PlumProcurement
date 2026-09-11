import React from 'react'
import ReactTestRenderer, { act } from 'react-test-renderer'
import { TextInput } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ThemeProvider } from '@rneui/themed'
import RecordPayment from '../screens/seller/RecordPayment'
import { PrimaryButton } from '../components/buttons/Button'
import { ROUTES, UI_TEXT } from '../constants'
import { makeAppTheme } from '../theme'

const mockGoBack = jest.fn()
const mockNavigate = jest.fn()
const mockParams = { sellerId: 2, sellerName: 'U Ba', sellerPhone: '09-123', balance: 120 }

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ goBack: mockGoBack, navigate: mockNavigate }),
    useRoute: () => ({ params: mockParams }),
}))

const flush = async () => {
    for (let i = 0; i < 3; i++) {
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
                    <RecordPayment />
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

const amountInput = (root: ReactTestRenderer.ReactTestRenderer) =>
    root.root.findAllByType(TextInput)[0]

beforeEach(() => {
    jest.clearAllMocks()
})

describe('RecordPayment screen', () => {
    test('shows the seller, outstanding balance and title', async () => {
        const root = await renderScreen()
        const text = textContent(root)
        expect(text).toContain(UI_TEXT.RECORD_PAYMENT)
        expect(text).toContain('U Ba')
        expect(text).toContain('09-123')
        expect(text).toContain('120.00$')
    })

    test('continues to the payment review with the entered details', async () => {
        const root = await renderScreen()
        await act(async () => {
            amountInput(root).props.onChangeText('50')
        })
        await act(async () => {
            root.root.findByType(PrimaryButton).props.onPress()
            await flush()
        })

        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.PAYMENT_REVIEW, {
            sellerId: 2,
            sellerName: 'U Ba',
            balance: 120,
            amount: 50,
            method: null,
            note: null,
        })
    })

    test('does not continue for an invalid amount', async () => {
        const root = await renderScreen()
        await act(async () => {
            amountInput(root).props.onChangeText('abc')
        })
        await act(async () => {
            root.root.findByType(PrimaryButton).props.onPress()
            await flush()
        })

        expect(mockNavigate).not.toHaveBeenCalled()
    })
})
