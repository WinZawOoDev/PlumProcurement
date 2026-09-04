import React from 'react'
import ReactTestRenderer, { act } from 'react-test-renderer'
import { ThemeProvider } from '@rneui/themed'
import Settings from '../screens/settings/Settings'
import { A11Y_LABELS, UI_TEXT } from '../constants'
import { makeAppTheme } from '../theme'

const setMode = jest.fn()

jest.mock('../context/ThemeModeContext', () => ({
    useThemeMode: jest.fn(),
}))

import { useThemeMode } from '../context/ThemeModeContext'
const mockUseThemeMode = useThemeMode as jest.Mock

const textContent = (root: ReactTestRenderer.ReactTestRenderer) => {
    const { Text: RNText } = require('react-native')
    return root.root
        .findAllByType(RNText)
        .map((t) => (Array.isArray(t.props.children) ? t.props.children.join('') : String(t.props.children)))
        .join(' ')
}

const themeOptions = (root: ReactTestRenderer.ReactTestRenderer) =>
    root.root
        .findAllByProps({ accessibilityRole: 'radio' })
        .filter((inst) => typeof inst.props.onPress === 'function')

const renderScreen = async () => {
    let root!: ReactTestRenderer.ReactTestRenderer
    await act(async () => {
        root = ReactTestRenderer.create(
            <ThemeProvider theme={makeAppTheme(false)}>
                <Settings />
            </ThemeProvider>
        )
    })
    return root
}

beforeEach(() => {
    jest.clearAllMocks()
    mockUseThemeMode.mockReturnValue({ mode: 'light', setMode })
})

describe('Settings screen', () => {
    test('renders appearance, preview, storage and about sections', async () => {
        const root = await renderScreen()
        const content = textContent(root)
        expect(content).toContain(UI_TEXT.SETTINGS)
        expect(content).toContain(UI_TEXT.APPEARANCE)
        expect(content).toContain(UI_TEXT.THEME_PREVIEW_TITLE)
        expect(content).toContain(UI_TEXT.DATA_STORAGE)
        expect(content).toContain(UI_TEXT.ABOUT)
        expect(content).toContain(UI_TEXT.APP_NAME)
        expect(content).toContain(UI_TEXT.SETTINGS_FOOTER_NOTE)
        expect(themeOptions(root)).toHaveLength(3)
    })

    test('marks the current theme mode as checked', async () => {
        const root = await renderScreen()
        const options = themeOptions(root)
        const lightOption = options.find((p) =>
            String(p.props.accessibilityLabel).includes(UI_TEXT.THEME_MODE_LIGHT)
        )!
        expect(lightOption.props.accessibilityState).toEqual({ checked: true })
        expect(lightOption.props.accessibilityLabel).toBe(
            `${A11Y_LABELS.SELECT_THEME_MODE}: ${UI_TEXT.THEME_MODE_LIGHT}`
        )
    })

    test('propagates theme mode changes to the context', async () => {
        const root = await renderScreen()
        const options = themeOptions(root)
        const darkOption = options.find((p) =>
            String(p.props.accessibilityLabel).includes(UI_TEXT.THEME_MODE_DARK)
        )!

        await act(async () => {
            darkOption.props.onPress()
        })

        expect(setMode).toHaveBeenCalledWith('dark')
    })

    test('does not call setMode when the active mode is pressed again', async () => {
        const root = await renderScreen()
        const options = themeOptions(root)
        const lightOption = options.find((p) =>
            String(p.props.accessibilityLabel).includes(UI_TEXT.THEME_MODE_LIGHT)
        )!

        await act(async () => {
            lightOption.props.onPress()
        })

        expect(setMode).not.toHaveBeenCalled()
    })
})
