import { createTheme } from "@rneui/themed";

export const makeAppTheme = (isDark: boolean) =>
    createTheme({
        mode: isDark ? 'dark' : 'light',
        lightColors: {
            primary: '#4E2A47',
            secondary: '#E7E8E9',
            tertiary: '#2A3C13',
            neutral: '#F8F9FA',
            background: '#F8F9FA',
            white: '#FFFFFF',
            black: '#1C1C1E',
        },
        darkColors: {
            primary: '#D8A7CA',
            secondary: '#2A2A2E',
            tertiary: '#9CB380',
            neutral: '#2A2A2E',
            background: '#121212',
            white: '#1E1E22',
            black: '#ECECEC',
            error: '#CF6679',
        },
        components: {
            Button: {
                raised: true,
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
