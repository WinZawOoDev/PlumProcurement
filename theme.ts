import { createTheme } from "@rneui/themed";
import { Platform } from 'react-native';


const WEB_FONT_STACK =
    'system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';

export const theme = createTheme({
    mode: 'light',
    lightColors: {
        primary: '#4E2A47',
        secondary: '#E7E8E9',
        tertiary: '#2A3C13',
        neutral: '#F8F9FA',
        background: '#F8F9FA',
    },
    darkColors: {
        primary: '#4E2A47',
        secondary: '#E7E8E9',
        tertiary: '#2A3C13',
        neutral: '#F8F9FA',
        background: 'black'
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


export const navTheme = {
    dark: false,
    colors: {
        primary: 'rgb(255, 45, 85)',
        background: 'rgb(242, 242, 242)',
        card: 'rgb(255, 255, 255)',
        text: 'rgb(28, 28, 30)',
        border: 'rgb(199, 199, 204)',
        notification: 'rgb(255, 69, 58)',
    },
    fonts: Platform.select({
        web: {
            regular: {
                fontFamily: WEB_FONT_STACK,
                fontWeight: '400',
            },
            medium: {
                fontFamily: WEB_FONT_STACK,
                fontWeight: '500',
            },
            bold: {
                fontFamily: WEB_FONT_STACK,
                fontWeight: '600',
            },
            heavy: {
                fontFamily: WEB_FONT_STACK,
                fontWeight: '700',
            },
        },
        ios: {
            regular: {
                fontFamily: 'System',
                fontWeight: '400',
            },
            medium: {
                fontFamily: 'System',
                fontWeight: '500',
            },
            bold: {
                fontFamily: 'System',
                fontWeight: '600',
            },
            heavy: {
                fontFamily: 'System',
                fontWeight: '700',
            },
        },
        default: {
            regular: {
                fontFamily: 'sans-serif',
                fontWeight: 'normal',
            },
            medium: {
                fontFamily: 'sans-serif-medium',
                fontWeight: 'normal',
            },
            bold: {
                fontFamily: 'sans-serif',
                fontWeight: '600',
            },
            heavy: {
                fontFamily: 'sans-serif',
                fontWeight: '700',
            },
        },
    }),
};