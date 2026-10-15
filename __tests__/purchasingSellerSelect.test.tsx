import React from 'react'
import ReactTestRenderer, { act } from 'react-test-renderer'
import { Text as RNText } from 'react-native'
import { ThemeProvider } from '@rneui/themed'
import SellerSelect from '../screens/purchasing/SellerSelect'
import { PrimaryButton } from '../components/buttons/Button'
import { CardSkeleton } from '../components/Skeleton'
import { sellerService } from '../services/sellerService'
import { MESSAGES, UI_TEXT } from '../constants'
import { ISeller } from '../types/database'
import { makeAppTheme } from '../theme'

jest.mock('../services/sellerService', () => ({
    sellerService: { getSellers: jest.fn() },
}))
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({ navigate: jest.fn(), popTo: jest.fn(), goBack: jest.fn() }),
    useRoute: () => ({ params: {} }),
}))

const sellers: ISeller[] = [
    { id: 1, name: 'U Ba', phone: null, address: null },
    { id: 2, name: 'Daw Mya', phone: null, address: null },
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
                <SellerSelect />
            </ThemeProvider>
        )
        await flush()
    })
    return root
}

const textContent = (root: ReactTestRenderer.ReactTestRenderer) =>
    root.root
        .findAllByType(RNText)
        .map((t) => (Array.isArray(t.props.children) ? t.props.children.join('') : String(t.props.children)))
        .join(' ')

beforeEach(() => {
    jest.clearAllMocks()
})

describe('SellerSelect screen', () => {
    test('shows skeletons while sellers are pending, never the empty state', async () => {
        ;(sellerService.getSellers as jest.Mock).mockReturnValueOnce(new Promise(() => {}))

        const root = await renderScreen()

        expect(root.root.findAllByType(CardSkeleton).length).toBeGreaterThan(0)
        expect(textContent(root)).not.toContain(UI_TEXT.EMPTY_SELLER_LIST)
    })

    test('renders sellers after a successful load', async () => {
        ;(sellerService.getSellers as jest.Mock).mockResolvedValue(sellers)

        const root = await renderScreen()

        expect(textContent(root)).toContain('U Ba')
        expect(textContent(root)).toContain('Daw Mya')
    })

    test('shows an error state with retry when loading fails, without the raw error', async () => {
        ;(sellerService.getSellers as jest.Mock).mockRejectedValueOnce(new Error('raw internal detail'))

        const root = await renderScreen()

        const text = textContent(root)
        expect(text).toContain(UI_TEXT.SOMETHING_WENT_WRONG)
        expect(text).toContain(MESSAGES.ERROR_GENERIC)
        expect(text).not.toContain('raw internal detail')
        expect(text).not.toContain(UI_TEXT.EMPTY_SELLER_LIST)
        expect(root.root.findByType(PrimaryButton).props.title).toBe(UI_TEXT.RETRY)
    })

    test('retry reloads sellers and replaces the error state', async () => {
        ;(sellerService.getSellers as jest.Mock)
            .mockRejectedValueOnce(new Error('boom'))
            .mockResolvedValueOnce(sellers)

        const root = await renderScreen()
        expect(textContent(root)).toContain(UI_TEXT.SOMETHING_WENT_WRONG)

        await act(async () => {
            root.root.findByType(PrimaryButton).props.onPress()
            await flush()
        })

        expect(sellerService.getSellers).toHaveBeenCalledTimes(2)
        const text = textContent(root)
        expect(text).not.toContain(UI_TEXT.SOMETHING_WENT_WRONG)
        expect(text).toContain('U Ba')
    })
})
