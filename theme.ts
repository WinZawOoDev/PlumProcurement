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
            primary: '#E2B5D0',
            primaryLight: '#F0C8E0',
            secondary: '#252529',
            tertiary: '#A8C49A',
            neutral: '#252529',
            background: '#0F0F12',
            surface: '#1A1A1E',
            white: '#1A1A1E',
            black: '#F0F0F0',
            grey0: '#1E1E22',
            grey1: '#2C2C30',
            grey2: '#3A3A3E',
            grey3: '#7A7A80',
            grey4: '#A0A0A8',
            grey5: '#D0D0D8',
            error: '#E07A7A',
            warning: '#E9C46A',
            success: '#4ECDC4',
            searchBg: '#1E1E22',
        },
        components: {
            Button: {
                raised: false,
            },
            Card: {
                containerStyle: {
                    borderRadius: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.04,
                    shadowRadius: 6,
                    elevation: 1,
                    borderWidth: 0,
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
