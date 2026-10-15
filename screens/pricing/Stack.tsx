import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PurchasePrice from "./PurchasePrice";
import CreatePrice, { CreatePriceHeaderTitle } from "./CreatePrice";
import { ROUTES } from "../../constants";

// Only CreatePrice shows a native header (its title is the theme-aware
// CreatePriceHeaderTitle component). Colors resolve against the active React
// Navigation theme so dark mode is honored — never a static light theme.
const PriceStack = createNativeStackNavigator({
  screenOptions: ({ theme }) => ({
    headerShown: false,
    headerTransparent: true,
    headerStyle: {
      backgroundColor: theme.colors.background,
    },
    headerShadowVisible: false,
    headerTintColor: theme.colors.primary,
  }),
  screens: {
    [ROUTES.PURCHASE_PRICE]: {
      screen: PurchasePrice,
      initialParams: {
        refresh: false
      }
    },
    CreatePrice: {
      screen: CreatePrice,
      options: {
        headerTitle: () => <CreatePriceHeaderTitle />,
        headerShown: true,
        headerTransparent: false,
      }
    }
  }
})

export default PriceStack;
