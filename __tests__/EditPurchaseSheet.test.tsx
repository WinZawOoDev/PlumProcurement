import React from 'react'
import ReactTestRenderer, { act } from 'react-test-renderer'
import { ThemeProvider } from '@rneui/themed'
import { EditPurchaseSheet } from '../screens/purchasing/EditPurchaseSheet'
import { QuantityStepper } from '../components/QuantityStepper'
import { PrimaryButton } from '../components/buttons/Button'
import { purchaseService } from '../services/purchaseService'
import { A11Y_LABELS, UI_TEXT } from '../constants'
import { IPurchaseWithSeller } from '../types/database'
import { makeAppTheme } from '../theme'

jest.mock('../services/purchaseService', () => ({
    purchaseService: { editPurchase: jest.fn() },
}))

const mockPurchase: IPurchaseWithSeller = {
    id: 3,
    price_id: 1,
    seller_id: 2,
    category: 'fruit',
    unit: 'CUP',
    unit_price: 5,
    quantity: 2,
    total: 10,
    seller_name: 'U Ba',
}

const onClose = jest.fn()
const onSaved = jest.fn()

const renderSheet = async () => {
    let root!: ReactTestRenderer.ReactTestRenderer
    await act(async () => {
        root = ReactTestRenderer.create(
            <ThemeProvider theme={makeAppTheme(false)}>
                <EditPurchaseSheet
                    visible={true}
                    purchase={mockPurchase}
                    onClose={onClose}
                    onSaved={onSaved}
                />
            </ThemeProvider>
        )
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
    ;(purchaseService.editPurchase as jest.Mock).mockResolvedValue(undefined)
})

describe('EditPurchaseSheet', () => {
    test('shows item info, seller name and the pre-filled total', async () => {
        const root = await renderSheet()
        const text = textContent(root)
        expect(text).toContain(UI_TEXT.EDIT_PURCHASE)
        expect(text).toContain('fruit (CUP)')
        expect(text).toContain(`${UI_TEXT.SOLD_BY}: U Ba`)
        expect(text).toContain('10.00$')
    })

    test('recomputes the total preview from the quantity stepper', async () => {
        const root = await renderSheet()
        const plus = root.root.findAllByProps({ accessibilityLabel: A11Y_LABELS.INCREASE_QUANTITY })[0]
        await act(async () => {
            plus.props.onPress()
        })
        expect(textContent(root)).toContain('15.00$')
    })

    test('saves quantity only (seller untouched) and closes', async () => {
        const root = await renderSheet()
        const plus = root.root.findAllByProps({ accessibilityLabel: A11Y_LABELS.INCREASE_QUANTITY })[0]
        await act(async () => {
            plus.props.onPress()
        })
        await act(async () => {
            root.root.findByType(PrimaryButton).props.onPress()
        })

        expect(purchaseService.editPurchase).toHaveBeenCalledWith(3, { quantity: 3 })
        expect(onSaved).toHaveBeenCalledTimes(1)
        expect(onClose).toHaveBeenCalledTimes(1)
    })

    test('rejects non-integer quantities without saving', async () => {
        const root = await renderSheet()
        const stepper = root.root.findByType(QuantityStepper)
        await act(async () => {
            stepper.props.onChange('1.5')
        })
        await act(async () => {
            root.root.findByType(PrimaryButton).props.onPress()
        })

        expect(purchaseService.editPurchase).not.toHaveBeenCalled()
        expect(onSaved).not.toHaveBeenCalled()
        expect(onClose).not.toHaveBeenCalled()
    })
})
