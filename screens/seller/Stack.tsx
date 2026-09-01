import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Sellers from "./Sellers";
import { ROUTES } from "../../constants";


const SellerStack = createNativeStackNavigator({
  screenOptions: {
    headerShown: false
  },
  screens: {
    [ROUTES.SELLER]: {
      screen: Sellers,
      options: { title: 'Sellers' }
    }
  }
})

export default SellerStack;