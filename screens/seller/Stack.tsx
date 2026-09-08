import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Sellers from "./Sellers";
import SellerDetails from "./SellerDetails";
import PurchaseSummary from "../purchasing/PurchaseSummary";
import { ROUTES, UI_TEXT } from "../../constants";


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
    },
    [ROUTES.PURCHASE_SUMMARY]: {
      screen: PurchaseSummary,
      options: { title: UI_TEXT.PURCHASE_SUMMARY_TITLE }
    }
  }
})

export default SellerStack;