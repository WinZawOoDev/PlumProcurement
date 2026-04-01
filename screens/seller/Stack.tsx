import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Sellers from "./Sellers";


const SellerStack = createNativeStackNavigator({
  screenOptions: {
    headerShown: true
  },
  screens: {
    Seller: {
      screen: Sellers,
      options: { title: 'Sellers' }
    }
  }
})

export default SellerStack;