import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Purchase from "./Purchase";
import PurchaseDetails from "./PurchaseDetails";
import { ROUTES, UI_TEXT } from "../../constants";


const PurchaseStack = createNativeStackNavigator({
  screenOptions: {
    headerShown: false,
  },
  screens: {
    Purchase: {
      screen: Purchase,
      options: { title: 'Purchase' }
    },
    [ROUTES.PURCHASE_DETAILS]: {
      screen: PurchaseDetails,
      options: { title: UI_TEXT.PURCHASE_HISTORY_TITLE }
    }
  }
})

export default PurchaseStack;