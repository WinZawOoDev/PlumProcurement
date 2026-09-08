import React from 'react'
import ReactTestRenderer, { act } from 'react-test-renderer'
import { Text as RNText } from 'react-native'
import { ThemeProvider } from '@rneui/themed'
import { PurchaseForm } from '../screens/purchasing/Purchase'
import { PriceProvider, usePrices } from '../context/PriceContext'
import { PrimaryButton } from '../components/buttons/Button'
import { priceService } from '../services/priceService'
import { purchaseService } from '../services/purchaseService'
import { A11Y_LABELS, UI_TEXT } from '../constants'
import { IPrice } from '../types/database'
import { makeAppTheme } from '../theme'

jest.mock('../services/priceService', () => ({
    priceService: { getPrices: jest.fn() },
}))
jest.mock('../services/purchaseService', () => ({
    purchaseService: { recordPurchase: jest.fn() },
}))
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ navigate: jest.fn() }),
}))

const mockPrices: IPrice[] = [
    { id: 1, price: 100, unit: 'PER KG', category: 'grains', is_available: true },
]

const flush = async () => {
    for (let i = 0; i < 3; i++) {
        await new Promise<void>((resolve) => setTimeout(resolve, 0))
    }
}

// PriceProvider does not auto-load; the real screen calls refresh() on mount
const sellers = [{ id: 1, name: 'Test Seller' }]
const onRecorded = jest.fn()
const onOpenSellerSelect = jest.fn()

const Harness = ({ seller }: { seller: { id: number; name: string } | null }) => {
    const { refresh } = usePrices()
    React.useEffect(() => {
        refresh()
    }, [refresh])
    return (
        <PurchaseForm
            selectedSeller={seller}
            onOpenSellerSelect={onOpenSellerSelect}
            onRecorded={onRecorded}
        />
    )
}

const buildHarness = (seller: { id: number; name: string } | null) => (
    <ThemeProvider theme={makeAppTheme(false)}>
        <PriceProvider>
            <Harness seller={seller} />
        </PriceProvider>
    </ThemeProvider>
)

const renderForm = async (seller: { id: number; name: string } | null = null) => {
    let root!: ReactTestRenderer.ReactTestRenderer
    await act(async () => {
        root = ReactTestRenderer.create(buildHarness(seller))
        await flush()
    })
    return root
}

// Simulates picking a seller on the SellerSelect screen and returning
const selectSeller = async (root: ReactTestRenderer.ReactTestRenderer, seller = sellers[0]) => {
    await act(async () => {
        root.update(buildHarness(seller))
        await flush()
    })
}

const findIncreaseButton = (root: ReactTestRenderer.ReactTestRenderer) => {
    return root.root.findAllByProps({ accessibilityLabel: `${A11Y_LABELS.INCREASE_QUANTITY} ${mockPrices[0].category}` })[0]
}

const findDecreaseButton = (root: ReactTestRenderer.ReactTestRenderer) => {
    return root.root.findAllByProps({ accessibilityLabel: `${A11Y_LABELS.DECREASE_QUANTITY} ${mockPrices[0].category}` })[0]
}

const findRecordButton = (root: ReactTestRenderer.ReactTestRenderer) => {
    return root.root.findByType(PrimaryButton)
}

const findSellerField = (root: ReactTestRenderer.ReactTestRenderer) => {
    return root.root.findAllByProps({ accessibilityLabel: `${UI_TEXT.SELECT_SELLER}: ${UI_TEXT.SELECT_SELLER_PLACEHOLDER}` })[0]
}

const textContent = (root: ReactTestRenderer.ReactTestRenderer) => {
    return root.root
        .findAllByType(RNText)
        .map((t) => (Array.isArray(t.props.children) ? t.props.children.join('') : String(t.props.children)))
        .join(' ')
}

beforeEach(() => {
    jest.clearAllMocks()
    ;(priceService.getPrices as jest.Mock).mockResolvedValue(mockPrices)
    ;(purchaseService.recordPurchase as jest.Mock).mockResolvedValue(1)
})

describe('PurchaseForm', () => {
    test('shows em dash total when no quantity is set', async () => {
        const root = await renderForm()
        expect(textContent(root)).toContain('—')
    })

    test('decrease button is disabled until a quantity is set', async () => {
        const root = await renderForm()
        expect(findDecreaseButton(root).props.disabled).toBe(true)

        await act(async () => {
            findIncreaseButton(root).props.onPress()
            await flush()
        })

        expect(findDecreaseButton(root).props.disabled).toBe(false)
    })

    test('seller field opens the seller select screen', async () => {
        const root = await renderForm()

        await act(async () => {
            findSellerField(root).props.onPress()
        })

        expect(onOpenSellerSelect).toHaveBeenCalledTimes(1)
    })

    test('record button is disabled until seller is selected and a quantity is set', async () => {
        const root = await renderForm()
        expect(findRecordButton(root).props.disabled).toBe(true)

        await selectSeller(root)
        expect(findRecordButton(root).props.disabled).toBe(true)

        await act(async () => {
            findIncreaseButton(root).props.onPress()
            await flush()
        })
        expect(findRecordButton(root).props.disabled).toBe(false)
    })

    test('computes total from unit price and quantity', async () => {
        const root = await renderForm()

        await selectSeller(root)
        await act(async () => {
            findIncreaseButton(root).props.onPress()
            findIncreaseButton(root).props.onPress()
            await flush()
        })

        expect(textContent(root)).toContain('200.00$')
    })

    test('records purchase with correct payload and refreshes recents', async () => {
        const root = await renderForm()

        await selectSeller(root)
        await act(async () => {
            findIncreaseButton(root).props.onPress()
            await flush()
        })
        await act(async () => {
            findRecordButton(root).props.onPress()
            await flush()
        })

        expect(purchaseService.recordPurchase).toHaveBeenCalledWith({
            seller_id: 1,
            items: [
                {
                    price_id: 1,
                    category: 'grains',
                    unit: 'PER KG',
                    unit_price: 100,
                    quantity: 1,
                },
            ],
        })
        expect(onRecorded).toHaveBeenCalledTimes(1)
    })

    test('does not record without a selected seller', async () => {
        const root = await renderForm()

        await act(async () => {
            findIncreaseButton(root).props.onPress()
            findRecordButton(root).props.onPress()
            await flush()
        })

        expect(purchaseService.recordPurchase).not.toHaveBeenCalled()
        expect(onRecorded).not.toHaveBeenCalled()
    })
})
