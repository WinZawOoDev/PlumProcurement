import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Sellers from "./Sellers";
import SellerDetails from "./SellerDetails";
import { ROUTES } from "../../constants";


const SellerStack = createNativeStackNavigator({
  screenOptions: {
    headerShown: false
  },
  screens: {
    [ROUTES.SELLER]: {
      screen: Sellers,
      options: { title: 'Sellers' }
    },
    [ROUTES.SELLER_DETAILS]: {
      screen: SellerDetails,
      options: { title: 'Seller Details' }
    }
  }
})

export default SellerStack;