import React from 'react'
import ReactTestRenderer, { act } from 'react-test-renderer'
import { ThemeProvider } from '@rneui/themed'
import Settings from '../screens/settings/Settings'
import { SelectPicker } from '../components/SelectPicker'
import { Picker } from '@react-native-picker/picker'
import { UI_TEXT } from '../constants'
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
    test('renders the theme preference picker with the current mode', async () => {
        const root = await renderScreen()
        expect(textContent(root)).toContain(UI_TEXT.SETTINGS)
        expect(textContent(root)).toContain(UI_TEXT.THEME)

        const picker = root.root
            .findAllByType(SelectPicker)
            .find((p) => p.props.label === UI_TEXT.THEME)!
        const rnPicker = picker.findAllByType(Picker)[0]
        expect(rnPicker.props.selectedValue).toBe('light')
    })

    test('propagates theme mode changes to the context', async () => {
        const root = await renderScreen()
        const picker = root.root
            .findAllByType(SelectPicker)
            .find((p) => p.props.label === UI_TEXT.THEME)!
        const rnPicker = picker.findAllByType(Picker)[0]

        await act(async () => {
            rnPicker.props.onValueChange('dark')
        })

        expect(setMode).toHaveBeenCalledWith('dark')
    })
})
