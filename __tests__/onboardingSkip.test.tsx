import React from 'react'
import ReactTestRenderer, { act } from 'react-test-renderer'
import App from '../App'
import { Onboarding } from '../components/Onboarding'
import { priceService } from '../services/priceService'
import { sellerService } from '../services/sellerService'
import { settingsService } from '../services/settingsService'
import { IPrice } from '../types/database'
import { ISeller } from '../types/database'

jest.mock('react-native-safe-area-context', () => ({
    SafeAreaProvider: ({ children }: { children?: React.ReactNode }) => children ?? null,
    SafeAreaView: ({ children }: { children?: React.ReactNode }) => children ?? null,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}))
jest.mock('../services/priceService', () => ({
    priceService: { getPrices: jest.fn() },
}))
jest.mock('../services/sellerService', () => ({
    sellerService: { getSellers: jest.fn() },
}))
jest.mock('../services/settingsService', () => ({
    settingsService: { isOnboarded: jest.fn(), setOnboarded: jest.fn(), getThemeMode: jest.fn(), setThemeMode: jest.fn() },
}))

const mockPrice: IPrice = { id: 1, price: 100, unit: 'PER KG', category: 'grains', is_available: true }
const mockSeller: ISeller = { id: 1, name: 'U Ba', phone: null, address: null }

const flush = async () => {
    // Drain microtasks and let React's scheduler flush re-renders
    for (let i = 0; i < 3; i++) {
        await new Promise<void>((resolve) => setTimeout(resolve, 0))
    }
}

const renderApp = async () => {
    let root!: ReactTestRenderer.ReactTestRenderer
    await act(async () => {
        root = ReactTestRenderer.create(<App />)
        await flush()
    })
    return root
}

beforeEach(() => {
    jest.clearAllMocks()
    ;(settingsService.isOnboarded as jest.Mock).mockResolvedValue(false)
    ;(settingsService.setOnboarded as jest.Mock).mockResolvedValue(undefined)
    ;(settingsService.getThemeMode as jest.Mock).mockResolvedValue('system')
    ;(settingsService.setThemeMode as jest.Mock).mockResolvedValue(undefined)
    ;(priceService.getPrices as jest.Mock).mockResolvedValue([])
    ;(sellerService.getSellers as jest.Mock).mockResolvedValue([])
})

describe('onboarding skip on startup', () => {
    test('shows onboarding on a fresh install (no flag, no data)', async () => {
        const root = await renderApp()
        expect(root.root.findAllByType(Onboarding)).toHaveLength(1)
        expect(settingsService.setOnboarded).not.toHaveBeenCalled()
    })

    test('skips onboarding when the flag is persisted', async () => {
        ;(settingsService.isOnboarded as jest.Mock).mockResolvedValue(true)

        const root = await renderApp()

        expect(root.root.findAllByType(Onboarding)).toHaveLength(0)
        expect(priceService.getPrices).not.toHaveBeenCalled()
    })

    test('skips onboarding and persists the flag when data exists', async () => {
        ;(priceService.getPrices as jest.Mock).mockResolvedValue([mockPrice])

        const root = await renderApp()

        expect(root.root.findAllByType(Onboarding)).toHaveLength(0)
        expect(settingsService.setOnboarded).toHaveBeenCalledTimes(1)
    })

    test('skips onboarding when only sellers exist', async () => {
        ;(sellerService.getSellers as jest.Mock).mockResolvedValue([mockSeller])

        const root = await renderApp()

        expect(root.root.findAllByType(Onboarding)).toHaveLength(0)
    })

    test('shows onboarding when the startup check fails', async () => {
        ;(settingsService.isOnboarded as jest.Mock).mockRejectedValue(new Error('db down'))

        const root = await renderApp()

        expect(root.root.findAllByType(Onboarding)).toHaveLength(1)
    })
})
