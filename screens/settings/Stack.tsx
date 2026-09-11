import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Settings from './Settings'
import { ROUTES } from '../../constants'
import i18n from '../../i18n'

const SettingsStack = createNativeStackNavigator({
    screenOptions: {
        headerShown: false,
    },
    screens: {
        [ROUTES.SETTINGS]: {
            screen: Settings,
            options: { title: i18n.t('uiText.SETTINGS') },
        },
    },
})

export default SettingsStack
