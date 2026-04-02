import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PurchasePrice from "./PurchasePrice";


const PriceStack = createNativeStackNavigator({
  screenOptions: {
    headerShown: false
  },
  screens: {
    Seller: {
      screen: PurchasePrice,
      options: { title: 'Prices' }
    }
  }
})

export default PriceStack;