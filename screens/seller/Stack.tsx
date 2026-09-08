import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Sellers from "./Sellers";
import SellerDetails from "./SellerDetails";
import SellerPurchases from "./SellerPurchases";
import SellerPayments from "./SellerPayments";
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
    },
    [ROUTES.SELLER_PURCHASES]: {
      screen: SellerPurchases,
      options: { title: UI_TEXT.PURCHASE_HISTORY_TITLE }
    },
    [ROUTES.SELLER_PAYMENTS]: {
      screen: SellerPayments,
      options: { title: UI_TEXT.PAYMENT_HISTORY }
    }
  }
})

export default SellerStack;