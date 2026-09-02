import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Settings from './Settings'
import { ROUTES } from '../../constants'

const SettingsStack = createNativeStackNavigator({
    screenOptions: {
        headerShown: false,
    },
    screens: {
        [ROUTES.SETTINGS]: {
            screen: Settings,
            options: { title: 'Settings' },
        },
    },
})

export default SettingsStack
