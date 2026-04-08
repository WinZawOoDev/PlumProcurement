import { createNativeStackNavigator } from '@react-navigation/native-stack'
import PurchasePrice from "./PurchasePrice";
import CreatePrice, { CreatePriceHeaderTitle } from "./CreatePrice";
import { theme } from "../../theme";

const PriceStack = createNativeStackNavigator({
  screenOptions: {
    headerShown: false,
    headerTransparent: true
  },
  screens: {
    PurchasePrice: {
      screen: PurchasePrice,
      options: { title: 'Prices' },
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