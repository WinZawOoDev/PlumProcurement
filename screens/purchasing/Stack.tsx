import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Purchase from "./Purchase";
import PurchaseDetails from "./PurchaseDetails";
import PurchaseSummary from "./PurchaseSummary";
import { ROUTES, UI_TEXT } from "../../constants";


const PurchaseStack = createNativeStackNavigator({
  screenOptions: {
    headerShown: false,
  },
  screens: {
    [ROUTES.PURCHASE]: {
      screen: Purchase,
      options: { title: 'Purchase' }
    },
    [ROUTES.PURCHASE_DETAILS]: {
      screen: PurchaseDetails,
      options: { title: UI_TEXT.PURCHASE_HISTORY_TITLE }
    },
    [ROUTES.PURCHASE_SUMMARY]: {
      screen: PurchaseSummary,
      options: { title: UI_TEXT.PURCHASE_SUMMARY_TITLE }
    }
  }
})

export default PurchaseStack;