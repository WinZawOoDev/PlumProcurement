import React from 'react'
import ReactTestRenderer, { act } from 'react-test-renderer'
import { TextInput } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ThemeProvider } from '@rneui/themed'
import SellerFormSheet from '../screens/seller/SellerFormSheet'
import { PrimaryButton } from '../components/buttons/Button'
import { sellerService } from '../services/sellerService'
import { MESSAGES } from '../constants'
import { makeAppTheme } from '../theme'

jest.mock('../services/sellerService', () => ({
    sellerService: {
        addSeller: jest.fn(),
        editSeller: jest.fn(),
    },
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

const renderSheet = async (props?: Partial<React.ComponentProps<typeof SellerFormSheet>>) => {
    let root!: ReactTestRenderer.ReactTestRenderer
    await act(async () => {
        root = ReactTestRenderer.create(
            <SafeAreaProvider initialMetrics={initialMetrics}>
                <ThemeProvider theme={makeAppTheme(false)}>
                    <SellerFormSheet
                        visible
                        seller={null}
                        onClose={jest.fn()}
                        onSaved={jest.fn()}
                        {...props}
                    />
                </ThemeProvider>
            </SafeAreaProvider>
        )
        await flush()
    })
    return root
}

const setInputs = async (
    root: ReactTestRenderer.ReactTestRenderer,
    values: [string, string, string]
) => {
    const inputs = root.root.findAllByType(TextInput)
    expect(inputs).toHaveLength(3)
    for (const [index, value] of values.entries()) {
        await act(async () => {
            inputs[index].props.onChangeText(value)
        })
    }
    await act(async () => {
        inputs.forEach((input) => input.props.onBlur?.())
        await flush()
    })
}

const submit = async (root: ReactTestRenderer.ReactTestRenderer) => {
    const save = root.root
        .findAllByType(PrimaryButton)
        .find((b) => typeof b.props.onPress === 'function')!
    await act(async () => {
        save.props.onPress()
        await flush()
    })
}

beforeEach(() => {
    jest.clearAllMocks()
    ;(sellerService.addSeller as jest.Mock).mockResolvedValue(1)
    ;(sellerService.editSeller as jest.Mock).mockResolvedValue(undefined)
})

describe('SellerFormSheet', () => {
    test('rejects whitespace-only values and keeps the sheet open', async () => {
        const onSaved = jest.fn()
        const root = await renderSheet({ onSaved })
        await setInputs(root, ['   ', '   ', '   '])
        await submit(root)

        expect(sellerService.addSeller).not.toHaveBeenCalled()
        expect(sellerService.editSeller).not.toHaveBeenCalled()
        expect(onSaved).not.toHaveBeenCalled()
    })

    test('trims values before saving a new seller', async () => {
        const onSaved = jest.fn()
        const onClose = jest.fn()
        const root = await renderSheet({ onSaved, onClose })
        await setInputs(root, ['  U Ba  ', ' 09-1 ', ' Main '])
        await submit(root)

        expect(sellerService.addSeller).toHaveBeenCalledWith({
            name: 'U Ba',
            phone: '09-1',
            address: 'Main',
        })
        expect(onSaved).toHaveBeenCalledTimes(1)
        expect(onClose).toHaveBeenCalledTimes(1)
    })

    test('edits the existing seller and shows the backend message on failure', async () => {
        const { DatabaseError } = require('../services/errors') as typeof import('../services/errors')
        ;(sellerService.editSeller as jest.Mock).mockRejectedValue(
            new DatabaseError(MESSAGES.ERROR_SELLER_IN_USE)
        )
        const showErrorSpy = jest.spyOn(require('../utils/notifications'), 'showError')

        const onSaved = jest.fn()
        const root = await renderSheet({
            seller: { id: 3, name: 'Old', phone: '1', address: 'a' },
            onSaved,
        })
        await setInputs(root, ['New', '2', 'b'])
        await submit(root)

        expect(sellerService.editSeller).toHaveBeenCalledWith(3, { name: 'New', phone: '2', address: 'b' })
        expect(showErrorSpy).toHaveBeenCalledWith(MESSAGES.ERROR_SELLER_IN_USE)
        expect(onSaved).not.toHaveBeenCalled()
        showErrorSpy.mockRestore()
    })
})
