import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Purchase from "./Purchase";
import PurchaseDetails from "./PurchaseDetails";
import PurchaseSummary from "./PurchaseSummary";
import EditPurchase from "./EditPurchase";
import SellerSelect from "./SellerSelect";
import { ROUTES } from "../../constants";

// Headers are hidden for every screen (each screen renders its own
// SectionHeader), so no static titles are declared here. They were previously
// computed with i18n.t() at import time, which froze them to one language and
// never reacted to a language change. If a native header is enabled later,
// set titles per screen via useTranslation/useLocalizedConstants instead, and
// theme header colors from the NavigationContainer theme (not a static theme).
const PurchaseStack = createNativeStackNavigator({
  screenOptions: {
    headerShown: false,
  },
  screens: {
    [ROUTES.PURCHASE]: {
      screen: Purchase,
    },
    [ROUTES.PURCHASE_DETAILS]: {
      screen: PurchaseDetails,
    },
    [ROUTES.PURCHASE_SUMMARY]: {
      screen: PurchaseSummary,
    },
    [ROUTES.EDIT_PURCHASE]: {
      screen: EditPurchase,
    },
    [ROUTES.SELECT_SELLER]: {
      screen: SellerSelect,
      options: {
        animation: 'fade',
        animationDuration: 200,
      }
    }
  }
})

export default PurchaseStack;