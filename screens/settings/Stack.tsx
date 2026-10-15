import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Settings from './Settings'
import { ROUTES } from '../../constants'

// The header is hidden (the screen renders its own SectionHeader), so no
// static title is declared here. i18n.t() at import time would freeze the
// title to one language; if a native header is enabled later, set the title
// per screen via useTranslation/useLocalizedConstants instead.
const SettingsStack = createNativeStackNavigator({
    screenOptions: {
        headerShown: false,
    },
    screens: {
        [ROUTES.SETTINGS]: {
            screen: Settings,
        },
    },
})

export default SettingsStack
