import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PurchasePrice from "./PurchasePrice";
import CreatePrice from "./CreatePrice";

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
        title: 'Create Price',
        headerShown: true
      }
    }
  }
})

export default PriceStack;