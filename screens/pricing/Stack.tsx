import { createNativeStackNavigator } from '@react-navigation/native-stack'
import PurchasePrice from "./PurchasePrice";
import CreatePrice, { CreatePriceHeaderTitle } from "./CreatePrice";
import { theme } from "../../theme";
import i18n from "../../i18n";

const PriceStack = createNativeStackNavigator({
  screenOptions: {
    headerShown: false,
    headerTransparent: true
  },
  screens: {
    PurchasePrice: {
      screen: PurchasePrice,
      options: { title: i18n.t('tabs.PRICES') },
      initialParams: {
        refresh: false
      }
    },
    CreatePrice: {
      screen: CreatePrice,
      options: {
        headerTitle: () => <CreatePriceHeaderTitle />,
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.lightColors?.background,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerShadowVisible: false,
        headerTintColor: theme.lightColors?.primary
      }
    }
  }
})

export default PriceStack;