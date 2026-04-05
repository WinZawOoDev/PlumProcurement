import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PurchasePrice from "./PurchasePrice";
import CreatePrice, { CreatePriceHeaderTitle } from "./CreatePrice";
import { theme } from "../../theme";

const PriceStack = createNativeStackNavigator({
  screenOptions: {
    headerShown: false
  },
  screens: {
    PurchasePrice: {
      screen: PurchasePrice,
      options: { title: 'Prices' }
    },
    CreatePrice: {
      screen: CreatePrice,
      options: {
        headerTitle: () => <CreatePriceHeaderTitle />,
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.lightColors?.neutral,
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