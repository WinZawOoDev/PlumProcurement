import { createTheme } from "@rneui/themed";

export const makeAppTheme = (isDark: boolean) =>
    createTheme({
        mode: isDark ? 'dark' : 'light',
        lightColors: {
            primary: '#5B2A4A',
            primaryLight: '#8E4A7A',
            secondary: '#F0EDE8',
            tertiary: '#2D4A22',
            neutral: '#F8F9FA',
            background: '#FDFCFB',
            surface: '#FFFFFF',
            white: '#FFFFFF',
            black: '#1C1C1E',
            grey0: '#F8F9FA',
            grey1: '#E9ECEF',
            grey2: '#DEE2E6',
            grey3: '#ADB5BD',
            grey4: '#6C757D',
            grey5: '#495057',
            error: '#E76F51',
            warning: '#E9C46A',
            success: '#2A9D8F',
            searchBg: '#F1F0ED',
        },
        darkColors: {
            primary: '#D8A7CA',
            primaryLight: '#E8C4DA',
            secondary: '#2A2A2E',
            tertiary: '#9CB380',
            neutral: '#2A2A2E',
            background: '#121212',
            surface: '#1E1E22',
            white: '#1E1E22',
            black: '#ECECEC',
            grey0: '#2A2A2E',
            grey1: '#343A40',
            grey2: '#495057',
            grey3: '#6C757D',
            grey4: '#ADB5BD',
            grey5: '#DEE2E6',
            error: '#CF6679',
            warning: '#E9C46A',
            success: '#2A9D8F',
            searchBg: '#2A2A2E',
        },
        components: {
            Button: {
                raised: false,
            },
            Card: {
                containerStyle: {
                    borderRadius: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.06,
                    shadowRadius: 12,
                    elevation: 3,
                },
            },
            Input: {
                inputContainerStyle: {
                    borderBottomWidth: 0,
                },
            },
        },
        spacing: {
            xl: 1,
            lg: 0.8,
            md: 0.6,
            sm: 0.4,
            xs: 0.2
        }
    });

export const theme = makeAppTheme(false);
