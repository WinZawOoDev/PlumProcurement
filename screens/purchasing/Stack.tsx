import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Purchase from "./Purchase";
import PurchaseDetails from "./PurchaseDetails";
import PurchaseSummary from "./PurchaseSummary";
import SellerSelect from "./SellerSelect";
import { ROUTES } from "../../constants";
import i18n from "../../i18n";


const PurchaseStack = createNativeStackNavigator({
  screenOptions: {
    headerShown: false,
  },
  screens: {
    [ROUTES.PURCHASE]: {
      screen: Purchase,
      options: { title: i18n.t('tabs.PURCHASING') }
    },
    [ROUTES.PURCHASE_DETAILS]: {
      screen: PurchaseDetails,
      options: { title: i18n.t('uiText.PURCHASE_HISTORY_TITLE') }
    },
    [ROUTES.PURCHASE_SUMMARY]: {
      screen: PurchaseSummary,
      options: { title: i18n.t('uiText.PURCHASE_SUMMARY_TITLE') }
    },
    [ROUTES.SELECT_SELLER]: {
      screen: SellerSelect,
      options: {
        title: i18n.t('uiText.SELECT_SELLER'),
        animation: 'fade',
        animationDuration: 200,
      }
    }
  }
})

export default PurchaseStack;